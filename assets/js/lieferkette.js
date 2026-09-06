/* =========================================================================
   Lieferketten-Einstufung
   Bewertet Anbieter nach vier Kriterien, leitet Kritikalität und die daraus
   folgenden Anforderungen ab und verwaltet ein Verzeichnis im Speicher.
   Rechnet lokal; nichts wird übertragen oder dauerhaft gespeichert.
   ========================================================================= */
(function () {
  'use strict';

  var werkzeug = document.getElementById('werkzeug');
  if (!werkzeug) return;
  werkzeug.hidden = false;

  var verzeichnis = [];

  var LABEL = {
    zugriff: { '0': 'kein Zugriff', '1': 'lesend', '2': 'schreibend', '4': 'administrativ' },
    ausfall: { '0': 'kaum spürbar', '1': 'nach Wochen', '2': 'binnen einer Woche', '4': 'binnen 24 Stunden' },
    daten:   { '0': 'keine', '1': 'einzelne Kontaktdaten', '2': 'umfangreich', '4': 'besondere Kategorien' },
    ersatz:  { '0': 'leicht', '1': 'mit Aufwand', '2': 'schwer', '3': 'praktisch nicht' }
  };

  function wert(name) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : '0';
  }

  function einstufen() {
    var z = wert('zugriff'), a = wert('ausfall'), d = wert('daten'), e = wert('ersatz');
    var punkte = Number(z) + Number(a) + Number(d) + Number(e);

    var stufe;
    if (punkte >= 8) stufe = 'hoch';
    else if (punkte >= 4) stufe = 'mittel';
    else stufe = 'gering';

    var sofortregeln = [];
    if (z === '4' && stufe === 'gering') {
      stufe = 'mittel';
      sofortregeln.push('Administrativer Zugriff führt unabhängig von der Punktezahl mindestens zur Stufe mittel.');
    }
    if (d === '4' && stufe === 'gering') {
      stufe = 'mittel';
      sofortregeln.push('Der Zugang zu besonderen Kategorien personenbezogener Daten nach Art. 9 DSGVO führt mindestens zur Stufe mittel.');
    }

    return {
      name: document.getElementById('name').value.trim() || 'Ohne Bezeichnung',
      leistung: document.getElementById('leistung').value.trim() || '—',
      zugriff: z, ausfall: a, daten: d, ersatz: e,
      punkte: punkte,
      stufe: stufe,
      sofortregeln: sofortregeln,
      avv: d !== '0'
    };
  }

  var ANFORDERUNGEN = {
    hoch: {
      titel: 'Kritikalität: hoch',
      klasse: 'essential',
      einleitung: 'Ein Vorfall bei diesem Anbieter trifft Sie unmittelbar. Behandeln Sie ihn wie einen internen Bereich.',
      punkte: [
        'Vollständige Sicherheitsprüfung vor Beauftragung: Zertifikate oder Prüfberichte einschließlich ihres Geltungsbereichs, Umgang mit Vorfällen, Patch-Fristen, Multi-Faktor-Authentifizierung, Unterauftragnehmer, Speicherorte.',
        'Vertragliche Sicherheitsanforderungen, konkret benannt statt allgemeiner Verweis auf den Stand der Technik.',
        'Meldepflicht bei Sicherheitsvorfällen mit ausdrücklicher Frist — üblich sind 24 Stunden ab Kenntnis des Anbieters.',
        'Auskunfts- und Prüfrechte einschließlich der Vorlage von Nachweisen.',
        'Benannte Ansprechperson für Sicherheitsfragen, erreichbar auch außerhalb der Geschäftszeiten.',
        'Zustimmungsvorbehalt bei Unterauftragnehmern und Weitergabe der Anforderungen.',
        'Jährliche Nachprüfung, dokumentiert.',
        'Dokumentierter Ausstiegsplan: Wer könnte ersetzen, wie lange dauert der Wechsel, wo liegen Daten und Zugangsdaten?',
        'Zugriffe protokollieren und mindestens halbjährlich überprüfen.',
        'Aufnahme in den Incident-Response-Plan als zu verständigende Stelle.'
      ]
    },
    mittel: {
      titel: 'Kritikalität: mittel',
      klasse: 'important',
      einleitung: 'Der Anbieter ist relevant, aber ein Ausfall oder Vorfall ist beherrschbar. Standardisiertes Vorgehen genügt.',
      punkte: [
        'Sicherheitsfragebogen vor Beauftragung, Antworten zur Akte.',
        'Sicherheits- und Meldeklauseln im Vertrag.',
        'Benannte Ansprechperson für Sicherheitsfragen.',
        'Multi-Faktor-Authentifizierung für alle Zugriffe auf Ihre Systeme.',
        'Zugriffsrechte auf das Notwendige beschränken und befristen.',
        'Nachprüfung alle zwei Jahre.',
        'Regelung zur Datenrückgabe und Löschung bei Vertragsende.'
      ]
    },
    gering: {
      titel: 'Kritikalität: gering',
      klasse: 'none',
      einleitung: 'Kein besonderer Aufwand erforderlich. Wichtig ist, dass der Anbieter im Verzeichnis geführt und bei Änderungen neu bewertet wird.',
      punkte: [
        'Im Anbieterverzeichnis führen — das ist die eigentliche Pflicht.',
        'Standardklauseln zur Vertraulichkeit im Vertrag.',
        'Neu bewerten, sobald sich Leistungsumfang oder Zugriffsrechte ändern.'
      ]
    }
  };

  var ergebnis = document.getElementById('ergebnis');
  var ergebnisBereich = document.getElementById('ergebnisbereich');

  function ergebnisAnzeigen(e) {
    var a = ANFORDERUNGEN[e.stufe];
    ergebnis.innerHTML = '';

    var box = document.createElement('div');
    box.className = 'result result--' + a.klasse;

    var h = document.createElement('p');
    h.className = 'verdict verdict--' + a.klasse;
    h.textContent = e.name + ' — ' + a.titel;
    box.appendChild(h);

    var p = document.createElement('p');
    p.textContent = a.einleitung;
    box.appendChild(p);

    var punkte = document.createElement('p');
    punkte.className = 'small muted mb-0';
    punkte.textContent = e.punkte + ' von 15 Punkten · Zugriff: ' + LABEL.zugriff[e.zugriff] +
      ' · Ausfallwirkung: ' + LABEL.ausfall[e.ausfall] +
      ' · Personenbezogene Daten: ' + LABEL.daten[e.daten] +
      ' · Ersetzbarkeit: ' + LABEL.ersatz[e.ersatz];
    box.appendChild(punkte);

    e.sofortregeln.forEach(function (regel) {
      var r = document.createElement('p');
      r.className = 'small mb-0';
      r.style.marginTop = '.5rem';
      r.textContent = 'Sofortregel: ' + regel;
      box.appendChild(r);
    });

    ergebnis.appendChild(box);

    var hAnf = document.createElement('h3');
    hAnf.textContent = 'Was daraus folgt';
    ergebnis.appendChild(hAnf);

    var ul = document.createElement('ul');
    a.punkte.forEach(function (t) {
      var li = document.createElement('li');
      li.textContent = t;
      ul.appendChild(li);
    });
    ergebnis.appendChild(ul);

    if (e.avv) {
      var avv = document.createElement('div');
      avv.className = 'callout callout--warn';
      avv.innerHTML = '<p class="callout__title">Auftragsverarbeitungsvertrag erforderlich</p>' +
        '<p class="mb-0">Der Anbieter verarbeitet personenbezogene Daten in Ihrem Auftrag. ' +
        'Damit brauchen Sie einen Vertrag mit dem Pflichtinhalt des Art. 28 Abs. 3 DSGVO — ' +
        'unabhängig von der Kritikalitätsstufe. Prüfen Sie zusätzlich, ob Daten in ein Drittland ' +
        'übermittelt werden und auf welcher Grundlage.</p>';
      ergebnis.appendChild(avv);
    }

    ergebnisBereich.hidden = false;
  }

  /* ---- Verzeichnis --------------------------------------------------- */
  var listenBereich = document.getElementById('listenbereich');
  var listenHost = document.getElementById('liste');
  var listenInfo = document.getElementById('listen-info');

  var RANG = { hoch: 0, mittel: 1, gering: 2 };

  function listeZeichnen() {
    listenHost.innerHTML = '';
    if (!verzeichnis.length) {
      listenBereich.hidden = true;
      return;
    }

    var sortiert = verzeichnis.slice().sort(function (a, b) {
      return RANG[a.stufe] - RANG[b.stufe] || b.punkte - a.punkte;
    });

    var wrap = document.createElement('div');
    wrap.className = 'table-wrap';
    var tabelle = document.createElement('table');
    tabelle.innerHTML = '<caption>Anbieterverzeichnis, sortiert nach Kritikalität. Grundlage für § 32 Z 4 NISG 2026 und Art. 28 DSGVO.</caption>' +
      '<thead><tr><th scope="col">Anbieter</th><th scope="col">Zugriff</th><th scope="col">Ausfall</th>' +
      '<th scope="col">Daten</th><th scope="col">Ersatz</th><th scope="col">Stufe</th>' +
      '<th scope="col">AVV</th><th scope="col"><span class="visually-hidden">Aktion</span></th></tr></thead>';
    var tbody = document.createElement('tbody');

    sortiert.forEach(function (e) {
      var tr = document.createElement('tr');

      var th = document.createElement('th');
      th.scope = 'row';
      th.textContent = e.name;
      var leistung = document.createElement('div');
      leistung.className = 'small muted';
      leistung.textContent = e.leistung;
      th.appendChild(leistung);
      tr.appendChild(th);

      [LABEL.zugriff[e.zugriff], LABEL.ausfall[e.ausfall], LABEL.daten[e.daten], LABEL.ersatz[e.ersatz]]
        .forEach(function (text) {
          var td = document.createElement('td');
          td.className = 'small';
          td.textContent = text;
          tr.appendChild(td);
        });

      var tdStufe = document.createElement('td');
      var tag = document.createElement('span');
      tag.className = 'tag' + (e.stufe === 'hoch' ? ' tag--nisg' : (e.stufe === 'mittel' ? '' : ' tag--dsgvo'));
      tag.textContent = e.stufe;
      tdStufe.appendChild(tag);
      var pkt = document.createElement('div');
      pkt.className = 'small muted num';
      pkt.textContent = e.punkte + '/15';
      tdStufe.appendChild(pkt);
      tr.appendChild(tdStufe);

      var tdAvv = document.createElement('td');
      tdAvv.className = e.avv ? 't-yes' : 't-no';
      tdAvv.textContent = e.avv ? 'ja' : 'nein';
      tr.appendChild(tdAvv);

      var tdAktion = document.createElement('td');
      var weg = document.createElement('button');
      weg.type = 'button';
      weg.className = 'btn btn--ghost btn--small no-print';
      weg.textContent = 'Entfernen';
      weg.setAttribute('aria-label', 'Anbieter ' + e.name + ' aus dem Verzeichnis entfernen');
      weg.addEventListener('click', function () {
        var i = verzeichnis.indexOf(e);
        if (i !== -1) verzeichnis.splice(i, 1);
        listeZeichnen();
      });
      tdAktion.appendChild(weg);
      tr.appendChild(tdAktion);

      tbody.appendChild(tr);
    });

    tabelle.appendChild(tbody);
    wrap.appendChild(tabelle);
    listenHost.appendChild(wrap);

    var hoch = verzeichnis.filter(function (e) { return e.stufe === 'hoch'; }).length;
    var mittel = verzeichnis.filter(function (e) { return e.stufe === 'mittel'; }).length;
    listenInfo.textContent = verzeichnis.length + ' Anbieter erfasst — ' + hoch + ' hoch, ' +
      mittel + ' mittel, ' + (verzeichnis.length - hoch - mittel) + ' gering. ' +
      verzeichnis.filter(function (e) { return e.avv; }).length + ' davon benötigen einen Auftragsverarbeitungsvertrag.';

    listenBereich.hidden = false;
  }

  function csvFeld(s) {
    var t = String(s == null ? '' : s);
    return /[";\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
  }

  function csvErzeugen() {
    var kopf = ['Anbieter', 'Leistung', 'Zugriffstiefe', 'Ausfallwirkung', 'Personenbezogene Daten',
      'Ersetzbarkeit', 'Punkte', 'Kritikalitaet', 'AVV erforderlich', 'Vertrag geprueft',
      'Letzte Pruefung', 'Naechste Pruefung', 'Ansprechperson'];
    var zeilen = [kopf.map(csvFeld).join(';')];
    verzeichnis.slice().sort(function (a, b) {
      return RANG[a.stufe] - RANG[b.stufe] || b.punkte - a.punkte;
    }).forEach(function (e) {
      zeilen.push([
        e.name, e.leistung, LABEL.zugriff[e.zugriff], LABEL.ausfall[e.ausfall],
        LABEL.daten[e.daten], LABEL.ersatz[e.ersatz], e.punkte, e.stufe,
        e.avv ? 'ja' : 'nein', '', '', '', ''
      ].map(csvFeld).join(';'));
    });
    // BOM, damit Tabellenkalkulationen die Umlaute richtig erkennen.
    return '﻿' + zeilen.join('\r\n');
  }

  /* ---- Bedienung ----------------------------------------------------- */
  document.getElementById('hinzufuegen').addEventListener('click', function () {
    var e = einstufen();
    verzeichnis.push(e);
    ergebnisAnzeigen(e);
    listeZeichnen();
    document.getElementById('ergebnis-titel').focus();
  });

  document.getElementById('formularleeren').addEventListener('click', function () {
    document.getElementById('anbieter-formular').reset();
    document.getElementById('name').focus();
  });

  document.getElementById('csv').addEventListener('click', function () {
    if (!verzeichnis.length) return;
    window.ISSEC.download('anbieterverzeichnis-' + new Date().toISOString().slice(0, 10) + '.csv',
      csvErzeugen(), 'text/csv');
  });

  document.getElementById('drucken').addEventListener('click', function () { window.print(); });

  document.getElementById('listeleeren').addEventListener('click', function () {
    verzeichnis = [];
    listeZeichnen();
    ergebnisBereich.hidden = true;
  });
})();
