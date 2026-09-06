# Sicher & Konform — IT-Sicherheit & Compliance in Österreich

Eine mehrseitige Informationsplattform zu **NISG 2026**, **ISO/IEC 27001** und **DSGVO**,
aufbereitet für technische wie nicht-technische Leserinnen und Leser sowie für
Geschäftsführung und Vorstand — mit interaktiven Werkzeugen und Generatoren.

## Aufbau

```
index.html                      Startseite
grundlagen.html                 Informationssicherheit ohne Vorkenntnisse
nisg-2026.html                  Das österreichische Cybersicherheitsgesetz
iso-27001.html                  Die Norm für Managementsysteme
dsgvo.html                      Datenschutz-Grundverordnung
vergleich.html                  Gegenüberstellung + Überschneidungsmatrix
fuer-die-fuehrung.html          Kompaktbriefing für die Leitungsebene
umsetzung.html                  Umsetzungsfahrplan
glossar.html                    Durchsuchbares Glossar
quellen.html                    Offizielle Quellen und Anlaufstellen
ueber.html                      Über die Plattform, Methodik
barrierefreiheit.html           Erklärung zur Barrierefreiheit
tools/                          Werkzeuge und Generatoren
assets/css | js | data | img    Stylesheet, Skripte, Datensätze, Grafiken
_build/                         Generator und Inhaltsfragmente
```

## Bauen

Die ausgelieferten HTML-Dateien sind eingecheckt; die Seite läuft ohne Build-Schritt.
Nach Änderungen an `_build/content/` oder am Seitengerüst in `_build/build.py`:

```sh
python3 _build/build.py
```

Der Generator setzt jedes Fragment aus `_build/content/` mit dem gemeinsamen Gerüst
(Kopfzeile, Navigation, Fußzeile) zusammen und schreibt das Ergebnis in den Projektstamm.
Es werden keine externen Pakete benötigt.

Lokal ansehen:

```sh
python3 -m http.server 8000
```

## Technische Grundsätze

- **Keine Abhängigkeiten.** Reines HTML, CSS und JavaScript ohne Framework und ohne Build-Kette
  im Auslieferungspfad.
- **Keine Drittanbieter-Ressourcen.** Ausschließlich Systemschriften, keine externen Fonts,
  keine CDNs, kein Tracking, keine Cookies — auf einer Seite über Datenschutz wäre alles
  andere widersprüchlich.
- **Rechnen im Browser.** Sämtliche Werkzeuge werten Eingaben lokal aus. Nichts wird übertragen
  oder gespeichert.
- **Barrierefreiheit.** Ziel ist WCAG 2.2 Stufe AA: semantische Struktur, Tastaturbedienbarkeit,
  sichtbarer Fokus, ausreichende Kontraste in hellem und dunklem Farbschema, Beschriftungen für
  alle Bedienelemente, `prefers-reduced-motion`, Zoom bis 200 %.
- **Progressive Verbesserung.** Alle Inhalte sind ohne JavaScript lesbar; die Werkzeuge weisen
  in diesem Fall darauf hin.

## Inhaltlicher Stand

Redaktioneller Stand: September 2026. Die Inhalte fassen öffentlich zugängliche Informationen
aus Rechtstexten, behördlichen Informationsangeboten und Publikationen der Wirtschaftskammer
zusammen. Sie stellen **keine Rechtsberatung** dar; maßgeblich sind ausschließlich die
geltenden Rechtstexte in ihrer jeweils gültigen Fassung.

Quellenübersicht: [`quellen.html`](quellen.html)
