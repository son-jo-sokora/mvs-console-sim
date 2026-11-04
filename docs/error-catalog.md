# IPL / シャットダウンで起こりうるエラー一覧（シミュレータ再現分・テスト対応）

z/OS 3.2 のマニュアルを検索して洗い出したエラーのうち、オペレーターの IPL・停止操作で起こるものをシミュレータで再現し、1件ずつテストにしたものです。

**シミュレータで再現・テストしているケース: 104 件**（結果は tests/run.html で確認できます）

マニュアルから機械抽出した候補は **全 387 件**（[error-candidates.md](error-candidates.md)）。そのうち、ここに載せたテストで再現しているメッセージ・待機状態コードは 51 件です。残りの大半はハードウェア・導入設定（PARMLIB の中身）・内部障害に起因するもので、オペレーター操作の練習には向かないため対象外としました。操作に関係するが未対応のものは、IEA338A・IEA341A（個別パラメーターの再指定）、IEA527A（SYSNAME 未指定）、IXC402D（相手システムの停止確認）、$HASP490（ホットスタート拒否）、$HASP620（停止処理中のコマンド拒否）、$HASP098・$HASP070（JES2 異常時の終了オプション）、$HASP454 に N と答えた後の HASP416/HASP417 の確認対話です。

- テストの実行: ブラウザで `tests/run.html` を開く、または `node tests/run-tests.js`（詳細出力は環境変数 `VERBOSE=1`）
- ケースの定義: `tests/cases.js`（この一覧は `node tools/make_errors_md.js` で再生成）
- 「出典」はそのケースで出る主なメッセージ／待機状態コードの定義ページ（PDF のページ番号）
- シナリオ名はシミュレータ画面左の「障害シナリオ」に対応

## A. HMC からの LOAD・LOAD パラメーター（14 件）

| No. | 状況・操作 | 前提シナリオ | 期待される応答 | 出典 |
|---|---|---|---|---|
| E01 | ロードアドレスが16進でない | — | `ロードアドレスが正しくありません` | （シミュレータ注記） |
| E02 | 存在しない装置から LOAD | — | `LOAD 失敗` | （シミュレータ注記） |
| E03 | IPL テキストのないボリュームから LOAD（待機状態 00F） | — | `待機状態コード 00F` | 待機 00F: System Codes p.682 |
| E04 | LOAD パラメーター1〜4桁目が16進でない（0B3） | — | `待機状態コード 0B3` | 待機 0B3: System Codes p.760 |
| E05 | LOADxx が存在しない（088-00） | — | `待機状態コード 088 理由 00` | 待機 088: System Codes p.734 |
| E06 | IODF 装置の指定誤り（IPLPARM が無い装置, 088-00） | — | `待機状態コード 088 理由 00` | 待機 088: System Codes p.734 |
| E07 | ロードパラメーター省略（SYSRES に LOADxx なし, 088-00） | — | `088 理由 00` | 待機 088: System Codes p.734 |
| E08 | 代替核 ID の誤り（088-0E） | — | `待機状態コード 088 理由 0E` | 待機 088: System Codes p.734 |
| E09 | LOADxx の IODF 文が存在しない IODF を指す（0B1-01） | — | `IEA246I LOAD   ID A1` → `待機状態コード 0B1 理由 01` | IEA246I: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1154<br>待機 0B1: System Codes p.756 |
| E10 | IMSI 文字が表にない（既定値扱い） | — | `IMSI 文字 "X"` → `$HASP492` | $HASP492: z/OS JES2 Messages p.377 |
| E11 | ロードパラメーターが9文字 | — | `8文字まで` | （シミュレータ注記） |
| E12 | 稼働中に LOAD（拒否） | — | `稼働中です` | （シミュレータ注記） |
| E13 | 待機状態中のコマンド入力 | — | `無効待機状態です` | （シミュレータ注記） |
| E14 | 3桁装置番号の先頭0省略（A8200M1 → 位置がずれて IODF=A820・LOAD0M となり 088-00） | — | `待機状態コード 088 理由 00` → `LOAD0M` | 待機 088: System Codes p.734 |

## B. NIP：装置・ボリューム（7 件）

