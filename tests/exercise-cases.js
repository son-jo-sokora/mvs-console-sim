/* 演習シナリオ（scenarios.js）の採点が正しく働くかのテスト。
 * 模範解答の一部を書き換えた「誤答」を流し、fail に挙げた採点項目だけが ✗ になることを確かめる。
 * mutate: [[置き換える手順の in（または op）, 置き換え後の手順の配列（空なら削除）], ...] */
(function (root) {
  const C = s => ({ op: 'CMD', in: s });
  const CASES = [
    { id: 'X1-W1', ex: 'X1', title: 'IEA213A に本番側の 0A85 を応答', mutate: [['R 00,0B85', [C('R 00,0A85')]]], fail: ['0B85'] },
    { id: 'X1-W2', ex: 'X1', title: 'PAYROLL を待たずに取り消す', mutate: [['WAIT', []]], fail: ['30 分以上'] },
    { id: 'X1-W3', ex: 'X1', title: 'IEA101A に Enter だけ（IEASYS01・CLPA なし）', mutate: [['R 00,SYSP=01,CLPA', [C('')]]], fail: ['IEASYS01 と CLPA'] },
    { id: 'X1-W4', ex: 'X1', title: 'TSO 利用者を FSTOP で終了', mutate: [['R #IKT010D#,SIC', [C('R #IKT010D#,FSTOP')]]], fail: ['SIC'] },
    { id: 'X2-W1', ex: 'X2', title: 'IXC405D に J', mutate: [['R 00,I', [C('R 00,J')]]], fail: ['IXC405D に I'] },
    { id: 'X2-W2', ex: 'X2', title: '$HASP454 に N → JES2 を COLD で起動し直す', mutate: [['R #$HASP454#,Y', [C('R #$HASP454#,N'), C('S JES2'), C('R #$HASP426#,COLD'), C('R #$HASP441#,Y')]]], fail: ['$HASP454 に Y', 'ウォームスタート'] },
    { id: 'X3-W1', ex: 'X3', title: '05F の後も Enter で再 IPL を繰り返す', mutate: [['R 00,02', [C('')]]], fail: ['02 と応答', 'ウォームスタート', '業務開始状態'] },
    { id: 'X4-W1', ex: 'X4', title: 'ジョブを片付けずに $P JES2,ABEND', mutate: [['C BKUP', []], ['D A,L', []], ['C BKUP,A=20', []], ['C BKUP,A=21', []], ['C HUNGJOB', []], ['FORCE HUNGJOB,ARM', []], ['$PJES2', [C('$PJES2,ABEND')]]], fail: ['A= で1本ずつ', 'FORCE ,ARM', 'ABEND を使っていない'] },
    { id: 'X4-W2', ex: 'X4', title: '時間をかけすぎる（20 分待つ）', mutate: [['$P', [C('$P'), { op: 'WAIT', min: 20 }]]], fail: ['15 分以内'] },
    { id: 'X5-W1', ex: 'X5', title: '初回なのに WARM で始めて遠回り', mutate: [['R #$HASP426#,COLD', [C('R #$HASP426#,WARM'), C('R #$HASP454#,Y'), C('R #$HASP272#,TERM'), C('S JES2'), C('R #$HASP426#,COLD')]]], fail: ['遠回り'] },
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = CASES; else root.MvsExerciseCases = CASES;
})(typeof window !== 'undefined' ? window : globalThis);
