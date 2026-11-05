"""extract_errors.py の JSON から docs/error-candidates.md を作る。engine.js で再現している ID に ✓ を付ける。
使い方: python -I tools/make_errors_all.py <JSON> engine.js msgref.js docs/error-candidates.md"""
import json, re, sys
data = json.load(open(sys.argv[1], encoding="utf-8"))
eng = open(sys.argv[2], encoding="utf-8").read()
ref = open(sys.argv[3], encoding="utf-8").read()
used = set(re.findall(r"(\$HASP\d{3,4}|\b[A-Z]{3,4}\d{3,4}[A-Z])", eng))
waits = set(re.findall(r"_waitState\('([0-9A-F]{3})'", eng)) | {"0A2"}
# 参照のみ（シミュレータ注記で案内）
noted = set(re.findall(r"'(\$HASP\d{3,4}|[A-Z]{3,4}\d{3,4}[A-Z])':", ref)) - used
groups = [
    ("A. IPL / NIP（IEA メッセージ、Vol 6）", lambda o: o["id"].startswith("IEA")),
    ("B. XCF / sysplex（IXC メッセージ、Vol 10）", lambda o: o["id"].startswith("IXC")),
    ("C. JES2 初期化・終了（$HASP メッセージ）", lambda o: o["id"].startswith("$HASP")),
    ("D. 操作コマンドのエラー（IEE / IEFC メッセージ、Vol 7 / Vol 8）", lambda o: o["id"].startswith(("IEE", "IEFC"))),
    ("E. IPL / NIP 中の待機状態コード（System Codes）", lambda o: o["kind"] == "wait"),
]
L = ["# マニュアルから抽出した IPL / シャットダウン関連エラー候補（全件）", "",
     "`tools/extract_errors.py` で z/OS 3.2 のマニュアル本文から機械抽出した一覧です。",
     "抽出条件: 初期化（IPL/NIP）中に出る応答要求（A/D）・待機（W）メッセージ、再指定や再IPLを求めるエラー、XCF の初期化／停止時の応答要求、",
     "JES2 の初期化・終了モジュールが出す応答要求／終了メッセージ、操作コマンドが拒否されるメッセージ、IPL/NIP に関係する待機状態コード。",
     "機械抽出のため、一部に情報メッセージ（エラーでないもの）も混じります。",
     "", "凡例: ✓＝シミュレータで再現（tests でテスト）、△＝解説のみ（シミュレータ内の注記・解説パネル）、空欄＝未対応", "",
     "メッセージの文面と説明は IBM のマニュアルの文章なので、この一覧には写していません。「出典」のページ（PDF のページ番号）で本文を確認してください。", ""]
total = 0; impl = 0
for title, f in groups:
    rows = [o for o in data if f(o)]
    if not rows: continue
    L += ["## " + title + f"（{len(rows)} 件）", "", "| 対応 | ID | 抽出した理由 | 出典 |", "|---|---|---|---|"]
    for o in rows:
        total += 1
        if o["kind"] == "wait":
            mark = "✓" if o["id"] in waits else ""
        else:
            mark = "✓" if o["id"] in used else ("△" if o["id"] in noted else "")
        impl += mark == "✓"
        # マニュアルの文面・説明は IBM の著作物なので載せない。抽出の条件（このプロジェクトの言葉）と出典ページだけ
        why = o["why"].replace("|", "/")
        L.append(f"| {mark} | `{o['id']}` | {why} | {o['book']} p.{o['page']} |")
    L.append("")
L.insert(8, f"**合計 {total} 件**（うちシミュレータで再現 {impl} 件）。シミュレータで扱うエラーの詳細とテスト対応は [error-catalog.md](error-catalog.md) を参照。")
L.insert(9, "")
open(sys.argv[4], "w", encoding="utf-8").write("\n".join(L) + "\n")
print(total, impl)
