/* tests/cases.js と msgref.js から docs/error-catalog.md（シミュレータで再現するエラー一覧）を作る。
 * 使い方: node tools/make_errors_md.js */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const cases = require(path.join(root, 'tests', 'cases.js'));
const Ref = require(path.join(root, 'msgref.js'));
const Sim = require(path.join(root, 'engine.js'));
const candPath = path.join(root, 'docs', 'error-candidates.md');
const allMd = fs.existsSync(candPath) ? fs.readFileSync(candPath, 'utf8') : '';
const tot = (/\*\*合計 (\d+) 件\*\*（うちシミュレータで再現 (\d+) 件）/.exec(allMd) || []);

const sections = [
  ['E01', 'E14', 'A. HMC からの LOAD・LOAD パラメーター'],
  ['E15', 'E21', 'B. NIP：装置・ボリューム'],
  ['E22', 'E25', 'C. NIP：マスターカタログ'],
  ['E26', 'E33', 'D. NIP：システムパラメーター（IEA101A）'],
  ['E34', 'E40', 'E. NIP：時刻・sysplex・応答操作'],
  ['E41', 'E54', 'F. JES2 の起動'],
  ['E55', 'E60', 'G. 稼働中の操作エラー'],
  ['E61', 'E84', 'H. 停止（シャットダウン）'],
  ['N01', 'N02', 'I. 正常系（基準）'],
];
const idOf = s => { const m = /^(\$HASP\d{3,4}|[A-Z]{3,4}\d{3,4}[A-Z])/.exec(s); return m ? m[1] : null; };
const waitOf = s => { const m = /待機状態コード ([0-9A-F]{3})|^([0-9A-F]{3}) 理由/.exec(s); return m ? (m[1] || m[2]) : null; };
const L = [];
L.push('# IPL / シャットダウンで起こりうるエラー一覧（シミュレータ再現分・テスト対応）', '');
L.push('z/OS 3.2 のマニュアルを検索して洗い出したエラーのうち、オペレーターの IPL・停止操作で起こるものをシミュレータで再現し、1件ずつテストにしたものです。');
if (tot[1]) L.push(`マニュアルから機械抽出した候補は **全 ${tot[1]} 件**（[error-candidates.md](error-candidates.md)）。そのうち、ここに載せたテストで再現しているメッセージ・待機状態コードは ${tot[2]} 件です。残りの大半はハードウェア・導入設定（PARMLIB の中身）・内部障害に起因するもので、オペレーター操作の練習には向かないため対象外としました。操作に関係するが未対応のものは、IEA338A・IEA341A（個別パラメーターの再指定）、IEA527A（SYSNAME 未指定）、IXC402D（相手システムの停止確認）、$HASP490（ホットスタート拒否）、$HASP620（停止処理中のコマンド拒否）、$HASP098・$HASP070（JES2 異常時の終了オプション）、$HASP454 に N と答えた後の HASP416/HASP417 の確認対話です。`);
L.push('', '- テストの実行: ブラウザで `tests/run.html` を開く、または `node tests/run-tests.js`（詳細出力は環境変数 `VERBOSE=1`）', '- ケースの定義: `tests/cases.js`（この一覧は `node tools/make_errors_md.js` で再生成）', '- 「出典」はそのケースで出る主なメッセージ／待機状態コードの定義ページ（PDF のページ番号）', '- シナリオ名はシミュレータ画面左の「障害シナリオ」に対応', '');
const scLabel = k => (Sim.SCENARIOS[k] || {}).label || k;
let n = 0;
for (const [a, b, title] of sections) {
  const rows = cases.filter(c => c.id >= a && c.id <= b && c.id[0] === a[0]);
  L.push('## ' + title + `（${rows.length} 件）`, '', '| No. | 状況・操作 | 前提シナリオ | 期待される応答 | 出典 |', '|---|---|---|---|---|');
  for (const c of rows) {
    n++;
    const ids = [...new Set((c.expect || []).map(idOf).filter(Boolean))];
    const waits = [...new Set((c.expect || []).map(waitOf).filter(Boolean))];
    const refs = ids.filter(i => Ref.MSG[i]).slice(0, 3).map(i => `${i}: ${Ref.MSG[i][0].replace(/ S[AC]\d{2}-\d{4}-\d{2}$/, '')} p.${Ref.MSG[i][1]}`)
      .concat(waits.filter(w => Ref.WAIT[w]).map(w => `待機 ${w}: System Codes p.${Ref.WAIT[w][1]}`));
    const exp = (c.expect || []).map(e => '`' + e.replace(/\|/g, '/') + '`').join(' → ');
    L.push(`| ${c.id} | ${c.title.replace(/\|/g, '/')} | ${(c.scenarios || []).map(scLabel).join('<br>') || '—'} | ${exp} | ${refs.join('<br>') || '（シミュレータ注記）'} |`);
  }
  L.push('');
}
L.splice(3, 0, '', `**シミュレータで再現・テストしているケース: ${n} 件**（結果は tests/run.html で確認できます）`, '');
fs.writeFileSync(path.join(root, 'docs', 'error-catalog.md'), L.join('\n') + '\n', 'utf8');
console.log('docs/error-catalog.md:', n, 'cases');
