#!/usr/bin/env python3
"""
Statischer Seitengenerator für die Informationsplattform.

Liest Inhaltsfragmente aus _build/content/ und setzt sie mit dem gemeinsamen
Seitengerüst (Kopf, Navigation, Fußzeile) zu fertigen HTML-Dateien im
Projektstamm zusammen. Kein externes Paket nötig: python3 _build/build.py
"""
from __future__ import annotations

import html
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTENT = ROOT / "_build" / "content"

SITE_NAME = "Sicher &amp; Konform"
SITE_SUB = "IT-Sicherheit &amp; Compliance in Österreich"
STAND = "September 2026"

# Navigation: (Schlüssel, Beschriftung, Pfad ab Stammverzeichnis)
NAV = [
    ("grundlagen", "Grundlagen", "grundlagen.html"),
    ("nisg", "NISG 2026", "nisg-2026.html"),
    ("iso", "ISO 27001", "iso-27001.html"),
    ("dsgvo", "DSGVO", "dsgvo.html"),
    ("vergleich", "Vergleich", "vergleich.html"),
    ("fuehrung", "Für die Führung", "fuer-die-fuehrung.html"),
    ("tools", "Werkzeuge", "tools/index.html"),
]

FOOTER_COLS = [
    ("Regelwerke", [
        ("NISG 2026 verstehen", "nisg-2026.html"),
        ("ISO/IEC 27001", "iso-27001.html"),
        ("DSGVO", "dsgvo.html"),
        ("Alle drei im Vergleich", "vergleich.html"),
    ]),
    ("Werkzeuge", [
        ("Betroffenheits-Check", "tools/betroffenheitscheck.html"),
        ("Reifegrad-Bewertung", "tools/reifegrad.html"),
        ("Meldefristen-Rechner", "tools/meldefristen.html"),
        ("Richtlinien-Generator", "tools/richtlinien-generator.html"),
        ("Alle Werkzeuge", "tools/index.html"),
    ]),
    ("Einstieg", [
        ("Grundlagen der Informationssicherheit", "grundlagen.html"),
        ("Kompakt für Geschäftsführung", "fuer-die-fuehrung.html"),
        ("Umsetzungsfahrplan", "umsetzung.html"),
        ("Glossar", "glossar.html"),
    ]),
    ("Offizielles", [
        ("Quellen &amp; Anlaufstellen", "quellen.html"),
        ("Über diese Plattform", "ueber.html"),
        ("Barrierefreiheit", "barrierefreiheit.html"),
    ]),
]

ICON_MARK = (
    '<svg class="brand__mark" width="26" height="26" viewBox="0 0 24 24" fill="none" '
    'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" '
    'aria-hidden="true" focusable="false">'
    '<path d="M12 2.5 4 5.6v6.1c0 4.6 3.2 8.3 8 9.8 4.8-1.5 8-5.2 8-9.8V5.6L12 2.5Z"/>'
    '<path d="M9.2 11.9h5.6"/><path d="M12 9.1v5.6"/></svg>'
)

ICON_MENU = (
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
    'stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false">'
    '<path d="M4 7h16M4 12h16M4 17h16"/></svg>'
)

ICON_SUN = (
    '<svg data-icon="sun" width="17" height="17" viewBox="0 0 24 24" fill="none" '
    'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" '
    'focusable="false" hidden><circle cx="12" cy="12" r="4"/>'
    '<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2'
    'M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
)

ICON_MOON = (
    '<svg data-icon="moon" width="17" height="17" viewBox="0 0 24 24" fill="none" '
    'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" '
    'aria-hidden="true" focusable="false">'
    '<path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.5 8.5 0 1 0 10.2 10.2Z"/></svg>'
)

