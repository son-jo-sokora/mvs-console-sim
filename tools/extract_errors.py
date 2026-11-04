"""IPL / シャットダウン操作で起こりうるエラーを、ローカルのマニュアルコーパス（z/OS 3.2）から機械的に洗い出す。
使い方: 環境変数 ZOS_TEXT_DIR に、z/OS 3.2 マニュアル PDF をテキスト化したファイル
（ieam600_v3r2.txt、hasa100_v3r2.txt、ieah700_v3r2.txt など、ページ区切りは "=== PAGE n ===" 行）のあるフォルダを指定して
  python -I tools/extract_errors.py <出力JSON>
続けて tools/make_errors_all.py で docs/error-candidates.md を作る。
抽出条件はコード中のコメントを参照。結果は「候補」であり、一部に情報メッセージも含む。"""
import re, sys, json, os
sys.stdout.reconfigure(encoding="utf-8")
T = os.environ.get("ZOS_TEXT_DIR") or sys.exit("環境変数 ZOS_TEXT_DIR にマニュアルのテキストのフォルダを指定してください")
def load(n): return open(os.path.join(T, n), encoding="utf-8", errors="replace").read().splitlines()
def pageof(L, i):
    for k in range(i, -1, -1):
        m = re.match(r"=== PAGE (\d+) ===", L[k])
        if m: return int(m.group(1))
    return None
out = []

def msgs(fname, idpat, book, keep):
    L = load(fname)
    starts = []
    for i, ln in enumerate(L):
        s = ln.strip()
        if re.fullmatch(idpat, s) and any(x.strip() == "Explanation" for x in L[i+1:i+14]):
            starts.append(i)
    for n, i in enumerate(starts):
        end = starts[n+1] if n + 1 < len(starts) else min(i + 400, len(L))
        blk = L[i:end]
        body = "\n".join(blk)
        head = " ".join(x.strip() for x in blk[1:6] if x.strip() and x.strip() != "Explanation" and not x.startswith("==="))[:120]
        why = keep(L[i].strip(), body)
        if why:
            out.append(dict(kind="msg", id=L[i].strip(), text=head, book=book, page=pageof(L, i), why=why))

# 1) IEA messages issued during system initialization that need operator action or stop the system
def keep_iea(mid, body):
    src = re.search(r"\nSource\n(.*)", body)
    src = src.group(1) if src else ""
    init = re.search(r"IPL|NIP|nucleus initialization|system initialization|initial program load", src + body[:1500], re.I)
    if not init: return None
    sfx = mid[-1]
    if sfx in "ADW": return "初期化中の応答要求/待機 (" + sfx + ")"
    if re.search(r"wait state", body, re.I) and re.search(r"enters? (a )?(non-?restartable|disabled) wait", body, re.I): return "初期化中に待機状態へ"
    if re.search(r"IEA336A|IEA341A|IEA906A|IEA332A|reIPL|re-IPL", body): return "初期化中のエラー（再指定/再IPL）"
    return None
msgs("ieam600_v3r2.txt", r"IEA\d{3}[A-Z]", "Vol6 SA38-0673-70", keep_iea)

# 2) IXC (XCF) initialization prompts / partition during IPL & shutdown
def keep_ixc(mid, body):
    if mid[-1] in "AD" and re.search(r"initializ|IPL|VARY XCF|sysplex", body[:2500], re.I): return "XCF 初期化・停止時の応答要求"
    return None
msgs("ieama00_v3r2.txt", r"IXC\d{3}[A-Z]", "Vol10 SA38-0677-70", keep_ixc)

# 3) JES2 initialization / termination messages (modules HASPIR*, HASPTERM, $PJES2 related)
def keep_jes(mid, body):
    mod = re.search(r"\nModule\n(.*)", body)
    mod = mod.group(1) if mod else ""
    if re.search(r"HASPIR|HASPTERM|HASPWARM|HASPIRA|HASPIRDA|HASPIRMA", mod) and re.search(r"waits for the operator|reply|ends|terminat|RESPECIFY|RESTART", body, re.I):
        return "JES2 初期化/終了 (" + mod.strip()[:30] + ")"
    if re.search(r"\$P ?JES2", body[:1500]) : return "$P JES2 関連"
    return None
msgs("hasa100_v3r2.txt", r"\$HASP\d{3,4}", "JES2 Messages SA32-0989-70", keep_jes)

# 3b) operator command errors used in IPL/shutdown (REPLY/START/STOP/CANCEL/FORCE/HALT/VARY XCF)
def keep_iee(mid, body):
    ex = body[:1800]
    if re.search(r"\b(REPLY|CANCEL|FORCE|HALT|STOP|START|MODIFY)\b command|entered a (REPLY|CANCEL|FORCE|HALT|STOP|START)|\b(CANCEL|FORCE) command|REPLY command", ex) and re.search(r"(rejects|ignores|does not process|not executed|INVALID|NOT ACTIVE|NOT OUTSTANDING|DUPLICATE|REJECTED)", ex):
        return "操作コマンドのエラー"
    return None
msgs("ieam700_v3r2.txt", r"IEE\d{3}[A-Z]", "Vol7 SA38-0674-70", keep_iee)
def keep_iefc(mid, body):
    if re.search(r"START command|started task|PROCEDURE", body[:1500]) and re.search(r"NOT FOUND|ERROR|rejects|ends", body[:1500]): return "START 時のエラー"
    return None
msgs("ieam800_v3r2.txt", r"IEFC\d{3}I", "Vol8 SA38-0675-70", keep_iefc)

# 4) Wait state codes related to IPL/NIP or shutdown
L = load("ieah700_v3r2.txt")
starts = [i for i, ln in enumerate(L) if re.fullmatch(r"[0-9A-F]{3}", ln.strip()) and 34000 < i < 41500 and any(x.strip() == "Explanation" for x in L[i+1:i+5])]
for n, i in enumerate(starts):
    end = starts[n+1] if n + 1 < len(starts) else i + 200
    body = "\n".join(L[i:end])
    if re.search(r"initial program load|\bIPL\b|nucleus initialization|NIP|LOADxx|IODF|SYSRES|master catalog|IEASYS|HALT EOD|VARY XCF", body, re.I):
        head = " ".join(x.strip() for x in L[i+2:i+5] if x.strip())[:120]
        out.append(dict(kind="wait", id=L[i].strip(), text=head, book="System Codes SA38-0665-70", page=pageof(L, i+2), why="IPL/NIP 関連の待機状態"))

json.dump(out, open(sys.argv[1], "w", encoding="utf-8"), ensure_ascii=False, indent=0)
from collections import Counter
print(Counter(o["kind"] + ":" + o["book"] for o in out))
print(len(out))
