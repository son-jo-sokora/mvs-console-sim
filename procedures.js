/* IPL / シャットダウンの手順例（教材コンテンツ）
 * 各手順はシミュレータ（engine.js）で実際に実行してコンソール出力を作る。手順書と画面が食い違わないようにするため。
 * steps の op:
 *   LOAD  … HMC から LOAD（addr, lp）
 *   CMD   … コンソール入力（in）。#MSGID# はその WTOR の応答番号に置き換える。'' は Enter のみ
 *   WAIT  … 時間経過（min 分）
 *   RESET … HMC からシステムリセット
 *   NOTE  … 操作なし。確認・判断のポイントだけ書く
 * prep: 表示しない前準備の手順（例: 停止手順の前に IPL を済ませておく）
 * end: 手順の最後にあるべき状態（テストで確認）
 */
(function (root) {
  const BOOT = [{ op: 'LOAD', addr: '0A80', lp: '0A8200M1' }, { op: 'CMD', in: 'R #$HASP426#,WARM' }, { op: 'CMD', in: '$S' }];
  const UPALL = BOOT.concat([{ op: 'CMD', in: 'S VTAM' }, { op: 'CMD', in: 'S TCPIP' }, { op: 'CMD', in: 'S TSO' }]);

  const P = [
    // ======================= 正常系 =======================
    {
      id: 'P01', cat: '正常系', title: '標準の IPL（メッセージ表示・プロンプトなし）',
      when: '毎日の立ち上げ。システムパラメーターは LOAD00 と IEASYS00 のとおりで変更しない。',
      points: [
        'ロードパラメーターは8桁で、各桁の位置に意味がある（IODF 装置4桁＋LOADxx 2桁＋IMSI 1桁＋代替核 1桁）。',
        'IMSI＝M は「情報メッセージを表示し、マスターカタログとシステムパラメーターは聞かない」。立ち上がりの様子を確認しやすい。',
        'JES2 の開始オプションは通常 WARM。COLD はスプール上のジョブがすべて失われるので、指示がない限り使わない。',
      ],
      steps: [
        { op: 'LOAD', addr: '0A80', lp: '0A8200M1', say: 'HMC でロードアドレスに SYSRES の装置番号 0A80、ロードパラメーターに 0A8200M1 を入れて LOAD。0A82＝IODF と SYS1.IPLPARM のある装置、00＝LOAD00、M＝メッセージ表示・プロンプトなし、1＝標準の核。' },
        { op: 'NOTE', say: 'IEA371I で LOADxx を読んだ装置、IEA246I でメンバー、IEA519I で IODF 名、IEA370I でマスターカタログ、IEA008I で使われた IEASYSxx を確認する。手順書の値と違えば止めてシステムプログラマーに連絡。' },
        { op: 'CMD', in: 'R #$HASP426#,WARM', say: 'IEE389I（MVS コマンドが使える）の後、COMMND00 から S JES2 が自動で入り、$HASP426 で開始オプションを聞かれる。WARM で応答。' },
        { op: 'CMD', in: '$S', say: '$HASP492（初期化完了）の後 $HASP400 ENTER REQUESTS が出たら $S で JES2 の処理を開始。' },
        { op: 'CMD', in: 'S VTAM', say: 'ネットワーク（VTAM）を開始。IST020I で初期化完了。' },
        { op: 'CMD', in: 'S TCPIP', say: 'TCP/IP を開始。' },
        { op: 'CMD', in: 'S TSO', say: 'TSO/VTAM を開始。VTAM が先に動いている必要がある。IKT007I でログオン受付開始。' },
        { op: 'CMD', in: 'D A,L', say: '最後に活動中のタスクを確認する。' },
      ],
      end: { phase: 'UP', jes: 'UP', vtam: 'UP' },
      refs: ['System Commands SA38-0666 p.2-7（起動・LOAD パラメーター・IMSI 表）', 'JES2 Commands SA32-0990 p.30-33（JES2 開始オプション）'],
    },
    {
      id: 'P02', cat: '正常系', title: 'パラメーターを指定して IPL（CLPA・IEASYS01 を追加）',
      when: 'システムプログラマーから「今回は SYSP=01 と CLPA を指定して IPL」と指示されたとき（保守適用後など）。',
      points: [
        'IMSI を A にすると、マスターカタログ（IEA347A）とシステムパラメーター（IEA101A）の両方を聞かれる。',
        'IEA347A は Enter で標準（SYS1.NUCLEUS の SYSCATLG）。',
        'IEA101A への応答は打ち間違えると望まない設定で起動するので、指示書を見ながら入れる。長いときは末尾に CONT を付けて次の行に続ける。',
        'JES2 に NOREQ を付けると $HASP400 が出ず、$S なしで処理が始まる。',
      ],
      steps: [
        { op: 'LOAD', addr: '0A80', lp: '0A8200A1', say: 'IMSI を A（両方プロンプト）にして LOAD。' },
        { op: 'CMD', in: '', say: 'IEA347A には Enter（SYSCATLG を使う）。' },
        { op: 'CMD', in: 'R 00,SYSP=01,CLPA', say: 'IEA101A に指示どおりのパラメーターを応答。IEASYS00 に加えて IEASYS01 を使い、CLPA で PLPA を作り直す。' },
        { op: 'NOTE', say: 'IEA008I の下に IEASYS00・IEASYS01 と CLPA が表示されていることを確認。' },
        { op: 'CMD', in: 'R #$HASP426#,WARM,NOREQ', say: 'JES2 は WARM,NOREQ。$HASP400 は出ず、$S は不要。' },
        { op: 'CMD', in: 'S VTAM' }, { op: 'CMD', in: 'S TCPIP' }, { op: 'CMD', in: 'S TSO' },
      ],
      end: { phase: 'UP', jes: 'UP', vtam: 'UP' },
      refs: ['System Commands p.6-7（IEA347A・IEA101A への応答）', 'MVS System Messages Vol 6 IEA101A p.1112'],
    },
    {
      id: 'P03', cat: '正常系', title: '標準のシャットダウン（TSO ユーザーが残っている場合）',
      when: '計画停止。JES2・VTAM・TCP/IP・TSO が動いていて、TSO ユーザーが2人ログオンしている。',
      scenarios: ['TSOUSERS'], prep: UPALL, prepSay: 'JES2・VTAM・TCP/IP・TSO が稼働中（P01 の状態）。',
      points: [
        '止める順番は「起動の逆」：TSO → TCP/IP → VTAM → バッチ（$P）→ JES2 → HALT EOD → システムの切り離し。',
        'JES2 は配下で動いているアドレス空間（VTAM・TCP/IP・TSO・ジョブ）がある間は止まらない。先にそれらを止める。',
        'HALT EOD（Z EOD）は JES2 停止の後。統計やログを書き出してから止めるためのもの。',
        'sysplex から外すときは V XCF,sysname,OFFLINE。確認の IXC371D に SYSNAME= で応答する。',
      ],
      steps: [
        { op: 'CMD', in: 'D A,L', say: 'まず活動中のタスクと TSO ユーザーを確認。' },
        { op: 'CMD', in: 'P TSO', say: 'TSO を停止。ユーザーが残っているので IKT010D で SIC/FSTOP を聞かれる。' },
        { op: 'CMD', in: 'R #IKT010D#,SIC', say: 'SIC（通常終了）で応答。FSTOP は SIC で終わらないときだけ使う。' },
        { op: 'CMD', in: 'P TCPIP', say: 'TCP/IP を停止。EZZ4201I で終了。' },
        { op: 'CMD', in: 'Z NET', say: 'VTAM を停止（HALT NET）。IST102I で終了。VTAM は P ではなく Z NET で止める。' },
        { op: 'CMD', in: '$P', say: 'JES2 のイニシエーター等を drain（新しいジョブを始めない）。$HASP099 が出れば全機能が休止。' },
        { op: 'CMD', in: '$PJES2', say: 'JES2 を停止。$HASP085 JES2 TERMINATION COMPLETE を確認。' },
        { op: 'CMD', in: 'Z EOD', say: 'HALT EOD。IEE334I HALT EOD SUCCESSFUL を確認。' },
        { op: 'CMD', in: 'V XCF,SYSA,OFFLINE', say: 'sysplex から SYSA を外す。' },
        { op: 'CMD', in: 'R #IXC371D#,SYSNAME=SYSA', say: '確認に SYSNAME=SYSA で応答。SYSA は待機状態 0A2（理由 004）になり停止完了。残る SYSB 側に IXC102A が出たら、SYSA のシステムリセット後に DOWN と応答する。' },
      ],
      end: { phase: 'PARTITIONED' }, evalAllOk: true,
      refs: ['JES2 Commands SA32-0990 p.38-39（Stopping JES2 / $P JES2 / HALT EOD）', 'SNA Messages IKT010D p.56', 'MVS System Messages Vol 10 IXC371D p.325', 'System Codes 0A2 p.743'],
    },

    // ======================= 停止時の対応 =======================
    {
      id: 'P04', cat: '停止時の対応', title: 'バッチジョブが残っている（終了を待つ）',
      when: '$P JES2 の前にバッチ PAYROLL がまだ実行中。業務上、最後まで走らせる必要がある。',
      scenarios: ['BATCH'], prep: BOOT, prepSay: 'JES2 稼働中、バッチ PAYROLL 実行中。',
      points: [
        '$P でイニシエーターを止めても、実行中のジョブは最後まで走る。新しいジョブは始まらない。',
        '$DA や D A,L で残っているジョブを確認し、終了を待つか、業務担当に確認して CANCEL するか判断する。',
        'ジョブが残ったまま $P JES2 を入れると $HASP607（RC=10 ACTIVE ADDRESS SPACES）と $HASP608 で理由が表示され、JES2 は止まらない。',
      ],
      steps: [
        { op: 'CMD', in: '$P', say: 'イニシエーターを drain。' },
        { op: 'CMD', in: '$DA', say: '実行中のジョブを確認 → PAYROLL が実行中。' },
        { op: 'CMD', in: '$PJES2', say: '（よくある誤り）ジョブが残ったまま $P JES2 → $HASP607 と $HASP608 で拒否される。' },
        { op: 'WAIT', min: 15, say: 'PAYROLL の終了を待つ（シミュレータでは時間を進める）。$HASP395 で終了、$HASP099 で全機能休止。' },
        { op: 'CMD', in: '$PJES2', say: 'あらためて $P JES2 → $HASP085。' },
        { op: 'CMD', in: 'Z EOD' },
      ],
      end: { jes: 'DOWN' },
      refs: ['JES2 Messages $HASP607 p.463 / $HASP608 p.465 / $HASP099 p.123', 'JES2 Commands p.38'],
    },
    {
      id: 'P05', cat: '停止時の対応', title: 'バッチジョブを取り消して停止する',
      when: '停止時刻を過ぎてもバッチ PAYROLL が終わらない。業務担当の了解を得て取り消す。',
      scenarios: ['BATCH'], prep: BOOT, prepSay: 'JES2 稼働中、バッチ PAYROLL 実行中。',
      points: [
        'CANCEL は業務への影響があるので、必ず担当者の了解を得てから。',
        'いきなり FORCE は使えない。まず CANCEL（IEE838I CANCELABLE - ISSUE CANCEL BEFORE FORCE が出る）。',
        'CANCEL されたジョブは S222 で異常終了する。',
      ],
      steps: [
        { op: 'CMD', in: '$P' },
        { op: 'CMD', in: '$DA', say: 'PAYROLL が実行中であることを確認。' },
        { op: 'CMD', in: 'FORCE PAYROLL', say: '（よくある誤り）先に FORCE → IEE838I で拒否される。' },
        { op: 'CMD', in: 'C PAYROLL', say: 'CANCEL。IEE301I で受付、IEF450I で S222、$HASP395 で終了。' },
        { op: 'CMD', in: '$PJES2' },
        { op: 'CMD', in: 'Z EOD' },
      ],
      end: { jes: 'DOWN' },
      refs: ['MVS System Messages Vol 7 IEE301I p.978 / IEE838I p.1268', 'Vol 8 IEF450I p.270'],
    },
    {
      id: 'P06', cat: '停止時の対応', title: '取り消しできないジョブ（NON-CANCELABLE）',
      when: 'CANCEL すると IEE841I NON-CANCELABLE と言われるジョブ HUNGJOB が残っている。',
      scenarios: ['HUNG'], prep: BOOT, prepSay: 'JES2 稼働中、取消し不可のジョブ HUNGJOB 実行中。',
      points: [
        '取消し不可として定義されたジョブは CANCEL も通常の FORCE も効かない（IEE841I → IEE838I NON-CANCELABLE - ISSUE FORCE ARM）。',
        'FORCE jobname,ARM で終わらせる。FORCE は最後の手段で、影響が大きいのでシステムプログラマーの指示で行う。',
      ],
      steps: [
        { op: 'CMD', in: '$P' },
        { op: 'CMD', in: '$PJES2', say: '$HASP608 の ACTIVE ADDRESS SPACES に HUNGJOB が残っていることがわかる。' },
        { op: 'CMD', in: 'C HUNGJOB', say: 'IEE841I NON-CANCELABLE。' },
        { op: 'CMD', in: 'FORCE HUNGJOB', say: 'IEE838I NON-CANCELABLE - ISSUE FORCE ARM。' },
        { op: 'CMD', in: 'FORCE HUNGJOB,ARM', say: 'IEE301I FORCE ARM COMMAND ACCEPTED。ジョブ終了。' },
        { op: 'CMD', in: '$PJES2' },
        { op: 'CMD', in: 'Z EOD' },
      ],
      end: { jes: 'DOWN' },
      refs: ['MVS System Messages Vol 7 IEE841I p.1271 / IEE838I p.1268'],
    },
    {
      id: 'P07', cat: '停止時の対応', title: '同じ名前のジョブが2本ある',
      when: 'バックアップジョブ BKUP が2本同時に動いていて、どちらも取り消す。',
      scenarios: ['DUPJOB'], prep: BOOT, prepSay: 'JES2 稼働中、BKUP が2本実行中。',
      points: [
        '同名ジョブがあると CANCEL jobname は IEE842I で拒否される。',
        'D A,L で ASID を調べ、C jobname,A=asid で1本ずつ指定する。',
      ],
      steps: [
        { op: 'CMD', in: '$P' },
        { op: 'CMD', in: 'C BKUP', say: 'IEE842I DUPLICATE NAME FOUND。' },
        { op: 'CMD', in: 'D A,L', say: '2本の BKUP の ASID（A=0020・A=0021）を確認。' },
        { op: 'CMD', in: 'C BKUP,A=20' },
        { op: 'CMD', in: 'C BKUP,A=21' },
        { op: 'CMD', in: '$PJES2' },
        { op: 'CMD', in: 'Z EOD' },
      ],
      end: { jes: 'DOWN' },
      refs: ['MVS System Messages Vol 7 IEE842I p.1272'],
    },

    // ======================= IPL 時の障害対応 =======================
    {
      id: 'P08', cat: 'IPL 時の障害対応', title: 'LOAD パラメーターの打ち間違い（待機状態 088）',
      when: 'LOAD したら何もメッセージが出ず、HMC に無効待機状態（DISABLED WAIT）が表示された。',
      points: [
        '無効待機状態になったら、まず PSW（右端の待機状態コードと理由コード）を記録する。',
        '088 理由 00 は「LOADxx が見つからない」。ロードパラメーター5〜6桁目（LOADxx）や1〜4桁目（IODF 装置）の打ち間違いを疑う。',
        '3桁の装置番号は先頭に 0 を付ける。各桁は位置で決まるので、1文字ずれると全部ずれる。',
        'ロードパラメーターを直して、もう一度 LOAD すればよい（待機状態からはそのまま再 LOAD できる）。',
      ],
      steps: [
        { op: 'LOAD', addr: '0A80', lp: '0A8201M1', say: 'LOAD00 のつもりが 01 と入力してしまった。' },
        { op: 'NOTE', say: 'PSW の右端 …00000088 → 待機状態コード 088 理由 00（LOAD01 が見つからない）。System Codes で 088 を確認。' },
        { op: 'LOAD', addr: '0A80', lp: '0A8200M1', say: 'ロードパラメーターを 0A8200M1 に直して再 LOAD。' },
        { op: 'CMD', in: 'R #$HASP426#,WARM' },
        { op: 'CMD', in: '$S' },
      ],
      end: { phase: 'UP', jes: 'UP' },
      refs: ['System Codes 088 p.734 / 0B3 p.760', 'System Commands p.4-5（LOAD パラメーターの書式）'],
    },
    {
      id: 'P09', cat: 'IPL 時の障害対応', title: 'ボリューム名の重複（IEA213A）',
      when: 'IPL 中に IEA213A DUPLICATE VOLUME WORK01 FOUND ON DEVICES 0A85 AND 0B85 が出た。',
      scenarios: ['DUPVOL'],
      points: [
        '同じボリューム名の DASD が2台あるので、どちらを OFFLINE にするかを応答する。',
        '手順書の「必要ボリューム一覧」で本番の装置番号を確認する（この環境では WORK01＝0A85）。外すのは 0B85。',
        '装置番号以外を応答すると IEA310A INVALID REPLY で同じ質問が再表示される。',
      ],
      steps: [
        { op: 'LOAD', addr: '0A80', lp: '0A8200M1' },
        { op: 'NOTE', say: '必要ボリューム一覧を見て、WORK01 の本番装置は 0A85 と確認。' },
        { op: 'CMD', in: 'R 00,0B85', say: '外す方（0B85）を応答。IEA313I DEVICE 0B85 DISMOUNTED。' },
        { op: 'CMD', in: 'R #$HASP426#,WARM' },
        { op: 'CMD', in: '$S' },
      ],
      end: { phase: 'UP', jes: 'UP' },
      refs: ['MVS System Messages Vol 6 IEA213A p.1147 / IEA313I p.1193 / IEA310A p.1191'],
    },
    {
      id: 'P10', cat: 'IPL 時の障害対応', title: '共用 DASD が応答しない（IEA120D）',
      when: 'IEA120D DEVICE 0B91 VOLID NOT READ が出た。0B91 は他システムと共用している。',
      scenarios: ['NOTREADY'],
      points: [
        '他システムが装置を予約（RESERVE）中だと読めない。WAIT＝読めるまで待つ、CONT＝その装置を OFFLINE にして続行。',
        'IPL に必要な装置なら WAIT。業務上すぐ不要なら CONT で先に進め、後で VARY ONLINE する。',
      ],
      steps: [
        { op: 'LOAD', addr: '0A80', lp: '0A8200M1' },
        { op: 'CMD', in: 'R 00,WAIT', say: '相手システムの予約解除を待つ。' },
        { op: 'CMD', in: 'R #$HASP426#,WARM' },
        { op: 'CMD', in: '$S' },
      ],
      end: { phase: 'UP', jes: 'UP' },
      refs: ['MVS System Messages Vol 6 IEA120D p.1115'],
    },
    {
      id: 'P11', cat: 'IPL 時の障害対応', title: 'マスターカタログの指定が壊れている（待機状態 05F → 代替を指定）',
      when: 'LOAD00 に SYSCAT 文がなく IEA347A が出る環境で、SYS1.NUCLEUS(SYSCATLG) が壊れている。代替として SYSCAT02 が用意されている。',
      scenarios: ['NOSYSCAT', 'BADCAT'],
      points: [
        'IEA347A に Enter だと SYSCATLG を使う。これが壊れていると待機状態 05F になる。',
        'システムプログラマーの指示で、代替の SYSCATxx（ここでは 02）を IEA347A に応答して再 IPL する。',
      ],
      steps: [
        { op: 'LOAD', addr: '0A80', lp: '0A8200M1' },
        { op: 'CMD', in: '', say: 'いつもどおり Enter（SYSCATLG）→ 待機状態 05F。' },
        { op: 'NOTE', say: 'PSW を記録してシステムプログラマーに連絡。代替メンバー SYSCAT02 を使うよう指示を受けた。' },
        { op: 'LOAD', addr: '0A80', lp: '0A8200M1', say: '再 LOAD。' },
        { op: 'CMD', in: 'R 00,02', say: 'IEA347A に 02 を応答（SYSCAT02 を使う）。IEA370I でマスターカタログを確認。' },
        { op: 'CMD', in: 'R #$HASP426#,WARM' },
        { op: 'CMD', in: '$S' },
      ],
      end: { phase: 'UP', jes: 'UP' },
      refs: ['MVS System Messages Vol 6 IEA347A p.1211 / IEA370I p.1227', 'System Codes 05F p.709'],
    },
    {
      id: 'P12', cat: 'IPL 時の障害対応', title: 'IEASYS00 が見つからない（IEA301I → IEA336A）',
      when: 'IPL 中に IEA301I IEASYS00 NOT FOUND IN SYS1.PARMLIB が出て、IEA336A で再指定を求められた。',
      scenarios: ['NOIEASYS'],
      points: [
        'IEA301I → IEA324I → IEA336A の組み合わせで出る。',
        'システムプログラマーの指示で、代わりの IEASYSxx を SYSP=xx で指定する。Enter で打ち切ると、それまでに受け付けたパラメーターだけで続行する。',
      ],
      steps: [
        { op: 'LOAD', addr: '0A80', lp: '0A8200M1' },
        { op: 'CMD', in: 'R 00,SYSP=01', say: '指示に従い IEASYS01 を指定。' },
        { op: 'CMD', in: 'R #$HASP426#,WARM' },
        { op: 'CMD', in: '$S' },
      ],
      end: { phase: 'UP', jes: 'UP' },
      refs: ['MVS System Messages Vol 6 IEA301I p.1186 / IEA324I p.1199 / IEA336A p.1206'],
    },
    {
      id: 'P13', cat: 'IPL 時の障害対応', title: 'sysplex に停止済みシステムの記録が残っている（IXC405D）',
      when: 'IXC404I SYSTEM(S) ACTIVE OR IPLING: SYSB と IXC405D が出た。SYSB は昨夜から電源断で止まっている。',
      scenarios: ['RESIDUAL'],
      points: [
        'SYSB が本当に止まっている（残骸）なら I（sysplex を新規初期化）。',
        'SYSB が実際に動いているなら J（参加）。動いているのに I と答えると SYSB が待機状態に落ちるので、必ず SYSB の状態を確認してから。',
        'R は COUPLExx を指定し直して XCF を再初期化する（システムプログラマーの指示時）。',
      ],
      steps: [
        { op: 'LOAD', addr: '0A80', lp: '0A8200M1' },
        { op: 'NOTE', say: 'HMC で SYSB の LPAR が停止していることを確認。' },
        { op: 'CMD', in: 'R 00,I', say: 'I で応答。IXC418I で sysplex に参加。' },
        { op: 'CMD', in: 'R #$HASP426#,WARM' },
        { op: 'CMD', in: '$S' },
      ],
      end: { phase: 'UP', jes: 'UP' },
      refs: ['MVS System Messages Vol 10 IXC404I p.362 / IXC405D p.363'],
    },
    {
      id: 'P14', cat: 'IPL 時の障害対応', title: '前回 JES2 が異常終了していた（$HASP479 / $HASP454）',
      when: '前回はシステムが落ちて、JES2 を正常に止められなかった。WARM で開始すると $HASP479 MEMBER=SYSA が出た。',
      scenarios: ['CKPTLOCK'],
      points: [
        'チェックポイントのロックを、落ちた SYSA 自身が持ったままになっている。',
        'ロックを持つメンバーが本当に停止しているときだけ $HASP454 に Y（ロックを無視して続行）。他に活動中のメンバーがあるなら N。',
      ],
      steps: [
        { op: 'LOAD', addr: '0A80', lp: '0A8200M1' },
        { op: 'CMD', in: 'R #$HASP426#,WARM', say: '$HASP479 UNABLE TO OBTAIN CKPT DATA SET LOCK - MEMBER=SYSA と $HASP454。' },
        { op: 'NOTE', say: 'ロックを持つのは自分（SYSA）で、前回落ちたことを確認。' },
        { op: 'CMD', in: 'R #$HASP454#,Y', say: 'Y で続行 → ウォームスタート完了。' },
        { op: 'CMD', in: '$S' },
      ],
      end: { phase: 'UP', jes: 'UP' },
      refs: ['JES2 Messages $HASP479 p.369 / $HASP454 p.350'],
    },
    {
      id: 'P15', cat: 'IPL 時の障害対応', title: 'JES2 を初めて起動する（COLD スタート）',
      when: '新しく作ったシステムで、JES2 のチェックポイントがまだ初期化されていない。',
      scenarios: ['FIRSTJES'],
      points: [
        '初回は COLD（または FORMAT）を指定する。WARM だと $HASP479 I/O ERROR → … → $HASP289/$HASP272 となり、TERM で終わらせて COLD でやり直すことになる。',
        'COLD は $HASP436 で内容を表示し、$HASP441 で Y/N の確認を求める。',
      ],
      steps: [
        { op: 'LOAD', addr: '0A80', lp: '0A8200M1' },
        { op: 'CMD', in: 'R #$HASP426#,COLD', say: 'COLD を指定。' },
        { op: 'CMD', in: 'R #$HASP441#,Y', say: '$HASP436 の表示（チェックポイントとスプール）を確認して Y。' },
        { op: 'CMD', in: '$S' },
      ],
      end: { phase: 'UP', jes: 'UP' },
      refs: ['JES2 Commands p.31（初回起動の手順）', 'JES2 Messages $HASP436 p.337 / $HASP441 p.340'],
    },
    {
      id: 'P16', cat: 'IPL 時の障害対応', title: '時刻の確認を求められた（IEA888A）',
      when: 'CLOCKxx が OPERATOR PROMPT になっていて、IPL 中に IEA888A で時刻の確認を求められた。',
      scenarios: ['TODPROMPT'],
      points: [
        '表示された時刻が正しければ U。',
        '直す場合は DATE=yyyy.ddd,CLOCK=hh.mm.ss（UTC で指定するなら ,GMT）。直すと再表示されるので、最後に U。',
      ],
      steps: [
        { op: 'LOAD', addr: '0A80', lp: '0A8200M1' },
        { op: 'NOTE', say: '表示された LOCAL の日時を時計と照合する。' },
        { op: 'CMD', in: 'R 00,U', say: '正しいので U。' },
        { op: 'CMD', in: 'R #$HASP426#,WARM' },
        { op: 'CMD', in: '$S' },
      ],
      end: { phase: 'UP', jes: 'UP' },
      refs: ['MVS System Messages Vol 6 IEA888A p.1439', 'System Commands p.7（Setting the Time and Date）'],
    },
  ];

  // 手順をシミュレータで実行し、ステップごとの出力を返す
  function run(Sim, proc) {
    const s = new Sim({ scenarios: proc.scenarios || [] });
    const exec = st => {
      if (st.op === 'LOAD') s.hmcLoad(st.addr, st.lp);
      else if (st.op === 'RESET') s.hmcReset();
      else if (st.op === 'WAIT') s.advance(st.min);
      else if (st.op === 'CMD') {
        const errs = [];
        const cmd = st.in.replace(/#([^#]+)#/g, (_, mid) => { const p = s.pending().find(x => x.msgid === mid); if (!p) { errs.push(mid); return '??'; } return p.id; });
        s.command(cmd);
        return { cmd, errs };
      }
      return {};
    };
    (proc.prep || []).forEach(exec);
    const result = [];
    for (const st of proc.steps) {
      const from = s.out.length;
      const r = exec(st) || {};
      result.push({ step: st, cmd: r.cmd, errs: r.errs || [], out: s.out.slice(from) });
    }
    return { sim: s, steps: result };
  }

  const api = { PROCS: P, run };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MvsProcs = api;
})(typeof window !== 'undefined' ? window : globalThis);