| No. | 状況・操作 | 前提シナリオ | 期待される応答 | 出典 |
|---|---|---|---|---|
| E15 | ラベルなし DASD（IEA311I） | ラベルのない DASD が接続されている（0B90） | `IEA311I UNLABELED DASD ON 0B90` | IEA311I: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1192 |
| E16 | IEA120D への不正応答 → IEA310A、WAIT で続行 | 共用 DASD が他システムに予約されている（0B91 応答なし） | `IEA120D DEVICE 0B91` → `IEA310A INVALID REPLY` → `IEA120D DEVICE 0B91` → `IEE389I` | IEA120D: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1115<br>IEA310A: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1191<br>IEE389I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.1026 |
| E17 | IEA120D に CONT（装置 OFFLINE で続行） | 共用 DASD が他システムに予約されている（0B91 応答なし） | `0B91 は OFFLINE` → `IEE389I` | IEE389I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.1026 |
| E18 | ボリューム重複 IEA213A：不正応答 → IEA310A、正しい応答 → IEA313I | ボリューム名の重複（WORK01 が 0A85 と 0B85 にある） | `IEA213A DUPLICATE VOLUME WORK01` → `IEA310A` → `IEA213A` → `IEA313I DEVICE 0B85 DISMOUNTED` → `IEE389I` | IEA213A: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1147<br>IEA310A: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1191<br>IEA313I: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1193 |
| E19 | IEA213A で本番側（0A85）を外した | ボリューム名の重複（WORK01 が 0A85 と 0B85 にある） | `IEA313I DEVICE 0A85 DISMOUNTED` → `手順書との相違` | IEA313I: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1193 |
| E20 | SYSRES 重複 IEA214A：不正応答 → IEA310A、CONT → IEA313I | SYSRES のコピー（Z32RS1）が別の装置 0B80 にもある | `IEA214A DUPLICATE SYSRES Z32RS1` → `IEA310A` → `IEA214A` → `IEA313I DEVICE 0B80 DISMOUNTED` → `IEE389I` | IEA214A: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1148<br>IEA310A: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1191<br>IEA313I: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1193 |
| E21 | 複数の装置障害が同時（IEA311I＋IEA120D＋IEA213A） | ラベルのない DASD が接続されている（0B90）<br>共用 DASD が他システムに予約されている（0B91 応答なし）<br>ボリューム名の重複（WORK01 が 0A85 と 0B85 にある） | `IEA311I` → `IEA120D` → `IEA213A` → `IEA313I` → `IEE389I` | IEA311I: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1192<br>IEA120D: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1115<br>IEA213A: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1147 |

## C. NIP：マスターカタログ（4 件）

| No. | 状況・操作 | 前提シナリオ | 期待される応答 | 出典 |
|---|---|---|---|---|
| E22 | LOADxx に SYSCAT なし → IEA347A。存在しないメンバー → 再表示、Enter で SYSCATLG | LOAD00 に SYSCAT 文がない（マスターカタログを聞かれる） | `IEA347A` → `IEA347A` → `IEA370I MASTER CATALOG SELECTED` | IEA347A: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1211<br>IEA370I: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1227 |
| E23 | SYSCATLG が壊れている状態で Enter → 待機状態 05F | SYS1.NUCLEUS(SYSCATLG) の内容が壊れている（SYSCAT02 は正常） | `IEA347A` → `待機状態コード 05F` | IEA347A: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1211<br>待機 05F: System Codes p.709 |
| E24 | SYSCATLG が壊れていても SYSCAT02 を指定すれば続行 | SYS1.NUCLEUS(SYSCATLG) の内容が壊れている（SYSCAT02 は正常） | `IEA347A` → `IEE389I` | IEA347A: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1211<br>IEE389I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.1026 |
| E25 | IEA347A への応答が3文字（不正）→ 再表示 | — | `IEA347A` → `IEA347A` | IEA347A: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1211 |

## D. NIP：システムパラメーター（IEA101A）（8 件）

