import pathlib, re, collections
routes = []
for f in pathlib.Path("app").rglob("page.tsx"):
    parts = f.parent.parts[1:]
    if any(p.startswith("(.") or p.startswith("@") for p in parts): continue
    segs = [p for p in parts if not (p.startswith("(") and p.endswith(")"))]
    rx = "".join("/" + (".+" if p.startswith("[...") else "[^/]+" if p.startswith("[") else re.escape(p)) for p in segs) or "/"
    routes.append(re.compile("^" + rx + "$"))
for f in pathlib.Path("app").rglob("route.*"): pass

dead, missing, fake = [], [], []
skip = ("(admin)", "/admin")
for root in ("app", "components"):
    for f in pathlib.Path(root).rglob("*.tsx"):
        if any(x in str(f) for x in skip): continue
        s = f.read_text(errors="ignore")
        for m in re.finditer(r'href=(?:"([^"]*)"|\'([^\']*)\')', s):
            h = m.group(1) if m.group(1) is not None else m.group(2)
            line = s[:m.start()].count("\n") + 1
            if h in ("", "#"): dead.append(f"{f}:{line}  href=\"{h}\"")
            elif h.startswith("/") and not h.startswith("//"):
                path = re.split(r"[?#]", h)[0].rstrip("/") or "/"
                if not any(r.match(path) for r in routes) and not path.startswith(("/api", "/_next", "/org-logos", "/state-logos", "/illustrations", "/icons")):
                    missing.append(f"{f}:{line}  {h}")
        for m in re.finditer(r"<a\b(?![^>]*\bhref)[^>]*>", s):
            dead.append(f"{f}:{s[:m.start()].count(chr(10)) + 1}  <a> without href")
        for m in re.finditer(r"<button\b([^>]*)>\s*([A-Za-z][^<{]{2,40})\s*</button>", s):
            attrs, text = m.group(1), m.group(2).strip()
            if re.search(r"view all|see all|learn more|read more|browse|explore|know more", text, re.I) and "onClick" not in attrs and 'type="submit"' not in attrs:
                fake.append(f"{f}:{s[:m.start()].count(chr(10)) + 1}  button \"{text}\" does nothing")
def show(title, rows):
    print(f"\n{title} ({len(rows)})")
    for r in rows[:60]: print("  " + r)
show("DEAD LINKS", dead); show("LINKS TO PAGES THAT DO NOT EXIST", missing); show("BUTTONS THAT LOOK LIKE LINKS BUT DO NOTHING", fake)
