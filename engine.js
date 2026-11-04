/* MVS (z/OS 3.2) IPL / シャットダウン操作シミュレータ — エンジン
 * ブラウザ（window.MvsSim）と Node（module.exports）の両方で動く。
 * メッセージ文面とふるまいは z/OS 3.2 マニュアル（docs/decisions.md / docs/error-catalog.md に出典）に基づく。
 */
(function (root) {
  'use strict';

  // ---- 構成（シミュレータ上の「設置環境」） -------------------------------
  const SYSRES = '0A80';
  const DEVICES = {
    '0A80': { vol: 'Z32RS1', iplText: true, ds: ['SYS1.NUCLEUS', 'SYS1.PARMLIB', 'SYS1.LINKLIB'] },
    '0A81': { vol: 'Z32RS2', iplText: false, ds: ['SYS1.LPALIB'] },
    '0A82': { vol: 'Z32CFG', iplText: false, ds: ['SYS1.IPLPARM', 'SYS1.IODF01'], iplparm: true },
    '0A83': { vol: 'Z32CAT', iplText: false, ds: ['CATALOG.Z32.MASTER'] },
    '0A84': { vol: 'SPOOL1', iplText: false, ds: ['SYS1.HASPACE'] },
    '0A85': { vol: 'WORK01', iplText: false, ds: [] },
    '0A86': { vol: 'USR001', iplText: false, ds: [] },
  };
  const LOADMEMBERS = {
    // LOAD00: 本番用。IODF 01、SYSCAT あり、SYSPARM 00
    '00': { iodf: '01', sysparm: ['00'], syscat: true },
    // LOADA1: テスト用だが IODF 99 を指している（存在しない）
    'A1': { iodf: '99', sysparm: ['00'], syscat: true },
  };
  const IEASYS = { '00': true, '01': true, '02': true };
  const SYSCAT_MEMBERS = { 'LG': 'CATALOG.Z32.MASTER', '02': 'CATALOG.Z32.MASTER' };
  const SYSPARM_KEYWORDS = ['APF', 'APG', 'CLOCK', 'CLPA', 'CMB', 'CMD', 'CON', 'CONT', 'COUPLE', 'CSA', 'CSCBLOC',
    'CVIO', 'DEVSUP', 'DIAG', 'DUMP', 'DUPLEX', 'EXIT', 'FIX', 'GRS', 'GRSCNF', 'GRSRNL', 'GTZ', 'HVSHARE', 'ICS',
    'IOS', 'IPS', 'LFAREA', 'LICENSE', 'LNK', 'LNKAUTH', 'LOGCLS', 'LOGLMT', 'LOGREC', 'LPA', 'MAXCAD', 'MAXUSER',
    'MLPA', 'MSTRJCL', 'NONVIO', 'NSYSLX', 'NUCMAP', 'OMVS', 'OPI', 'OPT', 'PAGE', 'PAGTOTL', 'PAK', 'PLEXCFG',
    'PROD', 'PROG', 'PURGE', 'RDE', 'REAL', 'RER', 'RSU', 'RSVNONR', 'RSVSTRT', 'SCH', 'SMF', 'SMS', 'SQA', 'SSN',
    'SVC', 'SWAP', 'SYSNAME', 'SYSP', 'TRACE', 'UNI', 'VAL', 'VIODSN', 'VRREGN', 'WARNUND', 'ZAAPZIIP', 'ZZ'];
  const OPI_NO = ['MAXUSER']; // IEASYS00 で OPI=NO の項目（→ IEA107I）
  const SYSNAME = 'SYSA', PLEX = 'PLEX1', OTHER = 'SYSB';
  const VERID = 'z/OS 03.02.00 HBB77F0';

  const SCENARIOS = {
    DUPVOL:   { group: 'IPL', label: 'ボリューム名の重複（WORK01 が 0A85 と 0B85 にある）' },
    DUPSYSRES:{ group: 'IPL', label: 'SYSRES のコピー（Z32RS1）が別の装置 0B80 にもある' },
    UNLABEL:  { group: 'IPL', label: 'ラベルのない DASD が接続されている（0B90）' },
    NOTREADY: { group: 'IPL', label: '共用 DASD が他システムに予約されている（0B91 応答なし）' },
    NOSYSCAT: { group: 'IPL', label: 'LOAD00 に SYSCAT 文がない（マスターカタログを聞かれる）' },
    BADCAT:   { group: 'IPL', label: 'SYS1.NUCLEUS(SYSCATLG) の内容が壊れている（SYSCAT02 は正常）' },
    NOIEASYS: { group: 'IPL', label: 'IEASYS00 が削除されている' },
    TODPROMPT:{ group: 'IPL', label: 'CLOCKxx に OPERATOR PROMPT（時刻の確認を求められる）' },
    RESIDUAL: { group: 'IPL', label: 'sysplex に停止済み SYSB の残骸がある（IXC405D）' },
    CKPTLOCK: { group: 'JES2', label: '前回 JES2 が異常終了しチェックポイントのロックが残っている' },
    FIRSTJES: { group: 'JES2', label: 'JES2 を初めて起動する（チェックポイント未初期化）' },
    BATCH:    { group: '停止', label: '長時間バッチ PAYROLL が実行中' },
    DUPJOB:   { group: '停止', label: '同じ名前のジョブ BKUP が2本実行中' },
    HUNG:     { group: '停止', label: 'CANCEL できない（非取消し可能）ジョブ HUNGJOB が実行中' },
    TSOUSERS: { group: '停止', label: 'TSO ユーザーがログオン中' },
  };

  const pad = (n, w) => String(n).padStart(w, '0');
  const isHex = s => /^[0-9A-F]+$/.test(s);

  class MvsSim {
    constructor(opts) {
      opts = opts || {};
      this.sc = new Set(opts.scenarios || []);
      this.listeners = [];
      this.out = [];
      this.events = [];       // 操作履歴（採点用）
      this.triggers = (opts.triggers || []).map(t => Object.assign({}, t, { fired: false }));
      this.initialJobs = opts.jobs || null; // 演習シナリオで、最初の JES2 起動時にスプールにあるジョブ
      this.clock = new Date(Date.UTC(2026, 10, 5, 6, 0, 0)); // 2026-11-05 06:00
      this._resetMachine();
      // 前回の運転状態（シナリオで変わる）
      this.ckptFormatted = !this.sc.has('FIRSTJES');
      this.ckptLockHeld = this.sc.has('CKPTLOCK');
      this.residual = this.sc.has('RESIDUAL');
    }

    _resetMachine() {
      this.phase = 'OFF';        // OFF / NIP / WAIT / UP / PARTITIONED
      this.psw = null; this.wait = null;
      this.replies = new Map();  // id -> {msgid, text, fn}
      this.nextReply = 1;
      this.imsi = null;
      this.jes = 'DOWN';         // DOWN / INIT / HOLD(=$HASP400) / UP / TERMED
      this.jesDrain = false;     // $P 済み
      this.jesTermNoRestart = false;
      this.jesAbendIssued = false;
      this.jobs = [];            // {name, type:'JOB'|'STC'|'TSU', asid, jobid, remain, cancelable, cancelled}
      this.nextAsid = 0x20; this.nextJobid = 101;
      this.vtam = 'DOWN';        // DOWN / UP / HALTING
      this.eod = false;
      this.inits = false;
      this.parms = {};
      this.nipQueue = null;
      this.continuing = false;
      this.dupvolResolved = false;
    }

    // ---- 出力 -----------------------------------------------------------
    on(fn) { this.listeners.push(fn); }
    ts() { const d = this.clock; return pad(d.getUTCHours(), 2) + '.' + pad(d.getUTCMinutes(), 2) + '.' + pad(d.getUTCSeconds(), 2); }
    emit(text, cls, msgid) {
      cls = cls || 'info';
      if (!msgid) { const m = /^(\$HASP\d{3,4}|[A-Z]{3,5}\d{3,4}[A-Z])(?![A-Z0-9])/.exec(text.replace(/^\*\d\d /, '')); msgid = m ? m[1] : null; }
      // IMSI による NIP 中の情報メッセージ抑止
      if (this.phase === 'NIP' && cls === 'info' && this.imsi && !this.imsi.show) { this._log('suppressed', msgid); return; }
      const rec = { time: this.ts(), text, cls, msgid };
      this.out.push(rec);
      this.listeners.forEach(f => f(rec));
    }
    note(text) { this.emit(text, 'sim', null); }
    hmc(text) { this.emit(text, 'hmc', null); }
    _log(type, detail) {
      this.events.push({ type, detail, phase: this.phase, jes: this.jes, vtam: this.vtam, time: this.ts() });
      this._fireTriggers(type, detail);
    }

    // ---- 途中で起きる出来事（演習シナリオ用） ----------------------------
    // opts.triggers: [{ after: 'eod' | 'reset' | 'wait:05F' | 'started:TSO' ..., do: { note, scenario, job } }]
    // after は操作履歴の種類（_log の type）か「種類:詳細の先頭」。一致したら1回だけ実行する。
    _fireTriggers(type, detail) {
      for (const t of this.triggers) {
        if (t.fired) continue;
        const [ty, de] = t.after.split(':');
        if (ty !== type || (de !== undefined && !String(detail || '').startsWith(de))) continue;
        t.fired = true;
        const d = t.do || {};
        if (d.scenario) [].concat(d.scenario).forEach(k => { this.sc.add(k); if (k === 'CKPTLOCK') this.ckptLockHeld = true; if (k === 'RESIDUAL') this.residual = true; });
        if (d.note) this.emit('（連絡）' + d.note, 'sim');
        if (d.job) [].concat(d.job).forEach(q => {
          if (this.jes === 'UP' && this.inits && !this.jesDrain) { const j = this._addJob(q.name, 'JOB', q.remain === undefined ? Infinity : q.remain, q.cancelable); this.emit('$HASP373 ' + j.name.padEnd(8) + ' STARTED - INIT 1    - CLASS A        - SYS ' + SYSNAME); }
          else (this._batchQueued = this._batchQueued || []).push(q);
        });
      }
    }
    tick(sec) { this.clock = new Date(this.clock.getTime() + sec * 1000); }

    // ---- WTOR ---------------------------------------------------------
    wtor(msgid, text, fn, opts) {
      opts = opts || {};
      const id = this.phase === 'NIP' ? '00' : pad(this.nextReply++ % 100, 2);
      this.replies.set(id, { msgid, text, fn });
      this.emit('*' + id + ' ' + (msgid.startsWith('$') ? msgid + ' ' : msgid + ' ') + text, 'wtor', msgid);
      return id;
    }
    pending() { return [...this.replies.entries()].map(([id, r]) => ({ id, msgid: r.msgid, text: r.text })); }

    // ---- HMC 操作 -----------------------------------------------------
    hmcLoad(addr, loadparm) {
      addr = (addr || '').trim().toUpperCase();
      loadparm = (loadparm || '').toUpperCase();
      this._log('load', addr + '/' + loadparm);
      if (this.phase !== 'OFF' && this.phase !== 'WAIT' && this.phase !== 'PARTITIONED') {
        this.hmc('HMC: このイメージは稼働中です。LOAD は中断的な操作です（シミュレータ：先に停止手順を行うか、システムリセットしてください）');
        this._log('load-while-up');
        return false;
      }
      this._resetMachine();
      this.hmc('HMC: LOAD 開始  ロードアドレス=' + addr + '  ロードパラメーター=' + (loadparm || '(なし)'));
      if (!/^[0-9A-F]{4,5}$/.test(addr)) { this.hmc('HMC: ロードアドレスが正しくありません（4〜5桁の16進数）'); this.phase = 'OFF'; return false; }
      const dev = DEVICES[addr.slice(-4)];
      if (!dev) { this.hmc('HMC: LOAD 失敗 — 装置 ' + addr + ' が応答しません（シミュレータ：ハードウェア側のエラー）'); this.phase = 'OFF'; return false; }
      if (!dev.iplText) return this._waitState('00F', null, 'IPL テキストのないボリューム（' + dev.vol + '）から LOAD しました');
      // LOAD パラメーター解析（System Commands p.32-33）
      if (loadparm.length > 8) { this.hmc('HMC: ロードパラメーターは8文字までです'); this.phase = 'OFF'; return false; }
      const lp = loadparm.padEnd(8, ' ');
      let iodfDev = lp.slice(0, 4);
      if (iodfDev.trim() === '' || iodfDev === '....') iodfDev = SYSRES;
      else if (!isHex(iodfDev)) return this._waitState('0B3', null, 'LOAD パラメーター1〜4桁目が16進の装置番号ではありません: "' + iodfDev + '"');
      let sfx = lp.slice(4, 6);
      if (sfx.trim() === '' || sfx === '..') sfx = '00';
      let imsi = lp[6]; if (imsi === ' ') imsi = '.';
      const IMSI = { '.': [0, 0, 0], A: [1, 1, 1], C: [0, 1, 0], D: [1, 1, 0], M: [1, 0, 0], P: [0, 1, 1], S: [0, 0, 1], T: [1, 0, 1] };
      if (!IMSI[imsi]) { this.note('（シミュレータ注記）IMSI 文字 "' + imsi + '" はマニュアルの表にありません。既定値（.）として扱います'); imsi = '.'; }
      this.imsi = { ch: imsi, show: !!IMSI[imsi][0], cat: !!IMSI[imsi][1], sys: !!IMSI[imsi][2] };
      const nuc = lp[7];
      this.phase = 'NIP';
      this.hmc('HMC: LOAD 完了。オペレーティングシステム・メッセージを確認してください');
      const idev = DEVICES[iodfDev];
      if (!idev || !idev.iplparm || !LOADMEMBERS[sfx]) {
        return this._waitState('088', '00', 'LOAD' + sfx + ' が装置 ' + iodfDev + ' の SYSn.IPLPARM / SYS1.PARMLIB に見つかりません');
      }
      if (!(nuc === ' ' || nuc === '.' || nuc === '1')) return this._waitState('088', '0E', '代替核 ID "' + nuc + '" に対応する IEANUC' + '1' + nuc + ' がありません');
      const lm = Object.assign({}, LOADMEMBERS[sfx]);
      if (sfx === '00' && this.sc.has('NOSYSCAT')) lm.syscat = false;
      this.loadmem = lm; this.iodfDev = iodfDev; this.loadSfx = sfx;
      this.emit('IEA371I SYS1.IPLPARM ON DEVICE ' + iodfDev + ' SELECTED FOR IPL PARAMETERS');
      this.emit('IEA246I LOAD   ID ' + sfx + ' SELECTED');
      this.emit('IEA246I NUCLST ID 00 SELECTED');
      if (lm.iodf !== '01') return this._waitState('0B1', '01', 'LOAD' + sfx + ' の IODF 文が SYS1.IODF' + lm.iodf + ' を指していますが存在しません');
      this.emit('IEA519I IODF DSN = SYS1.IODF01');
      this.emit('IEA520I CONFIGURATION ID = ZOS32A . IODF DEVICE NUMBER = ' + iodfDev);
      this.tick(5);
      this._nip(['volumes', 'mcat', 'sysparm', 'tod', 'xcf', 'finish']);
      return true;
    }

    hmcReset() {
      this._log('reset', this.phase);
      const was = this.phase;
      if (was === 'UP' && !this.eod) this._log('reset-without-shutdown');
      // JES2 が動いたままリセットすると、次回チェックポイントのロックが残る（$HASP479 MEMBER=SYSA）
      const jesActive = (was === 'UP' || was === 'PARTITIONED') && ['INIT', 'HOLD', 'UP'].includes(this.jes);
      this.hmc('HMC: システムリセット（クリア）を実行しました');
      this._resetMachine();
      if (jesActive) this.ckptLockHeld = true;
    }

    _waitState(code, rr, why) {
      this.phase = 'WAIT';
      this.wait = { code, rr };
      // 右端4バイトの書式は x rr yy www / x rrr www 等。表示用に簡略化
      const right = '0' + (rr ? rr.padStart(2, '0') : '00') + '00' + code.padStart(3, '0');
      this.psw = '00020000 80000000 00000000 ' + right.slice(-8);
      this.hmc('HMC: 無効待機状態（DISABLED WAIT） PSW=' + this.psw + '  待機状態コード ' + code + (rr ? ' 理由 ' + rr : ''));
      this.note('（シミュレータ注記）原因: ' + why);
      this._log('wait', code + (rr ? '-' + rr : ''));
      this.replies.clear();
      return false;
    }

    // ---- NIP の進行 -----------------------------------------------------
    _nip(steps) { this.nipQueue = steps; this._nipNext(); }
    _nipNext() {
      while (this.phase === 'NIP' && this.nipQueue && this.nipQueue.length) {
        const s = this.nipQueue.shift();
        const waiting = this['_step_' + s]();
        if (waiting) return; // WTOR 待ち
      }
    }

    _step_volumes() {
      if (this.sc.has('UNLABEL') && !this._unlabelDone) {
        this._unlabelDone = true;
        this.emit('IEA311I UNLABELED DASD ON 0B90. UNIT PUT OFFLINE.', 'action');
      }
      if (this.sc.has('NOTREADY') && !this._nrDone) {
        const ask = () => this.wtor('IEA120D', "DEVICE 0B91 VOLID NOT READ. REPLY 'WAIT' FOR I/O COMPLETION OR 'CONT' TO CONTINUE WITH DEVICE OFFLINE", r => {
          r = r.trim().toUpperCase();
          if (r === 'WAIT') { this.tick(30); this.note('（シミュレータ注記）他システムの予約が解除されるまで待ち、0B91 のボリューム SHR001 を読み取りました'); this._nrDone = true; return true; }
          if (r === 'CONT') { this.note('（シミュレータ注記）0B91 は OFFLINE のまま初期化を続行します'); this._nrDone = true; this._log('device-offline', '0B91'); return true; }
          this.emit('IEA310A INVALID REPLY', 'action'); ask(); return false;
        });
        ask(); this.nipQueue.unshift('volumes'); return true;
      }
      if (this.sc.has('DUPSYSRES') && !this._dupResDone) {
        const ask = () => this.wtor('IEA214A', "DUPLICATE SYSRES Z32RS1 FOUND ON DEVICE 0B80. VERIFY THAT CORRECT DEVICE WAS USED FOR IPL. DUPLICATE DEVICE WILL REMAIN OFFLINE. REPLY 'CONT' TO CONTINUE IPL", r => {
          if (r.trim().toUpperCase() === 'CONT') { this.emit('IEA313I DEVICE 0B80 DISMOUNTED'); this._dupResDone = true; this._log('dupsysres', 'CONT'); return true; }
          this.emit('IEA310A INVALID REPLY', 'action'); ask(); return false;
        });
        ask(); this.nipQueue.unshift('volumes'); return true;
      }
      if (this.sc.has('DUPVOL') && !this.dupvolResolved) {
        const ask = () => this.wtor('IEA213A', 'DUPLICATE VOLUME WORK01 FOUND ON DEVICES 0A85 AND 0B85. REPLY DEVICE NUMBER WHICH IS TO REMAIN OFFLINE', r => {
          r = r.trim().toUpperCase();
          if (r === '0A85' || r === '0B85') {
            this.emit('IEA313I DEVICE ' + r + ' DISMOUNTED');
            this.dupvolResolved = true; this._log('dupvol', r);
            if (r === '0A85') this.note('（シミュレータ注記）本番の WORK01 は 0A85 です。0A85 を外したので、IPL 後に V 0A85,ONLINE 等で状態を戻す必要があります（手順書との相違）');
            return true;
          }
          this.emit('IEA310A INVALID REPLY', 'action'); ask(); return false;
        });
        ask(); this.nipQueue.unshift('volumes'); return true;
      }
      return false;
    }

    _step_mcat() {
      const prompt = this.imsi.cat || !this.loadmem.syscat;
      const select = (member) => {
        const key = member || 'LG';
        if (!SYSCAT_MEMBERS[key]) return null;
        if (key === 'LG' && this.sc.has('BADCAT')) return 'BAD';
        return SYSCAT_MEMBERS[key];
      };
      const finish = (cat) => {
        if (cat === 'BAD') { this._waitState('05F', null, 'SYS1.NUCLEUS(SYSCATLG) の内容が誤っています。別メンバー（SYSCAT02）を指定すれば回避できます'); return; }
        this.emit('IEA370I MASTER CATALOG SELECTED IS MASTER CATALOG ' + cat);
      };
      if (!prompt) {
        // LOADxx の SYSCAT を使う。BADCAT は SYSCATLG 側の問題なので LOADxx 指定なら影響なし
        this.emit('IEA370I MASTER CATALOG SELECTED IS MASTER CATALOG CATALOG.Z32.MASTER');
        return false;
      }
      const ask = () => this.wtor('IEA347A', 'SPECIFY MASTER CATALOG PARAMETER', r => {
        r = r.trim().toUpperCase();
        if (r !== '' && !/^[0-9A-Z@#$]{2}$/.test(r)) { ask(); return false; }
        const cat = select(r === '' ? null : r);
        if (cat === null) { this._log('mcat-notfound', r); ask(); return false; }
        this._log('mcat', r || 'LG');
        finish(cat);
        return this.phase === 'NIP';
      });
      ask(); return true;
    }

    _step_sysparm() {
      this.parms = { SYSP: [], CLPA: false, CVIO: false, SYSNAME: SYSNAME };
      if (!this.imsi.sys) return !this._applySysp(['00'].concat(this.loadmem.sysparm.filter(x => x !== '00')), null);
      const ask = () => this.wtor('IEA101A', 'SPECIFY SYSTEM PARAMETERS FOR ' + VERID, r => this._sysparmReply(r));
      ask(); return true;
    }

    _splitParms(text) {
      const out = []; let depth = 0, cur = '';
      for (const ch of text) {
        if (ch === '(') depth++;
        if (ch === ')') depth--;
        if ((ch === ',' || ch === ' ') && depth === 0) { if (cur) out.push(cur); cur = ''; continue; }
        cur += ch;
      }
      if (cur) out.push(cur);
      return { parts: out, balanced: depth === 0 };
    }

    _sysparmReply(r, isRespec) {
      r = r.trim().toUpperCase().replace(/^'(.*)'$/, '$1');
      const { parts, balanced } = this._splitParms(r);
      const respec = () => this.wtor('IEA336A', 'RESPECIFY PARAMETERS OR PRESS ENTER TO CANCEL', x => {
        if (x.trim() === '') { this._log('sysparm-cancel'); return this._applySysp(['00'].concat((this._spAccum || []).filter(s => s !== '00')), this._spRest || []); }
        return this._sysparmReply(x, true);
      });
      if (!balanced) { this.emit('IEA321I INVALID PARAMETER SYNTAX - ' + r + ' - UNBALANCED PARENS', 'action'); respec(); return false; }
      let cont = false; const accepted = []; let sysp = this._spAccum && isRespec ? this._spAccum.slice() : (this._contSysp || []);
      for (const p of parts) {
        const [k, v] = p.split('=');
        if (k === 'CONT') { cont = true; continue; }
        if (!SYSPARM_KEYWORDS.includes(k)) { this.emit('IEA321I INVALID PARAMETER SYNTAX - ' + k + ' - UNDEFINED KEYWORD', 'action'); this._spAccum = sysp; this._spRest = accepted; this._log('sysparm-undefined', k); respec(); return false; }
        if (OPI_NO.includes(k)) { this.emit('IEA107I ' + k + ' IGNORED', 'action'); this._log('opi-ignored', k); continue; }
        if (k === 'SYSP') {
          const list = (v || '').replace(/[()]/g, '').split(',').filter(Boolean);
          if (!list.length || list.some(s => !/^[0-9A-Z@#$]{2}$/.test(s))) { this.emit('IEA321I INVALID PARAMETER SYNTAX - SYSP - IMPROPER DELIMITER', 'action'); respec(); return false; }
          sysp = sysp.concat(list);
        } else accepted.push(p);
      }
      if (cont) {
        this._contSysp = sysp; this._contAcc = (this._contAcc || []).concat(accepted);
        this.wtor('IEA116A', 'CONTINUE SYSTEM PARAMETERS', x => this._sysparmReply(x));
        return false;
      }
      const acc = (this._contAcc || []).concat(accepted);
      this._contSysp = null; this._contAcc = null;
      return this._applySysp(['00'].concat(sysp.filter(s => s !== '00')), acc) ? true : false;
    }

    // IEASYSxx を読む。エラー時は IEA301I→IEA324I→IEA336A。戻り値: 続行できるか
    _applySysp(list, operParms) {
      for (const m of list) {
        const exists = IEASYS[m] && !(m === '00' && this.sc.has('NOIEASYS'));
        if (!exists) {
          this.emit('IEA301I IEASYS' + m + ' NOT FOUND IN SYS1.PARMLIB', 'action');
          this.emit('IEA324I SYSP INPUT TERMINATED IN IEASYS' + m, 'action');
          this._log('ieasys-notfound', m);
          if (m === '00' && this.sc.has('NOIEASYS') && this._ieasys00Warned) {
            // 2回目以降の Enter 取消し → 受理済みのパラメーターで続行
            this.note('（シミュレータ注記）IEASYS00 なしで、受け付けたパラメーターのみで続行します');
            break;
          }
          if (m === '00') this._ieasys00Warned = true;
          this._spAccum = list.filter(x => x !== m && x !== '00');
          this._spRest = operParms || [];
          this.wtor('IEA336A', 'RESPECIFY PARAMETERS OR PRESS ENTER TO CANCEL', x => {
            if (x.trim() === '') {
              this._log('sysparm-cancel');
              const rest = list.filter(y => y !== m && (IEASYS[y] && !(y === '00' && this.sc.has('NOIEASYS'))));
              this._finishSysp(rest, operParms || []);
              return this.phase === 'NIP';
            }
            return this._sysparmReply(x, true);
          });
          return false;
        }
      }
      this._finishSysp(list.filter(m => IEASYS[m] && !(m === '00' && this.sc.has('NOIEASYS'))), operParms || []);
      return true;
    }

    _finishSysp(members, operParms) {
      this.parms.SYSP = members;
      for (const p of operParms) { const [k, v] = p.split('='); this.parms[k] = v === undefined ? true : v; }
      this.emit('IEA008I SYSTEM PARMS FOLLOW FOR ' + VERID);
      members.forEach(m => this.emit('IEASYS' + m));
      if (operParms.length) this.emit(operParms.join(','));
      if (this.parms.CLPA) this.note('（シミュレータ注記）CLPA 指定: PLPA を再作成します');
      this._log('sysparm', members.join(',') + (operParms.length ? ' +' + operParms.join(',') : ''));
    }

    _step_tod() {
      if (!this.sc.has('TODPROMPT')) return false;
      const d = this.clock;
      const jul = d.getUTCFullYear() + '.' + pad(Math.floor((d - Date.UTC(d.getUTCFullYear(), 0, 0)) / 864e5), 3);
      const ask = () => this.wtor('IEA888A', 'UTC DATE=' + jul + ',CLOCK=' + this.ts().replace(/\./g, '.') + ' LOCAL DATE=' + jul + ',CLOCK=' + this.ts() + ' REPLY U, OR UTC/LOCAL TIME', r => {
        r = r.trim().toUpperCase();
        if (r === 'U') { this._log('tod', 'U'); return true; }
        const m = /^DATE=(\d{4})\.(\d{3})(,CLOCK=(\d\d)\.(\d\d)\.(\d\d))?(,GMT)?$/.exec(r) || /^CLOCK=(\d\d)\.(\d\d)\.(\d\d)(,GMT)?$/.exec(r);
        if (m) { this._log('tod-set', r); ask(); return false; }
        this.note('（シミュレータ注記）応答形式が正しくありません。U または DATE=yyyy.ddd,CLOCK=hh.mm.ss の形式で応答してください');
        ask(); return false;
      });
      ask(); return true;
    }

    _step_xcf() {
      if (!this.residual) { this.emit('IXC418I SYSTEM ' + SYSNAME + ' IS NOW ACTIVE IN SYSPLEX ' + PLEX); return false; }
      this.emit('IXC404I SYSTEM(S) ACTIVE OR IPLING: ' + OTHER, 'action');
      const ask = () => this.wtor('IXC405D', 'REPLY I TO INITIALIZE THE SYSPLEX, J TO JOIN SYSPLEX ' + PLEX + ', OR R TO REINITIALIZE XCF', r => {
        r = r.trim().toUpperCase();
        if (r === 'I') { this.residual = false; this._log('xcf', 'I'); this.emit('IXC418I SYSTEM ' + SYSNAME + ' IS NOW ACTIVE IN SYSPLEX ' + PLEX); return true; }
        if (r === 'J') { this._log('xcf', 'J'); this.emit('IXC418I SYSTEM ' + SYSNAME + ' IS NOW ACTIVE IN SYSPLEX ' + PLEX);
          this.note('（シミュレータ注記）SYSB は実際には停止しています。J で参加すると、後で SYSB に対する状態更新欠落（status update missing）として区分化処理が起きる可能性があります。この状況では I が適切です'); this.residual = false; return true; }
        if (r === 'R') { this._log('xcf', 'R');
          const ask2 = () => this.wtor('IXC207A', 'XCF INITIALIZATION IS RESTARTED. RESPECIFY COUPLE SYSTEM PARAMETER, REPLY COUPLE=XX.', x => {
            x = x.trim().toUpperCase();
            if (/^COUPLE=00$/.test(x)) { this.nipQueue.unshift('xcf'); return true; }
            this.emit('IXC208I THE RESPONSE TO MESSAGE IXC207A IS INCORRECT: ' + x, 'action'); ask2(); return false; });
          ask2(); return false; }
        this.emit('IXC208I THE RESPONSE TO MESSAGE IXC405D IS INCORRECT: ' + r, 'action'); ask(); return false;
      });
      ask(); return true;
    }

    _step_finish() {
      this.phase = 'UP';
      this.emit('IEE252I MEMBER CONSOL00 FOUND IN SYS1.PARMLIB');
      this.emit('IEE612I CN=MSTCON  DEVNUM=0700 SYS=' + SYSNAME);
      this.emit('IEE389I MVS COMMAND PROCESSING AVAILABLE');
      this._log('ipl-complete', this.parms.SYSP.join(','));
      this.note('（シミュレータ注記）COMMND00 により S JES2 が自動投入されます');
      this.emit('S JES2', 'cmd');
      this._startJes2(null);
      return true;
    }

    // ---- 応答 -----------------------------------------------------------
    _reply(id, text) {
      const r = this.replies.get(id);
      if (!r) {
        if (this.replies.size === 0) this.emit('IEE701I REPLY ' + id + ' IGNORED; NO REPLIES OUTSTANDING', 'error');
        else this.emit('IEE704I REPLY ' + id + ' NOT OUTSTANDING', 'error');
        this._log('reply-bad-id', id);
        return;
      }
      this.replies.delete(id);
      if (this.phase !== 'NIP') this.emit('IEE600I REPLY TO ' + id + ' IS;' + text.slice(0, 43));
      this._log('reply', r.msgid + '=' + text);
      const cont = r.fn(text);
      if (cont && this.phase === 'NIP') this._nipNext();
    }

    // REPLY の解析。戻り値: null（REPLY ではない）/ {id, text} / {bad:id}（IEE702I）
    _parseReply(text) {
      const m = /^(?:R|REPLY)\s+(\d{1,2})(.*)$/i.exec(text);
      if (!m) return null;
      const id = pad(m[1], 2); let rest = m[2];
      if (rest.trim() === '') return { id, text: '' };
      if (!/^[\s,]/.test(rest)) return { bad: id };
      rest = rest.replace(/^\s*,?\s*/, '');
      if (rest.startsWith("'")) { if (!/^'.*'$/.test(rest) || rest.length < 2) return { bad: id }; rest = rest.slice(1, -1); }
      return { id, text: rest };
    }

    // ---- コンソール入力 ---------------------------------------------------
    command(raw) {
      const text = (raw || '').trim();
      if (this.phase === 'OFF') { this.note('（シミュレータ注記）システムは起動していません。HMC から LOAD してください'); return; }
      if (this.phase === 'WAIT' || this.phase === 'PARTITIONED') { this.note('（シミュレータ注記）システムは無効待機状態です。コマンドは受け付けられません。HMC からシステムリセット／再 LOAD してください'); return; }
      this.emit(text === '' ? '(ENTER)' : text, 'cmd');
      this._log('cmd', text);
      // NIP 中: 空 Enter は保留中の応答 00 への空応答
      if (this.phase === 'NIP') {
        if (text === '') { if (this.replies.has('00')) this._reply('00', ''); return; }
        const pr = this._parseReply(text);
        if (pr && pr.bad) { this.emit('IEE702I REPLY ' + pr.bad + ' IGNORED; IMPROPER USE OF DELIMITERS', 'error'); this._log('reply-delim', pr.bad); return; }
        if (pr) return this._reply(pr.id, pr.text);
        this.note('（シミュレータ注記）初期化中（NIP）は応答（R 00,xxx）か Enter のみ受け付けます');
        return;
      }
      if (text === '') return;
      this.tick(2);
      const up = text.toUpperCase();
      let m;
      const pr = this._parseReply(text);
      if (pr && pr.bad) { this.emit('IEE702I REPLY ' + pr.bad + ' IGNORED; IMPROPER USE OF DELIMITERS', 'error'); this._log('reply-delim', pr.bad); return; }
      if (pr) return this._reply(pr.id, pr.text);
      if (up.startsWith('$')) return this._jesCmd(up);
      if ((m = /^WAIT\s*(\d+)?$/.exec(up))) return this.advance(parseInt(m[1] || '1', 10));
      if (/^(D|DISPLAY)\s+T$/.test(up)) return this._dispT();
      if (/^(D|DISPLAY)\s+A(,L)?$/.test(up)) return this._dispA();
      if (/^(D|DISPLAY)\s+R(,L)?$/.test(up)) return this._dispR();
      if ((m = /^(S|START)\s+([A-Z0-9@#$]+)(?:\.[A-Z0-9]+)?(?:,(.*))?$/.exec(up))) return this._start(m[2], m[3] || '');
      if ((m = /^(P|STOP)\s+([A-Z0-9@#$]+)$/.exec(up))) return this._stop(m[2]);
      if ((m = /^(Z|HALT)\s+NET(?:,(QUICK|CANCEL))?$/.exec(up))) return this._haltNet(m[2] || '');
      if (/^(Z|HALT)\s+EOD$/.test(up)) return this._haltEod();
      if ((m = /^(C|CANCEL)\s+([A-Z0-9@#$]+)(?:,A=([0-9A-F]+))?$/.exec(up))) return this._cancel(m[2], m[3], false);
      if ((m = /^FORCE\s+([A-Z0-9@#$]+)(,ARM)?(?:,A=([0-9A-F]+))?$/.exec(up))) return this._cancel(m[1], m[3], true, !!m[2]);
      if ((m = /^(V|VARY)\s+XCF,([A-Z0-9]+),OFFLINE$/.exec(up))) return this._varyXcf(m[2]);
      const verb = up.split(/[\s,]/)[0];
      this.emit('IEE305I ' + verb + ' COMMAND INVALID', 'error');
      this._log('invalid-cmd', verb);
    }

    advance(min) {
      for (let i = 0; i < min; i++) {
        this.tick(60);
        for (const j of this.jobs.slice()) {
          if (j.type === 'JOB' && j.remain !== Infinity) { j.remain--; if (j.remain <= 0) this._endJob(j, 'RC=0000'); }
        }
        if (this.jes === 'UP') this._initiate();
      }
      this.note('（シミュレータ）' + min + '分経過');
      this._log('advance', String(min));
    }

    _dispT() {
      const d = this.clock;
      const jul = d.getUTCFullYear() + '.' + pad(Math.floor((d - Date.UTC(d.getUTCFullYear(), 0, 0)) / 864e5), 3);
      this.emit('IEE136I LOCAL: TIME=' + this.ts() + ' DATE=' + jul + '  UTC: TIME=' + this.ts() + ' DATE=' + jul);
    }
    _dispA() {
      const jobs = this.jobs.filter(j => j.type === 'JOB').length, stc = this.jobs.filter(j => j.type === 'STC').length, tsu = this.jobs.filter(j => j.type === 'TSU').length;
      const d = this.clock, jul = d.getUTCFullYear() + '.' + pad(Math.floor((d - Date.UTC(d.getUTCFullYear(), 0, 0)) / 864e5), 3);
      const lines = ['IEE114I ' + this.ts() + ' ' + jul + ' ACTIVITY FRAME LAST F E SYS=' + SYSNAME,
        ' JOBS     M/S    TS USERS    SYSAS    INITS   ACTIVE/MAX VTAM     OAS',
        ' ' + pad(jobs, 5) + '    ' + pad(stc + 1, 5) + '    ' + pad(tsu, 5) + '       00031    ' + pad(this.inits && this.jes === 'UP' && !this.jesDrain ? 3 : 0, 5) + '    ' + pad(tsu, 5) + '/00100     00000'];
      lines.push(' JES2     JES2     IEFPROC  ' + (this.jes === 'DOWN' || this.jes === 'TERMED' ? '(INACTIVE)' : 'NSW  S'));
      for (const j of this.jobs) lines.push(' ' + j.name.padEnd(8) + ' ' + (j.type === 'STC' ? j.name.padEnd(8) : 'STEP1   ') + ' ' + j.type.padEnd(4) + '  A=' + j.asid.toString(16).toUpperCase().padStart(4, '0'));
      this.emit(lines.join('\n'));
    }
    _dispR() {
      const p = this.pending();
      const lines = ['IEE112I ' + this.ts() + ' PENDING REQUESTS', ' RM=' + p.length + '  IM=0  CEM=0  EM=0  RU=0  IR=0  AMRF'];
      p.forEach(x => lines.push(' ID:R/K  ' + x.id + '  ' + x.msgid + ' ' + x.text.slice(0, 50)));
      this.emit(lines.join('\n'));
    }

    // ---- ジョブ・STC ----------------------------------------------------
    _addJob(name, type, remain, cancelable) {
      const j = { name, type, asid: this.nextAsid++, jobid: (type === 'JOB' ? 'JOB' : type === 'STC' ? 'STC' : 'TSU') + pad(this.nextJobid++, 5), remain, cancelable: cancelable !== false };
      this.jobs.push(j); return j;
    }
    _endJob(j, how) {
      this.jobs = this.jobs.filter(x => x !== j);
      this.emit('$HASP395 ' + j.name.padEnd(8) + ' ENDED - ' + how);
      this._log('job-end', j.name + ' ' + how);
      if (this.jes === 'UP' && this.jesDrain && !this.jobs.some(x => x.type === 'JOB')) this.emit('$HASP099 ALL AVAILABLE FUNCTIONS COMPLETE');
      if (j.name === 'TSO' && this.vtam === 'HALTING') this._vtamDown();
    }
    _initiate() {
      if (!this.inits || this.jesDrain || this.jes !== 'UP') return;
      if (!this._batchQueued) return;
      for (const q of this._batchQueued.splice(0)) {
        const j = this._addJob(q.name, 'JOB', q.remain, q.cancelable);
        this.emit('$HASP373 ' + j.name.padEnd(8) + ' STARTED - INIT 1    - CLASS A        - SYS ' + SYSNAME);
      }
    }
    _start(name, parm) {
      const known = { JES2: 1, VTAM: 1, NET: 1, TCPIP: 1, TSO: 1 };
      if (!known[name]) { this.emit('IEFC612I PROCEDURE ' + name + ' WAS NOT FOUND', 'error'); this._log('proc-notfound', name); return; }
      if (name === 'JES2') {
        if (this.jes !== 'DOWN' && this.jes !== 'TERMED') { this.note('（シミュレータ注記）JES2 はすでに活動中です'); return; }
        if (this.jesTermNoRestart) { this.note('（シミュレータ注記）$P JES2,TERM で停止した JES2 は、再 IPL するまで再起動できません（JES2 Commands p.39）'); this._log('jes-restart-after-term'); return; }
        const pm = /PARM=\(?'?([^')]*)'?\)?/.exec(parm);
        return this._startJes2(pm ? pm[1] : null);
      }
      if (this.jes !== 'UP' && this.jes !== 'HOLD') { this.note('（シミュレータ注記）JES2 が起動していないため ' + name + ' を開始できません'); this._log('start-before-jes', name); return; }
      const nm = name === 'NET' ? 'VTAM' : name;
      if (this.jobs.some(j => j.name === nm)) { this.note('（シミュレータ注記）' + nm + ' はすでに活動中です'); return; }
      if (nm === 'TSO' && this.vtam !== 'UP') { this.note('（シミュレータ注記）TSO/VTAM は VTAM が必要です。先に S VTAM を入力してください'); this._log('tso-before-vtam'); return; }
      const j = this._addJob(nm, 'STC', Infinity, true);
      this.emit('$HASP100 ' + nm.padEnd(8) + ' ON STCINRDR');
      this.emit('IEF695I START ' + nm.padEnd(8) + ' WITH JOBNAME ' + nm.padEnd(8) + ' IS ASSIGNED TO USER START1');
      this.emit('$HASP373 ' + nm.padEnd(8) + ' STARTED');
      if (nm === 'VTAM') { this.vtam = 'UP'; this.emit('IST020I VTAM INITIALIZATION COMPLETE FOR CSV3R2'); }
      if (nm === 'TCPIP') { this.emit('EZZ4202I Z/OS UNIX - TCP/IP CONNECTION ESTABLISHED FOR TCPIP'); this.emit('EZB6473I TCP/IP STACK FUNCTIONS INITIALIZATION COMPLETE.'); }
      if (nm === 'TSO') {
        this.emit('IKT005I TCAS IS INITIALIZED');
        this.emit('IKT007I TCAS ACCEPTING LOGONS');
        if (this.sc.has('TSOUSERS')) { this._addJob('USER01', 'TSU', Infinity, true); this._addJob('USER02', 'TSU', Infinity, true); this.note('（シミュレータ）USER01, USER02 が TSO にログオンしました'); }
      }
      this._log('started', nm);
    }
    _stop(name) {
      const j = this.jobs.find(x => x.name === name);
      if (!j) { this.emit('IEE341I ' + name + ' NOT ACTIVE', 'error'); this._log('stop-notactive', name); return; }
      if (name === 'VTAM') { this.note('（シミュレータ注記）VTAM は P ではなく Z NET（HALT NET）で停止します'); this.emit('IEE342I STOP  REJECTED-TASK BUSY（シミュレータ表示）', 'error'); this._log('p-vtam'); return; }
      if (name === 'TSO') {
        const users = this.jobs.filter(x => x.type === 'TSU');
        const fin = () => { this.emit('IKT006I TCAS ENDED'); this._endJob(j, 'RC=0000'); };
        if (!users.length) return fin();
        if ([...this.replies.values()].some(r => r.msgid === 'IKT010D')) { this.note('（シミュレータ注記）IKT010D への応答待ちです'); return; }
        const ask = () => this.wtor('IKT010D', pad(users.length, 5) + " USER(S) ACTIVE, REPLY 'SIC' OR 'FSTOP'", r => {
          r = r.trim().toUpperCase();
          if (r === 'SIC' || r === 'FSTOP') { this._log('tso-stop', r); this.jobs.filter(x => x.type === 'TSU').forEach(u => this._endJob(u, r === 'SIC' ? 'RC=0000' : 'ABEND=S222')); fin(); return true; }
          ask(); return false;
        });
        ask(); return;
      }
      if (name === 'TCPIP') { this.emit('EZZ4201I TCP/IP TERMINATION COMPLETE FOR TCPIP'); return this._endJob(j, 'RC=0000'); }
      if (j.type === 'JOB') { this.note('（シミュレータ注記）バッチジョブは STOP できません。終了を待つか CANCEL してください'); this.emit('IEE342I STOP  REJECTED-TASK BUSY（シミュレータ表示）', 'error'); return; }
      this._endJob(j, 'RC=0000');
    }
    _haltNet(opt) {
      const v = this.jobs.find(j => j.name === 'VTAM');
      if (!v) { this.emit('IEE341I NET NOT ACTIVE', 'error'); this._log('znet-notactive'); return; }
      this.emit('IST097I HALT ACCEPTED');
      this._log('znet', opt || 'NORMAL');
      const tso = this.jobs.find(j => j.name === 'TSO');
      if (opt === '' && tso) {
        this.vtam = 'HALTING';
        this.note('（シミュレータ注記）通常の HALT はアプリケーション（TSO）の終了を待ちます。P TSO で TSO を停止してください');
        return;
      }
      if (tso) { this.jobs.filter(x => x.type === 'TSU').forEach(u => this._endJob(u, 'ABEND=S522（シミュレータ）')); this._endJob(tso, 'RC=0000'); }
      this._vtamDown();
    }
    _vtamDown() {
      const v = this.jobs.find(j => j.name === 'VTAM');
      this.vtam = 'DOWN';
      this.emit('IST102I VTAM IS NOW INACTIVE');
      if (v) this._endJob(v, 'RC=0000');
    }
    _cancel(name, asid, force, arm) {
      let cands = this.jobs.filter(j => j.name === name);
      if (asid) cands = cands.filter(j => j.asid.toString(16).toUpperCase().padStart(4, '0').endsWith(asid.padStart(4, '0')) || j.asid === parseInt(asid, 16));
      if (!cands.length) { this.emit('IEE341I ' + name + ' NOT ACTIVE', 'error'); this._log('cancel-notactive', name); return; }
      if (cands.length > 1) { this.emit("IEE842I " + name + " DUPLICATE NAME FOUND - REENTER COMMAND WITH 'A='", 'error'); this._log('cancel-dup', name);
        this.note('（シミュレータ）A= に指定する ASID: ' + cands.map(c => c.asid.toString(16).toUpperCase().padStart(4, '0')).join(', ') + '（D A,L で確認できます）'); return; }
      const j = cands[0];
      if (force) {
        if (j.cancelable === false && !arm) { this.emit('IEE838I ' + name + ' NON-CANCELABLE - ISSUE FORCE ARM', 'error'); this._log('force-need-arm', name); return; }
        if (j.cancelable !== false && !j.cancelTried) { this.emit('IEE838I ' + name + ' CANCELABLE - ISSUE CANCEL BEFORE FORCE', 'error'); this._log('force-before-cancel', name); return; }
        this.emit('IEE301I ' + name + ' FORCE' + (arm ? ' ARM' : '') + ' COMMAND ACCEPTED');
        this._log('force', name);
        this.emit('IEF450I ' + name + ' STEP1 - ABEND=S122 U0000 REASON=00000000');
        return this._endJob(j, 'ABEND=S122');
      }
      if (j.cancelable === false) { this.emit('IEE841I ' + name + ' NON-CANCELABLE', 'error'); this._log('cancel-noncancelable', name); return; }
      this.emit('IEE301I ' + name + ' CANCEL COMMAND ACCEPTED');
      this._log('cancel', name);
      j.cancelTried = true;
      if (j.name === 'VTAM') { this.vtam = 'DOWN'; this.emit('IST102I VTAM IS NOW INACTIVE'); }
      this.emit('IEF450I ' + name + ' ' + (j.type === 'STC' ? name : 'STEP1') + ' - ABEND=S222 U0000 REASON=00000000');
      this._endJob(j, 'ABEND=S222');
    }

    // ---- JES2 ----------------------------------------------------------
    _startJes2(parm) {
      this.jes = 'INIT';
      this._jesWasUp = true; this._jesStopped = false;
      if (parm !== null && parm !== undefined) return this._jesOptions(parm, true);
      const ask = () => this.wtor('$HASP426', 'SPECIFY OPTIONS - JES2 z/OS 3.2 SSNAME=JES2', r => this._jesOptions(r, false, ask));
      ask();
    }
    _jesOptions(r, fromParm, ask) {
      const opts = r.toUpperCase().replace(/'/g, '').split(',').map(s => s.trim()).filter(Boolean);
      if (opts.includes('$PJES2') || opts.includes('$P JES2')) { this.emit('$HASP085 JES2 TERMINATION COMPLETE'); this.jes = 'DOWN'; this._jesStopped = true; return; }
      const valid = /^(COLD|WARM|FORMAT|NOFMT|NOREQ|REQ|LIST|NOLIST|LOG|NOLOG|CONSOLE|CKPT1|CKPT2|UNACT|HASPPARM=\w+|MEMBER=\w+|PARMLIB_MEMBER=\w+|SPOOL=VALIDATE|SPOOL=NOVALIDATE)$/;
      const bad = opts.filter(o => !valid.test(o));
      if (bad.length || opts.includes('CHECK')) {
        this.emit('$HASP427 PARAMETER OR SYNTAX ERROR - RESPECIFY OPTIONS', 'error');
        this._log('jes-badopt', bad.join(','));
        if (ask) ask(); else this._startJes2(null);
        return false;
      }
      let cold = false, noreq = false;
      for (const o of opts) { if (o === 'COLD' || o === 'FORMAT') cold = true; if (o === 'WARM') cold = opts.includes('FORMAT'); if (o === 'NOREQ') noreq = true; if (o === 'REQ') noreq = false; }
      this._log('jes-start', (cold ? 'COLD' : 'WARM') + (noreq ? ',NOREQ' : ''));
      this.jesNoreq = noreq;
      if (cold) {
        this.emit('$HASP436 CONFIRM COLD START ON CKPT1 - VOLSER=SPOOL1 DSN=SYS1.JES2.CKPT1  SPOOL - PREFIX=SPOOL DSNAME=SYS1.HASPACE', 'action');
        const ask2 = () => this.wtor('$HASP441', "REPLY 'Y' TO CONTINUE INITIALIZATION OR 'N' TO TERMINATE IN RESPONSE TO MESSAGE HASP436", x => {
          x = x.trim().toUpperCase();
          if (x === 'Y') { this._log('jes-cold-confirm'); this.ckptFormatted = true; this.ckptLockHeld = false; this._jesComplete('COLD'); return true; }
          if (x === 'N') { this.emit('$HASP428 CORRECT THE ABOVE PROBLEMS AND RESTART JES2', 'error'); this.emit('$HASP085 JES2 TERMINATION COMPLETE'); this.jes = 'DOWN'; this._jesStopped = true; this._log('jes-cold-cancel'); return true; }
          ask2(); return false;
        });
        ask2(); return true;
      }
      // WARM
      if (!this.ckptFormatted) {
        this.emit('$HASP479 UNABLE TO OBTAIN CKPT DATA SET LOCK - I/O ERROR', 'error');
        const a = () => this.wtor('$HASP454', "SHOULD JES2 BYPASS THE MULTI-MEMBER INTEGRITY LOCK? ('Y' OR 'N')", x => {
          x = x.trim().toUpperCase();
          if (x === 'Y') {
            this.emit('$HASP478 INITIAL CHECKPOINT READ IS FROM CKPT1 (SYS1.JES2.CKPT1 ON SPOOL1)');
            this.emit('$HASP434 INVALID CHECKPOINT RECORD ON CKPT1 DATA SET', 'error');
            this.emit('$HASP285 JES2 CHECKPOINT RECONFIGURATION IN PROGRESS');
            this.emit('$HASP289 CKPT1 AND/OR CKPT2 SPECIFICATIONS ARE REQUIRED.', 'action');
            const t = () => this.wtor('$HASP272', 'ENTER RESPONSE (ISSUE D R,MSG=$HASP289 FOR RELATED MSG)', y => {
              if (y.trim().toUpperCase() === 'TERM') { this.emit('$HASP428 CORRECT THE ABOVE PROBLEMS AND RESTART JES2'); this.emit('$HASP085 JES2 TERMINATION COMPLETE'); this.jes = 'DOWN'; this._jesStopped = true; this._log('jes-first-term');
                this.note('（シミュレータ注記）初回起動では S JES2 で再起動し、$HASP426 に COLD（または FORMAT）を指定します（JES2 Commands p.31）'); return true; }
              this.note('（シミュレータ注記）このシミュレータでは TERM 応答のみ再現しています（チェックポイント再構成ダイアログは省略）'); t(); return false;
            });
            t(); return true;
          }
          if (x === 'N') { this.emit('$HASP428 CORRECT THE ABOVE PROBLEMS AND RESTART JES2'); this.emit('$HASP085 JES2 TERMINATION COMPLETE'); this.jes = 'DOWN'; this._jesStopped = true; this._log('jes-454-N'); return true; }
          a(); return false;
        });
        a(); return true;
      }
      if (this.ckptLockHeld) {
        this.emit('$HASP479 UNABLE TO OBTAIN CKPT DATA SET LOCK - MEMBER=' + SYSNAME, 'error');
        const a = () => this.wtor('$HASP454', "SHOULD JES2 BYPASS THE MULTI-MEMBER INTEGRITY LOCK? ('Y' OR 'N')", x => {
          x = x.trim().toUpperCase();
          if (x === 'Y') { this._log('jes-steal-lock'); this.ckptLockHeld = false; this._jesComplete('WARM'); return true; }
          if (x === 'N') { this.emit('$HASP428 CORRECT THE ABOVE PROBLEMS AND RESTART JES2'); this.emit('$HASP085 JES2 TERMINATION COMPLETE'); this.jes = 'DOWN'; this._jesStopped = true; this._log('jes-454-N');
            this.note('（シミュレータ注記）実機では N 応答後に HASP416/HASP417 の確認対話になります（docs/decisions.md D16）'); return true; }
          a(); return false;
        });
        a(); return true;
      }
      this._jesComplete('WARM');
      return true;
    }
    _jesComplete(mode) {
      this.emit('$HASP478 INITIAL CHECKPOINT READ IS FROM CKPT1 (SYS1.JES2.CKPT1 ON SPOOL1)');
      this.emit('$HASP493 JES2 ' + (mode === 'COLD' ? 'COLD START' : 'ALL-MEMBER WARM START') + ' IS IN PROGRESS');
      this.emit('$HASP492 JES2 ' + (mode === 'COLD' ? 'COLD START' : 'ALL-MEMBER WARM START') + ' HAS COMPLETED');
      this.jesMode = mode;
      this.inits = true;
      // スプール上のジョブは最初の JES2 起動時だけ投入する（停止で片付けたジョブが再 IPL で復活しないように）
      if (!this._initialJobsDone && (this.initialJobs || this.sc.has('BATCH') || this.sc.has('DUPJOB') || this.sc.has('HUNG'))) {
        this._initialJobsDone = true;
        this._batchQueued = (this._batchQueued || []).concat(this.initialJobs || []);
        if (this.sc.has('BATCH')) this._batchQueued.push({ name: 'PAYROLL', remain: 15 });
        if (this.sc.has('DUPJOB')) { this._batchQueued.push({ name: 'BKUP', remain: 30 }); this._batchQueued.push({ name: 'BKUP', remain: 30 }); }
        if (this.sc.has('HUNG')) this._batchQueued.push({ name: 'HUNGJOB', remain: Infinity, cancelable: false });
        if (mode === 'COLD') { this._batchQueued = []; this.note('（シミュレータ注記）コールドスタートのため、スプール上のジョブはすべて失われました'); }
      }
      if (this.jesNoreq) { this.jes = 'UP'; this._initiate(); }
      else { this.jes = 'HOLD'; this.emit('$HASP400 ENTER REQUESTS', 'action'); }
    }

    _jesCmd(up) {
      if (this.jes === 'DOWN' || this.jes === 'TERMED' || this.jes === 'INIT') {
        const verb = up.split(/[\s,]/)[0];
        this.emit('IEE305I ' + verb + ' COMMAND INVALID', 'error');
        this._log('jes-cmd-no-jes', up); return;
      }
      const c = up.replace(/\s+/g, '');
      if (c === '$S') {
        this.jesDrain = false;
        if (this.jes === 'HOLD') { this.jes = 'UP'; this._log('jes-$S'); }
        this.emit('$HASP000 OK');
        this._initiate(); return;
      }
      if (c === '$P') {
        this.jesDrain = true; this._log('jes-$P');
        this.emit('$HASP000 OK');
        if (!this.jobs.some(j => j.type === 'JOB')) this.emit('$HASP099 ALL AVAILABLE FUNCTIONS COMPLETE');
        return;
      }
      if (c === '$DA' || c === '$DA,ALL') {
        const act = this.jobs.filter(j => j.type === 'JOB');
        if (!act.length) { this.note('（シミュレータ）実行中のバッチジョブはありません'); return; }
        act.forEach(j => this.emit('$HASP890 JOB(' + j.name + ')  STATUS=(EXECUTING/' + SYSNAME + '),CLASS=A  JOBID=' + j.jobid));
        return;
      }
      if (c === '$DU' || c === '$DJES2') return this._hasp608(c === '$DJES2');
      if (/^\$PJES2/.test(c)) return this._pjes2(c.slice(6));
      this.emit('$HASP003 RC=(01),' + up.split(/[\s,]/)[0] + ' - INVALID COMMAND（シミュレータ表示）', 'error');
      this._log('jes-cmd-bad', up);
    }
    _activity() {
      const as = this.jobs.filter(j => j.type !== 'TSU' || true);
      return as;
    }
    _hasp608(onlyList) {
      const as = this.jobs;
      if (!as.length && (this.jesDrain || !this.inits)) { this.emit('$HASP608 ALL AVAILABLE FUNCTIONS COMPLETE'); return; }
      const lines = ['$HASP608 ' + (as.length ? 'ACTIVE ADDRESS SPACES' : ''), '         ASID     JOBNAME  JOBID', '         -------- -------- --------'];
      as.forEach(j => lines.push('         ' + j.asid.toString(16).toUpperCase().padStart(4, '0').padEnd(8) + ' ' + j.name.padEnd(8) + ' ' + j.jobid));
      if (!this.jesDrain) lines.push('$HASP608 ACTIVE PROCESSORS: INITIATORS NOT DRAINED（$P 未投入）');
      this.emit(lines.join('\n'));
    }
    _pjes2(opt) {
      opt = opt.replace(/^,/, '');
      this._log('pjes2', opt || 'NORMAL');
      if (opt === 'ABEND,FORCE') {
        if (!this.jesAbendIssued) { this.emit('$HASP553 $P JES2,ABEND,FORCE COMMAND DENIED ISSUE THE $P JES2,ABEND COMMAND FIRST', 'error'); return; }
        return this._jesGone('FORCE');
      }
      if (opt === 'ABEND') { this.jesAbendIssued = true; return this._jesGone('ABEND'); }
      if (opt === 'TERM') { this.jesTermNoRestart = true; this._jesGone('TERM'); this.emit('$HASP9157 CANNOT RESTART JES2, IPL REQUIRED', 'action'); return; }
      if (opt !== '' && opt !== 'QUICK') { this.emit('$HASP003 RC=(01),$PJES2 - INVALID PARAMETER ' + opt + '（シミュレータ表示）', 'error'); return; }
      const as = this.jobs;
      if (as.length) {
        this.jesDrain = true;
        this.emit('$HASP607 JES2 NOT DORMANT -- MEMBER DRAINING, RC=10 ACTIVE ADDRESS SPACES', 'error');
        this._hasp608();
        this._log('pjes2-not-dormant', as.map(j => j.name).join(','));
        return;
      }
      if (!this.jesDrain) {
        this.jesDrain = true;
        this.emit('$HASP607 JES2 NOT DORMANT -- MEMBER DRAINING, RC=03 ACTIVE PROCESSORS', 'error');
        this.note('（シミュレータ注記）イニシエーターが稼働中でした。$P JES2 は $P として処理され drain されました。もう一度 $P JES2 を入力してください');
        this._log('pjes2-not-dormant', 'INITS');
        return;
      }
      this._jesGone('NORMAL');
    }
    _jesGone(how) {
      if (how === 'ABEND' || how === 'FORCE') this.emit('$HASP095 JES2 CATASTROPHIC ERROR. CODE = $PJ2（シミュレータ表示）', 'error');
      this.emit('$HASP085 JES2 TERMINATION COMPLETE');
      this.jes = how === 'TERM' ? 'TERMED' : 'DOWN';
      this._jesStopped = (how === 'NORMAL' || how === 'TERM');
      if (how === 'ABEND' || how === 'FORCE') this.ckptLockHeld = false; // 同一メンバーのホットスタートは可能
      this.inits = false;
    }

    // ---- 停止 -----------------------------------------------------------
    _haltEod() {
      this._log('eod', this.jes);
      this.emit('IEE334I HALT EOD SUCCESSFUL');
      this.eod = true;
      this.note('（シミュレータ注記）HALT EOD 完了。HMC からシステムリセット（または V XCF,' + SYSNAME + ',OFFLINE）で停止します');
    }
    _varyXcf(sys) {
      if (sys !== SYSNAME && sys !== OTHER) { this.note('（シミュレータ注記）' + sys + ' は sysplex ' + PLEX + ' のシステムではありません（実機の応答メッセージは未確認のため省略）'); this._log('vxcf-badsys', sys); return; }
      if (sys === OTHER) { this.note('（シミュレータ注記）このシミュレータは SYSA のみを操作します'); return; }
      const ask = () => this.wtor('IXC371D', 'CONFIRM REQUEST TO VARY SYSTEM ' + sys + ' OFFLINE. REPLY SYSNAME=' + sys + ' TO REMOVE ' + sys + ' OR C TO CANCEL.', r => {
        r = r.trim().toUpperCase();
        if (r === 'C') { this._log('vxcf-cancel'); this.note('（シミュレータ注記）V XCF の要求を取り消しました'); return true; }
        if (r === 'SYSNAME=' + sys) {
          this._log('vxcf', sys);
          this.emit('IXC101I SYSPLEX PARTITIONING IN PROGRESS FOR ' + sys + ' REQUESTED BY *MASTER*. REASON: OPERATOR VARY REQUEST');
          this.note('（シミュレータ注記）SFM が無い場合、残る ' + OTHER + ' 側に IXC102A（REPLY DOWN）が表示されます。SYSA のシステムリセット後に DOWN と応答します');
          this.phase = 'PARTITIONED';
          this.wait = { code: '0A2', rr: '004' };
          this.psw = '00020000 80000000 00000000 000040A2';
          this.hmc('HMC: 無効待機状態（DISABLED WAIT） PSW=' + this.psw + '  待機状態コード 0A2 理由 004');
          this.replies.clear();
          return true;
        }
        ask(); return false;
      });
      ask();
    }

    // ---- 採点 -----------------------------------------------------------
    evaluate() {
      const ev = this.events, idx = t => ev.findIndex(e => e.type === t);
      const res = [];
      const ipl = idx('ipl-complete') >= 0;
      res.push({ ok: ipl, item: 'IPL が完了した（IEE389I）' });
      res.push({ ok: ev.some(e => e.type === 'jes-start'), item: 'JES2 を起動した' });
      const eod = ev.find(e => e.type === 'eod');
      const pj = ev.filter(e => e.type === 'pjes2');
      const jesDownBeforeEod = eod ? eod.jes === 'DOWN' || eod.jes === 'TERMED' : false;
      if (eod || pj.length) {
        res.push({ ok: jesDownBeforeEod, item: 'JES2 停止（$P JES2）→ HALT EOD の順序' });
        res.push({ ok: eod ? eod.vtam === 'DOWN' : false, item: 'HALT EOD の前に VTAM を停止（Z NET）' });
        res.push({ ok: !pj.some(e => e.detail.startsWith('ABEND')), item: '$P JES2,ABEND を使わずに停止' });
      }
      res.push({ ok: !ev.some(e => e.type === 'reset-without-shutdown'), item: '停止手順なしのシステムリセットをしていない' });
      return res;
    }
  }

  MvsSim.SCENARIOS = SCENARIOS;
  MvsSim.DEVICES = DEVICES;
  if (typeof module !== 'undefined' && module.exports) module.exports = MvsSim;
  else root.MvsSim = MvsSim;
})(typeof window !== 'undefined' ? window : globalThis);