| No. | 状況・操作 | 前提シナリオ | 期待される応答 | 出典 |
|---|---|---|---|---|
| E26 | IEA101A に未定義キーワード → IEA321I UNDEFINED KEYWORD → IEA336A → 再指定 | — | `IEA101A` → `IEA321I INVALID PARAMETER SYNTAX - FOO - UNDEFINED KEYWORD` → `IEA336A` → `IEASYS01` | IEA101A: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1112<br>IEA321I: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1197<br>IEA336A: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1206 |
| E27 | IEA101A の括弧の対応誤り → IEA321I UNBALANCED PARENS | — | `UNBALANCED PARENS` → `IEA336A` | IEA336A: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1206 |
| E28 | 存在しない IEASYSxx → IEA301I/IEA324I/IEA336A、Enter で打ち切り続行 | — | `IEA301I IEASYS09 NOT FOUND` → `IEA324I SYSP INPUT TERMINATED IN IEASYS09` → `IEA336A` → `IEE389I` | IEA301I: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1186<br>IEA324I: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1199<br>IEA336A: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1206 |
| E29 | OPI=NO のパラメーター指定 → IEA107I | — | `IEA107I MAXUSER IGNORED` → `IEE389I` | IEA107I: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1113<br>IEE389I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.1026 |
| E30 | 応答の継続 CONT → IEA116A | — | `IEA116A CONTINUE SYSTEM PARAMETERS` → `IEASYS02` → `CLPA` | IEA116A: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1114 |
| E31 | IEASYS00 が無い（プロンプトなし）→ IEA301I/IEA324I/IEA336A、Enter で続行 | IEASYS00 が削除されている | `IEA301I IEASYS00 NOT FOUND` → `IEA324I` → `IEA336A` → `IEE389I` | IEA301I: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1186<br>IEA324I: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1199<br>IEA336A: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1206 |
| E32 | IEASYS00 が無い状態で SYSP=01 を再指定 | IEASYS00 が削除されている | `IEA301I IEASYS00` → `IEA336A` → `IEASYS00 なしで` → `IEASYS01` → `IEE389I` | IEA301I: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1186<br>IEA336A: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1206<br>IEE389I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.1026 |
| E33 | SYSP= の値の誤り（3文字）→ IEA321I IMPROPER DELIMITER | — | `IEA321I INVALID PARAMETER SYNTAX - SYSP - IMPROPER DELIMITER` → `IEA336A` | IEA321I: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1197<br>IEA336A: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1206 |

## E. NIP：時刻・sysplex・応答操作（7 件）

| No. | 状況・操作 | 前提シナリオ | 期待される応答 | 出典 |
|---|---|---|---|---|
| E34 | IEA888A：不正応答 → 再表示、時刻変更 → 再表示、U で続行 | CLOCKxx に OPERATOR PROMPT（時刻の確認を求められる） | `IEA888A` → `応答形式が正しくありません` → `IEA888A` → `IEA888A` → `IEE389I` | IEA888A: z/OS MVS System Messages Vol 6 (GOS-IEA) p.1439<br>IEE389I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.1026 |
| E35 | IXC405D 不正応答 → IXC208I、I で sysplex 初期化 | sysplex に停止済み SYSB の残骸がある（IXC405D） | `IXC404I SYSTEM(S) ACTIVE OR IPLING: SYSB` → `IXC405D` → `IXC208I` → `IXC405D` → `IXC418I` → `IEE389I` | IXC404I: z/OS MVS System Messages Vol 10 (IXC-IZP) p.362<br>IXC405D: z/OS MVS System Messages Vol 10 (IXC-IZP) p.363<br>IXC208I: z/OS MVS System Messages Vol 10 (IXC-IZP) p.76 |
| E36 | IXC405D に J（残骸 SYSB がある状態で参加） | sysplex に停止済み SYSB の残骸がある（IXC405D） | `IXC418I` → `I が適切です` | IXC418I: z/OS MVS System Messages Vol 10 (IXC-IZP) p.377 |
| E37 | IXC405D に R → IXC207A、不正 → IXC208I、COUPLE=00 → 再判定 | sysplex に停止済み SYSB の残骸がある（IXC405D） | `IXC207A` → `IXC208I THE RESPONSE TO MESSAGE IXC207A` → `IXC207A` → `IXC404I` → `IXC405D` → `IXC418I` | IXC207A: z/OS MVS System Messages Vol 10 (IXC-IZP) p.75<br>IXC208I: z/OS MVS System Messages Vol 10 (IXC-IZP) p.76<br>IXC404I: z/OS MVS System Messages Vol 10 (IXC-IZP) p.362 |
| E38 | NIP 中に応答以外のコマンド | — | `応答（R 00,xxx）か Enter のみ` | （シミュレータ注記） |
| E39 | NIP 中に存在しない応答番号 | — | `IEE704I REPLY 05 NOT OUTSTANDING` | IEE704I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.1187 |
| E40 | REPLY の区切り誤り → IEE702I | — | `IEE702I REPLY 00 IGNORED; IMPROPER USE OF DELIMITERS` → `IEE702I` | IEE702I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.1186 |

## F. JES2 の起動（14 件）

