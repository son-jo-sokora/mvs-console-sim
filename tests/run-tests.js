/* テストを Node で実行: node tests/run-tests.js [ケースID...]（詳細は環境変数 VERBOSE=1）
 * ブラウザでは tests/run.html を開く。中身は tests/runner.js で共用。 */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const { runAll } = require('./runner.js');
const only = process.argv.slice(2);
const { results, coverage } = runAll({
  Sim: require(path.join(root, 'engine.js')),
  Ref: require(path.join(root, 'msgref.js')),
  Procs: require(path.join(root, 'procedures.js')),
  cases: require('./cases.js'),
  Ex: require(path.join(root, 'scenarios.js')),
  exCases: require('./exercise-cases.js'),
  engineSrc: fs.readFileSync(path.join(root, 'engine.js'), 'utf8'),
  only,
});
for (const r of results) {
  console.log(`${r.ok ? '✓' : '✗'} ${r.kind === 'エラー' ? '' : r.kind + ' '}${r.id} ${r.title}`);
  r.errs.forEach(e => console.log('    - ' + e));
  if (process.env.VERBOSE) r.text.forEach(t => console.log('      | ' + t.replace(/\n/g, '\n      | ')));
}
if (coverage) {
  console.log('\n--- 網羅性 ---');
  console.log(`エンジンが出すメッセージ ID: ${coverage.ids} 種類、テストで出現: ${coverage.idsSeen}`);
  if (coverage.notSeen.length) console.log('  テストで一度も出ていない ID: ' + coverage.notSeen.join(', '));
  console.log(`待機状態コード: ${coverage.waits} 種類、テストで出現: ${coverage.waitsSeen}`);
  if (coverage.waitNotSeen.length) console.log('  テストで一度も出ていない待機状態: ' + coverage.waitNotSeen.join(', '));
  if (coverage.noRef.length) console.log('  解説（msgref.js）がない ID: ' + coverage.noRef.join(', '));
  if (coverage.waitNoRef.length) console.log('  解説がない待機状態: ' + coverage.waitNoRef.join(', '));
}
const pass = results.filter(r => r.ok).length, fail = results.length - pass;
const cov = coverage ? coverage.problems : 0;
console.log(`\n結果: ${pass} 件成功 / ${fail} 件失敗` + (cov ? ` / 網羅性の問題 ${cov} 件` : ''));
process.exit(fail || cov ? 1 : 0);
