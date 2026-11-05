# マニュアルから抽出した IPL / シャットダウン関連エラー候補（全件）

`tools/extract_errors.py` で z/OS 3.2 のマニュアル本文から機械抽出した一覧です。
抽出条件: 初期化（IPL/NIP）中に出る応答要求（A/D）・待機（W）メッセージ、再指定や再IPLを求めるエラー、XCF の初期化／停止時の応答要求、
JES2 の初期化・終了モジュールが出す応答要求／終了メッセージ、操作コマンドが拒否されるメッセージ、IPL/NIP に関係する待機状態コード。
機械抽出のため、一部に情報メッセージ（エラーでないもの）も混じります。

凡例: ✓＝シミュレータで再現（tests でテスト）、△＝解説のみ（シミュレータ内の注記・解説パネル）、空欄＝未対応
**合計 387 件**（うちシミュレータで再現 51 件）。シミュレータで扱うエラーの詳細とテスト対応は [error-catalog.md](error-catalog.md) を参照。


メッセージの文面と説明は IBM のマニュアルの文章なので、この一覧には写していません。「出典」のページ（PDF のページ番号）で本文を確認してください。

## A. IPL / NIP（IEA メッセージ、Vol 6）（116 件）

| 対応 | ID | 抽出した理由 | 出典 |
|---|---|---|---|
|  | `IEA004W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1048 |
|  | `IEA006W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1048 |
|  | `IEA009I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1051 |
|  | `IEA010I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1051 |
|  | `IEA011A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1052 |
|  | `IEA012E` | 初期化中に待機状態へ | Vol6 SA38-0673-70 p.1053 |
|  | `IEA013E` | 初期化中に待機状態へ | Vol6 SA38-0673-70 p.1054 |
|  | `IEA014W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1056 |
|  | `IEA016W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1058 |
|  | `IEA029D` | 初期化中の応答要求/待機 (D) | Vol6 SA38-0673-70 p.1065 |
|  | `IEA040W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1077 |
|  | `IEA067I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1094 |
|  | `IEA080D` | 初期化中の応答要求/待機 (D) | Vol6 SA38-0673-70 p.1104 |
|  | `IEA084W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1105 |
|  | `IEA086W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1106 |
|  | `IEA087W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1107 |
|  | `IEA088W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1108 |
|  | `IEA089W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1108 |
|  | `IEA090W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1109 |
|  | `IEA091I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1109 |
| ✓ | `IEA101A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1112 |
|  | `IEA102W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1113 |
|  | `IEA111D` | 初期化中の応答要求/待機 (D) | Vol6 SA38-0673-70 p.1114 |
| ✓ | `IEA116A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1114 |
| ✓ | `IEA120D` | 初期化中の応答要求/待機 (D) | Vol6 SA38-0673-70 p.1115 |
|  | `IEA145E` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1124 |
|  | `IEA182W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1132 |
|  | `IEA183W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1133 |
|  | `IEA184W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1133 |
|  | `IEA200I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1144 |
| ✓ | `IEA213A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1147 |
| ✓ | `IEA214A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1148 |
|  | `IEA297W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1183 |
|  | `IEA298I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1184 |
|  | `IEA300I` | 初期化中に待機状態へ | Vol6 SA38-0673-70 p.1185 |
| ✓ | `IEA301I` | 初期化中に待機状態へ | Vol6 SA38-0673-70 p.1186 |
|  | `IEA303W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1187 |
|  | `IEA304W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1188 |
| ✓ | `IEA310A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1191 |
|  | `IEA315A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1194 |
|  | `IEA316A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1195 |
|  | `IEA317A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1195 |
|  | `IEA319I` | 初期化中に待機状態へ | Vol6 SA38-0673-70 p.1197 |
| ✓ | `IEA321I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1197 |
|  | `IEA323I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1198 |
| ✓ | `IEA324I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1199 |
|  | `IEA328E` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1201 |
|  | `IEA330A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1202 |
|  | `IEA332A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1203 |
|  | `IEA334A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1204 |
| ✓ | `IEA336A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1206 |
|  | `IEA338A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1206 |
|  | `IEA339A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1207 |
|  | `IEA340I` | 初期化中に待機状態へ | Vol6 SA38-0673-70 p.1207 |
|  | `IEA341A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1209 |
|  | `IEA343D` | 初期化中の応答要求/待機 (D) | Vol6 SA38-0673-70 p.1209 |
|  | `IEA345A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1210 |
| ✓ | `IEA347A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1211 |
|  | `IEA354I` | 初期化中に待機状態へ | Vol6 SA38-0673-70 p.1215 |
|  | `IEA355A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1216 |
|  | `IEA358A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1219 |
|  | `IEA365E` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1224 |
|  | `IEA366W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1224 |
|  | `IEA367A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1225 |
|  | `IEA376I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1228 |
|  | `IEA377D` | 初期化中の応答要求/待機 (D) | Vol6 SA38-0673-70 p.1229 |
|  | `IEA378I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1230 |
|  | `IEA400I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1252 |
|  | `IEA432I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1269 |
|  | `IEA503W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1323 |
|  | `IEA510A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1324 |
|  | `IEA512W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1324 |
|  | `IEA513W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1325 |
|  | `IEA515W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1326 |
|  | `IEA516W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1326 |
|  | `IEA517W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1327 |
|  | `IEA518W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1327 |
| ✓ | `IEA519I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1328 |
| ✓ | `IEA520I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1328 |
|  | `IEA523W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1330 |
|  | `IEA525W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1331 |
|  | `IEA527A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1332 |
|  | `IEA528I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1333 |
|  | `IEA545W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1336 |
|  | `IEA548W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1336 |
|  | `IEA557A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1339 |
|  | `IEA660I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1361 |
|  | `IEA710A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1377 |
|  | `IEA716I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1379 |
|  | `IEA814D` | 初期化中の応答要求/待機 (D) | Vol6 SA38-0673-70 p.1399 |
|  | `IEA843I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1416 |
|  | `IEA853A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1424 |
|  | `IEA856W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1426 |
|  | `IEA865I` | 初期化中に待機状態へ | Vol6 SA38-0673-70 p.1433 |
|  | `IEA874I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1435 |
|  | `IEA883I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1436 |
| ✓ | `IEA888A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1439 |
|  | `IEA890I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1441 |
|  | `IEA896I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1445 |
|  | `IEA923D` | 初期化中の応答要求/待機 (D) | Vol6 SA38-0673-70 p.1463 |
|  | `IEA924D` | 初期化中の応答要求/待機 (D) | Vol6 SA38-0673-70 p.1464 |
|  | `IEA925D` | 初期化中の応答要求/待機 (D) | Vol6 SA38-0673-70 p.1465 |
|  | `IEA927I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1466 |
|  | `IEA935W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1472 |
|  | `IEA936D` | 初期化中の応答要求/待機 (D) | Vol6 SA38-0673-70 p.1472 |
|  | `IEA937I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1473 |
|  | `IEA938W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1474 |
|  | `IEA939D` | 初期化中の応答要求/待機 (D) | Vol6 SA38-0673-70 p.1474 |
|  | `IEA943W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1477 |
|  | `IEA944I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1478 |
|  | `IEA945W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1479 |
|  | `IEA947A` | 初期化中の応答要求/待機 (A) | Vol6 SA38-0673-70 p.1480 |
|  | `IEA950I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1482 |
|  | `IEA959I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1483 |
|  | `IEA983I` | 初期化中のエラー（再指定/再IPL） | Vol6 SA38-0673-70 p.1486 |
|  | `IEA999W` | 初期化中の応答要求/待機 (W) | Vol6 SA38-0673-70 p.1497 |