| No. | 状況・操作 | 前提シナリオ | 期待される応答 | 出典 |
|---|---|---|---|---|
| E41 | $HASP426 に不正オプション → $HASP427 → 再表示 | — | `$HASP427 PARAMETER OR SYNTAX ERROR` → `$HASP426` → `$HASP492` | $HASP427: z/OS JES2 Messages p.331<br>$HASP426: z/OS JES2 Messages p.331<br>$HASP492: z/OS JES2 Messages p.377 |
| E42 | $HASP426 に CHECK（応答では使えない）→ $HASP427 | — | `$HASP427` | $HASP427: z/OS JES2 Messages p.331 |
| E43 | COLD → $HASP436/$HASP441 に N → JES2 終了、再度 S JES2 | — | `$HASP436 CONFIRM COLD START` → `$HASP441` → `$HASP428` → `$HASP085` → `$HASP426` → `$HASP492` | $HASP436: z/OS JES2 Messages p.337<br>$HASP441: z/OS JES2 Messages p.340<br>$HASP428: z/OS JES2 Messages p.331 |
| E44 | COLD → Y でコールドスタート（ジョブ消失の注記） | 長時間バッチ PAYROLL が実行中 | `$HASP436` → `$HASP493 JES2 COLD START` → `ジョブはすべて失われ` | $HASP436: z/OS JES2 Messages p.337<br>$HASP493: z/OS JES2 Messages p.379 |
| E45 | 初回起動で WARM → $HASP479 I/O ERROR → $HASP454 Y → $HASP289/$HASP272 TERM → COLD で再起動 | JES2 を初めて起動する（チェックポイント未初期化） | `$HASP479 UNABLE TO OBTAIN CKPT DATA SET LOCK - I/O ERROR` → `$HASP454` → `$HASP434` → `$HASP289` → `$HASP272` → `TERM 応答のみ` → `$HASP272` → `$HASP085` → `$HASP436` → `$HASP492 JES2 COLD START` | $HASP479: z/OS JES2 Messages p.369<br>$HASP454: z/OS JES2 Messages p.350<br>$HASP434: z/OS JES2 Messages p.336 |
| E46 | 初回起動 WARM → $HASP454 に N | JES2 を初めて起動する（チェックポイント未初期化） | `$HASP479` → `$HASP428` → `$HASP085` | $HASP479: z/OS JES2 Messages p.369<br>$HASP428: z/OS JES2 Messages p.331<br>$HASP085: z/OS JES2 Messages p.72 |
| E47 | ロック残存 → $HASP479 MEMBER=SYSA → $HASP454 不正応答 → 再表示、Y でウォーム | 前回 JES2 が異常終了しチェックポイントのロックが残っている | `$HASP479 UNABLE TO OBTAIN CKPT DATA SET LOCK - MEMBER=SYSA` → `$HASP454` → `$HASP454` → `$HASP492 JES2 ALL-MEMBER WARM START HAS COMPLETED` | $HASP479: z/OS JES2 Messages p.369<br>$HASP454: z/OS JES2 Messages p.350<br>$HASP492: z/OS JES2 Messages p.377 |
| E48 | ロック残存 → $HASP454 に N | 前回 JES2 が異常終了しチェックポイントのロックが残っている | `$HASP428` → `$HASP085` → `HASP416/HASP417` | $HASP428: z/OS JES2 Messages p.331<br>$HASP085: z/OS JES2 Messages p.72 |
| E49 | 停止手順なしでリセット → 次回 IPL でロック残存（$HASP479 MEMBER=SYSA） | — | `システムリセット` → `$HASP479 UNABLE TO OBTAIN CKPT DATA SET LOCK - MEMBER=SYSA` → `$HASP454` | $HASP479: z/OS JES2 Messages p.369<br>$HASP454: z/OS JES2 Messages p.350 |
| E50 | JES2 起動前の $ コマンド → IEE305I | — | `IEE305I $DA COMMAND INVALID` | IEE305I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.981 |
| E51 | JES2 起動前の S VTAM（拒否） | — | `JES2 が起動していないため VTAM を開始できません` | （シミュレータ注記） |
| E52 | $HASP400 のまま（$S 未入力）ではジョブが始まらない → $S で開始 | 長時間バッチ PAYROLL が実行中 | `$HASP400 ENTER REQUESTS` → `1分経過` → `$HASP000 OK` → `$HASP373 PAYROLL` | $HASP400: z/OS JES2 Messages p.313<br>$HASP000: z/OS JES2 Messages p.29<br>$HASP373: z/OS JES2 Messages p.307 |
| E53 | S JES2,PARM= で開始（$HASP426 なし、NOREQ で $S 不要） | — | `$HASP085` → `$HASP492` | $HASP085: z/OS JES2 Messages p.72<br>$HASP492: z/OS JES2 Messages p.377 |
| E54 | S JES2 の二重起動 | — | `JES2 はすでに活動中` | （シミュレータ注記） |

