/* エラー一覧（docs/error-catalog.md）の各項目に対応するテストケース。
 * steps: ['LOAD', アドレス, ロードパラメーター] / ['RESET'] / ['WAIT', 分] / コンソール入力文字列
 *        文字列中の #MSGID# は、その WTOR の応答番号に置き換える（例: 'R #$HASP426#,WARM'）
 * expect: 出力にこの順で現れるべき文字列。notExpect: 現れてはいけない文字列
 * state: 最後の状態 { phase, wait, jes, vtam, pending:[msgid...] }、eval: 採点項目 {部分文字列: true/false}
 */
(function (root) {
const BOOT = [['LOAD', '0A80', '0A8200M1'], 'R #$HASP426#,WARM', '$S'];            // 正常 IPL（プロンプトなし）
const BOOTA = [['LOAD', '0A80', '0A8200A1']];                                      // 両方プロンプト
const UPALL = [...BOOT, 'S VTAM', 'S TCPIP', 'S TSO'];
const DOWNALL = ['P TSO', 'P TCPIP', 'Z NET', '$P', '$PJES2', 'Z EOD'];

const CASES = [
  // ---- A. HMC / LOAD ----------------------------------------------------
  { id: 'E01', title: 'ロードアドレスが16進でない', steps: [['LOAD', 'ZZZZ', '0A8200M1']], expect: ['ロードアドレスが正しくありません'], state: { phase: 'OFF' } },
  { id: 'E02', title: '存在しない装置から LOAD', steps: [['LOAD', '0C00', '0A8200M1']], expect: ['LOAD 失敗'], state: { phase: 'OFF' } },
  { id: 'E03', title: 'IPL テキストのないボリュームから LOAD（待機状態 00F）', steps: [['LOAD', '0A81', '0A8200M1']], expect: ['待機状態コード 00F'], state: { phase: 'WAIT', wait: '00F' } },
  { id: 'E04', title: 'LOAD パラメーター1〜4桁目が16進でない（0B3）', steps: [['LOAD', '0A80', '0G8200M1']], expect: ['待機状態コード 0B3'], state: { wait: '0B3' } },
  { id: 'E05', title: 'LOADxx が存在しない（088-00）', steps: [['LOAD', '0A80', '0A8299M1']], expect: ['待機状態コード 088 理由 00'], state: { wait: '088' } },
  { id: 'E06', title: 'IODF 装置の指定誤り（IPLPARM が無い装置, 088-00）', steps: [['LOAD', '0A80', '0A8500M1']], expect: ['待機状態コード 088 理由 00'], state: { wait: '088' } },
  { id: 'E07', title: 'ロードパラメーター省略（SYSRES に LOADxx なし, 088-00）', steps: [['LOAD', '0A80', '']], expect: ['088 理由 00'], state: { wait: '088' } },
  { id: 'E08', title: '代替核 ID の誤り（088-0E）', steps: [['LOAD', '0A80', '0A8200M5']], expect: ['待機状態コード 088 理由 0E'], state: { wait: '088' } },
  { id: 'E09', title: 'LOADxx の IODF 文が存在しない IODF を指す（0B1-01）', steps: [['LOAD', '0A80', '0A82A1M1']], expect: ['IEA246I LOAD   ID A1', '待機状態コード 0B1 理由 01'], state: { wait: '0B1' } },
  { id: 'E10', title: 'IMSI 文字が表にない（既定値扱い）', steps: [['LOAD', '0A80', '0A8200X1'], 'R #$HASP426#,WARM'], expect: ['IMSI 文字 "X"', '$HASP492'], state: { phase: 'UP' } },
  { id: 'E11', title: 'ロードパラメーターが9文字', steps: [['LOAD', '0A80', '0A8200M1X']], expect: ['8文字まで'], state: { phase: 'OFF' } },
  { id: 'E12', title: '稼働中に LOAD（拒否）', steps: [...BOOT, ['LOAD', '0A80', '0A8200M1']], expect: ['稼働中です'], state: { phase: 'UP', jes: 'UP' } },
  { id: 'E13', title: '待機状態中のコマンド入力', steps: [['LOAD', '0A81', ''], 'D A,L'], expect: ['無効待機状態です'], state: { wait: '00F' } },
  { id: 'E14', title: '3桁装置番号の先頭0省略（A8200M1 → 位置がずれて IODF=A820・LOAD0M となり 088-00）', steps: [['LOAD', '0A80', 'A8200M1']], expect: ['待機状態コード 088 理由 00', 'LOAD0M'], state: { wait: '088' } },

  // ---- B. NIP: 装置・ボリューム ------------------------------------------
  { id: 'E15', title: 'ラベルなし DASD（IEA311I）', scenarios: ['UNLABEL'], steps: [['LOAD', '0A80', '0A8200A1']], expect: ['IEA311I UNLABELED DASD ON 0B90'], state: { pending: ['IEA347A'] } },
  { id: 'E16', title: 'IEA120D への不正応答 → IEA310A、WAIT で続行', scenarios: ['NOTREADY'], steps: [['LOAD', '0A80', '0A8200M1'], 'R 00,XYZ', 'R 00,WAIT'], expect: ['IEA120D DEVICE 0B91', 'IEA310A INVALID REPLY', 'IEA120D DEVICE 0B91', 'IEE389I'], state: { phase: 'UP' } },
  { id: 'E17', title: 'IEA120D に CONT（装置 OFFLINE で続行）', scenarios: ['NOTREADY'], steps: [['LOAD', '0A80', '0A8200M1'], 'R 00,CONT'], expect: ['0B91 は OFFLINE', 'IEE389I'], state: { phase: 'UP' } },
  { id: 'E18', title: 'ボリューム重複 IEA213A：不正応答 → IEA310A、正しい応答 → IEA313I', scenarios: ['DUPVOL'], steps: [['LOAD', '0A80', '0A8200M1'], 'R 00,0A99', 'R 00,0B85'], expect: ['IEA213A DUPLICATE VOLUME WORK01', 'IEA310A', 'IEA213A', 'IEA313I DEVICE 0B85 DISMOUNTED', 'IEE389I'], state: { phase: 'UP' } },
  { id: 'E19', title: 'IEA213A で本番側（0A85）を外した', scenarios: ['DUPVOL'], steps: [['LOAD', '0A80', '0A8200M1'], 'R 00,0A85'], expect: ['IEA313I DEVICE 0A85 DISMOUNTED', '手順書との相違'], state: { phase: 'UP' } },
  { id: 'E20', title: 'SYSRES 重複 IEA214A：不正応答 → IEA310A、CONT → IEA313I', scenarios: ['DUPSYSRES'], steps: [['LOAD', '0A80', '0A8200M1'], 'R 00,YES', 'R 00,CONT'], expect: ['IEA214A DUPLICATE SYSRES Z32RS1', 'IEA310A', 'IEA214A', 'IEA313I DEVICE 0B80 DISMOUNTED', 'IEE389I'], state: { phase: 'UP' } },
  { id: 'E21', title: '複数の装置障害が同時（IEA311I＋IEA120D＋IEA213A）', scenarios: ['UNLABEL', 'NOTREADY', 'DUPVOL'], steps: [['LOAD', '0A80', '0A8200M1'], 'R 00,CONT', 'R 00,0B85'], expect: ['IEA311I', 'IEA120D', 'IEA213A', 'IEA313I', 'IEE389I'], state: { phase: 'UP' } },

  // ---- C. NIP: マスターカタログ ------------------------------------------
  { id: 'E22', title: 'LOADxx に SYSCAT なし → IEA347A。存在しないメンバー → 再表示、Enter で SYSCATLG', scenarios: ['NOSYSCAT'], steps: [['LOAD', '0A80', '0A8200M1'], 'R 00,99', ''], expect: ['IEA347A', 'IEA347A', 'IEA370I MASTER CATALOG SELECTED'], state: { phase: 'UP' } },
  { id: 'E23', title: 'SYSCATLG が壊れている状態で Enter → 待機状態 05F', scenarios: ['BADCAT'], steps: [['LOAD', '0A80', '0A8200C1'], ''], expect: ['IEA347A', '待機状態コード 05F'], state: { wait: '05F' } },
  { id: 'E24', title: 'SYSCATLG が壊れていても SYSCAT02 を指定すれば続行', scenarios: ['BADCAT'], steps: [['LOAD', '0A80', '0A8200C1'], 'R 00,02'], expect: ['IEA347A', 'IEE389I'], notExpect: ['IEA370I'], state: { phase: 'UP' } }, // IMSI=C は情報メッセージ非表示なので IEA370I は出ない
  { id: 'E25', title: 'IEA347A への応答が3文字（不正）→ 再表示', steps: [['LOAD', '0A80', '0A8200C1'], 'R 00,ABC'], expect: ['IEA347A', 'IEA347A'], state: { pending: ['IEA347A'] } },

  // ---- D. NIP: システムパラメーター ---------------------------------------
  { id: 'E26', title: 'IEA101A に未定義キーワード → IEA321I UNDEFINED KEYWORD → IEA336A → 再指定', steps: [...BOOTA, '', 'R 00,FOO=1', 'R 00,SYSP=01'], expect: ['IEA101A', 'IEA321I INVALID PARAMETER SYNTAX - FOO - UNDEFINED KEYWORD', 'IEA336A', 'IEASYS01'], state: { phase: 'UP' } },
  { id: 'E27', title: 'IEA101A の括弧の対応誤り → IEA321I UNBALANCED PARENS', steps: [...BOOTA, '', 'R 00,SYSP=(01,02'], expect: ['UNBALANCED PARENS', 'IEA336A'], state: { pending: ['IEA336A'] } },
  { id: 'E28', title: '存在しない IEASYSxx → IEA301I/IEA324I/IEA336A、Enter で打ち切り続行', steps: [...BOOTA, '', 'R 00,SYSP=09', ''], expect: ['IEA301I IEASYS09 NOT FOUND', 'IEA324I SYSP INPUT TERMINATED IN IEASYS09', 'IEA336A', 'IEE389I'], state: { phase: 'UP' } },
  { id: 'E29', title: 'OPI=NO のパラメーター指定 → IEA107I', steps: [...BOOTA, '', 'R 00,MAXUSER=500'], expect: ['IEA107I MAXUSER IGNORED', 'IEE389I'], state: { phase: 'UP' } },
  { id: 'E30', title: '応答の継続 CONT → IEA116A', steps: [...BOOTA, '', 'R 00,CLPA,CONT', 'R 00,SYSP=02'], expect: ['IEA116A CONTINUE SYSTEM PARAMETERS', 'IEASYS02', 'CLPA'], state: { phase: 'UP' } },
  { id: 'E31', title: 'IEASYS00 が無い（プロンプトなし）→ IEA301I/IEA324I/IEA336A、Enter で続行', scenarios: ['NOIEASYS'], steps: [['LOAD', '0A80', '0A8200M1'], ''], expect: ['IEA301I IEASYS00 NOT FOUND', 'IEA324I', 'IEA336A', 'IEE389I'], state: { phase: 'UP' } },
  { id: 'E32', title: 'IEASYS00 が無い状態で SYSP=01 を再指定', scenarios: ['NOIEASYS'], steps: [['LOAD', '0A80', '0A8200M1'], 'R 00,SYSP=01'], expect: ['IEA301I IEASYS00', 'IEA336A', 'IEASYS00 なしで', 'IEASYS01', 'IEE389I'], state: { phase: 'UP' } },
  { id: 'E33', title: 'SYSP= の値の誤り（3文字）→ IEA321I IMPROPER DELIMITER', steps: [...BOOTA, '', 'R 00,SYSP=ABC'], expect: ['IEA321I INVALID PARAMETER SYNTAX - SYSP - IMPROPER DELIMITER', 'IEA336A'], state: { pending: ['IEA336A'] } },

  // ---- E. NIP: 時刻・XCF・応答操作 ----------------------------------------
  { id: 'E34', title: 'IEA888A：不正応答 → 再表示、時刻変更 → 再表示、U で続行', scenarios: ['TODPROMPT'], steps: [['LOAD', '0A80', '0A8200M1'], 'R 00,XX', 'R 00,DATE=2026.309,CLOCK=06.30.00', 'R 00,U'], expect: ['IEA888A', '応答形式が正しくありません', 'IEA888A', 'IEA888A', 'IEE389I'], state: { phase: 'UP' } },
  { id: 'E35', title: 'IXC405D 不正応答 → IXC208I、I で sysplex 初期化', scenarios: ['RESIDUAL'], steps: [['LOAD', '0A80', '0A8200M1'], 'R 00,X', 'R 00,I'], expect: ['IXC404I SYSTEM(S) ACTIVE OR IPLING: SYSB', 'IXC405D', 'IXC208I', 'IXC405D', 'IXC418I', 'IEE389I'], state: { phase: 'UP' } },
  { id: 'E36', title: 'IXC405D に J（残骸 SYSB がある状態で参加）', scenarios: ['RESIDUAL'], steps: [['LOAD', '0A80', '0A8200M1'], 'R 00,J'], expect: ['IXC418I', 'I が適切です'], state: { phase: 'UP' } },
  { id: 'E37', title: 'IXC405D に R → IXC207A、不正 → IXC208I、COUPLE=00 → 再判定', scenarios: ['RESIDUAL'], steps: [['LOAD', '0A80', '0A8200M1'], 'R 00,R', 'R 00,COUPLE=ZZZ', 'R 00,COUPLE=00', 'R 00,I'], expect: ['IXC207A', 'IXC208I THE RESPONSE TO MESSAGE IXC207A', 'IXC207A', 'IXC404I', 'IXC405D', 'IXC418I'], state: { phase: 'UP' } },
  { id: 'E38', title: 'NIP 中に応答以外のコマンド', steps: [...BOOTA, 'D A,L'], expect: ['応答（R 00,xxx）か Enter のみ'], state: { pending: ['IEA347A'] } },
  { id: 'E39', title: 'NIP 中に存在しない応答番号', steps: [...BOOTA, 'R 05,X'], expect: ['IEE704I REPLY 05 NOT OUTSTANDING'], state: { pending: ['IEA347A'] } },
  { id: 'E40', title: 'REPLY の区切り誤り → IEE702I', steps: [...BOOTA, 'R 00;02', "R 00,'02"], expect: ['IEE702I REPLY 00 IGNORED; IMPROPER USE OF DELIMITERS', 'IEE702I'], state: { pending: ['IEA347A'] } },

  // ---- F. JES2 起動 ------------------------------------------------------
  { id: 'E41', title: '$HASP426 に不正オプション → $HASP427 → 再表示', steps: [['LOAD', '0A80', '0A8200M1'], 'R #$HASP426#,WARN', 'R #$HASP426#,WARM'], expect: ['$HASP427 PARAMETER OR SYNTAX ERROR', '$HASP426', '$HASP492'], state: { jes: 'HOLD' } },
  { id: 'E42', title: '$HASP426 に CHECK（応答では使えない）→ $HASP427', steps: [['LOAD', '0A80', '0A8200M1'], 'R #$HASP426#,CHECK'], expect: ['$HASP427'], state: { pending: ['$HASP426'] } },
  { id: 'E43', title: 'COLD → $HASP436/$HASP441 に N → JES2 終了、再度 S JES2', steps: [['LOAD', '0A80', '0A8200M1'], 'R #$HASP426#,COLD', 'R #$HASP441#,N', 'S JES2', 'R #$HASP426#,WARM'], expect: ['$HASP436 CONFIRM COLD START', '$HASP441', '$HASP428', '$HASP085', '$HASP426', '$HASP492'], state: { jes: 'HOLD' } },
  { id: 'E44', title: 'COLD → Y でコールドスタート（ジョブ消失の注記）', scenarios: ['BATCH'], steps: [['LOAD', '0A80', '0A8200M1'], 'R #$HASP426#,COLD,NOREQ', 'R #$HASP441#,Y'], expect: ['$HASP436', '$HASP493 JES2 COLD START', 'ジョブはすべて失われ'], notExpect: ['$HASP400', '$HASP373 PAYROLL'], state: { jes: 'UP' } },
  { id: 'E45', title: '初回起動で WARM → $HASP479 I/O ERROR → $HASP454 Y → $HASP289/$HASP272 TERM → COLD で再起動', scenarios: ['FIRSTJES'], steps: [['LOAD', '0A80', '0A8200M1'], 'R #$HASP426#,WARM', 'R #$HASP454#,Y', 'R #$HASP272#,FOO', 'R #$HASP272#,TERM', 'S JES2', 'R #$HASP426#,COLD', 'R #$HASP441#,Y'], expect: ['$HASP479 UNABLE TO OBTAIN CKPT DATA SET LOCK - I/O ERROR', '$HASP454', '$HASP434', '$HASP289', '$HASP272', 'TERM 応答のみ', '$HASP272', '$HASP085', '$HASP436', '$HASP492 JES2 COLD START'], state: { jes: 'HOLD' } },
  { id: 'E46', title: '初回起動 WARM → $HASP454 に N', scenarios: ['FIRSTJES'], steps: [['LOAD', '0A80', '0A8200M1'], 'R #$HASP426#,WARM', 'R #$HASP454#,N'], expect: ['$HASP479', '$HASP428', '$HASP085'], state: { jes: 'DOWN' } },
  { id: 'E47', title: 'ロック残存 → $HASP479 MEMBER=SYSA → $HASP454 不正応答 → 再表示、Y でウォーム', scenarios: ['CKPTLOCK'], steps: [['LOAD', '0A80', '0A8200M1'], 'R #$HASP426#,WARM', 'R #$HASP454#,MAYBE', 'R #$HASP454#,Y'], expect: ['$HASP479 UNABLE TO OBTAIN CKPT DATA SET LOCK - MEMBER=SYSA', '$HASP454', '$HASP454', '$HASP492 JES2 ALL-MEMBER WARM START HAS COMPLETED'], state: { jes: 'HOLD' } },
  { id: 'E48', title: 'ロック残存 → $HASP454 に N', scenarios: ['CKPTLOCK'], steps: [['LOAD', '0A80', '0A8200M1'], 'R #$HASP426#,WARM', 'R #$HASP454#,N'], expect: ['$HASP428', '$HASP085', 'HASP416/HASP417'], state: { jes: 'DOWN' } },
  { id: 'E49', title: '停止手順なしでリセット → 次回 IPL でロック残存（$HASP479 MEMBER=SYSA）', steps: [...BOOT, ['RESET'], ['LOAD', '0A80', '0A8200M1'], 'R #$HASP426#,WARM'], expect: ['システムリセット', '$HASP479 UNABLE TO OBTAIN CKPT DATA SET LOCK - MEMBER=SYSA', '$HASP454'], eval: { '停止手順なしのシステムリセット': false } },
  { id: 'E50', title: 'JES2 起動前の $ コマンド → IEE305I', steps: [['LOAD', '0A80', '0A8200M1'], '$DA'], expect: ['IEE305I $DA COMMAND INVALID'] },
  { id: 'E51', title: 'JES2 起動前の S VTAM（拒否）', steps: [['LOAD', '0A80', '0A8200M1'], 'S VTAM'], expect: ['JES2 が起動していないため VTAM を開始できません'] },
  { id: 'E52', title: '$HASP400 のまま（$S 未入力）ではジョブが始まらない → $S で開始', scenarios: ['BATCH'], steps: [['LOAD', '0A80', '0A8200M1'], 'R #$HASP426#,WARM', ['WAIT', 1], '$S'], expect: ['$HASP400 ENTER REQUESTS', '1分経過', '$HASP000 OK', '$HASP373 PAYROLL'], state: { jes: 'UP' } },
  { id: 'E53', title: 'S JES2,PARM= で開始（$HASP426 なし、NOREQ で $S 不要）', steps: [['LOAD', '0A80', '0A8200M1'], 'R #$HASP426#,$PJES2', "S JES2,PARM='WARM,NOREQ'"], expect: ['$HASP085', '$HASP492'], notExpect: ['$HASP400'], state: { jes: 'UP' } },
  { id: 'E54', title: 'S JES2 の二重起動', steps: [...BOOT, 'S JES2'], expect: ['JES2 はすでに活動中'] },

  // ---- G. 稼働中の操作エラー ---------------------------------------------
  { id: 'E55', title: '存在しないプロシージャーを START → IEFC612I', steps: [...BOOT, 'S VTAMX'], expect: ['IEFC612I PROCEDURE VTAMX WAS NOT FOUND'] },
  { id: 'E56', title: 'VTAM 前に S TSO（拒否）', steps: [...BOOT, 'S TSO'], expect: ['VTAM が必要'] },
  { id: 'E57', title: '応答待ちが無いのに REPLY → IEE701I', steps: [...BOOT, 'R 07,U'], expect: ['IEE701I REPLY 07 IGNORED; NO REPLIES OUTSTANDING'] },
  { id: 'E58', title: '応答番号違い → IEE704I', scenarios: ['TSOUSERS'], steps: [...UPALL, 'P TSO', 'R 99,SIC'], expect: ['IKT010D', 'IEE704I REPLY 99 NOT OUTSTANDING'], state: { pending: ['IKT010D'] } },
  { id: 'E59', title: '綴り誤りのコマンド → IEE305I', steps: [...BOOT, 'DISPLY A'], expect: ['IEE305I DISPLY COMMAND INVALID'] },
  { id: 'E60', title: '不明な JES2 コマンド → $HASP003', steps: [...BOOT, '$ZZ'], expect: ['$HASP003'] },

  // ---- H. 停止 ------------------------------------------------------------
  { id: 'E61', title: '活動していないタスクを STOP → IEE341I', steps: [...BOOT, 'P TCPIP'], expect: ['IEE341I TCPIP NOT ACTIVE'] },
  { id: 'E62', title: 'VTAM を P で止めようとする → IEE342I（Z NET を案内）', steps: [...BOOT, 'S VTAM', 'P VTAM'], expect: ['Z NET', 'IEE342I'], state: { vtam: 'UP' } },
  { id: 'E63', title: 'TSO ユーザー残存で P TSO → IKT010D、不正応答 → 再表示、SIC', scenarios: ['TSOUSERS'], steps: [...UPALL, 'P TSO', 'R #IKT010D#,NO', 'R #IKT010D#,SIC'], expect: ['IKT010D 00002 USER(S) ACTIVE', 'IKT010D', '$HASP395 USER01', 'IKT006I TCAS ENDED'] },
  { id: 'E64', title: 'IKT010D に FSTOP', scenarios: ['TSOUSERS'], steps: [...UPALL, 'P TSO', 'R #IKT010D#,FSTOP'], expect: ['$HASP395 USER01   ENDED - ABEND=S222', 'IKT006I'] },
  { id: 'E65', title: 'TSO 稼働中に Z NET（通常）→ TSO 停止まで待つ', steps: [...UPALL, 'Z NET', 'P TSO'], expect: ['IST097I HALT ACCEPTED', 'の終了を待ちます', 'IKT006I', 'IST102I VTAM IS NOW INACTIVE'], state: { vtam: 'DOWN' } },
  { id: 'E66', title: 'TSO 稼働中に Z NET,QUICK', scenarios: ['TSOUSERS'], steps: [...UPALL, 'Z NET,QUICK'], expect: ['IST097I', '$HASP395 USER01', 'IST102I'], state: { vtam: 'DOWN' } },
  { id: 'E67', title: 'VTAM 停止済みで Z NET → IEE341I', steps: [...BOOT, 'Z NET'], expect: ['IEE341I NET NOT ACTIVE'] },
  { id: 'E68', title: '作業中に $P JES2 → $HASP607 RC=10 ＋ $HASP608', steps: [...UPALL, '$PJES2'], expect: ['$HASP607 JES2 NOT DORMANT -- MEMBER DRAINING, RC=10 ACTIVE ADDRESS SPACES', '$HASP608'], expectIn: { '$HASP608': ['VTAM', 'TCPIP', 'TSO'] }, state: { jes: 'UP' } },
  { id: 'E69', title: '$P なしで $P JES2 → $HASP607 RC=03、再入力で終了', steps: [...BOOT, '$PJES2', '$PJES2'], expect: ['RC=03 ACTIVE PROCESSORS', '$HASP085 JES2 TERMINATION COMPLETE'], state: { jes: 'DOWN' } },
  { id: 'E70', title: 'バッチ実行中に $P → 終了待ち → $HASP099', scenarios: ['BATCH'], steps: [...BOOT, '$P', '$DA', ['WAIT', 15]], expect: ['$HASP373 PAYROLL', '$HASP890 JOB(PAYROLL)', '$HASP395 PAYROLL  ENDED - RC=0000', '$HASP099 ALL AVAILABLE FUNCTIONS COMPLETE'] },
  { id: 'E71', title: 'バッチを CANCEL → IEE301I/IEF450I S222', scenarios: ['BATCH'], steps: [...BOOT, 'C PAYROLL'], expect: ['IEE301I PAYROLL CANCEL COMMAND ACCEPTED', 'IEF450I PAYROLL STEP1 - ABEND=S222', '$HASP395 PAYROLL  ENDED - ABEND=S222'] },
  { id: 'E72', title: 'CANCEL 前に FORCE → IEE838I CANCELABLE', scenarios: ['BATCH'], steps: [...BOOT, 'FORCE PAYROLL', 'C PAYROLL'], expect: ['IEE838I PAYROLL CANCELABLE - ISSUE CANCEL BEFORE FORCE', 'IEE301I'] },
  { id: 'E73', title: '同名ジョブを CANCEL → IEE842I、A= 付きで再入力', scenarios: ['DUPJOB'], steps: [...BOOT, 'C BKUP', 'C BKUP,A=20'], expect: ["IEE842I BKUP DUPLICATE NAME FOUND - REENTER COMMAND WITH 'A='", 'A= に指定する ASID: 0020, 0021', 'IEE301I BKUP CANCEL COMMAND ACCEPTED'] },
  { id: 'E74', title: '取消し不可ジョブ: CANCEL → IEE841I、FORCE → IEE838I NON-CANCELABLE、FORCE ,ARM で終了', scenarios: ['HUNG'], steps: [...BOOT, 'C HUNGJOB', 'FORCE HUNGJOB', 'FORCE HUNGJOB,ARM'], expect: ['IEE841I HUNGJOB NON-CANCELABLE', 'IEE838I HUNGJOB NON-CANCELABLE - ISSUE FORCE ARM', 'IEE301I HUNGJOB FORCE ARM COMMAND ACCEPTED', 'ABEND=S122'] },
  { id: 'E75', title: '活動していないジョブを CANCEL → IEE341I', steps: [...BOOT, 'C NOJOB'], expect: ['IEE341I NOJOB NOT ACTIVE'] },
  { id: 'E76', title: '$P JES2,ABEND,FORCE を先に出す → $HASP553', steps: [...BOOT, '$PJES2,ABEND,FORCE'], expect: ['$HASP553'], state: { jes: 'UP' } },
  { id: 'E77', title: '$P JES2,ABEND（強制終了）→ 採点で減点', steps: [...BOOT, '$PJES2,ABEND', 'Z EOD'], expect: ['$HASP095', '$HASP085'], eval: { '$P JES2,ABEND を使わずに停止': false } },
  { id: 'E78', title: '$P JES2,TERM → $HASP9157、その後 S JES2 は不可', steps: [...BOOT, '$PJES2,TERM', 'S JES2'], expect: ['$HASP085', '$HASP9157 CANNOT RESTART JES2, IPL REQUIRED', '再 IPL するまで再起動できません'], state: { jes: 'TERMED' } },
  { id: 'E79', title: 'JES2 停止前に Z EOD → 採点で順序誤り', steps: [...BOOT, 'Z EOD'], expect: ['IEE334I HALT EOD SUCCESSFUL'], eval: { 'JES2 停止（$P JES2）→ HALT EOD の順序': false } },
  { id: 'E80', title: 'VTAM 稼働中に Z EOD → 採点で減点', steps: [...BOOT, 'S VTAM', '$P', '$PJES2', 'Z EOD'], expect: ['$HASP607', 'IEE334I'], eval: { 'HALT EOD の前に VTAM を停止': false } },
  { id: 'E81', title: 'V XCF,SYSA,OFFLINE → IXC371D 不正応答 → 再表示 → SYSNAME=SYSA → 0A2-004', steps: [...BOOT, '$P', '$PJES2', 'Z EOD', 'V XCF,SYSA,OFFLINE', 'R #IXC371D#,YES', 'R #IXC371D#,SYSNAME=SYSA'], expect: ['IXC371D CONFIRM REQUEST TO VARY SYSTEM SYSA OFFLINE', 'IXC371D', 'IXC101I SYSPLEX PARTITIONING IN PROGRESS FOR SYSA', 'IXC102A', '待機状態コード 0A2 理由 004'], state: { phase: 'PARTITIONED' } },
  { id: 'E82', title: 'V XCF の取消し（C）', steps: [...BOOT, 'V XCF,SYSA,OFFLINE', 'R #IXC371D#,C'], expect: ['IXC371D', '取り消しました'], state: { phase: 'UP' } },
  { id: 'E83', title: 'V XCF に sysplex 外のシステム名', steps: [...BOOT, 'V XCF,SYSZ,OFFLINE'], expect: ['sysplex PLEX1 のシステムではありません'] },
  { id: 'E84', title: '表示コマンド（D T / D A,L / D R,L / $DU / $D JES2）', steps: [...UPALL, 'D T', 'D A,L', 'D R,L', '$DU', '$D JES2'], expect: ['IEE136I LOCAL', 'IEE114I', 'IEE112I', '$HASP608', '$HASP608'] },

  // ---- J. jcl-terminal 連携（相手は link-mock.js の模擬端末。本物との一致は tests/link-e2e.html） ----
  { id: 'L01', link: true, title: 'TSO を起動すると、jcl-terminal の USER01 がログオンする', steps: UPALL, expect: ['IKT007I', '（連携）USER01（jcl-terminal）が TSO にログオン'], termState: { logon: true } },
  { id: 'L02', link: true, title: 'TSO が動いていないと、jcl-terminal から投入できない', steps: [...BOOT, ['TERM', 'HELLO']], notExpect: ['$HASP100 HELLO'], refused: 1, termState: { logon: false } },
  { id: 'L03', link: true, title: 'jcl-terminal で投入したジョブがコンソールに現れて終わる', steps: [...UPALL, ['TERM', 'HELLO']], expect: ['$HASP100 HELLO    ON INTRDR', '$HASP373 HELLO', '$HASP395 HELLO    ENDED - RC=0000'], term: { HELLO: 'CC 0000' } },
  { id: 'L04', link: true, title: '$S を入れる前（$HASP400）に投入したジョブは、$S まで始まらない', steps: [['LOAD', '0A80', '0A8200M1'], 'R #$HASP426#,WARM', 'S VTAM', 'S TCPIP', 'S TSO', ['TERM', 'HELLO'], '$S'], expect: ['$HASP400', '$HASP100 HELLO', '$S', '$HASP373 HELLO', '$HASP395 HELLO'], term: { HELLO: 'CC 0000' } },
  { id: 'L05', link: true, title: '$P の後に投入したジョブは、$S まで始まらない（投入は受け付ける）', steps: [...UPALL, '$P', ['TERM', 'HELLO'], '$S'], expect: ['$HASP100 HELLO', '$S', '$HASP373 HELLO'], term: { HELLO: 'CC 0000' } },
  { id: 'L06', link: true, title: 'データセット使用中 → IEF861I/IEF863I/IEF099I で待ち、使用中のジョブを取り消すと動く', jobs: [{ name: 'SALESUPD', remain: 600, dsns: [{ dsn: 'USER01.SALES.DATA', excl: true }] }],
    steps: [...UPALL, ['TERM', 'LINKRPT'], 'D A,L', 'C SALESUPD'],
    expect: ['$HASP373 SALESUPD', '$HASP373 LINKRPT', 'IEF861I FOLLOWING RESERVED DATA SET NAMES UNAVAILABLE TO LINKRPT', 'IEF863I DSN=USER01.SALES.DATA LINKRPT', 'IEF099I JOB LINKRPT WAITING FOR DATA SETS', 'IEE114I', 'IEE301I SALESUPD CANCEL COMMAND ACCEPTED', '$HASP395 SALESUPD', '$HASP395 LINKRPT  ENDED - RC=0000'],
    expectIn: { IEE114I: ['LINKRPT', 'SALESUPD'] }, term: { LINKRPT: 'CC 0000' } },
  { id: 'L07', link: true, title: 'データセット待ちのジョブ自身を取り消す（S222）', jobs: [{ name: 'SALESUPD', remain: 600, dsns: [{ dsn: 'USER01.SALES.DATA', excl: true }] }],
    steps: [...UPALL, ['TERM', 'LINKRPT'], 'C LINKRPT'], expect: ['IEF099I', 'IEE301I LINKRPT CANCEL COMMAND ACCEPTED', '$HASP395 LINKRPT  ENDED - ABEND=S222'], term: { LINKRPT: 'ABEND S222' } },
  { id: 'L08', link: true, title: 'ジョブの問い合わせ（OPRASK）がコンソールに出る。不正な応答 → 再質問、NO で RC=0004', steps: [...UPALL, ['TERM', 'LINKASK'], 'R #OPR001A#,MAYBE', 'R #OPR001A#,NO'],
    expect: ['OPR001A OK TO PRINT MONTHLY SALES REPORT. REPLY YES OR NO', "OPR003I LINKASK  REPLY 'MAYBE' IS NOT VALID", 'OPR001A', '$HASP395 LINKASK  ENDED - RC=0004'], term: { LINKASK: 'CC 0004' } },
  { id: 'L09', link: true, title: '問い合わせ中のジョブを取り消すと、応答待ちも消える', steps: [...UPALL, ['TERM', 'LINKASK'], 'C LINKASK', 'D R,L'], expect: ['OPR001A', 'IEE301I LINKASK', '$HASP395 LINKASK  ENDED - ABEND=S222', 'RM=0'], term: { LINKASK: 'ABEND S222' } },
  { id: 'L10', link: true, title: 'TYPRUN=HOLD のジョブを $DJ で確かめ、$AJ で解放', steps: [...UPALL, ['TERM', 'HOLDJOB'], "$DJ'HOLDJOB'", "$AJ'HOLDJOB'"],
    expect: ['$HASP100 HOLDJOB', '$HASP890 JOB(HOLDJOB)', '$HASP373 HOLDJOB', '$HASP395 HOLDJOB  ENDED - RC=0000'], expectIn: { '$HASP890 JOB(HOLDJOB)': ['AWAITING EXECUTION', 'HOLD=(JOB)'] }, term: { HOLDJOB: 'CC 0000' } },
  { id: 'L11', link: true, title: '実行前のジョブを $CJ で取り消す', steps: [...UPALL, ['TERM', 'HOLDJOB'], "$CJ'HOLDJOB'"], expect: ['実行前に取り消されました'], notExpect: ['$HASP373 HOLDJOB'], term: { HOLDJOB: 'CANCELED' } },
  { id: 'L12', link: true, title: '存在しないジョブを指定 → $HASP003 RC=(52)', steps: [...UPALL, "$DJ'NOSUCH'"], expect: ['$HASP003 RC=(52)'] },
  { id: 'L13', link: true, title: 'jcl-terminal の SDSF 行コマンド A が、JES2 の $AJ としてオペレーター側で処理される', steps: [...UPALL, ['TERM', 'HOLDJOB'], ['LINECMD', 'HOLDJOB', 'A']], expect: ['$AJ', '$HASP373 HOLDJOB', '$HASP395 HOLDJOB'], term: { HOLDJOB: 'CC 0000' } },
  { id: 'L14', link: true, title: '連携ジョブの実行中は $P JES2 で止まらない（$HASP608 に表示）', linkDurations: { LINKRPT: 30 }, steps: [...UPALL, ['TERM', 'LINKRPT'], '$P', '$PJES2', ['WAIT', 30]],
    expect: ['$HASP373 LINKRPT', '$HASP607', '$HASP608', '$HASP395 LINKRPT  ENDED - RC=0000'], expectIn: { '$HASP608': ['LINKRPT', 'USER01'] }, term: { LINKRPT: 'CC 0000' } },
  { id: 'L15', link: true, title: 'P TSO で USER01 が IKT010D の対象になり、SIC でログオフ', steps: [...UPALL, 'P TSO', 'R #IKT010D#,SIC'], expect: ['IKT010D 00001 USER(S) ACTIVE', 'TSO セッションが終了'], termState: { logon: false } },
  { id: 'L16', link: true, title: '実行中にシステムが落ちる → ウォームスタートで $HASP406、再実行される', linkDurations: { LINKRPT: 30 },
    steps: [...UPALL, ['TERM', 'LINKRPT'], ['RESET'], ['LOAD', '0A80', '0A8200M1'], 'R #$HASP426#,WARM', 'R #$HASP454#,Y', '$S', ['WAIT', 30]],
    expect: ['$HASP373 LINKRPT', 'システムリセット', '$HASP479', '$HASP406 LINKRPT  WAS EXECUTING ON MEMBER SYSA', '$HASP373 LINKRPT', '$HASP395 LINKRPT  ENDED - RC=0000'], term: { LINKRPT: 'CC 0000' } },
  { id: 'L17', link: true, title: 'コールドスタートすると、jcl-terminal から投入したジョブは消える', steps: [...UPALL, ['TERM', 'HOLDJOB'], ['RESET'], ['LOAD', '0A80', '0A8200M1'], 'R #$HASP426#,COLD', 'R #$HASP441#,Y'],
    expect: ['$HASP100 HOLDJOB', '$HASP436', 'ジョブと出力もすべて失われました'], term: { HOLDJOB: null } },
  { id: 'L18', link: true, title: 'JCL エラーのジョブは実行されずに終わる（IEFC452I / $HASP396）', steps: [...UPALL, ['TERM', 'BADJCL']], expect: ['$HASP100 BADJCL', 'IEFC452I BADJCL - JOB NOT RUN - JCL ERROR', '$HASP396 BADJCL   TERMINATED'], notExpect: ['$HASP373 BADJCL'], term: { BADJCL: 'JCL ERROR' } },

  // ---- I. 正常系（基準） ----------------------------------------------------
  { id: 'N01', title: '正常な IPL と停止（全採点項目 OK）', steps: [...UPALL, ...DOWNALL, 'V XCF,SYSA,OFFLINE', 'R #IXC371D#,SYSNAME=SYSA'], expect: ['IEE389I', '$HASP492', 'IST020I', 'IKT007I', 'EZZ4201I', 'IST102I', '$HASP099', '$HASP085', 'IEE334I', 'IXC101I'], state: { phase: 'PARTITIONED' }, evalAllOk: true },
  { id: 'N02', title: '正常停止後にリセット → 次の IPL ではロックが残らない', steps: [...BOOT, '$P', '$PJES2', 'Z EOD', ['RESET'], ['LOAD', '0A80', '0A8200M1'], 'R #$HASP426#,WARM'], expect: ['IEE334I', 'システムリセット', '$HASP492'], notExpect: ['$HASP479'], state: { jes: 'HOLD' } },
];
if (typeof module !== 'undefined' && module.exports) module.exports = CASES; else root.MvsCases = CASES;
})(typeof window !== 'undefined' ? window : globalThis);
