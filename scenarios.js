/* 付録: 演習シナリオ（一晩・一日の業務を通しで行う練習問題）
 * 手順例（procedures.js）との違い: 正解の手順は見せず、状況・連絡事項・作業指示書だけを渡す。
 * 途中で起きる出来事は triggers（engine.js の _fireTriggers）で起こす。
 * solution は模範解答。ページと tests で engine.js を使って実際に実行し、checks がすべて OK になることを確認する。
 * steps の書式は procedures.js と同じ（LOAD / CMD / WAIT / RESET / NOTE、#MSGID# は応答番号）。
 */
(function (root) {
  const BOOT = [{ op: 'LOAD', addr: '0A80', lp: '0A8200M1' }, { op: 'CMD', in: 'R #$HASP426#,WARM' }, { op: 'CMD', in: '$S' }];
  const UPALL = BOOT.concat([{ op: 'CMD', in: 'S VTAM' }, { op: 'CMD', in: 'S TCPIP' }, { op: 'CMD', in: 'S TSO' }]);

  // 採点の部品（s はシミュレータ、ev は挑戦開始後の操作履歴）
  const has = (ev, type, pre) => ev.some(e => e.type === type && (pre === undefined || String(e.detail).startsWith(pre)));
  const idx = (ev, type, pre) => ev.findIndex(e => e.type === type && (pre === undefined || String(e.detail).startsWith(pre)));
  const allUp = s => s.phase === 'UP' && s.jes === 'UP' && s.vtam === 'UP' && ['VTAM', 'TCPIP', 'TSO'].every(n => s.jobs.some(j => j.name === n));
  const minutes = (s, start) => Math.round((s.clock - start) / 60000);

  const X = [
    {
      id: 'X1', title: '月次の計画停止と、保守後の IPL',
      level: '中級', time: '20〜30分',
      story: '今夜は月次の計画停止です。SYSA を止めてハードウェア保守を行い、終わったらパラメーターを変えて立ち上げ直します。現在 SYSA は通常どおり稼働していて、TSO には利用者が残っています。バッチの PAYROLL がまだ実行中です。',
      handoff: [
        '業務担当（給与）: PAYROLL は普段は数分で終わる。停止作業を始めてから 30 分待っても終わらなければ取り消してよい。翌日に再実行する。',
        'システムプログラマー: 保守後の IPL では、IEASYS01 を追加し、CLPA を指定すること（今回適用した修正を反映するため）。ロードパラメーターの IMSI は A にして、パラメーターを手で入れること。',
        '保守担当: 作業内容は CPU まわりのみ。終わったら連絡する。',
      ],
      order: [
        '標準の順序で SYSA を停止する（TSO 利用者は通常終了させる）。',
        'HALT EOD の後、HMC からシステムリセットする（sysplex からの切り離しは不要）。',
        '保守担当からの連絡を待つ（シミュレータでは、リセットすると連絡が来る）。',
        'ロードアドレス 0A80、ロードパラメーター 0A8200A1 で IPL し、システムプログラマーの指示どおりのパラメーターを指定する。',
        'JES2 をウォームスタートし、VTAM・TCP/IP・TSO を起動して業務開始状態にする。',
      ],
      goal: 'SYSA が IEASYS01 と CLPA を使って再 IPL され、JES2・VTAM・TCP/IP・TSO が動いていること。',
      scenarios: ['TSOUSERS'],
      jobs: [{ name: 'PAYROLL', remain: 600 }],
      triggers: [{ after: 'reset', do: { scenario: 'DUPVOL', note: '保守担当: 作業が終わりました。ついでに、来月から使う予定のディスク（装置 0B85、WORK01 の複製入り）も接続しておきました。' } }],
      prep: UPALL, prepSay: 'SYSA 稼働中（JES2・VTAM・TCP/IP・TSO）。TSO 利用者2名、バッチ PAYROLL 実行中。',
      checks: [
        { item: 'TSO 利用者を SIC で通常終了させた', fn: (s, ev) => has(ev, 'tso-stop', 'SIC') },
        { item: 'PAYROLL を 30 分以上待ってから取り消した', fn: (s, ev) => { const c = idx(ev, 'cancel', 'PAYROLL'); return c >= 0 && ev.slice(0, c).filter(e => e.type === 'advance').reduce((a, e) => a + Number(e.detail), 0) >= 30; } },
        { item: 'JES2 を正常に停止してから HALT EOD、その後にリセット', fn: (s, ev) => { const e = ev.find(x => x.type === 'eod'); return !!e && e.jes === 'DOWN' && idx(ev, 'reset') > idx(ev, 'eod'); } },
        { item: 'IEA213A で増設側の 0B85 を OFFLINE にした（本番の 0A85 は残した）', fn: (s, ev) => has(ev, 'dupvol', '0B85') && !has(ev, 'dupvol', '0A85') },
        { item: 'IEASYS01 と CLPA を指定して IPL した', fn: (s, ev) => ev.some(e => e.type === 'sysparm' && /\b01\b/.test(e.detail) && /CLPA/.test(e.detail)) },
        { item: 'JES2 はウォームスタート（COLD にしていない）', fn: (s, ev) => !has(ev, 'jes-start', 'COLD') && has(ev, 'jes-start', 'WARM') },
        { item: '業務開始状態（JES2・VTAM・TCP/IP・TSO が稼働）', fn: s => allUp(s) },
      ],
      solution: [
        { op: 'CMD', in: 'D A,L', say: '動いているものを確認。PAYROLL と TSO 利用者が残っている。' },
        { op: 'CMD', in: 'P TSO' },
        { op: 'CMD', in: 'R #IKT010D#,SIC', say: '利用者は SIC で通常終了。' },
        { op: 'CMD', in: 'P TCPIP' },
        { op: 'CMD', in: 'Z NET' },
        { op: 'CMD', in: '$P', say: 'イニシエーターを止める。PAYROLL はまだ動いているので $HASP099 は出ない。' },
        { op: 'CMD', in: '$DA' },
        { op: 'WAIT', min: 30, say: '業務担当の指示どおり 30 分待つ。終わらない。' },
        { op: 'CMD', in: 'C PAYROLL', say: '指示に基づき取り消す。$HASP099 で JES2 が休止。' },
        { op: 'CMD', in: '$PJES2' },
        { op: 'CMD', in: 'Z EOD' },
        { op: 'RESET', say: 'HMC からシステムリセット。保守担当から連絡が来る。増設ディスクに WORK01 の複製がある、という点に注意。' },
        { op: 'LOAD', addr: '0A80', lp: '0A8200A1' },
        { op: 'CMD', in: 'R 00,0B85', say: '予想どおり IEA213A。本番の WORK01 は 0A85 なので、増設側の 0B85 を OFFLINE にする。' },
        { op: 'CMD', in: '', say: 'IEA347A は Enter（SYSCATLG）。' },
        { op: 'CMD', in: 'R 00,SYSP=01,CLPA', say: 'システムプログラマーの指示どおり。IEA008I で IEASYS00・IEASYS01 と CLPA を確認。' },
        { op: 'CMD', in: 'R #$HASP426#,WARM' },
        { op: 'CMD', in: '$S' },
        { op: 'CMD', in: 'S VTAM' }, { op: 'CMD', in: 'S TCPIP' }, { op: 'CMD', in: 'S TSO' },
        { op: 'CMD', in: 'D A,L', say: '業務開始状態を確認して完了。' },
      ],
      points: [
        '「30 分待ってから取り消す」のように、業務側の条件を守る。早く止めたいからと先に取り消すのは誤り。',
        '保守担当の連絡（ディスクを増設した）が IEA213A の伏線。どちらを外すかは「本番の装置はどれか」で決める。0A85 を外すと本番の WORK01 が使えなくなる。',
        'IMSI＝A なので、IEA347A（マスターカタログ）と IEA101A（パラメーター）の両方を聞かれる。',
      ],
      mistakes: [
        ['PAYROLL を待たずに取り消す', '業務担当との約束違反。翌日の再実行の影響を業務側が見込めない。'],
        ['ジョブが残ったまま $P JES2', '$HASP607 RC=10 で止まらない。$HASP608 に PAYROLL が表示される。'],
        ['IEA213A に 0A85 と応答', '本番の WORK01 が OFFLINE になる。IPL 後に VARY で戻す作業と報告が必要。'],
        ['IEA101A に Enter だけ', 'IEASYS01 と CLPA が反映されず、今回の修正が有効にならない。もう一度 IPL が必要。'],
      ],
    },
    {
      id: 'X2', title: '夜間障害からの復旧',
      level: '中級', time: '10〜15分',
      story: '午前 2 時すぎ、SYSA がハードウェア障害で突然停止しました。部品の交換は終わり、これから SYSA を立ち上げます。sysplex の相手 SYSB は月次保守のため昨夜から停止しています（HMC で SYSB の LPAR が非稼働であることを確認済み）。',
      handoff: [
        'ハードウェア保守: 交換完了。SYSA は通常の手順で IPL してよい。',
        'シフトリーダー: JES2 のスプールに翌朝のバッチが溜まっている。消さないように立ち上げること。',
      ],
      order: [
        'ロードアドレス 0A80、ロードパラメーター 0A8200M1 で IPL する。',
        '途中で聞かれたことには、状況と連絡事項から判断して応答する。',
        'JES2 を起動し（スプールのジョブを消さない）、VTAM・TCP/IP・TSO を起動する。',
      ],
      goal: 'スプールを消さずに JES2 が立ち上がり、JES2・VTAM・TCP/IP・TSO が動いていること。',
      scenarios: ['RESIDUAL', 'CKPTLOCK'],
      checks: [
        { item: 'IXC405D に I（SYSB は停止済みなので sysplex を初期化）', fn: (s, ev) => has(ev, 'xcf', 'I') && !has(ev, 'xcf', 'J') },
        { item: '$HASP454 に Y（ロックを持つのは停止した SYSA 自身）', fn: (s, ev) => has(ev, 'jes-steal-lock') },
        { item: 'JES2 はウォームスタート（スプールを消していない）', fn: (s, ev) => !has(ev, 'jes-start', 'COLD') && !has(ev, 'jes-cold-confirm') },
        { item: '業務開始状態（JES2・VTAM・TCP/IP・TSO が稼働）', fn: s => allUp(s) },
      ],
      solution: [
        { op: 'LOAD', addr: '0A80', lp: '0A8200M1' },
        { op: 'CMD', in: 'R 00,I', say: 'IXC404I に SYSB が出ているが、SYSB は停止済み（残骸）なので I。' },
        { op: 'CMD', in: 'R #$HASP426#,WARM', say: 'スプールを残すので WARM。$HASP479 MEMBER=SYSA でロックが残っていると言われる。' },
        { op: 'CMD', in: 'R #$HASP454#,Y', say: 'ロックを持っているのは、障害で落ちた SYSA 自身。他に動いているメンバーはないので Y。' },
        { op: 'CMD', in: '$S' },
        { op: 'CMD', in: 'S VTAM' }, { op: 'CMD', in: 'S TCPIP' }, { op: 'CMD', in: 'S TSO' },
        { op: 'CMD', in: 'D A,L' },
      ],
      points: [
        '異常終了の後は、正常停止の後には出ない質問（IXC405D、$HASP479/$HASP454）が出る。どちらも「相手は本当に止まっているか」の確認。',
        '判断の根拠は状況の中にある: SYSB は HMC で非稼働を確認済み、ロックの持ち主は SYSA 自身。',
        'スプールを消さない指示があるので COLD は使わない。',
      ],
      mistakes: [
        ['IXC405D に J', 'SYSB を活動中として扱うので、後で状態更新の欠落として SYSB の区分化処理が起きうる。この状況では I が適切。'],
        ['$HASP454 に N', 'JES2 が終了する（実機では HASP416/HASP417 の確認対話になる）。'],
        ['$HASP426 に COLD', 'スプール上のジョブがすべて失われる。シフトリーダーの指示に反する。'],
      ],
    },
    {
      id: 'X3', title: '新人の IPL を引き継ぐ',
      level: '初級〜中級', time: '10〜15分',
      story: '新人オペレーターが朝の IPL をしたところ、何もメッセージが出ないまま HMC に「無効待機状態」と表示されて止まってしまいました。あなたが引き継いで、業務開始状態まで立ち上げます。今朝、システムプログラマーが SYS1.NUCLEUS のマスターカタログ関係のメンバーを更新したと聞いています。',
      handoff: [
        '新人: 手順書のロードパラメーターを入れたつもりです……。',
        'システムプログラマー: マスターカタログで何かあったら連絡をください（携帯に連絡可）。',
      ],
      order: [
        '止まっている原因を PSW から調べ、正しいロードパラメーター（手順書では 0A8200M1）で IPL し直す。',
        '問題が出たら、記録してシステムプログラマーに連絡し、指示に従う（シミュレータでは、問題が出ると連絡が返ってくる）。',
        'JES2 をウォームスタートし、VTAM・TCP/IP・TSO を起動する。',
      ],
      goal: '正しいマスターカタログで IPL され、JES2・VTAM・TCP/IP・TSO が動いていること。',
      scenarios: ['NOSYSCAT', 'BADCAT'],
      prep: [{ op: 'LOAD', addr: '0A80', lp: '0A8201M1' }],
      prepSay: '新人が 0A8201M1 で LOAD し、待機状態になっている。',
      triggers: [{ after: 'wait:05F', do: { note: 'システムプログラマー: 今朝更新した SYSCATLG に誤りがありました。旧版を SYSCAT02 として残してあるので、IEA347A に 02 と応答して IPL してください。' } }],
      checks: [
        { item: '待機状態 088 の原因（LOAD01）を直して IPL した', fn: (s, ev) => has(ev, 'load', '0A80/0A8200') },
        { item: 'IEA347A に 02 と応答して SYSCAT02 を使った', fn: (s, ev) => has(ev, 'mcat', '02') },
        { item: 'JES2 はウォームスタート', fn: (s, ev) => has(ev, 'jes-start', 'WARM') && !has(ev, 'jes-start', 'COLD') },
        { item: '業務開始状態（JES2・VTAM・TCP/IP・TSO が稼働）', fn: s => allUp(s) },
      ],
      solution: [
        { op: 'NOTE', say: 'HMC の PSW は …00000088 → 待機状態コード 088 理由 00（LOADxx が見つからない）。ロードパラメーターを見ると 0A8201M1 で、5〜6桁目が 01 になっていた。' },
        { op: 'LOAD', addr: '0A80', lp: '0A8200M1', say: '正しいロードパラメーターで再 LOAD。' },
        { op: 'CMD', in: '', say: 'LOAD00 に SYSCAT がないので IEA347A が出る。通常どおり Enter → 待機状態 05F（マスターカタログのエラー）。システムプログラマーに連絡すると指示が返ってくる。' },
        { op: 'LOAD', addr: '0A80', lp: '0A8200M1', say: '指示に従い再 LOAD。' },
        { op: 'CMD', in: 'R 00,02', say: 'IEA347A に 02（SYSCAT02）。' },
        { op: 'CMD', in: 'R #$HASP426#,WARM' },
        { op: 'CMD', in: '$S' },
        { op: 'CMD', in: 'S VTAM' }, { op: 'CMD', in: 'S TCPIP' }, { op: 'CMD', in: 'S TSO' },
      ],
      points: [
        '無効待機状態では、まず PSW の右端（待機状態コードと理由）を記録し、System Codes で意味を調べる。',
        '088 理由 00 は LOADxx が見つからない → ロードパラメーターの打ち間違いを疑う。',
        '待機状態 05F はオペレーターだけでは直せない。記録してシステムプログラマーの指示を受ける。',
      ],
      mistakes: [
        ['088 のまま同じロードパラメーターで再 LOAD', '同じ待機状態を繰り返す。原因を見ずにやり直しても直らない。'],
        ['05F の後、指示を待たずに勝手なメンバーを指定', '存在しないメンバーなら IEA347A が再表示されるだけだが、別のカタログを選ぶと業務データが見えなくなる危険がある。'],
      ],
    },
    {
      id: 'X4', title: '15 分以内の緊急停止',
      level: '上級', time: '15分（シミュレータ上の時間）',
      story: '電源設備の緊急工事が決まり、15 分以内に SYSA を止めて sysplex から外すよう指示されました。SYSA ではバックアップの BKUP が2本と、運用部門のジョブ HUNGJOB が実行中で、TSO にも利用者が残っています。',
      handoff: [
        '運用責任者: 実行中のバッチはすべて取り消してよい。HUNGJOB は取り消し不可のジョブなので、必要なら FORCE してよい（ARM 付き）。',
        '運用責任者: JES2 は正常停止させること（$P JES2,ABEND は使わない）。',
      ],
      order: [
        'TSO 利用者を終了させ、TCP/IP・VTAM を止める。',
        'バッチをすべて終わらせ、JES2 を正常に停止する。',
        'HALT EOD の後、V XCF で SYSA を sysplex から外す。',
        '挑戦開始から 15 分以内（シミュレータの時計）に終える。',
      ],
      goal: 'JES2 を正常停止し、HALT EOD の後で SYSA が sysplex から外れていること（15 分以内）。',
      scenarios: ['DUPJOB', 'HUNG', 'TSOUSERS'],
      prep: UPALL, prepSay: 'SYSA 稼働中。BKUP×2、HUNGJOB 実行中。TSO 利用者2名。',
      checks: [
        { item: '同名ジョブを A= で1本ずつ取り消した', fn: (s, ev) => ev.filter(e => e.type === 'cancel' && e.detail === 'BKUP').length === 2 },
        { item: 'HUNGJOB を FORCE ,ARM で終わらせた', fn: (s, ev) => has(ev, 'force', 'HUNGJOB') },
        { item: '$P JES2,ABEND を使っていない', fn: (s, ev) => !has(ev, 'pjes2', 'ABEND') },
        { item: 'JES2 停止 → HALT EOD → V XCF の順', fn: (s, ev) => { const e = ev.find(x => x.type === 'eod'); return !!e && e.jes === 'DOWN' && idx(ev, 'vxcf') > idx(ev, 'eod'); } },
        { item: 'SYSA が sysplex から外れた（待機状態 0A2）', fn: s => s.phase === 'PARTITIONED' },
        { item: '15 分以内に終えた', fn: (s, ev, start) => minutes(s, start) <= 15 },
      ],
      solution: [
        { op: 'CMD', in: 'P TSO' },
        { op: 'CMD', in: 'R #IKT010D#,SIC' },
        { op: 'CMD', in: 'P TCPIP' },
        { op: 'CMD', in: 'Z NET' },
        { op: 'CMD', in: '$P' },
        { op: 'CMD', in: 'C BKUP', say: '同名が2本あるので IEE842I。' },
        { op: 'CMD', in: 'D A,L', say: 'BKUP の ASID を確認（0020 と 0021）。' },
        { op: 'CMD', in: 'C BKUP,A=20' },
        { op: 'CMD', in: 'C BKUP,A=21' },
        { op: 'CMD', in: 'C HUNGJOB', say: 'IEE841I NON-CANCELABLE。' },
        { op: 'CMD', in: 'FORCE HUNGJOB,ARM', say: '指示どおり FORCE ARM。$HASP099 で JES2 が休止。' },
        { op: 'CMD', in: '$PJES2' },
        { op: 'CMD', in: 'Z EOD' },
        { op: 'CMD', in: 'V XCF,SYSA,OFFLINE' },
        { op: 'CMD', in: 'R #IXC371D#,SYSNAME=SYSA' },
      ],
      points: [
        '急いでいても順番は変えない。時間を食うのは「エラーを出してやり直す」こと。',
        '同名ジョブは最初から D A,L で ASID を見ておけば、IEE842I を出さずに済む。',
        '取り消し不可のジョブは CANCEL → FORCE（ARM なし）→ FORCE ,ARM と試すより、指示があれば最初から FORCE ,ARM でよい。',
      ],
      mistakes: [
        ['ジョブが残ったまま $P JES2,ABEND', 'JES2 が異常終了し、次回の IPL で $HASP479 などの対応が必要になる。運用責任者の指示にも反する。'],
        ['HALT EOD を JES2 停止より前に', '統計やログの書き出しの順序が崩れる。採点で順序誤り。'],
        ['V XCF をせずに HMC でリセット', '残る SYSB 側で IXC402D などが出て、SYSB のオペレーターの対応が必要になる。'],
      ],
    },
    {
      id: 'X5', title: '新しいシステムの初回立ち上げ',
      level: '初級', time: '10分',
      story: '新しく構築したシステム SYSA を初めて立ち上げます。JES2 のチェックポイントとスプールはまだ初期化されていません。時刻装置の設定はこれからなので、IPL 中に時刻の確認を求められます。',
      handoff: [
        'システムプログラマー: パラメーターは既定（IEASYS00、SYSCATLG）のままでよいが、確認のため IMSI は A で IPL して、聞かれた内容を目で確かめること。',
        'システムプログラマー: 表示される時刻が 06:00 前後なら正しい。',
      ],
      order: [
        'ロードアドレス 0A80、ロードパラメーター 0A8200A1 で IPL する。',
        'マスターカタログとシステムパラメーターは既定値で応答する。',
        '時刻を確認して応答する。',
        'JES2 を初期化して起動し、VTAM・TCP/IP・TSO を起動して、D A,L で確認する。',
      ],
      goal: 'JES2 がコールドスタートで初期化され、JES2・VTAM・TCP/IP・TSO が動いていること。',
      scenarios: ['FIRSTJES', 'TODPROMPT'],
      checks: [
        { item: 'IEA888A に U（表示どおりの時刻を採用）', fn: (s, ev) => has(ev, 'tod', 'U') },
        { item: 'JES2 を COLD で初期化した', fn: (s, ev) => has(ev, 'jes-cold-confirm') },
        { item: '遠回りせずに初期化した（初回なのに WARM で始めていない）', fn: (s, ev) => !has(ev, 'jes-start', 'WARM') },
        { item: '業務開始状態（JES2・VTAM・TCP/IP・TSO が稼働）', fn: s => allUp(s) },
      ],
      solution: [
        { op: 'LOAD', addr: '0A80', lp: '0A8200A1' },
        { op: 'CMD', in: '', say: 'IEA347A は Enter（SYSCATLG）。' },
        { op: 'CMD', in: '', say: 'IEA101A も Enter（IEASYS00）。' },
        { op: 'CMD', in: 'R 00,U', say: 'IEA888A の LOCAL 時刻が 06:00 前後なので U。' },
        { op: 'CMD', in: 'R #$HASP426#,COLD', say: '初回なので COLD。' },
        { op: 'CMD', in: 'R #$HASP441#,Y', say: '$HASP436 の内容（チェックポイントとスプール）を確認して Y。' },
        { op: 'CMD', in: '$S' },
        { op: 'CMD', in: 'S VTAM' }, { op: 'CMD', in: 'S TCPIP' }, { op: 'CMD', in: 'S TSO' },
        { op: 'CMD', in: 'D A,L' },
      ],
      points: [
        'JES2 の初回起動は COLD（または FORMAT）。WARM だとチェックポイントが読めず、$HASP479 → $HASP454 → $HASP289/$HASP272 と進み、TERM で止めてやり直すことになる（JES2 Commands p.31）。',
        'IEA888A は表示が正しければ U。直す場合は DATE=…,CLOCK=… で指定し、再表示されたら U。',
      ],
      mistakes: [
        ['$HASP426 に WARM', '$HASP479 I/O ERROR から長い対話になる。最後は $HASP272 に TERM と答え、S JES2 → COLD でやり直し。'],
        ['$HASP441 に N', 'JES2 が終了する。S JES2 からやり直し。'],
      ],
    },
  ];

  // ======================= 連携演習（jcl-terminal と一緒に使う） =======================
  const SALESUPD = { name: 'SALESUPD', remain: 600, dsns: [{ dsn: 'USER01.SALES.DATA', excl: true }] };
  const SHUT = ['P TSO', 'R #IKT010D#,SIC', 'P TCPIP', 'Z NET', '$P', '$PJES2', 'Z EOD'].map(c => ({ op: 'CMD', in: c }));
  X.push(
    {
      id: 'XL1', link: true, title: '立ち上げ後に、利用者の確認ジョブで業務開始を判断する',
      level: '初級', time: '10分',
      story: '朝の立ち上げです。この職場の手順では、業務開始を宣言する前に、利用者（USER01）に確認用のジョブ HELLO を流してもらい、正常に終わったことをコンソールで確かめます。利用者役は jcl-terminal のタブで行います。',
      handoff: ['利用者 USER01: TSO に入れるようになったら、すぐ HELLO を流します。', 'シフトリーダー: HELLO が RC=0000 で終わるのを確認してから業務開始を連絡すること。'],
      order: ['ロードアドレス 0A80、ロードパラメーター 0A8200M1 で IPL する。', 'JES2 をウォームスタートし、VTAM・TCP/IP・TSO を起動する。', '（利用者役）jcl-terminal のタブで HELLO を SUB する。', 'コンソールで HELLO の終了（$HASP395 … RC=0000）を確認し、D A,L で全体を確認する。'],
      goal: 'HELLO が CC 0000 で終わり、JES2・VTAM・TCP/IP・TSO が動いていること。',
      checks: [
        { item: 'TSO にログオンしてから HELLO を投入した', fn: (s, ev) => idx(ev, 'link-logon') >= 0 && idx(ev, 'link-submit', 'HELLO') > idx(ev, 'link-logon') },
        { item: 'HELLO が CC 0000 で終わった', fn: s => s.linkResult('HELLO') === 'CC 0000' },
        { item: '業務開始状態（JES2・VTAM・TCP/IP・TSO が稼働）', fn: s => allUp(s) },
      ],
      solution: [
        { op: 'LOAD', addr: '0A80', lp: '0A8200M1' },
        { op: 'CMD', in: 'R #$HASP426#,WARM' },
        { op: 'CMD', in: '$S', say: '$S を忘れると、HELLO は投入されても始まらない（$HASP400 のまま）。' },
        { op: 'CMD', in: 'S VTAM' }, { op: 'CMD', in: 'S TCPIP' },
        { op: 'CMD', in: 'S TSO', say: 'TSO が動くと、jcl-terminal の USER01 がログオンする。' },
        { op: 'TERM', sub: 'HELLO', say: '（利用者役）jcl-terminal で HELLO を SUB。コンソールに $HASP100 → $HASP373 → $HASP395 が出る。' },
        { op: 'CMD', in: 'D A,L', say: '全体を確認して業務開始を連絡。' },
      ],
      points: ['利用者のジョブはオペレーター側の JES2 で実行される。$S やイニシエーターの状態しだいで、投入されても始まらないことがある。', 'TSO が動いていないと、利用者はそもそもジョブを投入できない。'],
      mistakes: [['$S を入れない', 'HELLO は入力キューで待ったまま。利用者からは「流したのに終わらない」と見える。'], ['TSO を起動する前に SUB させる', 'jcl-terminal に「TSO が動いていない」と表示され、投入できない。']],
    },
    {
      id: 'XL2', link: true, title: '「ジョブが終わらない」— データセット待ちを解消する',
      level: '中級', time: '10分',
      story: '利用者から電話です。「売上レポートの LINKRPT を流したけれど、いつまでたっても終わらない」。調べると、昨夜の売上更新ジョブ SALESUPD がまだ残っていました。',
      handoff: ['利用者 USER01: LINKRPT の結果を急ぎで欲しい。', '業務担当（売上）: SALESUPD は昨夜の処理の残り。取り消してよい（今夜もう一度流す）。'],
      order: ['（利用者役）jcl-terminal のタブで LINKRPT を SUB する。', 'コンソールで、LINKRPT が待っている理由と、原因のジョブを調べる。', '業務担当の了解の範囲で原因を取り除き、LINKRPT を完了させる。'],
      goal: 'LINKRPT が CC 0000 で終わっていること（利用者のジョブは取り消さない）。',
      jobs: [SALESUPD], prep: UPALL, prepSay: 'SYSA 稼働中（USER01 は TSO にログオン中）。昨夜の SALESUPD が USER01.SALES.DATA を使ったまま実行中。',
      checks: [
        { item: 'LINKRPT がデータセット待ち（IEF099I）になった', fn: (s, ev) => has(ev, 'enq-wait', 'LINKRPT') },
        { item: '原因の SALESUPD を取り消した', fn: (s, ev) => has(ev, 'cancel', 'SALESUPD') },
        { item: '利用者の LINKRPT は取り消していない', fn: (s, ev) => !has(ev, 'cancel', 'LINKRPT') },
        { item: 'LINKRPT が CC 0000 で終わった', fn: s => s.linkResult('LINKRPT') === 'CC 0000' },
      ],
      solution: [
        { op: 'TERM', sub: 'LINKRPT', say: '（利用者役）LINKRPT を SUB。$HASP373 の後に IEF861I・IEF863I（DSN=USER01.SALES.DATA）・IEF099I が出て止まる。' },
        { op: 'CMD', in: 'D A,L', say: '実行中のジョブを確認。SALESUPD が動いている。LINKRPT は DISP=OLD（排他）で同じデータセットを使うので待っている。' },
        { op: 'CMD', in: 'C SALESUPD', say: '業務担当の了解どおり SALESUPD を取り消す。データセットが空き、LINKRPT が自動で進んで RC=0000 で終わる。' },
      ],
      points: ['IEF099I は「待っているだけ」。時間切れにはならないので、放っておくと終わらない。', 'IEF863I のデータセット名から、同じデータセットを使っているジョブを D A,L や業務担当への確認で探す。', '取り消すのは了解を得た原因のジョブ。待っている側を取り消しても問題は解決しない。'],
      mistakes: [['C LINKRPT（待っている側を取り消す）', 'LINKRPT が S222 で終わり、利用者は結果を得られない。SALESUPD は残ったまま。'], ['FORCE SALESUPD から始める', 'IEE838I で拒否される（まず CANCEL）。']],
    },
    {
      id: 'XL3', link: true, title: '計画停止の前に、ジョブからの問い合わせに答える',
      level: '中級', time: '15分',
      story: '今夜の計画停止の直前に、利用者が月次売上レポート LINKASK を流しました。このジョブは印刷してよいかをオペレーターに尋ねてきます（WTOR）。',
      handoff: ['業務担当（売上）: 今夜は月次レポートを印刷しない。問い合わせには NO と答えること。', '運用責任者: 停止はいつもの順番で、最後に sysplex から外すこと。'],
      order: ['（利用者役）jcl-terminal のタブで LINKASK を SUB する。', '問い合わせに指示どおり応答する。', '標準の順序で停止し、V XCF で SYSA を sysplex から外す。'],
      goal: 'LINKASK が CC 0004（印刷しない）で終わり、SYSA が正しい順序で停止していること。',
      prep: UPALL, prepSay: 'SYSA 稼働中（USER01 は TSO にログオン中）。',
      checks: [
        { item: 'LINKASK の問い合わせに NO と応答した', fn: (s, ev) => has(ev, 'link-reply', 'LINKASK NO') },
        { item: 'YES と応答していない', fn: (s, ev) => !has(ev, 'link-reply', 'LINKASK YES') },
        { item: 'LINKASK が CC 0004 で終わった（取り消していない）', fn: s => s.linkResult('LINKASK') === 'CC 0004' },
        { item: 'JES2 停止 → HALT EOD → V XCF の順', fn: (s, ev) => { const e = ev.find(x => x.type === 'eod'); return !!e && e.jes === 'DOWN' && idx(ev, 'vxcf') > idx(ev, 'eod'); } },
        { item: 'SYSA が sysplex から外れた（待機状態 0A2）', fn: s => s.phase === 'PARTITIONED' },
      ],
      solution: [
        { op: 'TERM', sub: 'LINKASK', say: '（利用者役）LINKASK を SUB。コンソールに OPR001A の問い合わせが出る。' },
        { op: 'CMD', in: 'D R,L', say: '応答待ちの一覧で、LINKASK の問い合わせの番号を確かめる。' },
        { op: 'CMD', in: 'R #OPR001A#,NO', say: '指示どおり NO。LINKASK は印刷ステップを飛ばして RC=0004 で終わる。' },
        ...SHUT.map((s, k) => k === 0 ? Object.assign({}, s, { say: 'ここから標準の停止。USER01 も IKT010D の対象になる。' }) : s),
        { op: 'CMD', in: 'V XCF,SYSA,OFFLINE' },
        { op: 'CMD', in: 'R #IXC371D#,SYSNAME=SYSA' },
      ],
      points: ['ジョブの問い合わせ（WTOR）に答えないまま停止を進めると、$P JES2 で $HASP607 になり止まらない。', '「印刷しない」は取り消し（S222）ではなく NO の応答。業務側が結果を区別できるようにする。'],
      mistakes: [['問い合わせに答えずに $P JES2', '$HASP607・$HASP608 に LINKASK が表示され、JES2 は止まらない。'], ['C LINKASK で取り消す', 'LINKASK は S222 で終わる。業務担当の指示（NO と答える）と違う。'], ['YES と応答', '月次レポートが印刷されてしまう（CC 0000）。']],
    },
    {
      id: 'XL4', link: true, title: '再起動をまたいで、保留ジョブを守る',
      level: '中級〜上級', time: '20分',
      story: '保守のため SYSA を再起動します。利用者は、夜間に流したいジョブ HOLDJOB を保留付き（TYPRUN=HOLD）で先に投入しておき、再起動が終わったら流してほしいと言っています。',
      handoff: ['利用者 USER01: HOLDJOB は再起動が終わってから解放してほしい。', '運用責任者: 再起動では JES2 のスプールを残すこと（ジョブを消さない）。'],
      order: ['（利用者役）jcl-terminal のタブで HOLDJOB を SUB する（保留のまま入力キューに残る）。', '標準の順序で停止し、HALT EOD の後に HMC からシステムリセットする。', 'ロードパラメーター 0A8200M1 で IPL し、スプールを残して JES2 を起動、VTAM・TCP/IP・TSO を起動する。', 'HOLDJOB が残っていて保留中であることを JES2 コマンドで確かめてから解放し、CC 0000 で終わるのを確認する。'],
      goal: '再起動後に HOLDJOB が解放され、CC 0000 で終わっていること。',
      prep: UPALL, prepSay: 'SYSA 稼働中（USER01 は TSO にログオン中）。',
      checks: [
        { item: '再起動の前には解放していない', fn: (s, ev) => { const r = idx(ev, 'reset'); const a = idx(ev, 'jes-job', 'A HOLDJOB'); return r >= 0 && (a < 0 || a > r); } },
        { item: '再起動後の JES2 はウォームスタート（スプールを残した）', fn: (s, ev) => { const r = idx(ev, 'reset'); return r >= 0 && ev.slice(r).some(e => e.type === 'jes-start' && /^WARM/.test(e.detail)) && !ev.slice(r).some(e => e.type === 'jes-start' && /^COLD/.test(e.detail)); } },
        { item: '$DJ で確かめてから $AJ で解放した', fn: (s, ev) => { const d = idx(ev, 'jes-job', 'D HOLDJOB'), a = idx(ev, 'jes-job', 'A HOLDJOB'); return d >= 0 && a > d; } },
        { item: 'HOLDJOB が CC 0000 で終わった', fn: s => s.linkResult('HOLDJOB') === 'CC 0000' },
      ],
      solution: [
        { op: 'TERM', sub: 'HOLDJOB', say: '（利用者役）HOLDJOB を SUB。$HASP100 は出るが、保留中なので始まらない。' },
        ...SHUT,
        { op: 'RESET', say: 'HMC からシステムリセット（保守作業）。' },
        { op: 'LOAD', addr: '0A80', lp: '0A8200M1' },
        { op: 'CMD', in: 'R #$HASP426#,WARM', say: 'スプールを残すので WARM。COLD だと HOLDJOB は消える。' },
        { op: 'CMD', in: '$S' }, { op: 'CMD', in: 'S VTAM' }, { op: 'CMD', in: 'S TCPIP' }, { op: 'CMD', in: 'S TSO' },
        { op: 'CMD', in: "$DJ'HOLDJOB'", say: 'HOLDJOB が入力キューに残っていて HOLD=(JOB) であることを確認。' },
        { op: 'CMD', in: "$AJ'HOLDJOB'", say: '解放 → $HASP373 → $HASP395 RC=0000。' },
      ],
      points: ['入力キューのジョブはスプールにあるので、ウォームスタートなら再起動をまたいで残る。コールドスタートではすべて消える。', '保留ジョブは $DJ で状態を確かめてから $AJ で解放する。'],
      mistakes: [['再起動後に COLD で JES2 を起動', 'HOLDJOB を含むスプール上のジョブと出力がすべて消える。利用者は投入し直しになる。'], ['停止前に $AJ で解放', '停止作業中に HOLDJOB が走りだし、$P JES2 の妨げになる。利用者の依頼とも違う。']],
    },
  );

  // シナリオを用意する（prep まで実行）。挑戦開始時点の時刻と操作履歴の位置を返す
  // Mock を渡すと、連携演習では模擬の jcl-terminal（link-mock.js）を相手にする（ページの模範解答とテスト用）。
  // シミュレータの挑戦モードでは Mock を渡さず、別タブの本物の jcl-terminal とつなぐ。
  function setup(Sim, x, Mock) {
    const s = new Sim({ scenarios: x.scenarios || [], triggers: x.triggers, jobs: x.jobs, linkDurations: x.linkDurations });
    const term = x.link && Mock ? new Mock.MockTerm(s) : null;
    const ctx = { sim: s, term };
    for (const st of x.prep || []) exec(ctx, st);
    ctx.start = new Date(s.clock.getTime()); ctx.evFrom = s.events.length;
    return ctx;
  }
  function exec(ctx, st) {
    const r = execStep(ctx.sim, st, ctx.term);
    if (ctx.term) ctx.term.flush();
    return r;
  }
  function execStep(s, st, term) {
    if (st.op === 'TERM') { if (term) term.submit(st.sub); return {}; }
    if (st.op === 'LOAD') s.hmcLoad(st.addr, st.lp);
    else if (st.op === 'RESET') s.hmcReset();
    else if (st.op === 'WAIT') s.advance(st.min);
    else if (st.op === 'CMD') {
      const errs = [];
      const cmd = st.in.replace(/#([^#]+)#/g, (_, m) => { const p = s.pending().find(q => q.msgid === m); if (!p) { errs.push(m); return '??'; } return p.id; });
      s.command(cmd);
      return { cmd, errs };
    }
    return {};
  }
  function grade(x, ctx) {
    const ev = ctx.sim.events.slice(ctx.evFrom);
    return x.checks.map(c => ({ item: c.item, ok: !!c.fn(ctx.sim, ev, ctx.start) }));
  }
  // 模範解答を実行して、ステップごとの出力と採点を返す
  function runSolution(Sim, x, Mock) {
    const ctx = setup(Sim, x, Mock);
    const steps = x.solution.map(st => { const from = ctx.sim.out.length; const r = exec(ctx, st) || {}; return { step: st, cmd: r.cmd, errs: r.errs || [], out: ctx.sim.out.slice(from) }; });
    return { sim: ctx.sim, steps, grade: grade(x, ctx), minutes: minutes(ctx.sim, ctx.start) };
  }

  const api = { SCENARIOS: X, setup, grade, runSolution };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MvsExercises = api;
})(typeof window !== 'undefined' ? window : globalThis);