## G. 稼働中の操作エラー（6 件）

| No. | 状況・操作 | 前提シナリオ | 期待される応答 | 出典 |
|---|---|---|---|---|
| E55 | 存在しないプロシージャーを START → IEFC612I | — | `IEFC612I PROCEDURE VTAMX WAS NOT FOUND` | IEFC612I: z/OS MVS System Messages Vol 8 (IEF-IGD) p.539 |
| E56 | VTAM 前に S TSO（拒否） | — | `VTAM が必要` | （シミュレータ注記） |
| E57 | 応答待ちが無いのに REPLY → IEE701I | — | `IEE701I REPLY 07 IGNORED; NO REPLIES OUTSTANDING` | IEE701I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.1185 |
| E58 | 応答番号違い → IEE704I | TSO ユーザーがログオン中 | `IKT010D` → `IEE704I REPLY 99 NOT OUTSTANDING` | IKT010D: z/OS Communications Server SNA Messages p.56<br>IEE704I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.1187 |
| E59 | 綴り誤りのコマンド → IEE305I | — | `IEE305I DISPLY COMMAND INVALID` | IEE305I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.981 |
| E60 | 不明な JES2 コマンド → $HASP003 | — | `$HASP003` | $HASP003: z/OS JES2 Messages p.30 |

## H. 停止（シャットダウン）（24 件）