TEMPLATE = """<!DOCTYPE html>
<html lang="de-AT" prefix="og: https://ogp.me/ns#">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title_esc} — Sicher &amp; Konform</title>
<meta name="description" content="{desc_esc}">
<meta name="author" content="Sicher &amp; Konform — IT-Sicherheit &amp; Compliance in Österreich">
<meta name="robots" content="index, follow">
<meta property="og:type" content="website">
<meta property="og:locale" content="de_AT">
<meta property="og:title" content="{title_esc}">
<meta property="og:description" content="{desc_esc}">
<meta property="og:site_name" content="Sicher &amp; Konform">
<meta name="theme-color" content="#FBFAF7" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#14161A" media="(prefers-color-scheme: dark)">
<link rel="stylesheet" href="{up}assets/css/site.css">
<link rel="icon" href="{up}assets/img/favicon.svg" type="image/svg+xml">
<script>
/* Farbschema vor dem ersten Rendern setzen, damit nichts aufblitzt. */
(function(){{try{{var t=localStorage.getItem('issec.theme');
if(t==='dark'||t==='light'){{document.documentElement.setAttribute('data-theme',t);}}}}catch(e){{}}}})();
</script>
</head>
<body>
<a class="skip-link" href="#inhalt">Zum Hauptinhalt springen</a>

<header class="masthead">
  <div class="masthead__inner">
    <a class="brand" href="{up}index.html">
      {mark}
      <span class="brand__text">
        <span class="brand__name">Sicher &amp; Konform</span>
        <span class="brand__sub">IT-Sicherheit &amp; Compliance AT</span>
      </span>
    </a>
    <button class="nav__toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="hauptnavigation">
      {menu}<span>Menü</span>
    </button>
    <nav class="nav" id="hauptnavigation" aria-label="Hauptnavigation">
      <ul class="nav__list">
{navitems}
      </ul>
    </nav>
    <button class="theme-toggle" type="button" data-theme-toggle aria-pressed="false"
            aria-label="Dunkles Farbschema aktivieren" title="Dunkles Farbschema aktivieren">
      {sun}{moon}
    </button>
  </div>
</header>

<main id="inhalt">
{body}
</main>

<footer class="footer">
  <div class="shell">
    <div class="footer__grid">
{footercols}
    </div>
    <div class="footer__bottom">
      <p><strong>Keine Rechtsberatung.</strong> Diese Plattform bereitet öffentlich zugängliche
      Informationen redaktionell auf. Maßgeblich sind ausschließlich die geltenden Rechtstexte in
      ihrer jeweils gültigen Fassung. Für Entscheidungen im Einzelfall ziehen Sie bitte fachliche
      oder rechtliche Beratung bei.</p>
      <p class="num">Redaktioneller Stand: {stand} · Alle Werkzeuge rechnen ausschließlich
      im Browser · Keine Cookies, kein Tracking, keine Drittanbieter-Ressourcen</p>
    </div>
  </div>
</footer>

<script src="{up}assets/js/site.js" defer></script>
{extra_js}
</body>
</html>
"""


def parse_meta(raw: str):
    m = re.match(r"\s*<!--meta\s*(.*?)-->\s*", raw, re.S)
    if not m:
        raise SystemExit("Fragment ohne <!--meta ... --> Block")
    meta = {}
    for line in m.group(1).strip().splitlines():
        line = line.strip()
        if not line or ":" not in line:
            continue
        key, _, value = line.partition(":")
        meta[key.strip()] = value.strip()
    return meta, raw[m.end():]


def build_nav(active: str, up: str) -> str:
    out = []
    for key, label, path in NAV:
        current = ' aria-current="page"' if key == active else ""
        out.append(
            f'        <li><a class="nav__link" href="{up}{path}"{current}>{label}</a></li>'
        )
    return "\n".join(out)


def build_footer(up: str) -> str:
    blocks = []
    for heading, links in FOOTER_COLS:
        items = "\n".join(
            f'          <li><a href="{up}{href}">{label}</a></li>' for label, href in links
        )
        blocks.append(
            f"      <section>\n        <h2>{heading}</h2>\n"
            f"        <ul>\n{items}\n        </ul>\n      </section>"
        )
    return "\n".join(blocks)


def render(fragment: pathlib.Path) -> tuple[pathlib.Path, str]:
    raw = fragment.read_text(encoding="utf-8")
    meta, body = parse_meta(raw)

    rel = fragment.relative_to(CONTENT)
    depth = len(rel.parts) - 1
    up = "../" * depth

    body = body.replace("{{up}}", up)

    extra = ""
    for script in filter(None, (s.strip() for s in meta.get("js", "").split(","))):
        extra += f'<script src="{up}assets/js/{script}" defer></script>\n'

    page = TEMPLATE.format(
        title_esc=meta["title"],
        desc_esc=html.escape(meta.get("desc", ""), quote=True),
        up=up,
        mark=ICON_MARK,
        menu=ICON_MENU,
        sun=ICON_SUN,
        moon=ICON_MOON,
        navitems=build_nav(meta.get("nav", ""), up),
        footercols=build_footer(up),
        body=body.strip(),
        stand=STAND,
        extra_js=extra,
    )
    return ROOT / rel, page


def main() -> int:
    fragments = sorted(CONTENT.rglob("*.html"))
    if not fragments:
        print("Keine Inhaltsfragmente gefunden.", file=sys.stderr)
        return 1
    for fragment in fragments:
        target, page = render(fragment)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(page, encoding="utf-8")
        print(f"  {target.relative_to(ROOT)}  ({len(page):,} Zeichen)".replace(",", "."))
    print(f"\n{len(fragments)} Seiten erzeugt.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
