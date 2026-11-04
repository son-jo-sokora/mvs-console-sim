/* 演習シナリオ（scenarios.js）の採点が正しく働くかのテスト。
 * 模範解答の一部を書き換えた「誤答」を流し、fail に挙げた採点項目だけが ✗ になることを確かめる。
 * mutate: [[置き換える手順の in（または op）, 置き換え後の手順の配列（空なら削除）], ...] */
(function (root) {
  const C = s => ({ op: 'CMD', in: s });
  const CASES = [
    { id: 'X1-W1', ex: 'X1', title: 'IEA213A に本番側の 0A85 を応答', mutate: [['R 00,0B85', [C('R 00,0A85')]]], fail: ['0B85'] },
    { id: 'X1-W2', ex: 'X1', title: 'PAYROLL を待たずに取り消す', mutate: [['WAIT:30', []]], fail: ['30 分以上'] },
    { id: 'X1-W3', ex: 'X1', title: 'IEA101A に Enter だけ（IEASYS01・CLPA なし）', mutate: [['R 00,SYSP=01,CLPA', [C('')]]], fail: ['IEASYS01 と CLPA'] },
    { id: 'X1-W4', ex: 'X1', title: 'TSO 利用者を FSTOP で終了', mutate: [['R #IKT010D#,SIC', [C('R #IKT010D#,FSTOP')]]], fail: ['SIC'] },
    { id: 'X2-W1', ex: 'X2', title: 'IXC405D に J', mutate: [['R 00,I', [C('R 00,J')]]], fail: ['IXC405D に I'] },
    { id: 'X2-W2', ex: 'X2', title: '$HASP454 に N → JES2 を COLD で起動し直す', mutate: [['R #$HASP454#,Y', [C('R #$HASP454#,N'), C('S JES2'), C('R #$HASP426#,COLD'), C('R #$HASP441#,Y')]]], fail: ['$HASP454 に Y', 'ウォームスタート'] },
    { id: 'X3-W1', ex: 'X3', title: '05F の後も Enter で再 IPL を繰り返す', mutate: [['R 00,02', [C('')]]], fail: ['02 と応答', 'ウォームスタート', '業務開始状態'] },
    { id: 'X4-W1', ex: 'X4', title: 'ジョブを片付けずに $P JES2,ABEND', mutate: [['C BKUP', []], ['D A,L', []], ['C BKUP,A=20', []], ['C BKUP,A=21', []], ['C HUNGJOB', []], ['FORCE HUNGJOB,ARM', []], ['$PJES2', [C('$PJES2,ABEND')]]], fail: ['A= で1本ずつ', 'FORCE ,ARM', 'ABEND を使っていない'] },
    { id: 'X4-W2', ex: 'X4', title: '時間をかけすぎる（20 分待つ）', mutate: [['$P', [C('$P'), { op: 'WAIT', min: 20 }]]], fail: ['15 分以内'] },
    { id: 'XL1-W1', ex: 'XL1', title: '$S を入れない（HELLO が始まらない）', mutate: [['$S', []]], fail: ['CC 0000', '業務開始状態'] },
    { id: 'XL2-W1', ex: 'XL2', title: '待っている LINKRPT を取り消す', mutate: [['C SALESUPD', [C('C LINKRPT')]]], fail: ['SALESUPD を取り消した', 'LINKRPT は取り消していない', 'CC 0000'] },
    { id: 'XL3-W1', ex: 'XL3', title: '問い合わせに YES と応答', mutate: [['R #OPR001A#,NO', [C('R #OPR001A#,YES')]]], fail: ['NO と応答した', 'YES と応答していない', 'CC 0004'] },
    { id: 'XL3-W2', ex: 'XL3', title: '問い合わせに答えず LINKASK を取り消す', mutate: [['R #OPR001A#,NO', [C('C LINKASK')]]], fail: ['NO と応答した', 'CC 0004'] },
    { id: 'XL4-W1', ex: 'XL4', title: '再起動後に COLD で JES2 を起動', mutate: [['R #$HASP426#,WARM', [C('R #$HASP426#,COLD'), C('R #$HASP441#,Y')]]], fail: ['ウォームスタート', '$DJ で確かめて', 'HOLDJOB が CC 0000'] },
    { id: 'XL4-W2', ex: 'XL4', title: '停止前に解放してしまう', mutate: [['P TSO', [C("$AJ'HOLDJOB'"), C('P TSO')]]], fail: ['再起動の前には解放していない', '$DJ で確かめて'] },
    { id: 'XS1-W1', ex: 'XS1', title: '原因を VTAM と診断（根拠も違う）', mutate: [['DIAG', [{ op: 'DIAG', cause: 'A', evidence: 'IST020I' }]]], fail: ['原因の診断', '根拠のメッセージ'] },
    { id: 'XS1-W2', ex: 'XS1', title: 'SYSLOG を見ずに S TSO', mutate: [['LOG', []], ['LOG', []], ['LOG', []]], fail: ['SYSLOG を調べた', 'SYSLOG を調べてから'] },
    { id: 'XS2-W1', ex: 'XS2', title: '待っている NIGHTRPT を取り消す', mutate: [['C SALESUPD', [C('C NIGHTRPT')]]], fail: ['原因の SALESUPD を取り消し', 'NIGHTRPT が RC=0000'] },
    { id: 'XS3-W1', ex: 'XS3', title: 'COLD で JES2 を起動（スプールが消える）', mutate: [['R #$HASP426#,WARM', [C('R #$HASP426#,COLD'), C('R #$HASP441#,Y')]], ['R #$HASP454#,Y', []]], fail: ['スプールを残した', '$HASP454 に Y'] },
    { id: 'XS4-W1', ex: 'XS4', title: '根拠に $HASP000 を挙げる', mutate: [['DIAG', [{ op: 'DIAG', cause: 'A', evidence: '$HASP000' }]]], fail: ['根拠のメッセージ'] },
    { id: 'XS5-W1', ex: 'XS5', title: '「オペレーターが取り消した」と診断', mutate: [['DIAG', [{ op: 'DIAG', cause: 'A', evidence: 'IEE301I' }]]], fail: ['原因の診断', '根拠のメッセージ'] },
    { id: 'XS5-W2', ex: 'XS5', title: '診断の後に、余計な IPL をする', mutate: [['DIAG', [{ op: 'DIAG', cause: 'B', evidence: 'CSV003I' }, C('$P'), C('$PJES2')]]], fail: ['操作をしていない'] },
    { id: 'C1-W1', ex: 'C1', title: '事象2 で、待っている LINKRPT を取り消す（SALESUPD が残り、15 時の LINKASK も待ち、停止もできない）', mutate: [['C SALESUPD', [C('C LINKRPT')]]], fail: ['SALESUPD を取り消し', 'LINKRPT が CC 0000', 'LINKASK に NO', 'JES2 停止 → HALT EOD'] },
    { id: 'C1-W2', ex: 'C1', title: '17 時の連絡を待たずに停止を始める', mutate: [['WAIT:120', []]], fail: ['17 時の連絡の後'] },
    { id: 'C2-W1', ex: 'C2', title: '再 IPL で JES2 を COLD で起動', mutate: [['R #$HASP426#,WARM', [C('R #$HASP426#,COLD'), C('R #$HASP441#,Y')]], ['R #$HASP454#,Y', []]], fail: ['報告してから', 'スプールを残した', 'LINKRPT が再実行'] },
    { id: 'C2-W2', ex: 'C2', title: '$HASP454 に応答してから原因を報告', mutate: [['DIAG', []], ['R #$HASP454#,Y', [C('R #$HASP454#,Y'), { op: 'DIAG', key: 'D1', cause: 'B', evidence: '$HASP479' }]]], fail: ['報告してから'] },
    { id: 'C3-W1', ex: 'C3', title: '停止を急いで BACKUP を取り消す', mutate: [['$DA', [C('C BACKUP')]]], fail: ['BACKUP を取り消さず'] },
    { id: 'C3-W2', ex: 'C3', title: 'IEA213A に本番側の 0A85 を応答', mutate: [['R 00,0B85', [C('R 00,0A85')]]], fail: ['0B85 を OFFLINE'] },
    { id: 'X5-W1', ex: 'X5', title: '初回なのに WARM で始めて遠回り', mutate: [['R #$HASP426#,COLD', [C('R #$HASP426#,WARM'), C('R #$HASP454#,Y'), C('R #$HASP272#,TERM'), C('S JES2'), C('R #$HASP426#,COLD')]]], fail: ['遠回り'] },
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = CASES; else root.MvsExerciseCases = CASES;
})(typeof window !== 'undefined' ? window : globalThis);