| No. | 状況・操作 | 前提シナリオ | 期待される応答 | 出典 |
|---|---|---|---|---|
| E61 | 活動していないタスクを STOP → IEE341I | — | `IEE341I TCPIP NOT ACTIVE` | IEE341I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.1000 |
| E62 | VTAM を P で止めようとする → IEE342I（Z NET を案内） | — | `Z NET` → `IEE342I` | IEE342I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.1001 |
| E63 | TSO ユーザー残存で P TSO → IKT010D、不正応答 → 再表示、SIC | TSO ユーザーがログオン中 | `IKT010D 00002 USER(S) ACTIVE` → `IKT010D` → `$HASP395 USER01` → `IKT006I TCAS ENDED` | IKT010D: z/OS Communications Server SNA Messages p.56<br>$HASP395: z/OS JES2 Messages p.310<br>IKT006I: z/OS Communications Server SNA Messages p.54 |
| E64 | IKT010D に FSTOP | TSO ユーザーがログオン中 | `$HASP395 USER01   ENDED - ABEND=S222` → `IKT006I` | $HASP395: z/OS JES2 Messages p.310<br>IKT006I: z/OS Communications Server SNA Messages p.54 |
| E65 | TSO 稼働中に Z NET（通常）→ TSO 停止まで待つ | — | `IST097I HALT ACCEPTED` → `の終了を待ちます` → `IKT006I` → `IST102I VTAM IS NOW INACTIVE` | IST097I: z/OS Communications Server SNA Messages p.116<br>IKT006I: z/OS Communications Server SNA Messages p.54<br>IST102I: z/OS Communications Server SNA Messages p.117 |
| E66 | TSO 稼働中に Z NET,QUICK | TSO ユーザーがログオン中 | `IST097I` → `$HASP395 USER01` → `IST102I` | IST097I: z/OS Communications Server SNA Messages p.116<br>$HASP395: z/OS JES2 Messages p.310<br>IST102I: z/OS Communications Server SNA Messages p.117 |
| E67 | VTAM 停止済みで Z NET → IEE341I | — | `IEE341I NET NOT ACTIVE` | IEE341I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.1000 |
| E68 | 作業中に $P JES2 → $HASP607 RC=10 ＋ $HASP608 | — | `$HASP607 JES2 NOT DORMANT -- MEMBER DRAINING, RC=10 ACTIVE ADDRESS SPACES` → `$HASP608` | $HASP607: z/OS JES2 Messages p.463<br>$HASP608: z/OS JES2 Messages p.465 |
| E69 | $P なしで $P JES2 → $HASP607 RC=03、再入力で終了 | — | `RC=03 ACTIVE PROCESSORS` → `$HASP085 JES2 TERMINATION COMPLETE` | $HASP085: z/OS JES2 Messages p.72 |
| E70 | バッチ実行中に $P → 終了待ち → $HASP099 | 長時間バッチ PAYROLL が実行中 | `$HASP373 PAYROLL` → `$HASP890 JOB(PAYROLL)` → `$HASP395 PAYROLL  ENDED - RC=0000` → `$HASP099 ALL AVAILABLE FUNCTIONS COMPLETE` | $HASP373: z/OS JES2 Messages p.307<br>$HASP890: z/OS JES2 Messages p.632<br>$HASP395: z/OS JES2 Messages p.310 |
| E71 | バッチを CANCEL → IEE301I/IEF450I S222 | 長時間バッチ PAYROLL が実行中 | `IEE301I PAYROLL CANCEL COMMAND ACCEPTED` → `IEF450I PAYROLL STEP1 - ABEND=S222` → `$HASP395 PAYROLL  ENDED - ABEND=S222` | IEE301I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.978<br>IEF450I: z/OS MVS System Messages Vol 8 (IEF-IGD) p.270<br>$HASP395: z/OS JES2 Messages p.310 |
| E72 | CANCEL 前に FORCE → IEE838I CANCELABLE | 長時間バッチ PAYROLL が実行中 | `IEE838I PAYROLL CANCELABLE - ISSUE CANCEL BEFORE FORCE` → `IEE301I` | IEE838I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.1268<br>IEE301I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.978 |
| E73 | 同名ジョブを CANCEL → IEE842I、A= 付きで再入力 | 同じ名前のジョブ BKUP が2本実行中 | `IEE842I BKUP DUPLICATE NAME FOUND - REENTER COMMAND WITH 'A='` → `A= に指定する ASID: 0020, 0021` → `IEE301I BKUP CANCEL COMMAND ACCEPTED` | IEE842I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.1272<br>IEE301I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.978 |
| E74 | 取消し不可ジョブ: CANCEL → IEE841I、FORCE → IEE838I NON-CANCELABLE、FORCE ,ARM で終了 | CANCEL できない（非取消し可能）ジョブ HUNGJOB が実行中 | `IEE841I HUNGJOB NON-CANCELABLE` → `IEE838I HUNGJOB NON-CANCELABLE - ISSUE FORCE ARM` → `IEE301I HUNGJOB FORCE ARM COMMAND ACCEPTED` → `ABEND=S122` | IEE841I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.1271<br>IEE838I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.1268<br>IEE301I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.978 |
| E75 | 活動していないジョブを CANCEL → IEE341I | — | `IEE341I NOJOB NOT ACTIVE` | IEE341I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.1000 |
| E76 | $P JES2,ABEND,FORCE を先に出す → $HASP553 | — | `$HASP553` | $HASP553: z/OS JES2 Messages p.434 |
| E77 | $P JES2,ABEND（強制終了）→ 採点で減点 | — | `$HASP095` → `$HASP085` | $HASP095: z/OS JES2 Messages p.95<br>$HASP085: z/OS JES2 Messages p.72 |
| E78 | $P JES2,TERM → $HASP9157、その後 S JES2 は不可 | — | `$HASP085` → `$HASP9157 CANNOT RESTART JES2, IPL REQUIRED` → `再 IPL するまで再起動できません` | $HASP085: z/OS JES2 Messages p.72<br>$HASP9157: z/OS JES2 Messages p.870 |
| E79 | JES2 停止前に Z EOD → 採点で順序誤り | — | `IEE334I HALT EOD SUCCESSFUL` | IEE334I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.996 |
| E80 | VTAM 稼働中に Z EOD → 採点で減点 | — | `$HASP607` → `IEE334I` | $HASP607: z/OS JES2 Messages p.463<br>IEE334I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.996 |
| E81 | V XCF,SYSA,OFFLINE → IXC371D 不正応答 → 再表示 → SYSNAME=SYSA → 0A2-004 | — | `IXC371D CONFIRM REQUEST TO VARY SYSTEM SYSA OFFLINE` → `IXC371D` → `IXC101I SYSPLEX PARTITIONING IN PROGRESS FOR SYSA` → `IXC102A` → `待機状態コード 0A2 理由 004` | IXC371D: z/OS MVS System Messages Vol 10 (IXC-IZP) p.325<br>IXC101I: z/OS MVS System Messages Vol 10 (IXC-IZP) p.41<br>IXC102A: z/OS MVS System Messages Vol 10 (IXC-IZP) p.43<br>待機 0A2: System Codes p.743 |
| E82 | V XCF の取消し（C） | — | `IXC371D` → `取り消しました` | IXC371D: z/OS MVS System Messages Vol 10 (IXC-IZP) p.325 |
| E83 | V XCF に sysplex 外のシステム名 | — | `sysplex PLEX1 のシステムではありません` | （シミュレータ注記） |
| E84 | 表示コマンド（D T / D A,L / D R,L / $DU / $D JES2） | — | `IEE136I LOCAL` → `IEE114I` → `IEE112I` → `$HASP608` → `$HASP608` | IEE136I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.825<br>IEE114I: Redbook ABCs of z/OS System Programming Vol 8 SG24-6988-01（z/OS 1.13） p.138<br>IEE112I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.813 |

