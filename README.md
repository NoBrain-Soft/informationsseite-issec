# Sicher & Konform — IT-Sicherheit & Compliance in Österreich

Eine mehrseitige Informationsplattform zu **NISG 2026**, **ISO/IEC 27001** und **DSGVO**,
aufbereitet für technische wie nicht-technische Leserinnen und Leser sowie für
Geschäftsführung und Vorstand — mit acht interaktiven Werkzeugen und Generatoren.

Redaktioneller Stand: **September 2026**.

## Inhalt

### Seiten

| Datei | Inhalt |
|---|---|
| `index.html` | Einstieg über drei Zielgruppen-Bahnen, Kennzahlen, Fristenkette, Werkzeugübersicht, fünf verbreitete Irrtümer |
| `grundlagen.html` | Informationssicherheit ohne Vorkenntnisse: Schutzziele, Begriffsabgrenzung, Ablauf eines Angriffs, Risikobegriff |
| `nisg-2026.html` | Das Gesetz im Detail: 18 Sektoren, Größenschwellen, öffentliche Verwaltung, wesentlich/wichtig, alle Pflichten, Aufsicht, Sanktionen |
| `iso-27001.html` | Klauseln 4–10, die 93 Maßnahmen des Anhangs A, Pflichtdokumente, Zertifizierungsablauf, Verhältnis zum NISG |
| `dsgvo.html` | Grundsätze, Rechtsgrundlagen, Pflichten, Betroffenenrechte, Datenpanne, Sanktionen samt österreichischem DSG |
| `vergleich.html` | Gegenüberstellung, Überschneidungsmatrix der zehn Maßnahmenbereiche, Diagramm der parallelen Meldeketten |
| `fuer-die-fuehrung.html` | Kompaktbriefing: nicht delegierbare Pflichten, zwölf Prüffragen, Managementbeschluss, Kennzahlen, erste 24 Stunden |
| `umsetzung.html` | Fahrplan in fünf Phasen, Rollen, acht Kerndokumente, sieben häufige Fehler |
| `glossar.html` | 33 Begriffe mit Volltext- und Themenfilter |
| `quellen.html` | Primärquellen, Behörden, Anlaufstellen, Umgang mit Quellen |
| `ueber.html`, `barrierefreiheit.html` | Methodik, Datenschutz, Konformitätserklärung |

### Werkzeuge (`tools/`)

| Werkzeug | Was es tut |
|---|---|
| `betroffenheitscheck.html` | Fünf Schritte durch Sektor, Teilsektor, Größenklasse und Sonderfälle. Bildet auch die größenunabhängig erfassten Tätigkeiten, den Opt-in der Länder und die Ausnahme für Gemeinden ab |
| `reifegrad.html` | 40 Fragen entlang der zehn Maßnahmenbereiche des § 32, Profil je Bereich, priorisierte Lückenliste, Textbericht |
| `meldefristen.html` | Stichzeiten nach NISG und DSGVO ab dem Zeitpunkt der Kenntnis, laufende Restzeit, Kalenderexport (RFC 5545), Vorfallprotokoll |
| `richtlinien-generator.html` | Rohfassungen der sechs Kerndokumente als Markdown, offene Entscheidungen sichtbar markiert |
| `vvt-generator.html` | Verarbeitungsverzeichnis nach Art. 30 DSGVO mit zehn Vorlagen, CSV-Export |
| `lieferkette.html` | Kritikalitätseinstufung von Dienstleistern, abgeleitete Vertrags- und Prüfanforderungen, CSV-Export |
| `notfallkarte.html` | Druckbare Karte mit Erstmaßnahmen, Meldekette, Fristen und externen Stellen |
| `passwort.html` | Passphrasen und Zufallspasswörter über `crypto.getRandomValues`, mit ehrlicher Entropieangabe |

### Datensätze (`assets/data/`)

