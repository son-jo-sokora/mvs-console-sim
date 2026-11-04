/* テストの実行部分（ブラウザの tests/run.html と Node の tests/run-tests.js で共用）
 * runAll({Sim, Ref, Procs, cases, engineSrc, only}) → {results:[{id,title,kind,ok,errs,text}], coverage:{...}} */
(function (root) {
  function runCase(Sim, c) {
    const s = new Sim({ scenarios: c.scenarios || [] });
    const errs = [];
    for (const st of c.steps) {
      if (Array.isArray(st)) {
        if (st[0] === 'LOAD') s.hmcLoad(st[1], st[2]);
        else if (st[0] === 'RESET') s.hmcReset();
        else if (st[0] === 'WAIT') s.advance(st[1]);
        continue;
      }
      const cmd = st.replace(/#([^#]+)#/g, (_, mid) => {
        const p = s.pending().find(x => x.msgid === mid);
        if (!p) { errs.push(`手順 "${st}": 応答待ちの ${mid} がない`); return '99'; }
        return p.id;
      });
      s.command(cmd);
    }
    const text = s.out.map(r => r.text);
    let pos = 0;
    for (const e of c.expect || []) {
      let k = pos; while (k < text.length && !text[k].includes(e)) k++;
      if (k >= text.length) errs.push(`期待 "${e}" が（順序どおりに）出ていない`); else pos = k + 1;
    }
    for (const [head, words] of Object.entries(c.expectIn || {})) {
      const rec = text.find(t => t.startsWith(head));
      if (!rec) errs.push(`"${head}" の行がない`); else words.forEach(w => { if (!rec.includes(w)) errs.push(`"${head}" の中に "${w}" がない`); });
    }
    for (const e of c.notExpect || []) if (text.some(t => t.includes(e))) errs.push(`出てはいけない "${e}" が出た`);
    const st = c.state || {};
    if (st.phase && s.phase !== st.phase) errs.push(`phase=${s.phase}（期待 ${st.phase}）`);
    if (st.wait && (!s.wait || s.wait.code !== st.wait)) errs.push(`wait=${s.wait && s.wait.code}（期待 ${st.wait}）`);
    if (st.jes && s.jes !== st.jes) errs.push(`jes=${s.jes}（期待 ${st.jes}）`);
    if (st.vtam && s.vtam !== st.vtam) errs.push(`vtam=${s.vtam}（期待 ${st.vtam}）`);
    if (st.pending) { const p = s.pending().map(x => x.msgid); for (const m of st.pending) if (!p.includes(m)) errs.push(`応答待ちに ${m} がない（${p.join(',') || 'なし'}）`); }
    const ev = s.evaluate();
    for (const [k, v] of Object.entries(c.eval || {})) {
      const item = ev.find(x => x.item.includes(k));
      if (!item) errs.push(`採点項目 "${k}" がない`); else if (item.ok !== v) errs.push(`採点 "${k}" = ${item.ok}（期待 ${v}）`);
    }
    if (c.evalAllOk) ev.filter(x => !x.ok).forEach(x => errs.push(`採点 NG: ${x.item}`));
    return { id: c.id, title: c.title, kind: 'エラー', ok: !errs.length, errs, text, sim: s };
  }

  function runProc(Sim, Procs, p) {
    const r = Procs.run(Sim, p), s = r.sim, errs = [];
    r.steps.forEach((x, i) => x.errs.forEach(m => errs.push(`手順 ${i + 1}: 応答待ちの ${m} がない`)));
    r.steps.forEach((x, i) => { if (x.step.op === 'CMD' && x.out.some(o => /シミュレータ注記）.*(受け付けます|起動していません|無効待機状態です)/.test(o.text))) errs.push(`手順 ${i + 1}: コマンドが受け付けられていない`); });
    const e = p.end || {};
    if (e.phase && s.phase !== e.phase) errs.push(`phase=${s.phase}（期待 ${e.phase}）`);
    if (e.jes && s.jes !== e.jes) errs.push(`jes=${s.jes}（期待 ${e.jes}）`);
    if (e.vtam && s.vtam !== e.vtam) errs.push(`vtam=${s.vtam}（期待 ${e.vtam}）`);
    if (p.evalAllOk) s.evaluate().filter(x => !x.ok).forEach(x => errs.push('採点 NG: ' + x.item));
    return { id: p.id, title: p.title, kind: '手順例', ok: !errs.length, errs, text: s.out.map(o => o.text), sim: s };
  }

  function runAll(o) {
    const only = o.only || [];
    const results = [];
    const seenIds = new Set(), seenWaits = new Set();
    for (const c of o.cases) {
      if (only.length && !only.includes(c.id)) continue;
      const r = runCase(o.Sim, c); results.push(r);
      r.sim.out.forEach(x => x.msgid && seenIds.add(x.msgid)); if (r.sim.wait) seenWaits.add(r.sim.wait.code);
    }
    for (const p of o.Procs ? o.Procs.PROCS : []) {
      if (only.length && !only.includes(p.id)) continue;
      const r = runProc(o.Sim, o.Procs, p); results.push(r);
      r.sim.out.forEach(x => x.msgid && seenIds.add(x.msgid));
    }
    let coverage = null;
    if (!only.length && o.engineSrc) {
      const used = new Set(o.engineSrc.match(/\$HASP\d{3,4}|\b[A-Z]{3,4}\d{3,4}[A-Z]\b/g));
      used.delete('IXC102A'); // 注記の中で言及するだけ（メッセージとしては出さない）
      const waits = new Set([...o.engineSrc.matchAll(/_waitState\('([0-9A-F]{3})'/g)].map(m => m[1]).concat(['0A2']));
      coverage = {
        ids: used.size, idsSeen: [...used].filter(i => seenIds.has(i)).length,
        notSeen: [...used].filter(i => !seenIds.has(i)),
        waits: waits.size, waitsSeen: [...waits].filter(w => seenWaits.has(w)).length,
        waitNotSeen: [...waits].filter(w => !seenWaits.has(w)),
        noRef: [...seenIds].filter(i => !o.Ref.MSG[i]),
        waitNoRef: [...seenWaits].filter(w => !o.Ref.WAIT[w]),
      };
      coverage.problems = ['notSeen', 'waitNotSeen', 'noRef', 'waitNoRef'].filter(k => coverage[k].length).length;
    }
    results.forEach(r => delete r.sim);
    return { results, coverage };
  }

  const api = { runAll };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MvsTestRunner = api;
})(typeof window !== 'undefined' ? window : globalThis);
