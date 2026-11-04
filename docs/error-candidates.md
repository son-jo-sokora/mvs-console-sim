# マニュアルから抽出した IPL / シャットダウン関連エラー候補（全件）

`tools/extract_errors.py` で z/OS 3.2 のマニュアル本文から機械抽出した一覧です。
抽出条件: 初期化（IPL/NIP）中に出る応答要求（A/D）・待機（W）メッセージ、再指定や再IPLを求めるエラー、XCF の初期化／停止時の応答要求、
JES2 の初期化・終了モジュールが出す応答要求／終了メッセージ、操作コマンドが拒否されるメッセージ、IPL/NIP に関係する待機状態コード。
機械抽出のため、一部に情報メッセージ（エラーでないもの）も混じります。

凡例: ✓＝シミュレータで再現（tests でテスト）、△＝解説のみ（シミュレータ内の注記・解説パネル）、空欄＝未対応
**合計 387 件**（うちシミュレータで再現 50 件）。シミュレータで扱うエラーの詳細とテスト対応は [error-catalog.md](error-catalog.md) を参照。


## A. IPL / NIP（IEA メッセージ、Vol 6）（116 件）

| 対応 | ID | 内容（先頭） | 出典 |
|---|---|---|---|
|  | `IEA004W` | CHANNEL SUBSYSTEM IDENTIFIER IS NOT ZERO The system was IPLed into a partition that has a  | Vol6 SA38-0673-70 p.1048 |
|  | `IEA006W` | LOGICAL PARTITION IDENTIFIER IS NOT IN THE RANGE OF 0-F The system was IPLed in a partitio | Vol6 SA38-0673-70 p.1048 |
|  | `IEA009I` | SYMBOLIC DEFINITIONS is READ FROM: IEASYMxx ⋮IEASYMzz This message displays the IEASYMxx p | Vol6 SA38-0673-70 p.1051 |
|  | `IEA010I` | SYMBOLIC DEFINITION ALTERED: SYMBOL nameORIGINAL VALUE = old-textNEW VALUE = &symbol.= new | Vol6 SA38-0673-70 p.1051 |
|  | `IEA011A` | RESPECIFY ENTIRE IEASYMXX SUFFIX LIST OR U TO BYPASS If this message is preceded by messag | Vol6 SA38-0673-70 p.1052 |
|  | `IEA012E` | CIRCULAR SYMBOLIC DEFINITION DETECTED text Where text is: | Vol6 SA38-0673-70 p.1053 |
|  | `IEA013E` | ERROR DETECTED PROCESSING IEASYMxx: text The system found an error in an IEASYMxx parmlib  | Vol6 SA38-0673-70 p.1054 |
|  | `IEA014W` | NONRECOVERABLE ERROR IN IEASYMXX PROCESSING The system found an error in an IEASYMxx parml | Vol6 SA38-0673-70 p.1056 |
|  | `IEA016W` | REQUIRED LEVEL OF DFSMS IS NOT INSTALLED 1042 z/OS: z/OS MVS System Messages, Vol 6 (GOS-I | Vol6 SA38-0673-70 p.1058 |
|  | `IEA029D` | {IEASVC/ALLOC/SCHED} PARMLIB MEMBER HAS AN UNBALANCED COMMENT. REPLY YES TO CONTINUE IPL O | Vol6 SA38-0673-70 p.1065 |
|  | `IEA040W` | REMOTE SLIP TRAP ID=xxxx FROM SYSTEM ssssssss MATCHED. ACTION=WAIT RESTART THE SYSTEM TO C | Vol6 SA38-0673-70 p.1077 |
|  | `IEA067I` | CROSS-MEMORY RESOURCE MONITORING HAS FAILED A fatal error occurred in the cross-memory mon | Vol6 SA38-0673-70 p.1094 |
|  | `IEA080D` | IOS KEYWORD PARAMETER INVALID. REPLY IOS=XX OR IOS=DEFAULT In response to message IEA101A  | Vol6 SA38-0673-70 p.1104 |
|  | `IEA084W` | ENTRY POINT entrypt NOT FOUND IN THE NUCLEUS During system initialization, the system coul | Vol6 SA38-0673-70 p.1105 |
|  | `IEA086W` | memname NOT FOUND IN SYS1.NUCLEUS The initial program load (IPL) program was unable to loc | Vol6 SA38-0673-70 p.1106 |
|  | `IEA087W` | ENTRY POINT entrypt APPEARS IN mod1 AND mod2 The system detected a duplicate entry point n | Vol6 SA38-0673-70 p.1107 |
|  | `IEA088W` | NUCLEUS REQUIRES MORE STORAGE BELOW 16MB THAN IS AVAILABLE | Vol6 SA38-0673-70 p.1108 |
|  | `IEA089W` | memname HAS MORE THAN 1 CSECT BUT WAS NOT LINK EDITED WITH SCTR OPTION | Vol6 SA38-0673-70 p.1108 |
|  | `IEA090W` | LOAD REAL ADDRESS FAILED DURING irimname PROCESSING An initial program load (IPL) resource | Vol6 SA38-0673-70 p.1109 |
|  | `IEA091I` | NUCLEUS x SELECTED The system selected module IEANUC0X as the base nucleus module to load  | Vol6 SA38-0673-70 p.1109 |
| ✓ | `IEA101A` | SPECIFY SYSTEM PARAMETERS FOR xx...x This message is issued during system initialization t | Vol6 SA38-0673-70 p.1112 |
|  | `IEA102W` | OPERATOR PROMPT NOT ALLOWED FOR A SYSPLEX TEST DATESOURCE LPAR | Vol6 SA38-0673-70 p.1113 |
|  | `IEA111D` | SPECIFY SUBCHANNEL SET TO BE USED FOR DEVICES THAT ARE ACCESSIBLE FROM MULTIPLE SUBCHANNEL | Vol6 SA38-0673-70 p.1114 |
| ✓ | `IEA116A` | CONTINUE SYSTEM PARAMETERS During nucleus initialization, the reply to message IEA101A spe | Vol6 SA38-0673-70 p.1114 |
| ✓ | `IEA120D` | DEVICE dev VOLID NOT READ. REPLY ‘WAIT’ FOR I/O COMPLETION OR ‘CONT’ TO CONTINUE WITH DEVI | Vol6 SA38-0673-70 p.1115 |
|  | `IEA145E` | MESSAGES/COMMANDS MAY HAVE BEEN LOST, COMMANDS MAY NEED TO BE REISSUED | Vol6 SA38-0673-70 p.1124 |
|  | `IEA182W` | RECONFIGURATION INITIALIZATION FAILED TO OBTAIN CHANNEL PATH INFORMATION FROM THE SERVICE  | Vol6 SA38-0673-70 p.1132 |
|  | `IEA183W` | RECONFIGURATION INITIALIZATION FAILED TO OBTAIN SIDE INFORMATION FROM THE SERVICE PROCESSO | Vol6 SA38-0673-70 p.1133 |
|  | `IEA184W` | RECONFIGURATION INITIALIZATION FAILED TO OBTAIN THE LENGTH OF THE SIDE INFORMATION BLOCK C | Vol6 SA38-0673-70 p.1133 |
|  | `IEA200I` | memberxx - text During system initialization, the system could not use a data set member t | Vol6 SA38-0673-70 p.1144 |
| ✓ | `IEA213A` | DUPLICATE VOLUME volname FOUND ON DEVICES dev1 AND dev2. REPLY DEVICE NUMBER WHICH IS TO R | Vol6 SA38-0673-70 p.1147 |
| ✓ | `IEA214A` | DUPLICATE SYSRES volname FOUND ON DEVICE dev. VERIFY THAT CORRECT DEVICE WAS USED FOR IPL. | Vol6 SA38-0673-70 p.1148 |
|  | `IEA297W` | LSQA IS EXHAUSTED IN A NON-MEMTERMABLE ADDRESS SPACE: ASID=xxxx JOBNAME=yyyyyyyy | Vol6 SA38-0673-70 p.1183 |
|  | `IEA298I` | MAXCAD VALUE, xxxxxx, NOT VALID. DEFAULT OF 50 USED During system initialization, an incor | Vol6 SA38-0673-70 p.1184 |
|  | `IEA300I` | I/O ERROR DURING BLDL FOR mem IN dsname An uncorrectable I/O error prevents the nucleus in | Vol6 SA38-0673-70 p.1185 |
| ✓ | `IEA301I` | mem {NOT FOUND/IS ALIAS} IN dsname/PARMLIB The nucleus initialization program (NIP) detect | Vol6 SA38-0673-70 p.1186 |
|  | `IEA303W` | ABEND cde REASON rsn DURING INITIALIZATION UNDER RIM dsname [modname NOT FOUND] | Vol6 SA38-0673-70 p.1187 |
|  | `IEA304W` | SYSTEM WAIT STATE - CODE cde DURING mod INITIALIZATION The nucleus initialization program  | Vol6 SA38-0673-70 p.1188 |
| ✓ | `IEA310A` | INVALID REPLY During nucleus initialization, the last reply to message IEA120A, IEA213A, o | Vol6 SA38-0673-70 p.1191 |
|  | `IEA315A` | M devname,[NL], dsname During system initialization, the system required one of the follow | Vol6 SA38-0673-70 p.1194 |
|  | `IEA316A` | D dev[,ser] During system initialization, the system found that a volume was mounted on a  | Vol6 SA38-0673-70 p.1195 |
|  | `IEA317A` | SPECIFY UNIT FOR dataset ON volser [OR CANCEL] During system initialization, the system co | Vol6 SA38-0673-70 p.1195 |
|  | `IEA319I` | dsname NOT FOUND ON volser During system initialization, the system could not find a data  | Vol6 SA38-0673-70 p.1197 |
| ✓ | `IEA321I` | INVALID PARAMETER SYNTAX - prm - text text is one of the following: | Vol6 SA38-0673-70 p.1197 |
|  | `IEA323I` | OPI INVALID IN mem The nucleus initialization program (NIP) found an incorrect OPI paramet | Vol6 SA38-0673-70 p.1198 |
| ✓ | `IEA324I` | SYSP INPUT TERMINATED IN mem During system initialization, the nucleus initialization prog | Vol6 SA38-0673-70 p.1199 |
|  | `IEA328E` | LNKLSTxx INPUT TRUNCATED AT dsname Too many data set names were specified for inclusion in | Vol6 SA38-0673-70 p.1201 |
|  | `IEA330A` | CONTINUE prm PARM This message permits the operator to continue entering information relat | Vol6 SA38-0673-70 p.1202 |
|  | `IEA332A` | SPECIFY prm The nucleus initialization program (NIP) found that a function defined by a pa | Vol6 SA38-0673-70 p.1203 |
|  | `IEA334A` | dsname(mem) HAS AN INVALID RECORD LENGTH - SPECIFY EOB TO CONTINUE | Vol6 SA38-0673-70 p.1204 |
| ✓ | `IEA336A` | RESPECIFY PARAMETERS OR PRESS ENTER TO CANCEL During nucleus initialization, one of the fo | Vol6 SA38-0673-70 p.1206 |
|  | `IEA338A` | INVALID prm PARM - RESPECIFY parm OR PRESS ENTER TO CANCEL 1190 z/OS: z/OS MVS System Mess | Vol6 SA38-0673-70 p.1206 |
|  | `IEA339A` | dsname HAS AN INVALID BLOCKSIZE - PRESS ENTER TO CONTINUE The block size of the parmlib da | Vol6 SA38-0673-70 p.1207 |
|  | `IEA340I` | REAL OR VIRTUAL STORAGE NOT AVAILABLE FOR func The nucleus initialization program (NIP) co | Vol6 SA38-0673-70 p.1207 |
|  | `IEA341A` | RESPECIFY prm PARM OR PRESS ENTER A system parameter specified during initialization was i | Vol6 SA38-0673-70 p.1209 |
|  | `IEA343D` | NUCLEUS OVERLAPS PLPA, RE-IPL OR REPLY ‘GO’ FOR COLD START The nucleus overlaps into the p | Vol6 SA38-0673-70 p.1209 |
|  | `IEA345A` | dsname NOT USED (text) - PRESS ENTER TO CONTINUE The system cannot use the specified parml | Vol6 SA38-0673-70 p.1210 |
| ✓ | `IEA347A` | SPECIFY MASTER CATALOG PARAMETER During system initialization the system issues this messa | Vol6 SA38-0673-70 p.1211 |
|  | `IEA354I` | [CLPA/MLPA/BLDL/IOSDLPAL] FAILED - text The system link pack area (LPA) or the pageable bu | Vol6 SA38-0673-70 p.1215 |
|  | `IEA355A` | RESPECIFY prm [OR CANCEL] The nucleus initialization program (NIP) detected an error a par | Vol6 SA38-0673-70 p.1216 |
|  | `IEA358A` | LPALIB MODULE mod IS NON-EXECUTABLE. PRESS ENTER TO CONTINUE, OR RE-IPL THE SYSTEM | Vol6 SA38-0673-70 p.1219 |
|  | `IEA365E` | text Where text is: | Vol6 SA38-0673-70 p.1224 |
|  | `IEA366W` | MULTIPLE CONSOLE SUPPORT INOPERATIVE-WAIT STATE 201 - REIPL Because of a failure, multiple | Vol6 SA38-0673-70 p.1224 |
|  | `IEA367A` | MULTIPLE CONSOLE SUPPORT INOPERATIVE ERROR CODE = xxxx REPLY WITH ANY CHARACTER TO CONTINU | Vol6 SA38-0673-70 p.1225 |
|  | `IEA376I` | VIODSN PARAMETER IS 'IGNORE'. NO VIO JOURNALING The value of the VIODSN parameter in the I | Vol6 SA38-0673-70 p.1228 |
|  | `IEA377D` | REPLY VIO JOURNALING DATA SET NAME OR 'IGNORE' This message allows the operator to respeci | Vol6 SA38-0673-70 p.1229 |
|  | `IEA378I` | REPLY TO IEA377D IS 'IGNORE' OR NULL. NO VIO JOURNALING The reply to the message IEA377D i | Vol6 SA38-0673-70 p.1230 |
|  | `IEA400I` | NSYSLX VALUE, value, NOT VALID, DEFAULT OF number USED During system initialization, the n | Vol6 SA38-0673-70 p.1252 |
|  | `IEA432I` | sysa IS REMOVING sysb FROM THE SYSPLEX. sysa IS EXPERIENCING STORAGE SHORTAGES. | Vol6 SA38-0673-70 p.1269 |
|  | `IEA503W` | MULTIPLE CPUS FAILED DURING xxx SYNC-CHECK PROCESSING. At least two processors could not c | Vol6 SA38-0673-70 p.1323 |
|  | `IEA510A` | LNKLST PROCESSING IS INOPERATIVE, HIT ENTER TO CONTINUE WITH THE DEFAULT LNKLST OR RE-IPL  | Vol6 SA38-0673-70 p.1324 |
|  | `IEA512W` | h.IODFxx IS NOT VALID. SUFFIX RANGE IS ‘00’ THRU ‘FF’. The specified input/output definiti | Vol6 SA38-0673-70 p.1324 |
|  | `IEA513W` | DATASET NOT FOUND ON DEVICE dev: dsname The system cannot find a data set name because one | Vol6 SA38-0673-70 p.1325 |
|  | `IEA515W` | DEVICE NUMBER dev NOT DEFINED TO THE CHANNEL SUBSYSTEM During system initialization, the s | Vol6 SA38-0673-70 p.1326 |
|  | `IEA516W` | MODIFY SUBCHANNEL FAILED FOR DEVICE NUMBER dev 1310 z/OS: z/OS MVS System Messages, Vol 6  | Vol6 SA38-0673-70 p.1326 |
|  | `IEA517W` | IODF IS NOT VALID FOR AN IPL During system initialization, the system found an incorrect I | Vol6 SA38-0673-70 p.1327 |
|  | `IEA518W` | CONFIGURATION ID xxxxxxxx NOT FOUND IN IODF. During system initialization, the system coul | Vol6 SA38-0673-70 p.1327 |
| ✓ | `IEA519I` | IODF DSN = dsname This message identifies the I/O definition file (IODF) data set name. In | Vol6 SA38-0673-70 p.1328 |
| ✓ | `IEA520I` | CONFIGURATION ID = xxxxxxxx. IODF DEVICE NUMBER = dev This message identifies the configur | Vol6 SA38-0673-70 p.1328 |
|  | `IEA523W` | NO DEVICES DEFINED The system cannot recognize any of the devices defined in the I/O defin | Vol6 SA38-0673-70 p.1330 |
|  | `IEA525W` | UIM modname SPECIFIED UNDEFINED DEVICE NUMBER s-dev A user interaction module (UIM) asked  | Vol6 SA38-0673-70 p.1331 |
|  | `IEA527A` | SPECIFY REQUIRED SYSNAME PARAMETER. SYSNAME= During system initialization, the system name | Vol6 SA38-0673-70 p.1332 |
|  | `IEA528I` | IPL IODF NAME DOES NOT MATCH IODF NAME IN HARDWARE TOKEN IODFdsname | Vol6 SA38-0673-70 p.1333 |
|  | `IEA545W` | MULTIPLE CONSOLE SUPPORT INOPERATIVE MESSAGE IEA367A COULD NOT BE DISPLAYED ERROR CODE = c | Vol6 SA38-0673-70 p.1336 |
|  | `IEA548W` | NIP CONSOLE UNAVAILABLE. INITIALIZATION CANNOT PROCEED. FAILING MESSAGE: text | Vol6 SA38-0673-70 p.1336 |
|  | `IEA557A` | MULTIPLE REQUESTORS FOR REPLY ID 0, REPLY TO ID 0 ON sysname An authorized program issued  | Vol6 SA38-0673-70 p.1339 |
|  | `IEA660I` | PROCESSING CONTINUES AFTER UNDEFINED KEYWORD DUE TO WARNUND | Vol6 SA38-0673-70 p.1361 |
|  | `IEA710A` | LPALST FUNCTION INOPERATIVE - HIT ENTER TO CONTINUE WITH THE DEFAULT LPALST OR RE-IPL THE  | Vol6 SA38-0673-70 p.1377 |
|  | `IEA716I` | text- member DATA SET IGNORED library text is one of the following: LIBRARY NOT LOCATED | Vol6 SA38-0673-70 p.1379 |
|  | `IEA814D` | DATA SET dsname DRAINING ON PREVIOUS IPL, CONTINUE DRAINING? REPLY ‘YES’ OR ‘NO’ | Vol6 SA38-0673-70 p.1399 |
|  | `IEA843I` | MODULE mmmmmmmm NOT FOUND During system initialization, a resource initialization module ( | Vol6 SA38-0673-70 p.1416 |
|  | `IEA853A` | REPLY CONT, END OR RESPECIFY. While reading the VATLSTxx parmlib member, referred to in me | Vol6 SA38-0673-70 p.1424 |
|  | `IEA856W` | ATTEMPTED ACR OF LAST CPU - SYSTEM TERMINATED Alternate CPU recovery (ACR) attempted to re | Vol6 SA38-0673-70 p.1426 |
|  | `IEA865I` | SYSTEM ERROR DURING NIP PROCESSING OF prm PARAMETER - IPL TERMINATED | Vol6 SA38-0673-70 p.1433 |
|  | `IEA874I` | INVALID OPT IN IEAOPTxx Processing for system resources manager (SRM) initialization found | Vol6 SA38-0673-70 p.1435 |
|  | `IEA883I` | MODULE mmmmmmmm NOT FOUND During system initialization, SVC dump initialization processing | Vol6 SA38-0673-70 p.1436 |
| ✓ | `IEA888A` | [UTC DATE=yyyy.ddd,CLOCK=hh.mm.ss] LOCAL DATE=yyyy.ddd,CLOCK=hh.mm.ss REPLY U, OR UTC/LOCA | Vol6 SA38-0673-70 p.1439 |
|  | `IEA890I` | comnd FAILED- MEMORY COULD NOT BE CREATED comnd is one of the following: | Vol6 SA38-0673-70 p.1441 |
|  | `IEA896I` | RECORDING FUNCTION NO LONGER ACTIVE The recovery termination manager (RTM) has stopped rec | Vol6 SA38-0673-70 p.1445 |
|  | `IEA923D` | VOLUME ser NEEDED FOR PAGE DATA SET WAS NOT MOUNTED; REPLY ‘GO’ OR ‘IGNORE’ | Vol6 SA38-0673-70 p.1463 |
|  | `IEA924D` | VOLUME ser NEEDED FOR PAGE DATA SET WAS NOT MOUNTED; {CLPA MAY BE FORCED/NEW PLPA DATA SET | Vol6 SA38-0673-70 p.1464 |
|  | `IEA925D` | VOLUME ser NEEDED FOR PAGE DATA SET WAS NOT MOUNTED; CVIO MAY BE FORCED; REPLY ‘GO’ OR ‘IG | Vol6 SA38-0673-70 p.1465 |
|  | `IEA927I` | PLPA AND COMMON PAGE DATA SETS FULL FROM PREVIOUS IPL 1450 z/OS: z/OS MVS System Messages, | Vol6 SA38-0673-70 p.1466 |
|  | `IEA935W` | INSUFFICIENT PAGING RESOURCES, IPL TERMINATED To support minimal paging, there must be a m | Vol6 SA38-0673-70 p.1472 |
|  | `IEA936D` | FUTURE QUICK AND WARM STARTS OF THIS IPL WILL FAIL. RE-IPL OR REPLY ‘GO’ TO CONTINUE COLD  | Vol6 SA38-0673-70 p.1472 |
|  | `IEA937I` | COMMON PAGE DATA SET TIMESTAMP FAILURE When this message is followed by message IEA935W, t | Vol6 SA38-0673-70 p.1473 |
|  | `IEA938W` | NO STORAGE AVAILABLE, PAGING INITIALIZATION TERMINATED A request for additional storage fa | Vol6 SA38-0673-70 p.1474 |
|  | `IEA939D` | QUICK AND WARM START DATA IS INVALID, RE-IPL OR REPLY ‘GO’ FOR COLD START 1458 z/OS: z/OS  | Vol6 SA38-0673-70 p.1474 |
|  | `IEA943W` | FAILURE DURING SAVE OR REBUILD OF PLPA For an initialization without the CLPA option, the  | Vol6 SA38-0673-70 p.1477 |
|  | `IEA944I` | QUICK OR WARM STARTS FROM THIS IPL WILL HAVE RANDOM RESULTS | Vol6 SA38-0673-70 p.1478 |
|  | `IEA945W` | UNABLE TO USE CLOCK FOR TIMESTAMP On a system initialization with CLPA or CVIO specified o | Vol6 SA38-0673-70 p.1479 |
|  | `IEA947A` | REPLY U TO CONTINUE, OR RE IPL. During processing of a VATLSTxx parmlib member, the system | Vol6 SA38-0673-70 p.1480 |
|  | `IEA950I` | MODULE mod NOT FOUND; MC ROUTING INACTIVE A module was not found in the link pack area (LP | Vol6 SA38-0673-70 p.1482 |
|  | `IEA959I` | ERROR CAUSED ACTIVE LPA TO BE TRUNCATED, MODULE CONTROL MAY BE LOST | Vol6 SA38-0673-70 p.1483 |
|  | `IEA983I` | WORKINST=YES is not available. [diagnostic_info] The WORKINST system parameter was specifi | Vol6 SA38-0673-70 p.1486 |
|  | `IEA999W` | ADDRESS TRANSLATION ERROR IN MASTER MEMORY The system encountered recursive addressing tra | Vol6 SA38-0673-70 p.1497 |

## B. XCF / sysplex（IXC メッセージ、Vol 10）（27 件）

| 対応 | ID | 内容（先頭） | 出典 |
|---|---|---|---|
| ✓ | `IXC102A` | XCF IS WAITING FOR SYSTEM sysname DEACTIVATION. REPLY DOWN WHEN MVS ON sysname HAS BEEN SY | Vol10 SA38-0677-70 p.43 |
|  | `IXC201A` | RESPECIFY COUPLE SYSTEM PARAMETER, REPLY COUPLE=xx 54 z/OS: z/OS MVS System Messages, Vol  | Vol10 SA38-0677-70 p.66 |
| ✓ | `IXC207A` | XCF INITIALIZATION IS RESTARTED. RESPECIFY COUPLE SYSTEM PARAMETER, REPLY couple=xx. | Vol10 SA38-0677-70 p.75 |
|  | `IXC211A` | SYNTAX ERROR IN COUPLE SYSTEM PARAMETER. REPLY COUPLE=XX. XCF could not process the specif | Vol10 SA38-0677-70 p.78 |
|  | `IXC221D` | REPLY C TO USE COUPLE DATA SETS SPECIFIED IN COUPLExx OR R TO RESPECIFY COUPLEXX | Vol10 SA38-0677-70 p.88 |
|  | `IXC222D` | REPLY U TO USE RESOLVED DATA SETS OR R TO RESPECIFY COUPLEXX This system encountered an er | Vol10 SA38-0677-70 p.89 |
|  | `IXC239A` | UNABLE TO ACTIVATE COUPLE DATA SET(S) FOR typename 80 z/OS: z/OS MVS System Messages, Vol  | Vol10 SA38-0677-70 p.92 |
|  | `IXC247D` | REPLY U to ACCEPT USE OR D TO DENY USE OF THE COUPLE DATA SET FOR typename. | Vol10 SA38-0677-70 p.99 |
|  | `IXC252D` | REPLY C TO CONTINUE IPL WITHOUT THE typename FUNCTION, OR R TO RETRY DATA SET ALLOCATION | Vol10 SA38-0677-70 p.105 |
|  | `IXC256A` | REMOVAL OF {PRIMARY/ALTERNATE} COUPLE DATA SET dsname FOR typename CANNOT FINISH THE {ACTI | Vol10 SA38-0677-70 p.112 |
|  | `IXC269D` | REPLY U TO USE RESOLVED DATA SETS, C TO USE COUPLE DATA SETS SPECIFIED IN COUPLExx, OR R T | Vol10 SA38-0677-70 p.122 |
|  | `IXC279D` | REPLY R TO USE altdsname ON altvolser TO REPAIR DATA FOR typename OR S TO STOP | Vol10 SA38-0677-70 p.130 |
|  | `IXC289D` | REPLY U TO USE THE DATA SETS LAST USED FOR typename OR C TO USE THE COUPLE DATA SETS SPECI | Vol10 SA38-0677-70 p.139 |
| ✓ | `IXC371D` | CONFIRM REQUEST TO VARY SYSTEM sysname OFFLINE. REPLY SYSNAME=sysname TO REMOVE sysname OR | Vol10 SA38-0677-70 p.325 |
|  | `IXC402D` | sysname LAST OPERATIVE AT hh:mm:ss. REPLY DOWN AFTER SYSTEM RESET OR INTERVAL=SSSSS TO SET | Vol10 SA38-0677-70 p.359 |
|  | `IXC403D` | sysname STARTED INITIALIZATION AT hh:mm:ss. REPLY W TO WAIT FOR sysname OR I TO COMPLETE I | Vol10 SA38-0677-70 p.361 |
| ✓ | `IXC405D` | REPLY I TO INITIALIZE THE SYSPLEX, J TO JOIN SYSPLEX sysplexname, OR R TO REINITIALIZE XCF | Vol10 SA38-0677-70 p.363 |
|  | `IXC409D` | SIGNAL PATHS BETWEEN sysname1 AND sysname2 ARE LOST. REPLY RETRY OR SYSNAME=SYSNAME OF THE | Vol10 SA38-0677-70 p.367 |
|  | `IXC417D` | CONFIRM REQUEST TO REMOVE sysname FROM THE SYSPLEX. REPLY SYSNAME=sysname TO REMOVE sysnam | Vol10 SA38-0677-70 p.376 |
|  | `IXC420D` | REPLY I TO INITIALIZE SYSPLEX sysplex-name, OR R TO REINITIALIZE XCF. REPLYING I WILL IMPA | Vol10 SA38-0677-70 p.378 |
|  | `IXC426D` | SYSTEM sysname IS SENDING XCF SIGNALS BUT NOT UPDATING STATUS. REPLY SYSNAME=sysname TO RE | Vol10 SA38-0677-70 p.384 |
|  | `IXC427A` | SYSTEM sysname HAS NOT UPDATED STATUS SINCE hh:mm:ss BUT IS SENDING XCF SIGNALS. XCF SYSPL | Vol10 SA38-0677-70 p.385 |
|  | `IXC455D` | REPLY INTERVAL=NNN SECONDS TO RECHECK CONNECTIVITY OR text 402 z/OS: z/OS MVS System Messa | Vol10 SA38-0677-70 p.414 |
|  | `IXC501A` | REPLY Y TO USE COUPLING FACILITY NAMED cfname OR N TO NOT USE COUPLING FACILITY | Vol10 SA38-0677-70 p.454 |
|  | `IXC508A` | REPLY K TO KEEP, D TO DELETE STRUCTURES FROM SYSPLEX plexname | Vol10 SA38-0677-70 p.463 |
|  | `IXC558D` | CONFIRM DISRUPTIVE CF DUMP OF CF cfname. REPLY CANCEL OR CONTINUE | Vol10 SA38-0677-70 p.532 |
|  | `IXC560A` | REPLY Y TO CONFIRM THAT COUPLING FACILITY NAME cfname SHOULD BE USED BY plexname1 OR N TO  | Vol10 SA38-0677-70 p.534 |

## C. JES2 初期化・終了（$HASP メッセージ）（135 件）

| 対応 | ID | 内容（先頭） | 出典 |
|---|---|---|---|
|  | `$HASP051` | EXTREME BERT SHORTAGE DETECTED. JES2 PROCESSING IS IN A NON-STABLE STATE. | JES2 Messages SA32-0989-70 p.53 |
|  | `$HASP065` | AWAITING RESPONSE TO HASP xxx | JES2 Messages SA32-0989-70 p.59 |
|  | `$HASP068` | PARTIAL RECOVERY SUCCESSFUL – xxxxxxxx | JES2 Messages SA32-0989-70 p.60 |
|  | `$HASP070` | SPECIFY RECOVERY OPTIONS – ( ‘RECOVER’ OR ‘TERMINATE’ | JES2 Messages SA32-0989-70 p.62 |
|  | `$HASP071` | INVALID REPLY TO HASP070 The operator entered an incorrect reply to message HASP070. | JES2 Messages SA32-0989-70 p.63 |
|  | `$HASP074` | RECOVERY UNSUCCESSFUL An error occurred in a JES2 processor (for example, in the command p | JES2 Messages SA32-0989-70 p.64 |
|  | `$HASP083` | R13 NOT A VALID PCE ADDRESS The operator responded SNAP in reply to message HASP070 or HAS | JES2 Messages SA32-0989-70 p.71 |
|  | `$HASP084` | INVALID SAVE AREA CHAIN The operator responded SNAP in reply to message HASP070 or HASP098 | JES2 Messages SA32-0989-70 p.71 |
| ✓ | `$HASP085` | JES2 TERMINATION COMPLETE JES2 has ended because the operator entered the $P JES2 command  | JES2 Messages SA32-0989-70 p.72 |
|  | `$HASP087` | JES2 FAILED DURING TERMINATION PROCESSING, | JES2 Messages SA32-0989-70 p.72 |
|  | `$HASP088` | Only 32 bit registers are being used ------- JES2 [SUBTASK ] ABEND ANALYSIS -------FMID =  | JES2 Messages SA32-0989-70 p.73 |
|  | `$HASP089` | JES2 SYSTEM DUMP UNSUCCESSFUL, REPLY REPLY ‘Y’ TO RETRY, OR | JES2 Messages SA32-0989-70 p.76 |
|  | `$HASP093` | CALLER ADDRESS ARRAY UNDERFLOWED JES2 processing is attempting to build the calling sequen | JES2 Messages SA32-0989-70 p.79 |
| ✓ | `$HASP095` | Chapter 4. Zero to ninety-nine 81 JES2 CATASTROPHIC | JES2 Messages SA32-0989-70 p.95 |
|  | `$HASP098` | ENTER TERMINATION OPTION The JES2 main task encountered an error and issued message HASP09 | JES2 Messages SA32-0989-70 p.122 |
|  | `$HASP140` | ENF LISTEN REQUEST nn | JES2 Messages SA32-0989-70 p.159 |
|  | `$HASP141` | ENF DELETE REQUEST nn | JES2 Messages SA32-0989-70 p.160 |
|  | `$HASP198` | REPLY TO HASP098 WITH ONE OF THE FOLLOWING: | JES2 Messages SA32-0989-70 p.188 |
|  | `$HASP238` | RMTxxxx ROUTECDE=yyyy – – CONFLICTS WITH RMTyyyy | JES2 Messages SA32-0989-70 p.219 |
|  | `$HASP242` | REMOTE POOLING ERROR – – CANNOT POOL A REMOTE TO A | JES2 Messages SA32-0989-70 p.221 |
|  | `$HASP254` | MEMBER member | JES2 Messages SA32-0989-70 p.230 |
|  | `$HASP258` | CHECKPOINT WRITE IS IN PROGRESS FORCING JES2 MAY CAUSE SEVERE CKPT DAMAGE | JES2 Messages SA32-0989-70 p.235 |
|  | `$HASP283` | JES2 IS PROCESSING A ‘RECONFIG’ REQUEST TO OVERRIDE THE | JES2 Messages SA32-0989-70 p.264 |
| ✓ | `$HASP400` | ENTER REQUESTS JES2 is ready for job processing and is waiting for requests. This mode pro | JES2 Messages SA32-0989-70 p.313 |
|  | `$HASP401` | EXTENT ERROR ON volser | JES2 Messages SA32-0989-70 p.313 |
|  | `$HASP403` | DO YOU WISH TO IGNORE THE CHANGE LOG UPDATES? | JES2 Messages SA32-0989-70 p.315 |
|  | `$HASP406` | jobname WAS EXECUTING ON MEMBER | JES2 Messages SA32-0989-70 p.316 |
|  | `$HASP407` | jobname WAS TERMINATING ON MEMBER | JES2 Messages SA32-0989-70 p.317 |
|  | `$HASP408` | jobname IS QUEUED FOR RE-EXECUTION | JES2 Messages SA32-0989-70 p.317 |
|  | `$HASP411` | MORE THAN nnn | JES2 Messages SA32-0989-70 p.319 |
|  | `$HASP412` | JES2 CAN NOT RECONNECT TO FSS fssname, | JES2 Messages SA32-0989-70 p.320 |
|  | `$HASP413` | JES2 RECONNECT TO FSS fssname | JES2 Messages SA32-0989-70 p.320 |
|  | `$HASP415` | JES2 FSA PREVIOUSLY DEFINED FOR IS NOT DEFINED, FSA TERMINATED | JES2 Messages SA32-0989-70 p.322 |
|  | `$HASP416` | VERIFY CHECKPOINT DATA SET INFORMATION VALUES JES2 WILL USE hh:mm:ss | JES2 Messages SA32-0989-70 p.323 |
|  | `$HASP417` | ARE THE VALUES JES2 WILL USE CORRECT? 310 z/OS: z/OS JES2 Messages | JES2 Messages SA32-0989-70 p.324 |
|  | `$HASP419` | MEMBER memname1 | JES2 Messages SA32-0989-70 p.326 |
|  | `$HASP420` | 312 z/OS: z/OS JES2 Messages REPLY ‘Y’ IF | JES2 Messages SA32-0989-70 p.326 |
|  | `$HASP422` | DUPLICATE volser | JES2 Messages SA32-0989-70 p.328 |
|  | `$HASP424` | volser MEMBER | JES2 Messages SA32-0989-70 p.329 |
|  | `$HASP425` | SUBSYSTEM INTERFACE NOT DORMANT, ssn | JES2 Messages SA32-0989-70 p.330 |
| ✓ | `$HASP426` | SPECIFY OPTIONS – JES2 jeslevel | JES2 Messages SA32-0989-70 p.331 |
| ✓ | `$HASP427` | PARAMETER OR SYNTAX ERROR – RESPECIFY OPTIONS | JES2 Messages SA32-0989-70 p.331 |
| ✓ | `$HASP428` | Chapter 8. Four-hundreds 317 CORRECT THE ABOVE PROBLEMS | JES2 Messages SA32-0989-70 p.331 |
|  | `$HASP429` | SUBSYSTEM jesname | JES2 Messages SA32-0989-70 p.332 |
|  | `$HASP430` | INCOMPATIBLE SUBSYSTEM INTERFACE – RC= | JES2 Messages SA32-0989-70 p.333 |
|  | `$HASP432` | AVAILABLE STORAGE EXCEEDED WHILE ALLOCATING | JES2 Messages SA32-0989-70 p.334 |
|  | `$HASP435` | MORE THAN 32 MEMBER NAMES sid | JES2 Messages SA32-0989-70 p.336 |
|  | `$HASP437` | parm VALUE EXCEEDS MAXIMUM | JES2 Messages SA32-0989-70 p.338 |
|  | `$HASP438` | 324 z/OS: z/OS JES2 Messages FORWARDED DATA SET NAME FOUND ON A | JES2 Messages SA32-0989-70 p.338 |
|  | `$HASP439` | JES2 SUBTASK TO RECONNECT FSS SUBIT RC= | JES2 Messages SA32-0989-70 p.339 |
| ✓ | `$HASP441` | 326 z/OS: z/OS JES2 Messages REPLY‘Y’ TO CONTINUE INITIALIZATION | JES2 Messages SA32-0989-70 p.340 |
|  | `$HASP442` | INITIALIZATION STATEMENTS CONFLICTING WITH SAVED VALUES FOLLOW: | JES2 Messages SA32-0989-70 p.341 |
|  | `$HASP443` | vvvvvv DATASET | JES2 Messages SA32-0989-70 p.342 |
|  | `$HASP444` | destid PRINT/PUNCH ROUTE CODE INVALID | JES2 Messages SA32-0989-70 p.343 |
|  | `$HASP445` | UNACTIVATE REQUEST FAILED, reason | JES2 Messages SA32-0989-70 p.344 |
|  | `$HASP446` | CURRENT CHECKPOINT DATA SUPPORTED BY THE | JES2 Messages SA32-0989-70 p.345 |
|  | `$HASP447` | WARM START DENIED - ACTIVE SPOOL MIGRATION DETECTED | JES2 Messages SA32-0989-70 p.346 |
|  | `$HASP452` | NODE NUMBER ON CONNECT STATEMENT EXCEEDS NODENUM VALUE | JES2 Messages SA32-0989-70 p.349 |
| ✓ | `$HASP454` | SHOULD JES2 BYPASS THE MULTI-MEMBER INTEGRITY LOCK? (‘Y’ OR ‘N’) | JES2 Messages SA32-0989-70 p.350 |
|  | `$HASP457` | FORWARDED DATA SET NAME FOUND. SHOULD JES2 FORWARD? (‘Y’ OR ‘N’) | JES2 Messages SA32-0989-70 p.352 |
|  | `$HASP460` | UNABLE TO CONFIRM THAT EITHER DATA SET IS A VALID CHECKPOINT DUE TO | JES2 Messages SA32-0989-70 p.354 |
|  | `$HASP465` | RMTnnnn SPECIFIES INVALID LINE VALUE | JES2 Messages SA32-0989-70 p.358 |
|  | `$HASP466` | initialization-parameter-statement-image This message is issued for each initialization pa | JES2 Messages SA32-0989-70 p.358 |
|  | `$HASP467` | diagnostic Where diagnostic is one of the following: | JES2 Messages SA32-0989-70 p.359 |
|  | `$HASP469` | REPLY PARAMETER STATEMENT, CANCEL, OR END | JES2 Messages SA32-0989-70 p.361 |
|  | `$HASP471` | REPLY ‘Y’ TO CONTINUE COLD | JES2 Messages SA32-0989-70 p.362 |
|  | `$HASP472` | BOTH CHECKPOINT DATA SETS ARE MARKED INUSE=NO | JES2 Messages SA32-0989-70 p.363 |
|  | `$HASP475` | nn GENERAL PURPOSE SUBTASKS ATTACHED - | JES2 Messages SA32-0989-70 p.366 |
| ✓ | `$HASP478` | INITIAL CHECKPOINT READ IS FROM CKPT1/2 | JES2 Messages SA32-0989-70 p.368 |
| ✓ | `$HASP479` | Chapter 8. Four-hundreds 355 UNABLE TO OBTAIN CKPT DATA SET LOCK – | JES2 Messages SA32-0989-70 p.369 |
|  | `$HASP481` | PARM=CKPT n | JES2 Messages SA32-0989-70 p.370 |
|  | `$HASP482` | WARM START DENIED – (dsname | JES2 Messages SA32-0989-70 p.371 |
|  | `$HASP483` | JES2 JOB QUEUE ERROR, RC= | JES2 Messages SA32-0989-70 p.372 |
|  | `$HASP486` | JES2 CKPT n | JES2 Messages SA32-0989-70 p.374 |
|  | `$HASP487` | CKPT n | JES2 Messages SA32-0989-70 p.375 |
|  | `$HASP490` | HOT START DENIED – RE-IPL REQUIRED You cannot attempt a hot start because on of the follow | JES2 Messages SA32-0989-70 p.376 |
|  | `$HASP491` | MEMBER BEING RESTARTED ON | JES2 Messages SA32-0989-70 p.377 |
| ✓ | `$HASP492` | subsystem ALL–MEMBER WARM START | JES2 Messages SA32-0989-70 p.377 |
| ✓ | `$HASP493` | subsystem ALL–MEMBER WARM START | JES2 Messages SA32-0989-70 p.379 |
|  | `$HASP494` | HOT START DENIED – INVALID MEMBER ID | JES2 Messages SA32-0989-70 p.380 |
|  | `$HASP495` | PP BUFFER SIZE EXCEEDS 4096 When used to calculate the size of the print/punch (PP) buffer | JES2 Messages SA32-0989-70 p.380 |
|  | `$HASP496` | statement keyword=xxxxxxxx, reason JES2 determined that an initialization statement specif | JES2 Messages SA32-0989-70 p.381 |
|  | `$HASP506` | 384 z/OS: z/OS JES2 Messages UPDATING LOCAL NODE NAME | JES2 Messages SA32-0989-70 p.398 |
|  | `$HASP507` | COULD NOT CREATE DESTID FOR NODE | JES2 Messages SA32-0989-70 p.399 |
|  | `$HASP509` | RMTnnnn CONDEST VALUE HIGHER THAN | JES2 Messages SA32-0989-70 p.401 |
|  | `$HASP512` | Chapter 9. Five-hundreds 387 REMOTE DESTINATION TABLE | JES2 Messages SA32-0989-70 p.401 |
|  | `$HASP516` | ERROR OBTAINING JCL GROUPING KEYWORDS | JES2 Messages SA32-0989-70 p.404 |
|  | `$HASP518` | ROUTE CODE NUMBER n | JES2 Messages SA32-0989-70 p.405 |
|  | `$HASP537` | THE CURRENT CHECKPOINT USES nnnn | JES2 Messages SA32-0989-70 p.421 |
|  | `$HASP552` | A CHECKPOINT DATA SET WRITE IS CURRENTLY IN PROGRESS. JES2 | JES2 Messages SA32-0989-70 p.434 |
| ✓ | `$HASP553` | 420 z/OS: z/OS JES2 Messages $P JES2,ABEND,FORCE COMMAND | JES2 Messages SA32-0989-70 p.434 |
|  | `$HASP555` | NO CHECKPOINT RECORDS FOUND IN CKPTn DATA | JES2 Messages SA32-0989-70 p.436 |
|  | `$HASP562` | UNABLE TO INCREASE NJEDEF NODENUM FROM mmmmm | JES2 Messages SA32-0989-70 p.437 |
|  | `$HASP563` | NODE(n) <NAME= | JES2 Messages SA32-0989-70 p.438 |
|  | `$HASP564` | 424 z/OS: z/OS JES2 Messages UNABLE TO | JES2 Messages SA32-0989-70 p.438 |
|  | `$HASP566` | <DCT/SCK> ATTACH FOR | JES2 Messages SA32-0989-70 p.440 |
|  | `$HASP603` | devname STATUS= | JES2 Messages SA32-0989-70 p.454 |
| ✓ | `$HASP607` | JES2 NOT DORMANT – MEMBER DRAINING, PJES2,TERM NOT ALLOWED AT THIS TIME, | JES2 Messages SA32-0989-70 p.463 |
| ✓ | `$HASP608` | ACTIVE PROCESSORS (PCES) NAME COUNT JOBID | JES2 Messages SA32-0989-70 p.465 |
|  | `$HASP618` | 456 z/OS: z/OS JES2 Messages PCE ATTACH DENIED | JES2 Messages SA32-0989-70 p.470 |
|  | `$HASP620` | COMMAND REJECTED – JES2 SHUTDOWN IN PROGRESS | JES2 Messages SA32-0989-70 p.471 |
|  | `$HASP623` | MEMBER DRAINING The operator entered a $P command and the member has discontinued scheduli | JES2 Messages SA32-0989-70 p.474 |
|  | `$HASP631` | EVENT TRACE LOG DISASTROUS ERROR – – TRACING/LOGGING DISABLED | JES2 Messages SA32-0989-70 p.480 |
|  | `$HASP701` | devname NOT DRAINED – FSS= | JES2 Messages SA32-0989-70 p.519 |
|  | `$HASP702` | FSS fssname | JES2 Messages SA32-0989-70 p.520 |
|  | `$HASP706` | 510 z/OS: z/OS JES2 Messages devname – | JES2 Messages SA32-0989-70 p.524 |
|  | `$HASP709` | JES2 INITIALIZATION DELAYED – reason | JES2 Messages SA32-0989-70 p.528 |
|  | `$HASP712` | ERROR DURING WORKLOAD MANAGER func | JES2 Messages SA32-0989-70 p.531 |
|  | `$HASP714` | JES2 TERMINATION PROCESSING AWAITING nnnnnnnn | JES2 Messages SA32-0989-70 p.533 |
|  | `$HASP715` | ADDRESS SPACES AWAITING RETURN JOBID ASID JOBNAME | JES2 Messages SA32-0989-70 p.533 |
|  | `$HASP850` | nnnnnn TRACK GROUPS ON | JES2 Messages SA32-0989-70 p.598 |
|  | `$HASP853` | REPLY GO, QUIT, OR PURGE | JES2 Messages SA32-0989-70 p.601 |
|  | `$HASP854` | MAXIMUM NUMBER OF TRACK GROUPS EXCEEDED WHILE ALLOCATING VOLUME volser | JES2 Messages SA32-0989-70 p.602 |
|  | `$HASP856` | JES2 FSS SERVICES PROHIBITED DUE TO CROSS MEMORY AXxxx ERROR, RC= | JES2 Messages SA32-0989-70 p.603 |
|  | `$HASP858` | 590 z/OS: z/OS JES2 Messages EXIT ROUTINE | JES2 Messages SA32-0989-70 p.604 |
|  | `$HASP859` | REQUESTED EXIT ROUTINE(S) NOT FOUND | JES2 Messages SA32-0989-70 p.605 |
|  | `$HASP863` | Chapter 12. Eight-hundreds 593 MORE THAN 10 SPOOL I/O ERRORS OCCURRED. | JES2 Messages SA32-0989-70 p.607 |
|  | `$HASP864` | INITIALIZATION TERMINATED BY INSTALLATION EXIT | JES2 Messages SA32-0989-70 p.608 |
|  | `$HASP865` | CONFIRM MEMBER (nn) | JES2 Messages SA32-0989-70 p.609 |
|  | `$HASP867` | 596 z/OS: z/OS JES2 Messages Unable to allocate spool data set, | JES2 Messages SA32-0989-70 p.610 |
|  | `$HASP870` | REPLY Y TO CONFIRM, N TO REFUSE OR T TO TERMINATE | JES2 Messages SA32-0989-70 p.613 |
|  | `$HASP871` | Chapter 12. Eight-hundreds 599 WARNING | JES2 Messages SA32-0989-70 p.613 |
|  | `$HASP872` | REPLY‘Y’ TO CONTINUE INITIALIZATION, ‘N’ TO TERMINATE OR ‘R’ TO RETRY | JES2 Messages SA32-0989-70 p.614 |
|  | `$HASP874` | JES2 VERSION vvvvvvvv | JES2 Messages SA32-0989-70 p.615 |
|  | `$HASP875` | module – reason, | JES2 Messages SA32-0989-70 p.616 |
|  | `$HASP876` | MEMBER memname | JES2 Messages SA32-0989-70 p.620 |
|  | `$HASP877` | OWNMEMB= memname | JES2 Messages SA32-0989-70 p.621 |
|  | `$HASP1500` | Explanation: Cannot create EDSCB. Email services not available. | JES2 Messages SA32-0989-70 p.739 |
|  | `$HASP4401` | JES2 cannot start because a checkpoint reconfiguration occurred JES2 initialization proces | JES2 Messages SA32-0989-70 p.829 |
|  | `$HASP4402` | Following initialization statement (including comments) exceeds the size of the statement  | JES2 Messages SA32-0989-70 p.829 |
|  | `$HASP4451` | Queue error detected during UNACT processing. Reply "CONTINUE" to initialize JES2, "TERM"  | JES2 Messages SA32-0989-70 p.831 |
| ✓ | `$HASP9157` | CANNOT RESTART JES2, IPL REQUIRED JES2 issues this notice message in response to a $JDJES  | JES2 Messages SA32-0989-70 p.870 |
|  | `$HASP9158` | JES2 PROCESSING STOPPED, $S NEEDED JES2 issues this notice issued in response to a $JDJES  | JES2 Messages SA32-0989-70 p.871 |
|  | `$HASP9160` | AT LEAST ONE PCE HAS ENDED JES2 issues this notice message in response to a $JDJES or a $J | JES2 Messages SA32-0989-70 p.872 |
|  | `$HASP9176` | ENVIRONMENT ERRORS, RESTART JES2 WHEN MORE BERTS AVAILABLE JES2 issues this notice message | JES2 Messages SA32-0989-70 p.881 |

## D. 操作コマンドのエラー（IEE / IEFC メッセージ、Vol 7 / Vol 8）（33 件）

| 対応 | ID | 内容（先頭） | 出典 |
|---|---|---|---|
|  | `IEE037D` | LOG NOT ACTIVE The system log (SYSLOG) is not active for one of these reasons: | Vol7 SA38-0674-70 p.772 |
|  | `IEE079I` | VARY OFFLINE FAILED. DEVICE xxxx IS RESERVED. ISSUE VARY OFFLINE,FORCE | Vol7 SA38-0674-70 p.796 |
|  | `IEE122I` | START COMMAND JCL ERROR A START command invoked a cataloged procedure or job. The system d | Vol7 SA38-0674-70 p.818 |
|  | `IEE132I` | START COMMAND DEVICE ALLOCATION ERROR A START command invoked a cataloged procedure. While | Vol7 SA38-0674-70 p.822 |
|  | `IEE279A` | REPLY id IGNORED; NON DECIMAL ID. SPECIFY REPLY nn. The system expected a reply to a synch | Vol7 SA38-0674-70 p.968 |
|  | `IEE281A` | REPLY id IGNORED; IMPROPER USE OF DELIMITERS. RESPECIFY. The operator entered an incorrect | Vol7 SA38-0674-70 p.969 |
|  | `IEE282A` | REPLY id EXPECTED; NO OTHER COMMANDS ACCEPTED. SPECIFY REPLY id. | Vol7 SA38-0674-70 p.970 |
|  | `IEE283A` | REPLY id IGNORED; ONLY REPLY nn ACCEPTED. SPECIFY REPLY nn. The system expected a reply to | Vol7 SA38-0674-70 p.970 |
| ✓ | `IEE301I` | jobname {CANCEL/FORCE/FORCE ARM/FORCE TCB} COMMAND ACCEPTED | Vol7 SA38-0674-70 p.978 |
|  | `IEE324I` | userid NOT LOGGED ON [IN SPECIFIED ADDRESS SPACE] Chapter 6. IEE messages (IEE200I - IEE39 | Vol7 SA38-0674-70 p.991 |
| ✓ | `IEE341I` | {ttt/jobname/CN=nnnnnnnn} NOT ACTIVE [IN SPECIFIED ADDRESS SPACE] | Vol7 SA38-0674-70 p.1000 |
| ✓ | `IEE342I` | cm REJECTED-TASK BUSY While processing a STOP (P) or MODIFY (F) command for this task, the | Vol7 SA38-0674-70 p.1001 |
|  | `IEE422I` | command COMMAND OUTPUT COMMAND RESPONSE FOR WORKITEMS AFFECTED BY jobname.id* jobname.iden | Vol7 SA38-0674-70 p.1048 |
|  | `IEE458I` | LOGROUTE text The system issues this message in response to a START, STOP, or MODIFY LOGRO | Vol7 SA38-0674-70 p.1056 |
|  | `IEE700I` | REPLY id IGNORED; REPLY TOO LONG FOR REQUESTOR A REPLY command contained reply text that i | Vol7 SA38-0674-70 p.1185 |
| ✓ | `IEE701I` | REPLY id IGNORED; NO REPLIES OUTSTANDING The operator entered a REPLY command when a reply | Vol7 SA38-0674-70 p.1185 |
| ✓ | `IEE702I` | REPLY id IGNORED; IMPROPER USE OF DELIMITERS A REPLY command was not valid for one of the  | Vol7 SA38-0674-70 p.1186 |
|  | `IEE703I` | {REPLY id/MESSAGE [yyyyy]} NOT REQUESTED FROM THIS CONSOLE COMMAND ISSUED IS command | Vol7 SA38-0674-70 p.1186 |
| ✓ | `IEE704I` | REPLY id NOT OUTSTANDING[.] [ON THIS SYSTEM] The operator entered a REPLY command. There i | Vol7 SA38-0674-70 p.1187 |
|  | `IEE756I` | text COMMAND CANCELED BY OPERATOR text is one of the following: | Vol7 SA38-0674-70 p.1223 |
|  | `IEE825I` | SUBSYSTEM subsystem-name DOES NOT SUPPORT THE SUB PARAMETER | Vol7 SA38-0674-70 p.1260 |
|  | `IEE827I` | SUBSYSTEM subsystem-name IS NOT ACTIVE One of the following occurred: | Vol7 SA38-0674-70 p.1261 |
| ✓ | `IEE838I` | jobname CANCELABLE - ISSUE CANCEL BEFORE FORCE --or-- jobname NON-CANCELABLE - ISSUE FORCE | Vol7 SA38-0674-70 p.1268 |
| ✓ | `IEE841I` | jobname {NON-CANCELABLE/NON-FORCIBLE/TCB NON-FORCIBLE} A CANCEL or FORCE command requested | Vol7 SA38-0674-70 p.1271 |
| ✓ | `IEE842I` | jobname DUPLICATE NAME FOUND - REENTER COMMAND WITH 'A=' KEYWORD | Vol7 SA38-0674-70 p.1272 |
|  | `IEFC008I` | PEND STATEMENT FOUND BEFORE END OF PROCEDURE The system found a PEND statement before reac | Vol8 SA38-0675-70 p.508 |
|  | `IEFC022I` | UNEXPECTED END OF PROCEDURE The system found the end of a procedure when it expected more  | Vol8 SA38-0675-70 p.517 |
|  | `IEFC452I` | text - JOB NOT RUN - JCL ERROR 520 z/OS: z/OS MVS System Messages, Vol 8 (IEF-IGD) | Vol8 SA38-0675-70 p.532 |
|  | `IEFC610I` | PROCEDURE HAS NO STEP The system did not find an EXEC statement in a procedure. | Vol8 SA38-0675-70 p.537 |
|  | `IEFC611I` | OVERRIDDEN STEP NOT FOUND IN PROCEDURE The system did not find a step name specified by an | Vol8 SA38-0675-70 p.538 |
| ✓ | `IEFC612I` | PROCEDURE [procname] WAS NOT FOUND The system could not find a procedure in the input stre | Vol8 SA38-0675-70 p.539 |
|  | `IEFC614I` | PROCLIB DEVICE I/O ERROR SEARCHING FOR PROCEDURE/INCLUDE During processing of a job that r | Vol8 SA38-0675-70 p.540 |
|  | `IEFC665I` | EXCESSIVE NUMBER OF INSTREAM PROCEDURES The system found that the job fills the data set w | Vol8 SA38-0675-70 p.571 |

## E. IPL / NIP 中の待機状態コード（System Codes）（76 件）

| 対応 | ID | 内容（先頭） | 出典 |
|---|---|---|---|
|  | `002` | Explanation During initial program load (IPL), an I/O operation was not initiated; the sub | System Codes SA38-0665-70 p.675 |
|  | `003` | Explanation Initial program load (IPL) cannot continue processing because the subchannel f | System Codes SA38-0665-70 p.675 |
|  | `005` | Explanation An I/O interruption during initial program load (IPL) indicated a unit check.  | System Codes SA38-0665-70 p.676 |
|  | `006` | Explanation During initial program load (IPL), an I/O error occurred while IPL was reading | System Codes SA38-0665-70 p.677 |
|  | `007` | Explanation During system initialization, a console was not available, or became unavailab | System Codes SA38-0665-70 p.678 |
|  | `009` | Explanation There is a system build error. The required release is not installed. A reason | System Codes SA38-0665-70 p.679 |
|  | `00A` | Explanation For one or more of the following data sets: • SYS1.LINKLIB | System Codes SA38-0665-70 p.679 |
|  | `00E` | Explanation Initial program load (IPL) cannot continue due to a problem on the system resi | System Codes SA38-0665-70 p.681 |
| ✓ | `00F` | Explanation For initial program load (IPL), a volume has been loaded that does not contain | System Codes SA38-0665-70 p.682 |
|  | `013` | Explanation During processing of the nucleus initialization program (NIP), an error occurr | System Codes SA38-0665-70 p.682 |
|  | `017` | Explanation During initial program load (IPL), a unit check occurred after an I/O operatio | System Codes SA38-0665-70 p.683 |
|  | `019` | Explanation During initial program load (IPL), an unexpected program interruption occurred | System Codes SA38-0665-70 p.684 |
|  | `025` | Explanation The system detected a duplicate entry point name appearing in modules being lo | System Codes SA38-0665-70 p.688 |
|  | `02E` | Explanation The auxiliary storage manager (ASM) is unable to function because of recovery  | System Codes SA38-0665-70 p.689 |
|  | `02F` | Explanation The auxiliary storage manager (ASM) is unable to process paging requests becau | System Codes SA38-0665-70 p.690 |
|  | `030` | Explanation | System Codes SA38-0665-70 p.690 |
|  | `031` | Explanation The system did not find a unit control block for the device containing the sys | System Codes SA38-0665-70 p.691 |
|  | `032` | Explanation A module required for nucleus initialization (NIP) is missing from the SYS1.NU | System Codes SA38-0665-70 p.692 |
|  | `033` | Explanation An I/O error occurred in build link-list request (BLDL macro) processing for a | System Codes SA38-0665-70 p.693 |
|  | `035` | Explanation During system initialization, the system could not find an entry point in the  | System Codes SA38-0665-70 p.693 |
|  | `037` | Explanation The data space control block (DSCB) for logrec, SYS1.SVCLIB, SYS1.PARMLIB, or  | System Codes SA38-0665-70 p.694 |
|  | `038` | Explanation The operating system cannot initialize itself because there is not enough cent | System Codes SA38-0665-70 p.695 |
|  | `03C` | Explanation The auxiliary storage manager (ASM) found that not enough auxiliary storage sp | System Codes SA38-0665-70 p.696 |
|  | `03D` | Explanation | System Codes SA38-0665-70 p.697 |
|  | `03E` | Explanation The auxiliary storage manager (ASM) determined that there were not enough slot | System Codes SA38-0665-70 p.698 |
|  | `03F` | Explanation A program invoked a nucleus initialization program (NIP) function incorrectly. | System Codes SA38-0665-70 p.698 |
|  | `040` | Explanation The system abnormally ended a task during nucleus initialization program (NIP) | System Codes SA38-0665-70 p.699 |
|  | `044` | Explanation During nucleus initialization program (NIP) processing, a machine check occurr | System Codes SA38-0665-70 p.699 |
|  | `045` | Explanation While initializing the recovery termination manager (RTM), the nucleus initial | System Codes SA38-0665-70 p.700 |
|  | `046` | Explanation During nucleus initialization program (NIP) processing, an unexpected program  | System Codes SA38-0665-70 p.700 |
|  | `04A` | Explanation A time-of-day (TOD) clock on one of the central processors is in error. The cl | System Codes SA38-0665-70 p.701 |
|  | `053` | Explanation | System Codes SA38-0665-70 p.702 |
|  | `054` | Explanation The system detected an error with a member being loaded into the dynamic addre | System Codes SA38-0665-70 p.703 |
|  | `055` | Explanation The initial program load (IPL) program was unable to locate a necessary member | System Codes SA38-0665-70 p.704 |
|  | `056` | Explanation DFP encountered a terminating error during NIP initialization. See message IGW | System Codes SA38-0665-70 p.706 |
|  | `059` | Explanation During nucleus initialization program (NIP) processing, a build link-list requ | System Codes SA38-0665-70 p.706 |
|  | `05C` | Explanation During nucleus initialization program (NIP) processing, the pointer to the mas | System Codes SA38-0665-70 p.707 |
|  | `05D` | Explanation During initialization, DFP could not find a data set control block (DSCB) for  | System Codes SA38-0665-70 p.708 |
|  | `05E` | Explanation An I/O error occurred while the system attempted to read the master catalog se | System Codes SA38-0665-70 p.708 |
| ✓ | `05F` | Explanation DFP processing found an error related to the master catalog. The problem was c | System Codes SA38-0665-70 p.709 |
|  | `060` | Explanation While saving or rebuilding the pageable link pack area (PLPA) or extended PLPA | System Codes SA38-0665-70 p.710 |
|  | `061` | Explanation The auxiliary storage manager (ASM) detected an error with the time-of-day (TO | System Codes SA38-0665-70 p.710 |
|  | `063` | Explanation The nucleus initialization program (NIP) was unable to obtain storage. The pro | System Codes SA38-0665-70 p.711 |
|  | `064` | Explanation During nucleus initialization program (NIP) processing, NIP detected a softwar | System Codes SA38-0665-70 p.712 |
|  | `065` | Explanation During nucleus initialization program (NIP) processing, a program issued type  | System Codes SA38-0665-70 p.714 |
|  | `070` | Explanation During initial program load (IPL) processing, IPL did not find enough contiguo | System Codes SA38-0665-70 p.716 |
|  | `072` | Explanation There is no more room in the work space allocated to initial program load (IPL | System Codes SA38-0665-70 p.718 |
|  | `073` | Explanation Initial program load (IPL) is waiting for an I/O or external interrupt. The ri | System Codes SA38-0665-70 p.718 |
|  | `074` | Explanation Initial program load (IPL) contains a program logic error. The right-most four | System Codes SA38-0665-70 p.720 |
|  | `075` | Explanation Initial program load (IPL) could not load a module. The right-most four bytes  | System Codes SA38-0665-70 p.721 |
|  | `076` | Explanation During initial program load (IPL) processing, the system attempted to load an  | System Codes SA38-0665-70 p.722 |
|  | `078` | Explanation The master catalog could not be opened successfully. Message IEC161I precedes  | System Codes SA38-0665-70 p.723 |
|  | `07B` | Explanation A required processor facility is not available. The wait state reason code ide | System Codes SA38-0665-70 p.723 |
|  | `07C` | Explanation During system initialization an error was detected in the system configuration | System Codes SA38-0665-70 p.726 |
|  | `07D` | Explanation During system initialization, an error occurred when the system tried to proce | System Codes SA38-0665-70 p.728 |
|  | `081` | Explanation Initial program load (IPL) tried to load a module from the SYS1.NUCLEUS data s | System Codes SA38-0665-70 p.729 |
|  | `085` | Explanation During this warm start IPL, the auxiliary storage manager (ASM) forced a switc | System Codes SA38-0665-70 p.732 |
| ✓ | `088` | Explanation During initial program load (IPL), the system encountered an error in processi | System Codes SA38-0665-70 p.734 |
|  | `089` | Explanation During NIP processing, the system found an error with a unit control block (UC | System Codes SA38-0665-70 p.736 |
|  | `08C` | Explanation An error occurred during workload manager (WLM) processing due to recurring ab | System Codes SA38-0665-70 p.737 |
| ✓ | `0A2` | Explanation | System Codes SA38-0665-70 p.742 |
|  | `0A3` | Explanation A system could not successfully participate in a global resource serialization | System Codes SA38-0665-70 p.746 |
|  | `0A7` | Explanation There is insufficient storage available to build the eligible device table (ED | System Codes SA38-0665-70 p.755 |
|  | `0B0` | Explanation The system could not recognize the I/O definition file (IODF) specified in the | System Codes SA38-0665-70 p.756 |
| ✓ | `0B1` | Explanation System initialization cannot continue because of a problem in the LOADxx parml | System Codes SA38-0665-70 p.756 |
|  | `0B2` | Explanation No devices were defined in the I/O definition file (IODF). | System Codes SA38-0665-70 p.760 |
| ✓ | `0B3` | Explanation Initial program load (IPL), found incorrect information in the LOAD parameter. | System Codes SA38-0665-70 p.760 |
|  | `0E0` | Explanation During nucleus initialization program (NIP) processing, the system could not s | System Codes SA38-0665-70 p.762 |
|  | `0E8` | Explanation During nucleus initialization program (NIP) processing, the machine check hand | System Codes SA38-0665-70 p.763 |
|  | `140` | Explanation IOS detected a non-recoverable error and stopped the system. The right-most fo | System Codes SA38-0665-70 p.774 |
|  | `204` | Explanation An error occurred during Allocation processing. The right-most three bytes of  | System Codes SA38-0665-70 p.777 |
|  | `205` | Explanation During nucleus initialization program (NIP) processing, the system tried to lo | System Codes SA38-0665-70 p.778 |
|  | `A03` | Explanation | System Codes SA38-0665-70 p.780 |
|  | `A2A` | Explanation The system detected a page within the range of the pageable link pack area (PL | System Codes SA38-0665-70 p.786 |
|  | `A7A` | Explanation Initialization of the service processor interface (SPI) failed. The reason cod | System Codes SA38-0665-70 p.789 |
|  | `EC9` | Explanation The IPL requested Validated Boot in Secure mode and an error was found. The ri | System Codes SA38-0665-70 p.799 |