- `sektoren.json` — 18 Sektoren, 47 Teilsektoren mit erfassten Arten von Einrichtungen und Sonderregeln
- `massnahmen.json` — die zehn Maßnahmenbereiche des § 32 mit Prüffragen und Zuordnung zu ISO 27001 und DSGVO
- `glossar.json` — 33 Glossareinträge
- `woerter.json` — 781 Wörter für den Passphrasen-Generator (9,61 Bit je Wort)

## Bauen

Die ausgelieferten HTML-Dateien sind eingecheckt; die Seite läuft ohne Build-Schritt.
Nach Änderungen an `_build/content/` oder am Seitengerüst in `_build/build.py`:

```sh
python3 _build/build.py
```

Der Generator setzt jedes Fragment aus `_build/content/` mit dem gemeinsamen Gerüst
(Kopfzeile, Navigation, Fußzeile) zusammen und schreibt das Ergebnis in den Projektstamm.
`{{include:pfad}}` bindet eine Datei wörtlich ein — so stehen die Datensätze direkt in
den Werkzeugseiten und funktionieren ohne Netzwerkzugriff, auch lokal über `file://`.
Es werden keine externen Pakete benötigt.

Lokal ansehen:

```sh
python3 -m http.server 8000
```

## Technische Grundsätze

- **Keine Abhängigkeiten.** Reines HTML, CSS und JavaScript ohne Framework.
- **Keine Drittanbieter-Ressourcen.** Ausschließlich Systemschriften, keine externen Fonts,
  keine CDNs, kein Tracking, keine Cookies — auf einer Seite über Datenschutz wäre alles
  andere widersprüchlich. Im Browser geprüft: null seiteninitiierte externe Requests.
- **Rechnen im Browser.** Sämtliche Werkzeuge werten Eingaben lokal aus. Nichts wird
  übertragen oder gespeichert; einzige gespeicherte Einstellung ist die Wahl des Farbschemas.
- **Barrierefreiheit.** Ziel ist WCAG 2.2 Stufe AA: semantische Struktur, Tastaturbedienbarkeit,
  sichtbarer Fokus, ausreichende Kontraste in hellem und dunklem Schema, Beschriftungen für
  alle Bedienelemente, `prefers-reduced-motion`, Zoom bis 200 %.
- **Progressive Verbesserung.** Alle Inhalte sind ohne JavaScript lesbar — auch das
  vollständige Glossar und alle Sektorentabellen. Die Werkzeuge weisen dann sichtbar darauf hin.

## Geprüft

Mit Chromium automatisiert geprüft (Skripte nicht Teil des Repositories):

- 21 Seiten ohne Konsolen- oder Ladefehler, genau eine `h1` je Seite, lückenlose
  Überschriftenhierarchie, keine defekten Verweise oder Anker
- Kontraste in hellem und dunklem Schema auf allen Kernseiten, einschließlich der
  dynamisch erzeugten Ergebnisbereiche
- Kein horizontaler Überlauf bei 320 px Breite und bei 200 % Zoom
- Tastaturbedienung, Sprunglink, Fokusdarstellung, Farbschema-Umschalter, mobile Navigation
- Inhalte ohne JavaScript vollständig lesbar
- 55 Funktionsprüfungen der Werkzeuge, darunter eine Wahrheitstabelle der Einstufungslogik
  über 15 Fälle, die Fristenarithmetik einschließlich Monatsende-Überlauf, die
  RFC-5545-Konformität des Kalenderexports und die Gleichverteilung des Passphrasen-Generators

## Inhaltlicher Stand

Die Inhalte fassen öffentlich zugängliche Informationen aus Rechtstexten, behördlichen
Informationsangeboten und Publikationen der Wirtschaftskammer zusammen. Sie stellen
**keine Rechtsberatung** dar; maßgeblich sind ausschließlich die geltenden Rechtstexte in
ihrer jeweils gültigen Fassung. Normtexte der ISO sind urheberrechtlich geschützt und werden
nicht im Wortlaut zitiert.

Quellenübersicht: [`quellen.html`](quellen.html)