## J. jcl-terminal との連携（2つのタブをつないだとき）（18 件）

| No. | 状況・操作 | 前提シナリオ | 期待される応答 | 出典 |
|---|---|---|---|---|
| L01 | TSO を起動すると、jcl-terminal の USER01 がログオンする | — | `IKT007I` → `（連携）USER01（jcl-terminal）が TSO にログオン` | IKT007I: z/OS Communications Server SNA Messages p.55 |
| L02 | TSO が動いていないと、jcl-terminal から投入できない | — |  | （シミュレータ注記） |
| L03 | jcl-terminal で投入したジョブがコンソールに現れて終わる | — | `$HASP100 HELLO    ON INTRDR` → `$HASP373 HELLO` → `$HASP395 HELLO    ENDED - RC=0000` | $HASP100: z/OS JES2 Messages p.125<br>$HASP373: z/OS JES2 Messages p.307<br>$HASP395: z/OS JES2 Messages p.310 |
| L04 | $S を入れる前（$HASP400）に投入したジョブは、$S まで始まらない | — | `$HASP400` → `$HASP100 HELLO` → `$S` → `$HASP373 HELLO` → `$HASP395 HELLO` | $HASP400: z/OS JES2 Messages p.313<br>$HASP100: z/OS JES2 Messages p.125<br>$HASP373: z/OS JES2 Messages p.307 |
| L05 | $P の後に投入したジョブは、$S まで始まらない（投入は受け付ける） | — | `$HASP100 HELLO` → `$S` → `$HASP373 HELLO` | $HASP100: z/OS JES2 Messages p.125<br>$HASP373: z/OS JES2 Messages p.307 |
| L06 | データセット使用中 → IEF861I/IEF863I/IEF099I で待ち、使用中のジョブを取り消すと動く | — | `$HASP373 SALESUPD` → `$HASP373 LINKRPT` → `IEF861I FOLLOWING RESERVED DATA SET NAMES UNAVAILABLE TO LINKRPT` → `IEF863I DSN=USER01.SALES.DATA LINKRPT` → `IEF099I JOB LINKRPT WAITING FOR DATA SETS` → `IEE114I` → `IEE301I SALESUPD CANCEL COMMAND ACCEPTED` → `$HASP395 SALESUPD` → `$HASP395 LINKRPT  ENDED - RC=0000` | $HASP373: z/OS JES2 Messages p.307<br>IEF861I: z/OS MVS System Messages Vol 8 (IEF-IGD) p.430<br>IEF863I: z/OS MVS System Messages Vol 8 (IEF-IGD) p.431 |
| L07 | データセット待ちのジョブ自身を取り消す（S222） | — | `IEF099I` → `IEE301I LINKRPT CANCEL COMMAND ACCEPTED` → `$HASP395 LINKRPT  ENDED - ABEND=S222` | IEF099I: z/OS MVS System Messages Vol 8 (IEF-IGD) p.77<br>IEE301I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.978<br>$HASP395: z/OS JES2 Messages p.310 |
| L08 | ジョブの問い合わせ（OPRASK）がコンソールに出る。不正な応答 → 再質問、NO で RC=0004 | — | `OPR001A OK TO PRINT MONTHLY SALES REPORT. REPLY YES OR NO` → `OPR003I LINKASK  REPLY 'MAYBE' IS NOT VALID` → `OPR001A` → `$HASP395 LINKASK  ENDED - RC=0004` | OPR001A: jcl-terminal の練習用プログラム OPRASK のメッセージ（IBM の製品ではない）<br>OPR003I: jcl-terminal の練習用プログラム OPRASK のメッセージ（IBM の製品ではない）<br>$HASP395: z/OS JES2 Messages p.310 |
| L09 | 問い合わせ中のジョブを取り消すと、応答待ちも消える | — | `OPR001A` → `IEE301I LINKASK` → `$HASP395 LINKASK  ENDED - ABEND=S222` → `RM=0` | OPR001A: jcl-terminal の練習用プログラム OPRASK のメッセージ（IBM の製品ではない）<br>IEE301I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.978<br>$HASP395: z/OS JES2 Messages p.310 |
| L10 | TYPRUN=HOLD のジョブを $DJ で確かめ、$AJ で解放 | — | `$HASP100 HOLDJOB` → `$HASP890 JOB(HOLDJOB)` → `$HASP373 HOLDJOB` → `$HASP395 HOLDJOB  ENDED - RC=0000` | $HASP100: z/OS JES2 Messages p.125<br>$HASP890: z/OS JES2 Messages p.632<br>$HASP373: z/OS JES2 Messages p.307 |
| L11 | 実行前のジョブを $CJ で取り消す | — | `実行前に取り消されました` | （シミュレータ注記） |
| L12 | 存在しないジョブを指定 → $HASP003 RC=(52) | — | `$HASP003 RC=(52)` | $HASP003: z/OS JES2 Messages p.30 |
| L13 | jcl-terminal の SDSF 行コマンド A が、JES2 の $AJ としてオペレーター側で処理される | — | `$AJ` → `$HASP373 HOLDJOB` → `$HASP395 HOLDJOB` | $HASP373: z/OS JES2 Messages p.307<br>$HASP395: z/OS JES2 Messages p.310 |
| L14 | 連携ジョブの実行中は $P JES2 で止まらない（$HASP608 に表示） | — | `$HASP373 LINKRPT` → `$HASP607` → `$HASP608` → `$HASP395 LINKRPT  ENDED - RC=0000` | $HASP373: z/OS JES2 Messages p.307<br>$HASP607: z/OS JES2 Messages p.463<br>$HASP608: z/OS JES2 Messages p.465 |
| L15 | P TSO で USER01 が IKT010D の対象になり、SIC でログオフ | — | `IKT010D 00001 USER(S) ACTIVE` → `TSO セッションが終了` | IKT010D: z/OS Communications Server SNA Messages p.56 |
| L16 | 実行中にシステムが落ちる → ウォームスタートで $HASP406、再実行される | — | `$HASP373 LINKRPT` → `システムリセット` → `$HASP479` → `$HASP406 LINKRPT  WAS EXECUTING ON MEMBER SYSA` → `$HASP373 LINKRPT` → `$HASP395 LINKRPT  ENDED - RC=0000` | $HASP373: z/OS JES2 Messages p.307<br>$HASP479: z/OS JES2 Messages p.369<br>$HASP406: z/OS JES2 Messages p.316 |
| L17 | コールドスタートすると、jcl-terminal から投入したジョブは消える | — | `$HASP100 HOLDJOB` → `$HASP436` → `ジョブと出力もすべて失われました` | $HASP100: z/OS JES2 Messages p.125<br>$HASP436: z/OS JES2 Messages p.337 |
| L18 | JCL エラーのジョブは実行されずに終わる（IEFC452I / $HASP396） | — | `$HASP100 BADJCL` → `IEFC452I BADJCL - JOB NOT RUN - JCL ERROR` → `$HASP396 BADJCL   TERMINATED` | $HASP100: z/OS JES2 Messages p.125<br>IEFC452I: z/OS MVS System Messages Vol 8 (IEF-IGD) p.532<br>$HASP396: z/OS JES2 Messages p.311 |

## I. 正常系（基準）（2 件）

| No. | 状況・操作 | 前提シナリオ | 期待される応答 | 出典 |
|---|---|---|---|---|
| N01 | 正常な IPL と停止（全採点項目 OK） | — | `IEE389I` → `$HASP492` → `IST020I` → `IKT007I` → `EZZ4201I` → `IST102I` → `$HASP099` → `$HASP085` → `IEE334I` → `IXC101I` | IEE389I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.1026<br>$HASP492: z/OS JES2 Messages p.377<br>IST020I: z/OS Communications Server SNA Messages p.92 |
| N02 | 正常停止後にリセット → 次の IPL ではロックが残らない | — | `IEE334I` → `システムリセット` → `$HASP492` | IEE334I: z/OS MVS System Messages Vol 7 (IEB-IEE) p.996<br>$HASP492: z/OS JES2 Messages p.377 |