## B. XCF / sysplex（IXC メッセージ、Vol 10）（27 件）

| 対応 | ID | 抽出した理由 | 出典 |
|---|---|---|---|
| ✓ | `IXC102A` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.43 |
|  | `IXC201A` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.66 |
| ✓ | `IXC207A` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.75 |
|  | `IXC211A` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.78 |
|  | `IXC221D` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.88 |
|  | `IXC222D` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.89 |
|  | `IXC239A` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.92 |
|  | `IXC247D` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.99 |
|  | `IXC252D` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.105 |
|  | `IXC256A` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.112 |
|  | `IXC269D` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.122 |
|  | `IXC279D` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.130 |
|  | `IXC289D` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.139 |
| ✓ | `IXC371D` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.325 |
|  | `IXC402D` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.359 |
|  | `IXC403D` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.361 |
| ✓ | `IXC405D` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.363 |
|  | `IXC409D` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.367 |
|  | `IXC417D` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.376 |
|  | `IXC420D` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.378 |
|  | `IXC426D` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.384 |
|  | `IXC427A` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.385 |
|  | `IXC455D` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.414 |
|  | `IXC501A` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.454 |
|  | `IXC508A` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.463 |
|  | `IXC558D` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.532 |
|  | `IXC560A` | XCF 初期化・停止時の応答要求 | Vol10 SA38-0677-70 p.534 |

