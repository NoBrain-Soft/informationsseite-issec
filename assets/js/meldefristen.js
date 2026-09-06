/* =========================================================================
   Meldefristen-Rechner
   Berechnet aus dem Zeitpunkt der Kenntnis die Stichzeiten nach NISG 2026
   und DSGVO, erzeugt Kalendereinträge (ICS) und ein Protokoll.
   Rechnet lokal, kein Netzwerkzugriff.
   ========================================================================= */
(function () {
  'use strict';

  var werkzeug = document.getElementById('werkzeug');
  if (!werkzeug) return;
  werkzeug.hidden = false;

  var datumFeld = document.getElementById('datum');
  var zeitFeld = document.getElementById('zeit');
  var ergebnisBereich = document.getElementById('ergebnisbereich');
  var ergebnis = document.getElementById('ergebnis');

  var letzteFristen = null;
  var letzterZeitpunkt = null;
  var tickerId = null;

  function jetztEinsetzen() {
    var d = new Date();
    datumFeld.value = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0')
    ].join('-');
    zeitFeld.value = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  jetztEinsetzen();
  document.getElementById('jetzt').addEventListener('click', jetztEinsetzen);

  function kenntniszeitpunkt() {
    if (!datumFeld.value || !zeitFeld.value) return null;
    var teile = datumFeld.value.split('-').map(Number);
    var uhr = zeitFeld.value.split(':').map(Number);
    var d = new Date(teile[0], teile[1] - 1, teile[2], uhr[0], uhr[1], 0, 0);
    return isNaN(d.getTime()) ? null : d;
  }

  function plusStunden(d, h) { return new Date(d.getTime() + h * 3600000); }

  function plusMonat(d) {
    var ziel = new Date(d.getTime());
    var tag = ziel.getDate();
    ziel.setMonth(ziel.getMonth() + 1);
    // Monatsende korrigieren: 31.01. + 1 Monat ergibt sonst den 03.03.
    if (ziel.getDate() !== tag) ziel.setDate(0);
    return ziel;
  }

  function fristenBerechnen(start) {
    var pbd = document.getElementById('pbd').checked;
    var hoch = document.getElementById('hohesrisiko').checked;
    var anhaltend = document.getElementById('anhaltend').checked;

    var liste = [
      {
        id: 'fruehwarnung',
        titel: 'Frühwarnung an das CSIRT',
        frist: 'binnen 24 Stunden ab Kenntnis',
        zeitpunkt: plusStunden(start, 24),
        rechtsgrund: 'NISG 2026, Meldepflichten',
        inhalt: 'Knapp halten: erster Verdacht, mutmaßlich rechtswidrige oder böswillige Handlung, mögliche grenzüberschreitende Auswirkungen. Keine vollständige Analyse abwarten.',
        klasse: 'nisg'
      },
      {
        id: 'meldung',
        titel: 'Meldung des Sicherheitsvorfalls an das CSIRT',
        frist: 'binnen 72 Stunden ab Kenntnis',
        zeitpunkt: plusStunden(start, 72),
        rechtsgrund: 'NISG 2026, Meldepflichten',
        inhalt: 'Aktualisierung der Frühwarnung: erste Bewertung von Schweregrad und Auswirkungen, Art des Vorfalls, betroffene Systeme, soweit verfügbar Kompromittierungsindikatoren.',
        klasse: 'nisg'
      }
    ];

    if (pbd) {
      liste.push({
        id: 'dsb',
        titel: 'Meldung an die Datenschutzbehörde',
        frist: 'unverzüglich, möglichst binnen 72 Stunden ab Bekanntwerden',
        zeitpunkt: plusStunden(start, 72),
        rechtsgrund: 'Art. 33 DSGVO',
        inhalt: 'Art der Verletzung, Kategorien und ungefähre Zahl betroffener Personen und Datensätze, Kontaktstelle, wahrscheinliche Folgen, ergriffene Maßnahmen. Eine Meldung mit unvollständigen Angaben ist zulässig; Fehlendes wird nachgereicht. Entfällt nur, wenn ein Risiko für die Rechte und Freiheiten voraussichtlich nicht besteht — diese Einschätzung ist zu dokumentieren.',
        klasse: 'dsgvo'
      });
    }

    if (pbd && hoch) {
      liste.push({
        id: 'betroffene',
        titel: 'Benachrichtigung der betroffenen Personen',
        frist: 'unverzüglich — keine feste Stundenfrist',
        zeitpunkt: plusStunden(start, 72),
        unscharf: true,
        rechtsgrund: 'Art. 34 DSGVO',
        inhalt: 'In klarer, einfacher Sprache: Art der Verletzung, wahrscheinliche Folgen, ergriffene Maßnahmen, Kontaktstelle. Entfällt unter anderem, wenn die Daten wirksam verschlüsselt waren und die Schlüssel nicht kompromittiert wurden.',
        klasse: 'dsgvo'
      });
    }

    liste.push({
      id: 'abschluss',
      titel: anhaltend ? 'Fortschrittsbericht an das CSIRT' : 'Abschlussbericht an das CSIRT',
      frist: 'spätestens einen Monat nach der Frühwarnung',
      zeitpunkt: plusMonat(start),
      rechtsgrund: 'NISG 2026, Meldepflichten',
      inhalt: anhaltend
        ? 'Da der Vorfall noch andauert, ist zu diesem Zeitpunkt ein Fortschrittsbericht zu erstatten. Der Abschlussbericht folgt binnen eines Monats nach Bewältigung des Vorfalls.'
        : 'Ausführliche Beschreibung, zugrunde liegende Ursache, ergriffene und laufende Abhilfemaßnahmen, gegebenenfalls grenzüberschreitende Auswirkungen.',
      klasse: 'nisg'
    });

    liste.sort(function (a, b) { return a.zeitpunkt - b.zeitpunkt; });
    return liste;
  }

  function restzeit(ziel) {
    var ms = ziel - new Date();
    if (ms <= 0) return { abgelaufen: true, text: 'Frist abgelaufen' };
    var stunden = Math.floor(ms / 3600000);
    var minuten = Math.floor((ms % 3600000) / 60000);
    if (stunden >= 48) {
      var tage = Math.floor(stunden / 24);
      return { abgelaufen: false, text: 'noch ' + tage + ' Tage ' + (stunden % 24) + ' Stunden' };
    }
    return { abgelaufen: false, text: 'noch ' + stunden + ' Std. ' + String(minuten).padStart(2, '0') + ' Min.' };
  }

  function anzeigen() {
    var start = kenntniszeitpunkt();
    if (!start) {
      ergebnis.innerHTML = '<p class="notice-inline" role="alert">Bitte geben Sie Datum und Uhrzeit der Kenntnis an.</p>';
      ergebnisBereich.hidden = false;
      return;
    }

    letzterZeitpunkt = start;
    letzteFristen = fristenBerechnen(start);

    ergebnis.innerHTML = '';

    var kopf = document.createElement('div');
    kopf.className = 'result';
    kopf.innerHTML = '<p class="verdict">Kenntnis: ' +
      window.ISSEC.escapeHTML(window.ISSEC.fmtDateTime(start)) + '</p>';
    var bez = document.getElementById('bezeichnung').value.trim();
    if (bez) {
      var p = document.createElement('p');
      p.className = 'mb-0';
      p.textContent = 'Vorfall: ' + bez;
      kopf.appendChild(p);
    }
    var hinw = document.createElement('p');
    hinw.className = 'small muted mb-0';
    hinw.style.marginTop = '.5rem';
    hinw.textContent = 'Alle Angaben sind Höchstfristen. Das Gesetz verlangt jeweils unverzügliches Handeln — melden Sie, sobald Sie können, nicht erst kurz vor Fristablauf.';
    kopf.appendChild(hinw);
    ergebnis.appendChild(kopf);

    var wrap = document.createElement('div');
    wrap.className = 'table-wrap';
    var tabelle = document.createElement('table');
    tabelle.innerHTML =
      '<caption>Fristenplan, berechnet ab dem Zeitpunkt der Kenntnis in Ihrer lokalen Zeitzone.</caption>' +
      '<thead><tr><th scope="col">Was</th><th scope="col">Spätestens</th><th scope="col">Verbleibend</th></tr></thead>';
    var tbody = document.createElement('tbody');

    letzteFristen.forEach(function (f) {
      var tr = document.createElement('tr');
      tr.dataset.zeitpunkt = f.zeitpunkt.toISOString();

      var th = document.createElement('th');
      th.scope = 'row';
      var tag = document.createElement('span');
      tag.className = f.klasse === 'nisg' ? 'tag tag--nisg' : 'tag tag--dsgvo';
      tag.textContent = f.klasse === 'nisg' ? 'NISG 2026' : 'DSGVO';
      th.appendChild(tag);
      var titel = document.createElement('div');
      titel.style.marginTop = '.35rem';
      titel.textContent = f.titel;
      th.appendChild(titel);
      var grund = document.createElement('div');
      grund.className = 'small muted';
      grund.textContent = f.rechtsgrund + ' · ' + f.frist;
      th.appendChild(grund);
      tr.appendChild(th);

      var td1 = document.createElement('td');
      td1.className = 'num';
      td1.textContent = f.unscharf
        ? 'unverzüglich'
        : window.ISSEC.fmtDateTime(f.zeitpunkt);
      if (f.unscharf) {
        var zusatz = document.createElement('div');
        zusatz.className = 'small muted';
        zusatz.textContent = 'Orientierung: nicht später als die Meldung an die Behörde';
        td1.appendChild(zusatz);
      }
      tr.appendChild(td1);

      var td2 = document.createElement('td');
      td2.className = 'num rest';
      tr.appendChild(td2);

      tbody.appendChild(tr);

      var trInhalt = document.createElement('tr');
      var tdInhalt = document.createElement('td');
      tdInhalt.colSpan = 3;
      tdInhalt.className = 'small';
      tdInhalt.style.paddingTop = '0';
      tdInhalt.style.color = 'var(--ink-2)';
      tdInhalt.textContent = f.inhalt;
      trInhalt.appendChild(tdInhalt);
      tbody.appendChild(trInhalt);
    });

    tabelle.appendChild(tbody);
    wrap.appendChild(tabelle);
    ergebnis.appendChild(wrap);

    if (letzteFristen.some(function (f) { return f.klasse === 'dsgvo'; })) {
      var kasten = document.createElement('div');
      kasten.className = 'callout callout--warn';
      kasten.innerHTML =
        '<p class="callout__title">Zwei Behörden, zwei Meldungen</p>' +
        '<p class="mb-0">Die Meldung an das CSIRT ersetzt nicht die Meldung an die Datenschutzbehörde und umgekehrt. ' +
        'Die beiden Meldungen haben unterschiedliche Schutzgüter, unterschiedliche Inhalte und gehen an ' +
        'unterschiedliche Stellen. Führen Sie beide getrennt und dokumentieren Sie beide.</p>';
      ergebnis.appendChild(kasten);
    }

    ergebnisBereich.hidden = false;
    document.getElementById('ergebnis-titel').focus();

    restzeitAktualisieren();
    if (tickerId) clearInterval(tickerId);
    tickerId = setInterval(restzeitAktualisieren, 30000);
  }

  function restzeitAktualisieren() {
    ergebnis.querySelectorAll('tr[data-zeitpunkt]').forEach(function (tr) {
      var zelle = tr.querySelector('.rest');
      if (!zelle) return;
      var r = restzeit(new Date(tr.dataset.zeitpunkt));
      zelle.textContent = r.text;
      zelle.style.color = r.abgelaufen ? 'var(--crit)' : '';
      zelle.style.fontWeight = r.abgelaufen ? '700' : '';
    });
  }

  /* ---- Kalenderexport ------------------------------------------------ */
  function icsZeit(d) {
    return d.getUTCFullYear() +
      String(d.getUTCMonth() + 1).padStart(2, '0') +
      String(d.getUTCDate()).padStart(2, '0') + 'T' +
      String(d.getUTCHours()).padStart(2, '0') +
      String(d.getUTCMinutes()).padStart(2, '0') +
      String(d.getUTCSeconds()).padStart(2, '0') + 'Z';
  }

  function icsText(s) {
    return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  }

  function falten(zeile) {
    // RFC 5545: eine Zeile darf 75 Oktette nicht überschreiten (ohne CRLF).
    // Umlaute belegen in UTF-8 zwei Oktette, daher wird byteweise gezählt.
    var kodierer = new TextEncoder();
    if (kodierer.encode(zeile).length <= 75) return zeile;

    var teile = [];
    var aktuell = '';
    var belegt = 0;

    // Array.from hält Ersatzzeichenpaare (etwa Emoji) zusammen.
    Array.from(zeile).forEach(function (z) {
      var breite = kodierer.encode(z).length;
      // Nicht zwischen Gegenschrägstrich und maskiertem Zeichen trennen:
      // eine ungerade Zahl abschließender Gegenschrägstriche heißt "mitten in einer Maskierung".
      var offeneMaskierung = /(^|[^\\])(\\\\)*\\$/.test(aktuell);
      if (belegt + breite > 75 && !offeneMaskierung) {
        teile.push(aktuell);
        aktuell = ' ' + z;             // Fortsetzungszeilen beginnen mit einem Leerzeichen
        belegt = 1 + breite;
      } else {
        aktuell += z;
        belegt += breite;
      }
    });

    teile.push(aktuell);
    return teile.join('\r\n');
  }

  function icsErzeugen() {
    if (!letzteFristen) return '';
    var bez = document.getElementById('bezeichnung').value.trim();
    var stempel = icsZeit(new Date());
    var zeilen = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Sicher und Konform//Meldefristen NISG 2026//DE',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    letzteFristen.forEach(function (f, i) {
      var ende = new Date(f.zeitpunkt.getTime() + 30 * 60000);
      zeilen.push('BEGIN:VEVENT');
      zeilen.push('UID:' + f.id + '-' + letzterZeitpunkt.getTime() + '-' + i + '@sicher-und-konform.local');
      zeilen.push('DTSTAMP:' + stempel);
      zeilen.push('DTSTART:' + icsZeit(f.zeitpunkt));
      zeilen.push('DTEND:' + icsZeit(ende));
      zeilen.push('SUMMARY:' + icsText('FRIST: ' + f.titel + (bez ? ' — ' + bez : '')));
      zeilen.push('DESCRIPTION:' + icsText(
        f.frist + '\n\nRechtsgrundlage: ' + f.rechtsgrund +
        '\n\nInhalt der Meldung:\n' + f.inhalt +
        '\n\nKenntnis erlangt: ' + window.ISSEC.fmtDateTime(letzterZeitpunkt) +
        '\n\nHöchstfrist. Das Gesetz verlangt unverzügliches Handeln.'
      ));
      zeilen.push('PRIORITY:1');
      zeilen.push('BEGIN:VALARM');
      zeilen.push('TRIGGER:-PT4H');
      zeilen.push('ACTION:DISPLAY');
      zeilen.push('DESCRIPTION:' + icsText('In 4 Stunden endet die Frist: ' + f.titel));
      zeilen.push('END:VALARM');
      zeilen.push('END:VEVENT');
    });

    zeilen.push('END:VCALENDAR');
    return zeilen.map(falten).join('\r\n');
  }

  function protokollErzeugen() {
    if (!letzteFristen) return '';
    var bez = document.getElementById('bezeichnung').value.trim();
    var z = [];
    z.push('VORFALLPROTOKOLL — FRISTENPLAN');
    z.push('='.repeat(64));
    z.push('');
    z.push('Vorfall:            ' + (bez || '______________________________________'));
    z.push('Kenntnis erlangt:   ' + window.ISSEC.fmtDateTime(letzterZeitpunkt));
    z.push('Kenntnis wodurch:   ______________________________________');
    z.push('Kenntnis durch wen: ______________________________________');
    z.push('Protokoll erstellt: ' + window.ISSEC.fmtDateTime(new Date()));
    z.push('');
    z.push('FRISTEN');
    z.push('-'.repeat(64));
    letzteFristen.forEach(function (f) {
      z.push('');
      z.push('[ ] ' + f.titel);
      z.push('    Rechtsgrundlage: ' + f.rechtsgrund);
      z.push('    Frist:           ' + f.frist);
      z.push('    Spätestens:      ' + (f.unscharf ? 'unverzüglich' : window.ISSEC.fmtDateTime(f.zeitpunkt)));
      z.push('    Inhalt:          ' + f.inhalt);
      z.push('    Erledigt am:     ____________  durch: ____________________');
      z.push('    Aktenzahl:       ______________________________________');
    });
    z.push('');
    z.push('WEITERE SCHRITTE');
    z.push('-'.repeat(64));
    z.push('[ ] Krisenstab einberufen, Erreichbarkeiten geprüft');
    z.push('[ ] Beweissicherung veranlasst (Protokolle, Abbilder) vor Wiederherstellung');
    z.push('[ ] Betroffene Systeme isoliert, Entscheidung dokumentiert');
    z.push('[ ] Kommunikation nach innen und außen abgestimmt');
    z.push('[ ] Versicherung und Rechtsbeistand verständigt');
    z.push('[ ] Nachbereitung terminisiert (Ursachenanalyse, Lehren, Maßnahmen)');
    z.push('');
    z.push('-'.repeat(64));
    z.push('Grundlage: Meldepflichten NISG 2026 (BGBl. I Nr. 94/2025) sowie Art. 33 und 34');
    z.push('DSGVO. Die Zeitpunkte sind Höchstfristen und in lokaler Zeit angegeben.');
    z.push('Notfallhilfe: Cyber-Security-Hotline der Wirtschaftskammern, 0800 888 133.');
    return z.join('\n');
  }

  document.getElementById('berechnen').addEventListener('click', anzeigen);

  document.getElementById('ics').addEventListener('click', function () {
    var inhalt = icsErzeugen();
    if (inhalt) window.ISSEC.download('meldefristen-vorfall.ics', inhalt, 'text/calendar');
  });

  document.getElementById('protokoll').addEventListener('click', function () {
    var inhalt = protokollErzeugen();
    if (inhalt) {
      var stempel = new Date().toISOString().slice(0, 10);
      window.ISSEC.download('vorfallprotokoll-' + stempel + '.txt', inhalt);
    }
  });

  document.getElementById('drucken').addEventListener('click', function () { window.print(); });
})();
