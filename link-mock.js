/* jcl-terminal の代わりに連携の相手をする模擬端末（Node のテストと、演習ページの模範解答の表示に使う）
 * 本物の jcl-terminal と同じメッセージをやり取りする。結果は jcl-terminal のサンプルを実行したときと同じになるように決めてある
 * （本物との一致は tests/link-e2e.html で、実際の jcl-terminal を相手に確かめる）。
 * やり取りは順番待ちの列に積み、flush() でまとめて処理する（ブラウザの BroadcastChannel と同じく非同期の扱い）。 */
(function (root) {
  const p8 = s => String(s).padEnd(8);
  // jcl-terminal の USER01.JCL にあるサンプル（連携演習で使うもの）
  const SAMPLES = {
    HELLO:   { name: 'HELLO',   dsns: [], rc: 0 },
    LINKRPT: { name: 'LINKRPT', dsns: [{ dsn: 'USER01.SALES.DATA', excl: true }], rc: 0 },
    LINKASK: { name: 'LINKASK', dsns: [{ dsn: 'USER01.SALES.DATA', excl: false }], ask: 'OK TO PRINT MONTHLY SALES REPORT' },
    HOLDJOB: { name: 'HOLDJOB', dsns: [], rc: 0, held: true },
    BADJCL:  { name: 'BADJCL',  dsns: [], jclError: true },
  };

  class MockTerm {
    constructor(sim) {
      this.sim = sim; this.q = []; this.jobs = []; this.n = 2001; this.state = null; this.refused = 0; this.notes = [];
      sim.setLink(m => this.q.push(['in', m]));
      this.send({ t: 'hello', pending: [] });
      this.flush();
    }
    send(m) { this.q.push(['out', m]); }
    flush() {
      for (let guard = 0; this.q.length && guard < 1000; guard++) {
        const [dir, m] = this.q.shift();
        if (dir === 'out') this.sim.linkIn(m); else this.onMsg(m);
      }
    }
    job(id) { return this.jobs.find(j => j.id === id); }
    result(name) { const j = this.jobs.filter(x => x.name === name).pop(); return j ? j.maxcc || j.queue : null; }
    // 編集画面で SUB したのと同じ
    submit(member) {
      const d = SAMPLES[member];
      if (!d) throw new Error('模擬端末に無いサンプル: ' + member);
      if (!this.state || !this.state.logon) { this.refused++; this.notes.push('TSO にログオンしていないため投入できない'); return null; }
      const j = { id: 'JOB0' + this.n++, name: d.name, def: d, queue: 'INPUT', maxcc: '', held: !!d.held };
      this.jobs.push(j);
      if (d.jclError) {
        j.queue = 'PRINT'; j.maxcc = 'JCL ERROR';
        this.send({ t: 'submit', id: j.id, name: j.name, cls: 'A', pgmr: 'USER01', held: false, dsns: [], asks: false, done: true, maxcc: 'JCL ERROR',
          lines: ['IEFC452I ' + j.name + ' - JOB NOT RUN - JCL ERROR', '$HASP396 ' + p8(j.name) + ' TERMINATED'] });
      } else {
        this.send({ t: 'submit', id: j.id, name: j.name, cls: 'A', pgmr: 'USER01', held: j.held, dsns: d.dsns, asks: !!d.ask });
      }
      this.flush();
      return j;
    }
    // SDSF ST の行コマンド（H / A / C）は JES2 コマンドとしてオペレーター側へ送る
    lineCmd(name, v) { const j = this.jobs.filter(x => x.name === name).pop(); if (j) { this.send({ t: 'cmd', text: '$' + v + 'J' + (+j.id.slice(3)) }); this.flush(); } }
    finish(j, rc, abend) {
      j.queue = 'PRINT';
      j.maxcc = abend ? 'ABEND ' + abend : 'CC ' + String(rc).padStart(4, '0');
      const lines = abend ? ['$HASP395 ' + p8(j.name) + ' ENDED - ABEND=' + abend] : ['$HASP395 ' + p8(j.name) + ' ENDED - RC=' + String(rc).padStart(4, '0')];
      this.send({ t: 'result', id: j.id, maxcc: j.maxcc, lines });
    }
    ask(j) { this.send({ t: 'wtor', id: j.id, ask: 0, text: 'OPR001A ' + j.def.ask + '. REPLY YES OR NO' }); }
    onMsg(m) {
      const j = m.id ? this.job(m.id) : null;
      switch (m.t) {
        case 'state': this.state = m; return;
        case 'hello': this.send({ t: 'hello', pending: this.jobs.filter(x => x.queue !== 'PRINT').map(x => ({ id: x.id, name: x.name, queue: x.queue, held: x.held, dsns: x.def.dsns, asks: !!x.def.ask })) }); return;
        case 'start': if (j) { j.queue = 'EXECUTION'; if (j.def.ask) this.ask(j); } return;
        case 'run': if (j && j.queue === 'EXECUTION') this.finish(j, j.def.rc || 0); return;
        case 'reply': if (!j) return;
          if (/^(YES|NO)$/i.test(m.text.trim())) this.finish(j, /^YES$/i.test(m.text.trim()) ? 0 : 4);
          else { this.send({ t: 'msg', text: 'OPR003I ' + p8(j.name) + " REPLY '" + m.text.trim().toUpperCase() + "' IS NOT VALID - REPLY YES OR NO" }); this.ask(j); }
          return;
        case 'cancel': if (j) { j.queue = 'PRINT'; j.maxcc = 'ABEND ' + m.code; } return;
        case 'job': if (!j) return;
          if (m.status === 'HELD') j.held = true;
          if (m.status === 'RELEASED') j.held = false;
          if (m.status === 'CANCELED') { j.queue = 'PRINT'; j.maxcc = 'CANCELED'; }
          return;
        case 'requeue': if (j) j.queue = 'INPUT'; return;
        case 'cold': this.jobs = []; return;
      }
    }
  }
  const api = { MockTerm, SAMPLES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MvsLinkMock = api;
})(typeof window !== 'undefined' ? window : globalThis);