## C. JES2 初期化・終了（$HASP メッセージ）（135 件）

| 対応 | ID | 抽出した理由 | 出典 |
|---|---|---|---|
|  | `$HASP051` | $P JES2 関連 | JES2 Messages SA32-0989-70 p.53 |
|  | `$HASP065` | JES2 初期化/終了 (HASPTERM) | JES2 Messages SA32-0989-70 p.59 |
|  | `$HASP068` | JES2 初期化/終了 (HASPTERM) | JES2 Messages SA32-0989-70 p.60 |
|  | `$HASP070` | JES2 初期化/終了 (HASPTERM) | JES2 Messages SA32-0989-70 p.62 |
|  | `$HASP071` | JES2 初期化/終了 (HASPTERM) | JES2 Messages SA32-0989-70 p.63 |
|  | `$HASP074` | JES2 初期化/終了 (HASPTERM) | JES2 Messages SA32-0989-70 p.64 |
|  | `$HASP083` | JES2 初期化/終了 (HASPTERM) | JES2 Messages SA32-0989-70 p.71 |
|  | `$HASP084` | JES2 初期化/終了 (HASPTERM) | JES2 Messages SA32-0989-70 p.71 |
| ✓ | `$HASP085` | JES2 初期化/終了 (HASPTERM) | JES2 Messages SA32-0989-70 p.72 |
|  | `$HASP087` | JES2 初期化/終了 (HASPTERM) | JES2 Messages SA32-0989-70 p.72 |
|  | `$HASP088` | JES2 初期化/終了 (HASPTERM) | JES2 Messages SA32-0989-70 p.73 |
|  | `$HASP089` | JES2 初期化/終了 (HASPRAS, HASPTERM) | JES2 Messages SA32-0989-70 p.76 |
|  | `$HASP093` | JES2 初期化/終了 (HASPTERM) | JES2 Messages SA32-0989-70 p.79 |
| ✓ | `$HASP095` | JES2 初期化/終了 (HASPBSC, HASPIRMA, HASPCKDS, H) | JES2 Messages SA32-0989-70 p.95 |
|  | `$HASP098` | JES2 初期化/終了 (HASPTERM) | JES2 Messages SA32-0989-70 p.122 |
|  | `$HASP140` | JES2 初期化/終了 (HASPIRSI) | JES2 Messages SA32-0989-70 p.159 |
|  | `$HASP141` | JES2 初期化/終了 (HASPTERM) | JES2 Messages SA32-0989-70 p.160 |
|  | `$HASP198` | JES2 初期化/終了 (HASPTERM) | JES2 Messages SA32-0989-70 p.188 |
|  | `$HASP238` | JES2 初期化/終了 (HASPIRRE) | JES2 Messages SA32-0989-70 p.219 |
|  | `$HASP242` | JES2 初期化/終了 (HASPIRRE) | JES2 Messages SA32-0989-70 p.221 |
|  | `$HASP254` | $P JES2 関連 | JES2 Messages SA32-0989-70 p.230 |
|  | `$HASP258` | $P JES2 関連 | JES2 Messages SA32-0989-70 p.235 |
|  | `$HASP283` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.264 |
| ✓ | `$HASP400` | $P JES2 関連 | JES2 Messages SA32-0989-70 p.313 |
|  | `$HASP401` | JES2 初期化/終了 (HASPSPOL, HASPIRDA) | JES2 Messages SA32-0989-70 p.313 |
|  | `$HASP403` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.315 |
| ✓ | `$HASP406` | JES2 初期化/終了 (HASPWARM) | JES2 Messages SA32-0989-70 p.316 |
|  | `$HASP407` | JES2 初期化/終了 (HASPWARM) | JES2 Messages SA32-0989-70 p.317 |
|  | `$HASP408` | JES2 初期化/終了 (HASPWARM) | JES2 Messages SA32-0989-70 p.317 |
|  | `$HASP411` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.319 |
|  | `$HASP412` | JES2 初期化/終了 (HASPWARM) | JES2 Messages SA32-0989-70 p.320 |
|  | `$HASP413` | JES2 初期化/終了 (HASPWARM) | JES2 Messages SA32-0989-70 p.320 |
|  | `$HASP415` | JES2 初期化/終了 (HASPWARM) | JES2 Messages SA32-0989-70 p.322 |
|  | `$HASP416` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.323 |
|  | `$HASP417` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.324 |
|  | `$HASP419` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.326 |
|  | `$HASP420` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.326 |
|  | `$HASP422` | JES2 初期化/終了 (HASPSPOL, HASPIRDA) | JES2 Messages SA32-0989-70 p.328 |
|  | `$HASP424` | JES2 初期化/終了 (HASPSPOL, HASPIRDA, HASPCKDS) | JES2 Messages SA32-0989-70 p.329 |
|  | `$HASP425` | JES2 初期化/終了 (HASPIRSI) | JES2 Messages SA32-0989-70 p.330 |
| ✓ | `$HASP426` | JES2 初期化/終了 (HASPIRMA) | JES2 Messages SA32-0989-70 p.331 |
| ✓ | `$HASP427` | JES2 初期化/終了 (HASPIRMA) | JES2 Messages SA32-0989-70 p.331 |
| ✓ | `$HASP428` | JES2 初期化/終了 (HASPIRA) | JES2 Messages SA32-0989-70 p.331 |
|  | `$HASP429` | JES2 初期化/終了 (HASPIRSI) | JES2 Messages SA32-0989-70 p.332 |
|  | `$HASP430` | JES2 初期化/終了 (HASPIRSI) | JES2 Messages SA32-0989-70 p.333 |
|  | `$HASP432` | JES2 初期化/終了 (HASPIRA, HASPIRDA, HASPIRMA) | JES2 Messages SA32-0989-70 p.334 |
|  | `$HASP435` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.336 |
|  | `$HASP437` | JES2 初期化/終了 (HASPIRPL) | JES2 Messages SA32-0989-70 p.338 |
|  | `$HASP438` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.338 |
|  | `$HASP439` | JES2 初期化/終了 (HASPWARM) | JES2 Messages SA32-0989-70 p.339 |
| ✓ | `$HASP441` | JES2 初期化/終了 (HASPIRA) | JES2 Messages SA32-0989-70 p.340 |
|  | `$HASP442` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.341 |
|  | `$HASP443` | JES2 初期化/終了 (HASPSPOL, HASPIRDA) | JES2 Messages SA32-0989-70 p.342 |
|  | `$HASP444` | JES2 初期化/終了 (HASPIRA) | JES2 Messages SA32-0989-70 p.343 |
|  | `$HASP445` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.344 |
|  | `$HASP446` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.345 |
|  | `$HASP447` | JES2 初期化/終了 (HASPIRMA) | JES2 Messages SA32-0989-70 p.346 |
|  | `$HASP452` | JES2 初期化/終了 (HASPIRRE) | JES2 Messages SA32-0989-70 p.349 |
| ✓ | `$HASP454` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.350 |
|  | `$HASP457` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.352 |
|  | `$HASP460` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.354 |
|  | `$HASP465` | JES2 初期化/終了 (HASPIRRE) | JES2 Messages SA32-0989-70 p.358 |
|  | `$HASP466` | JES2 初期化/終了 (HASPIRPL) | JES2 Messages SA32-0989-70 p.358 |
|  | `$HASP467` | JES2 初期化/終了 (HASPIRPL) | JES2 Messages SA32-0989-70 p.359 |
|  | `$HASP469` | JES2 初期化/終了 (HASPIRPL) | JES2 Messages SA32-0989-70 p.361 |
|  | `$HASP471` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.362 |
|  | `$HASP472` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.363 |
|  | `$HASP475` | JES2 初期化/終了 (HASPIRMA) | JES2 Messages SA32-0989-70 p.366 |
| ✓ | `$HASP478` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.368 |
| ✓ | `$HASP479` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.369 |
|  | `$HASP481` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.370 |
|  | `$HASP482` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.371 |
|  | `$HASP483` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.372 |
|  | `$HASP486` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.374 |
|  | `$HASP487` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.375 |
|  | `$HASP490` | JES2 初期化/終了 (HASPIRA, HASPIRMA) | JES2 Messages SA32-0989-70 p.376 |
|  | `$HASP491` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.377 |
| ✓ | `$HASP492` | JES2 初期化/終了 (HASPWARM) | JES2 Messages SA32-0989-70 p.377 |
| ✓ | `$HASP493` | JES2 初期化/終了 (HASPWARM, HASPIRDA) | JES2 Messages SA32-0989-70 p.379 |
|  | `$HASP494` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.380 |
|  | `$HASP495` | JES2 初期化/終了 (HASPIRMA) | JES2 Messages SA32-0989-70 p.380 |
|  | `$HASP496` | JES2 初期化/終了 (HASPWARM, HASPIRDA) | JES2 Messages SA32-0989-70 p.381 |
|  | `$HASP506` | JES2 初期化/終了 (HASPIRRE) | JES2 Messages SA32-0989-70 p.398 |
|  | `$HASP507` | JES2 初期化/終了 (HASPIRRE) | JES2 Messages SA32-0989-70 p.399 |
|  | `$HASP509` | JES2 初期化/終了 (HASPIRRE) | JES2 Messages SA32-0989-70 p.401 |
|  | `$HASP512` | JES2 初期化/終了 (HASPIRRE) | JES2 Messages SA32-0989-70 p.401 |
|  | `$HASP516` | JES2 初期化/終了 (HASPIRMA) | JES2 Messages SA32-0989-70 p.404 |
|  | `$HASP518` | JES2 初期化/終了 (HASPIRMA) | JES2 Messages SA32-0989-70 p.405 |
|  | `$HASP537` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.421 |
|  | `$HASP552` | $P JES2 関連 | JES2 Messages SA32-0989-70 p.434 |
| ✓ | `$HASP553` | $P JES2 関連 | JES2 Messages SA32-0989-70 p.434 |
|  | `$HASP555` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.436 |
|  | `$HASP562` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.437 |
|  | `$HASP563` | JES2 初期化/終了 (HASPIRRE) | JES2 Messages SA32-0989-70 p.438 |
|  | `$HASP564` | JES2 初期化/終了 (HASPIRRE) | JES2 Messages SA32-0989-70 p.438 |
|  | `$HASP566` | JES2 初期化/終了 (HASPIRPL) | JES2 Messages SA32-0989-70 p.440 |
|  | `$HASP603` | JES2 初期化/終了 (HASPIRPL) | JES2 Messages SA32-0989-70 p.454 |
| ✓ | `$HASP607` | $P JES2 関連 | JES2 Messages SA32-0989-70 p.463 |
| ✓ | `$HASP608` | $P JES2 関連 | JES2 Messages SA32-0989-70 p.465 |
|  | `$HASP618` | JES2 初期化/終了 (HASPIRMA) | JES2 Messages SA32-0989-70 p.470 |
|  | `$HASP620` | $P JES2 関連 | JES2 Messages SA32-0989-70 p.471 |
|  | `$HASP623` | $P JES2 関連 | JES2 Messages SA32-0989-70 p.474 |
|  | `$HASP631` | $P JES2 関連 | JES2 Messages SA32-0989-70 p.480 |
|  | `$HASP701` | $P JES2 関連 | JES2 Messages SA32-0989-70 p.519 |
|  | `$HASP702` | $P JES2 関連 | JES2 Messages SA32-0989-70 p.520 |
|  | `$HASP706` | $P JES2 関連 | JES2 Messages SA32-0989-70 p.524 |
|  | `$HASP709` | JES2 初期化/終了 (HASPIRMA, HASPIRDA, HASPIRPL, ) | JES2 Messages SA32-0989-70 p.528 |
|  | `$HASP712` | JES2 初期化/終了 (HASPIRPL, HASPCKPT, HASPTERM, ) | JES2 Messages SA32-0989-70 p.531 |
|  | `$HASP714` | $P JES2 関連 | JES2 Messages SA32-0989-70 p.533 |
|  | `$HASP715` | $P JES2 関連 | JES2 Messages SA32-0989-70 p.533 |
|  | `$HASP850` | JES2 初期化/終了 (HASPSPOL, HASPIRDA) | JES2 Messages SA32-0989-70 p.598 |
|  | `$HASP853` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.601 |
|  | `$HASP854` | JES2 初期化/終了 (HASPIRDA, HASPSPOL) | JES2 Messages SA32-0989-70 p.602 |
|  | `$HASP856` | JES2 初期化/終了 (HASPIRMA) | JES2 Messages SA32-0989-70 p.603 |
|  | `$HASP858` | JES2 初期化/終了 (HASPIRPL) | JES2 Messages SA32-0989-70 p.604 |
|  | `$HASP859` | JES2 初期化/終了 (HASPIRPL) | JES2 Messages SA32-0989-70 p.605 |
|  | `$HASP863` | JES2 初期化/終了 (HASPWARM) | JES2 Messages SA32-0989-70 p.607 |
|  | `$HASP864` | JES2 初期化/終了 (HASPIRA) | JES2 Messages SA32-0989-70 p.608 |
|  | `$HASP865` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.609 |
|  | `$HASP867` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.610 |
|  | `$HASP870` | JES2 初期化/終了 (HASPIRA) | JES2 Messages SA32-0989-70 p.613 |
|  | `$HASP871` | JES2 初期化/終了 (HASPIRMA) | JES2 Messages SA32-0989-70 p.613 |
|  | `$HASP872` | JES2 初期化/終了 (HASPIRA) | JES2 Messages SA32-0989-70 p.614 |
|  | `$HASP874` | JES2 初期化/終了 (HASPIRMA) | JES2 Messages SA32-0989-70 p.615 |
|  | `$HASP875` | JES2 初期化/終了 (HASPCSV, HASPIRSI) | JES2 Messages SA32-0989-70 p.616 |
|  | `$HASP876` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.620 |
|  | `$HASP877` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.621 |
|  | `$HASP1500` | JES2 初期化/終了 (HASPIRMA) | JES2 Messages SA32-0989-70 p.739 |
|  | `$HASP4401` | JES2 初期化/終了 (HASPIRDA) | JES2 Messages SA32-0989-70 p.829 |
|  | `$HASP4402` | JES2 初期化/終了 (HASPIRPL) | JES2 Messages SA32-0989-70 p.829 |
|  | `$HASP4451` | JES2 初期化/終了 (HASPIRPL) | JES2 Messages SA32-0989-70 p.831 |
| ✓ | `$HASP9157` | $P JES2 関連 | JES2 Messages SA32-0989-70 p.870 |
|  | `$HASP9158` | $P JES2 関連 | JES2 Messages SA32-0989-70 p.871 |
|  | `$HASP9160` | $P JES2 関連 | JES2 Messages SA32-0989-70 p.872 |
|  | `$HASP9176` | $P JES2 関連 | JES2 Messages SA32-0989-70 p.881 |

## D. 操作コマンドのエラー（IEE / IEFC メッセージ、Vol 7 / Vol 8）（33 件）

| 対応 | ID | 抽出した理由 | 出典 |
|---|---|---|---|
|  | `IEE037D` | 操作コマンドのエラー | Vol7 SA38-0674-70 p.772 |
|  | `IEE079I` | 操作コマンドのエラー | Vol7 SA38-0674-70 p.796 |
|  | `IEE122I` | 操作コマンドのエラー | Vol7 SA38-0674-70 p.818 |
|  | `IEE132I` | 操作コマンドのエラー | Vol7 SA38-0674-70 p.822 |
|  | `IEE279A` | 操作コマンドのエラー | Vol7 SA38-0674-70 p.968 |
|  | `IEE281A` | 操作コマンドのエラー | Vol7 SA38-0674-70 p.969 |
|  | `IEE282A` | 操作コマンドのエラー | Vol7 SA38-0674-70 p.970 |
|  | `IEE283A` | 操作コマンドのエラー | Vol7 SA38-0674-70 p.970 |
| ✓ | `IEE301I` | 操作コマンドのエラー | Vol7 SA38-0674-70 p.978 |
|  | `IEE324I` | 操作コマンドのエラー | Vol7 SA38-0674-70 p.991 |
| ✓ | `IEE341I` | 操作コマンドのエラー | Vol7 SA38-0674-70 p.1000 |
| ✓ | `IEE342I` | 操作コマンドのエラー | Vol7 SA38-0674-70 p.1001 |
|  | `IEE422I` | 操作コマンドのエラー | Vol7 SA38-0674-70 p.1048 |
|  | `IEE458I` | 操作コマンドのエラー | Vol7 SA38-0674-70 p.1056 |
|  | `IEE700I` | 操作コマンドのエラー | Vol7 SA38-0674-70 p.1185 |
| ✓ | `IEE701I` | 操作コマンドのエラー | Vol7 SA38-0674-70 p.1185 |
| ✓ | `IEE702I` | 操作コマンドのエラー | Vol7 SA38-0674-70 p.1186 |
|  | `IEE703I` | 操作コマンドのエラー | Vol7 SA38-0674-70 p.1186 |
| ✓ | `IEE704I` | 操作コマンドのエラー | Vol7 SA38-0674-70 p.1187 |
|  | `IEE756I` | 操作コマンドのエラー | Vol7 SA38-0674-70 p.1223 |
|  | `IEE825I` | 操作コマンドのエラー | Vol7 SA38-0674-70 p.1260 |
|  | `IEE827I` | 操作コマンドのエラー | Vol7 SA38-0674-70 p.1261 |
| ✓ | `IEE838I` | 操作コマンドのエラー | Vol7 SA38-0674-70 p.1268 |
| ✓ | `IEE841I` | 操作コマンドのエラー | Vol7 SA38-0674-70 p.1271 |
| ✓ | `IEE842I` | 操作コマンドのエラー | Vol7 SA38-0674-70 p.1272 |
|  | `IEFC008I` | START 時のエラー | Vol8 SA38-0675-70 p.508 |
|  | `IEFC022I` | START 時のエラー | Vol8 SA38-0675-70 p.517 |
| △ | `IEFC452I` | START 時のエラー | Vol8 SA38-0675-70 p.532 |
|  | `IEFC610I` | START 時のエラー | Vol8 SA38-0675-70 p.537 |
|  | `IEFC611I` | START 時のエラー | Vol8 SA38-0675-70 p.538 |
| ✓ | `IEFC612I` | START 時のエラー | Vol8 SA38-0675-70 p.539 |
|  | `IEFC614I` | START 時のエラー | Vol8 SA38-0675-70 p.540 |
|  | `IEFC665I` | START 時のエラー | Vol8 SA38-0675-70 p.571 |

## E. IPL / NIP 中の待機状態コード（System Codes）（76 件）

| 対応 | ID | 抽出した理由 | 出典 |
|---|---|---|---|
|  | `002` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.675 |
|  | `003` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.675 |
|  | `005` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.676 |
|  | `006` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.677 |
|  | `007` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.678 |
|  | `009` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.679 |
|  | `00A` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.679 |
|  | `00E` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.681 |
| ✓ | `00F` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.682 |
|  | `013` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.682 |
|  | `017` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.683 |
|  | `019` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.684 |
|  | `025` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.688 |
|  | `02E` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.689 |
|  | `02F` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.690 |
|  | `030` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.690 |
|  | `031` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.691 |
|  | `032` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.692 |
|  | `033` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.693 |
|  | `035` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.693 |
|  | `037` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.694 |
|  | `038` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.695 |
|  | `03C` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.696 |
|  | `03D` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.697 |
|  | `03E` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.698 |
|  | `03F` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.698 |
|  | `040` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.699 |
|  | `044` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.699 |
|  | `045` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.700 |
|  | `046` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.700 |
|  | `04A` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.701 |
|  | `053` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.702 |
|  | `054` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.703 |
|  | `055` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.704 |
|  | `056` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.706 |
|  | `059` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.706 |
|  | `05C` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.707 |
|  | `05D` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.708 |
|  | `05E` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.708 |
| ✓ | `05F` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.709 |
|  | `060` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.710 |
|  | `061` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.710 |
|  | `063` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.711 |
|  | `064` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.712 |
|  | `065` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.714 |
|  | `070` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.716 |
|  | `072` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.718 |
|  | `073` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.718 |
|  | `074` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.720 |
|  | `075` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.721 |
|  | `076` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.722 |
|  | `078` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.723 |
|  | `07B` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.723 |
|  | `07C` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.726 |
|  | `07D` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.728 |
|  | `081` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.729 |
|  | `085` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.732 |
| ✓ | `088` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.734 |
|  | `089` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.736 |
|  | `08C` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.737 |
| ✓ | `0A2` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.742 |
|  | `0A3` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.746 |
|  | `0A7` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.755 |
|  | `0B0` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.756 |
| ✓ | `0B1` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.756 |
|  | `0B2` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.760 |
| ✓ | `0B3` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.760 |
|  | `0E0` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.762 |
|  | `0E8` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.763 |
|  | `140` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.774 |
|  | `204` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.777 |
|  | `205` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.778 |
|  | `A03` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.780 |
|  | `A2A` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.786 |
|  | `A7A` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.789 |
|  | `EC9` | IPL/NIP 関連の待機状態 | System Codes SA38-0665-70 p.799 |

