/* =========================================================================
   Verzeichnis von Verarbeitungstätigkeiten (Art. 30 DSGVO)
   Vorlagen, Eintragsverwaltung und CSV-Export. Arbeitet ausschließlich
   lokal; nichts wird übertragen oder dauerhaft gespeichert.
   ========================================================================= */
(function () {
  'use strict';

  var werkzeug = document.getElementById('werkzeug');
  if (!werkzeug) return;
  werkzeug.hidden = false;

  var VORLAGEN = [
    {
      id: 'personal',
      titel: 'Personalverwaltung',
      hinweis: 'Stammdaten, Dienstverhältnis, Abrechnung',
      daten: {
        bezeichnung: 'Personalverwaltung',
        zweck: 'Begründung, Durchführung und Beendigung von Dienstverhältnissen, Lohn- und Gehaltsabrechnung, Erfüllung arbeits-, sozialversicherungs- und abgabenrechtlicher Pflichten',
        rechtsgrundlage: 'lit. b — Vertragserfüllung oder vorvertragliche Maßnahmen',
        betroffene: 'Beschäftigte, ehemalige Beschäftigte, Lehrlinge, geringfügig Beschäftigte',
        datenkategorien: 'Stammdaten, Kontaktdaten, Bankverbindung, Sozialversicherungsnummer, Vertragsdaten, Arbeitszeitdaten, Abrechnungsdaten, Qualifikationen',
        art9: true,
        empfaenger: 'Steuerberatung, Sozialversicherungsträger, Finanzamt, Betriebsrat, Lohnverrechnung, Betriebliche Vorsorgekasse',
        drittland: 'keine',
        loeschfrist: '7 Jahre nach Ende des Kalenderjahres der Beendigung des Dienstverhältnisses; abweichende Fristen für Sozialversicherungsunterlagen',
        tom: 'Rollenbasierte Zugriffsrechte, Beschränkung auf die Personalstelle, Verschlüsselung der Datenträger, versperrbare Ablage für Papierakten, Protokollierung der Zugriffe, tägliche Sicherung'
      }
    },
    {
      id: 'bewerbung',
      titel: 'Bewerbungsverfahren',
      hinweis: 'Unterlagen, Auswahl, Absagen',
      daten: {
        bezeichnung: 'Bewerbungsverfahren',
        zweck: 'Durchführung von Auswahlverfahren zur Besetzung offener Stellen',
        rechtsgrundlage: 'lit. b — Vertragserfüllung oder vorvertragliche Maßnahmen',
        betroffene: 'Bewerberinnen und Bewerber',
        datenkategorien: 'Stammdaten, Kontaktdaten, Lebenslauf, Zeugnisse, Qualifikationen, Gesprächsnotizen',
        art9: false,
        empfaenger: 'Fachabteilung, Geschäftsleitung, gegebenenfalls Personalberatung',
        drittland: 'keine',
        loeschfrist: '7 Monate nach Abschluss des Verfahrens; bei Einwilligung in den Bewerberpool länger, mit gesonderter Frist',
        tom: 'Zugriff auf den beteiligten Personenkreis beschränkt, verschlüsselte Übertragung, automatisierte Löscherinnerung'
      }
    },
    {
      id: 'kunden',
      titel: 'Kundenverwaltung',
      hinweis: 'Auftragsabwicklung und Rechnungslegung',
      daten: {
        bezeichnung: 'Kundenverwaltung und Auftragsabwicklung',
        zweck: 'Anbahnung, Abwicklung und Abrechnung von Aufträgen, Erfüllung von Gewährleistungs- und Aufbewahrungspflichten',
        rechtsgrundlage: 'lit. b — Vertragserfüllung oder vorvertragliche Maßnahmen',
        betroffene: 'Kundinnen und Kunden, Ansprechpersonen bei Geschäftskunden, Interessentinnen und Interessenten',
        datenkategorien: 'Stammdaten, Kontaktdaten, Auftragsdaten, Lieferdaten, Zahlungsdaten, Korrespondenz',
        art9: false,
        empfaenger: 'Steuerberatung, Versanddienstleister, Zahlungsdienstleister, IT-Dienstleister',
        drittland: 'keine',
        loeschfrist: '7 Jahre ab Ende des Kalenderjahres der letzten Geschäftsbeziehung, entsprechend den abgabenrechtlichen Aufbewahrungspflichten',
        tom: 'Rollenbasierte Zugriffsrechte, verschlüsselte Übertragung, tägliche Sicherung, Protokollierung von Änderungen'
      }
    },
    {
      id: 'lieferanten',
      titel: 'Lieferantenverwaltung',
      hinweis: 'Einkauf und Dienstleister',
      daten: {
        bezeichnung: 'Lieferanten- und Dienstleisterverwaltung',
        zweck: 'Beschaffung von Waren und Leistungen, Vertragsverwaltung, Rechnungsprüfung',
        rechtsgrundlage: 'lit. b — Vertragserfüllung oder vorvertragliche Maßnahmen',
        betroffene: 'Ansprechpersonen bei Lieferanten und Dienstleistern',
        datenkategorien: 'Name, Funktion, geschäftliche Kontaktdaten, Vertragsdaten, Zahlungsdaten',
        art9: false,
        empfaenger: 'Steuerberatung, Buchhaltung, IT-Dienstleister',
        drittland: 'keine',
        loeschfrist: '7 Jahre ab Ende des Kalenderjahres der letzten Geschäftsbeziehung',
        tom: 'Zugriff auf Einkauf und Buchhaltung beschränkt, Sicherung, Protokollierung'
      }
    },
    {
      id: 'newsletter',
      titel: 'Newsletter und Direktwerbung',
      hinweis: 'Einwilligung und Widerruf',
      daten: {
        bezeichnung: 'Newsletter und elektronische Direktwerbung',
        zweck: 'Versand von Informationen und Werbung an Personen, die dem zugestimmt haben',
        rechtsgrundlage: 'lit. a — Einwilligung',
        betroffene: 'Abonnentinnen und Abonnenten, Interessentinnen und Interessenten',
        datenkategorien: 'E-Mail-Adresse, Name, Zeitpunkt und Nachweis der Einwilligung, Versand- und Öffnungsdaten',
        art9: false,
        empfaenger: 'Versanddienstleister für E-Mail',
        drittland: 'prüfen — viele Versanddienste verarbeiten außerhalb der EU; gegebenenfalls Standardvertragsklauseln',
        loeschfrist: 'unverzüglich nach Widerruf; Nachweis der Einwilligung bis zum Ablauf der Verjährungsfristen',
        tom: 'Verfahren mit Bestätigungsschritt bei der Anmeldung, Nachweis der Einwilligung, Abmeldelink in jeder Nachricht, Zugriffsbeschränkung'
      }
    },
    {
      id: 'video',
      titel: 'Videoüberwachung',
      hinweis: 'Erhöhte Anforderungen, Folgenabschätzung prüfen',
      daten: {
        bezeichnung: 'Videoüberwachung des Betriebsgeländes',
        zweck: 'Schutz von Personen und Eigentum, Beweissicherung bei Vorfällen',
        rechtsgrundlage: 'lit. f — berechtigte Interessen',
        betroffene: 'Beschäftigte, Besucherinnen und Besucher, Lieferpersonal, Passantinnen und Passanten',
        datenkategorien: 'Bildaufnahmen, Aufnahmezeitpunkt, Kamerastandort',
        art9: false,
        empfaenger: 'Sicherheitsdienst, im Anlassfall Strafverfolgungsbehörden, Wartungsdienstleister der Anlage',
        drittland: 'keine',
        loeschfrist: 'Regelfall 72 Stunden; längere Speicherung nur im begründeten Anlassfall, dokumentiert',
        tom: 'Kennzeichnung der überwachten Bereiche, Beschränkung des Bildausschnitts auf das eigene Gelände, Zugriff nur durch benannte Personen, Protokollierung jedes Zugriffs, automatische Löschung, verschlüsselte Speicherung'
      }
    },
    {
      id: 'protokoll',
      titel: 'Protokollierung in IT-Systemen',
      hinweis: 'Sicherheitsprotokolle, häufig übersehen',
      daten: {
        bezeichnung: 'Protokollierung in IT-Systemen',
        zweck: 'Gewährleistung der Netz- und Informationssicherheit, Erkennung und Aufklärung von Sicherheitsvorfällen, Fehleranalyse',
        rechtsgrundlage: 'lit. f — berechtigte Interessen',
        betroffene: 'Beschäftigte, externe Nutzende, Ansprechpersonen bei Dienstleistern',
        datenkategorien: 'Benutzerkennungen, IP-Adressen, Zeitstempel, aufgerufene Systeme und Aktionen, Fehlermeldungen',
        art9: false,
        empfaenger: 'IT-Betrieb, gegebenenfalls beauftragte Sicherheitsdienstleister',
        drittland: 'keine',
        loeschfrist: 'Regelfall 90 Tage; im Anlassfall längere Aufbewahrung zur Aufklärung eines Vorfalls, dokumentiert',
        tom: 'Zugriff auf den IT-Betrieb beschränkt, keine Verhaltens- oder Leistungskontrolle, Vereinbarung mit dem Betriebsrat, Schutz der Protokolle vor Veränderung, automatische Löschung'
      }
    },
    {
      id: 'website',
      titel: 'Website und Reichweitenmessung',
      hinweis: 'Server-Protokolle und Analysedienste',
      daten: {
        bezeichnung: 'Betrieb der Website',
        zweck: 'Bereitstellung der Website, Gewährleistung der Stabilität und Sicherheit, gegebenenfalls Reichweitenmessung',
        rechtsgrundlage: 'lit. f — berechtigte Interessen',
        betroffene: 'Besucherinnen und Besucher der Website',
        datenkategorien: 'IP-Adresse, Zeitpunkt, aufgerufene Seiten, Browser- und Systemangaben, Verweisquelle',
        art9: false,
        empfaenger: 'Hostinganbieter, gegebenenfalls Anbieter der Reichweitenmessung',
        drittland: 'prüfen — bei Analyse- oder Auslieferungsdiensten außerhalb der EU',
        loeschfrist: 'Server-Protokolle 7 bis 30 Tage; Auswertungen in aggregierter, nicht personenbezogener Form',
        tom: 'Verschlüsselte Übertragung, Kürzung der IP-Adresse, Zugriffsbeschränkung, Einwilligungsverwaltung für nicht erforderliche Dienste'
      }
    },
    {
      id: 'zutritt',
      titel: 'Zutrittskontrolle',
      hinweis: 'Ausweise, Schließsystem, Besuchsbuch',
      daten: {
        bezeichnung: 'Zutrittskontrolle und Besuchsverwaltung',
        zweck: 'Schutz von Betriebsbereichen, Nachvollziehbarkeit des Zutritts zu Sicherheitsbereichen',
        rechtsgrundlage: 'lit. f — berechtigte Interessen',
        betroffene: 'Beschäftigte, Besucherinnen und Besucher, externe Dienstleister',
        datenkategorien: 'Name, Unternehmen, Ausweisnummer, Zutrittszeitpunkte, betretene Bereiche',
        art9: false,
        empfaenger: 'Empfang, Sicherheitsverantwortliche, Wartungsdienstleister der Anlage',
        drittland: 'keine',
        loeschfrist: 'Zutrittsprotokolle 90 Tage, Besuchsaufzeichnungen 12 Monate',
        tom: 'Zugriff auf benannte Personen beschränkt, keine Verhaltenskontrolle, Vereinbarung mit dem Betriebsrat, automatische Löschung'
      }
    },
    {
      id: 'vorfall',
      titel: 'Bearbeitung von Sicherheitsvorfällen',
      hinweis: 'Verbindung zur Meldepflicht',
      daten: {
        bezeichnung: 'Bearbeitung von Sicherheitsvorfällen',
        zweck: 'Erkennung, Bewältigung und Nachbereitung von Sicherheitsvorfällen, Erfüllung gesetzlicher Melde- und Dokumentationspflichten',
        rechtsgrundlage: 'lit. c — rechtliche Verpflichtung',
        betroffene: 'Beschäftigte, betroffene Personen des jeweiligen Vorfalls, Ansprechpersonen bei Dienstleistern',
        datenkategorien: 'Vorfalldaten, Protokollauszüge, Benutzerkennungen, Korrespondenz, Meldungen an Behörden',
        art9: false,
        empfaenger: 'CSIRT, Cybersicherheitsbehörde, Datenschutzbehörde, beauftragte Fachleute, Versicherung, gegebenenfalls Strafverfolgungsbehörden',
        drittland: 'keine',
        loeschfrist: 'Bis zum Ablauf der Verjährungs- und Nachweisfristen, mindestens für die Dauer eines allfälligen Verfahrens',
        tom: 'Getrennte, zugriffsbeschränkte Vorfallakte, Verschlüsselung, dokumentierte Beweissicherung, Vier-Augen-Prinzip bei der Freigabe von Meldungen'
      }
    }
  ];

  /* ---- Vorlagen anzeigen --------------------------------------------- */
  var vorlagenHost = document.getElementById('vorlagen');
  VORLAGEN.forEach(function (v) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice';
    btn.style.textAlign = 'left';
    btn.style.font = 'inherit';
    btn.style.cursor = 'pointer';
    var text = document.createElement('span');
    text.className = 'choice__text';
    var t = document.createElement('span');
    t.className = 'choice__title';
    t.textContent = v.titel;
    var d = document.createElement('span');
    d.className = 'choice__desc';
    d.textContent = v.hinweis;
    text.appendChild(t);
    text.appendChild(d);
    btn.appendChild(text);
    btn.addEventListener('click', function () {
      vorlageLaden(v.daten);
      document.getElementById('eintrag-titel').focus();
    });
    vorlagenHost.appendChild(btn);
  });

  var FELDER = ['bezeichnung', 'zweck', 'rechtsgrundlage', 'betroffene', 'datenkategorien',
    'empfaenger', 'drittland', 'loeschfrist', 'tom'];

  function vorlageLaden(daten) {
    FELDER.forEach(function (f) {
      var el = document.getElementById(f);
      if (el) el.value = daten[f] || '';
    });
    document.getElementById('art9').checked = !!daten.art9;
  }

  function eintragLesen() {
    var e = {};
    FELDER.forEach(function (f) {
      var el = document.getElementById(f);
      e[f] = el ? el.value.trim() : '';
    });
    e.art9 = document.getElementById('art9').checked;
    return e;
  }

  /* ---- Verzeichnis --------------------------------------------------- */
  var verzeichnis = [];
  var host = document.getElementById('verzeichnis');
  var bereich = document.getElementById('verzeichnisbereich');
  var info = document.getElementById('verzeichnis-info');

  function zeichnen() {
    host.innerHTML = '';
    if (!verzeichnis.length) { bereich.hidden = true; return; }

    verzeichnis.forEach(function (e, index) {
      var block = document.createElement('details');
      block.open = false;
      var summary = document.createElement('summary');
      summary.textContent = (index + 1) + '. ' + (e.bezeichnung || 'Ohne Bezeichnung') +
        (e.art9 ? '  ·  besondere Kategorien' : '');
      block.appendChild(summary);

      var body = document.createElement('div');
      body.className = 'details__body';

      var wrap = document.createElement('div');
      wrap.className = 'table-wrap';
      var tabelle = document.createElement('table');
      var tbody = document.createElement('tbody');

      var zeilen = [
        ['Zweck', e.zweck],
        ['Rechtsgrundlage', 'Art. 6 Abs. 1 ' + e.rechtsgrundlage + (e.art9 ? ' — zusätzlich Ausnahme nach Art. 9 Abs. 2 erforderlich' : '')],
        ['Betroffene Personen', e.betroffene],
        ['Datenkategorien', e.datenkategorien],
        ['Empfänger', e.empfaenger],
        ['Drittland', e.drittland],
        ['Löschfrist', e.loeschfrist],
        ['Maßnahmen nach Art. 32', e.tom]
      ];
      zeilen.forEach(function (z) {
        var tr = document.createElement('tr');
        var th = document.createElement('th');
        th.scope = 'row';
        th.style.width = '30%';
        th.textContent = z[0];
        var td = document.createElement('td');
        td.textContent = z[1] || '— noch offen —';
        if (!z[1]) td.className = 'muted';
        tr.appendChild(th);
        tr.appendChild(td);
        tbody.appendChild(tr);
      });
      tabelle.appendChild(tbody);
      wrap.appendChild(tabelle);
      body.appendChild(wrap);

      if (e.art9) {
        var warn = document.createElement('div');
        warn.className = 'callout callout--warn';
        warn.innerHTML = '<p class="callout__title">Besondere Kategorien</p><p class="mb-0">' +
          'Die Verarbeitung ist nach Art. 9 Abs. 1 DSGVO grundsätzlich untersagt und nur zulässig, ' +
          'wenn zusätzlich eine Ausnahme nach Art. 9 Abs. 2 greift — etwa ausdrückliche Einwilligung ' +
          'oder arbeits- und sozialrechtliche Verpflichtungen. Halten Sie fest, welche Ausnahme Sie ' +
          'heranziehen. Prüfen Sie außerdem, ob eine Datenschutz-Folgenabschätzung nach Art. 35 erforderlich ist.</p>';
        body.appendChild(warn);
      }

      if (e.rechtsgrundlage.indexOf('lit. f') === 0) {
        var abw = document.createElement('div');
        abw.className = 'callout callout--note';
        abw.innerHTML = '<p class="callout__title">Interessenabwägung dokumentieren</p><p class="mb-0">' +
          'Bei berechtigten Interessen ist die Abwägung gegen die Interessen der betroffenen Personen ' +
          'schriftlich festzuhalten. Ohne diese Dokumentation fehlt der Nachweis, dass sie stattgefunden hat.</p>';
        body.appendChild(abw);
      }

      var zeile = document.createElement('div');
      zeile.className = 'btn-row no-print';
      var bearbeiten = document.createElement('button');
      bearbeiten.type = 'button';
      bearbeiten.className = 'btn btn--ghost btn--small';
      bearbeiten.textContent = 'In das Formular laden';
      bearbeiten.addEventListener('click', function () {
        vorlageLaden(e);
        document.getElementById('eintrag-titel').focus();
      });
      var entfernen = document.createElement('button');
      entfernen.type = 'button';
      entfernen.className = 'btn btn--ghost btn--small';
      entfernen.textContent = 'Entfernen';
      entfernen.setAttribute('aria-label', 'Eintrag ' + (e.bezeichnung || 'ohne Bezeichnung') + ' entfernen');
      entfernen.addEventListener('click', function () {
        var i = verzeichnis.indexOf(e);
        if (i !== -1) verzeichnis.splice(i, 1);
        zeichnen();
      });
      zeile.appendChild(bearbeiten);
      zeile.appendChild(entfernen);
      body.appendChild(zeile);

      block.appendChild(body);
      host.appendChild(block);
    });

    var art9 = verzeichnis.filter(function (e) { return e.art9; }).length;
    var drittland = verzeichnis.filter(function (e) {
      var d = (e.drittland || '').toLowerCase();
      return d && d !== 'keine' && d !== 'nein' && d !== '—';
    }).length;
    info.textContent = verzeichnis.length + ' Verarbeitungstätigkeit' +
      (verzeichnis.length === 1 ? '' : 'en') + ' erfasst' +
      (art9 ? ', davon ' + art9 + ' mit besonderen Kategorien nach Art. 9' : '') +
      (drittland ? ', ' + drittland + ' mit Drittlandsbezug' : '') + '.';

    bereich.hidden = false;
  }

  function csvFeld(s) {
    var t = String(s == null ? '' : s);
    return /[";\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
  }

  function csvErzeugen() {
    var zeilen = [];
    var verantwortlicher = document.getElementById('verantwortlicher').value.trim();
    var dsb = document.getElementById('dsb').value.trim();

    zeilen.push(csvFeld('Verzeichnis von Verarbeitungstaetigkeiten nach Art. 30 DSGVO'));
    zeilen.push(csvFeld('Verantwortlicher') + ';' + csvFeld(verantwortlicher || 'noch offen'));
    zeilen.push(csvFeld('Datenschutzbeauftragte Person') + ';' + csvFeld(dsb || 'nicht benannt'));
    zeilen.push(csvFeld('Stand') + ';' + csvFeld(new Date().toLocaleDateString('de-AT')));
    zeilen.push('');

    var kopf = ['Nr', 'Bezeichnung', 'Zweck', 'Rechtsgrundlage Art. 6 Abs. 1',
      'Besondere Kategorien Art. 9', 'Betroffene Personen', 'Datenkategorien', 'Empfaenger',
      'Drittland', 'Loeschfrist', 'Massnahmen nach Art. 32', 'Letzte Aktualisierung'];
    zeilen.push(kopf.map(csvFeld).join(';'));

    verzeichnis.forEach(function (e, i) {
      zeilen.push([
        i + 1, e.bezeichnung, e.zweck, 'Art. 6 Abs. 1 ' + e.rechtsgrundlage,
        e.art9 ? 'ja' : 'nein', e.betroffene, e.datenkategorien, e.empfaenger,
        e.drittland, e.loeschfrist, e.tom, ''
      ].map(csvFeld).join(';'));
    });

    // BOM, damit Tabellenkalkulationen die Umlaute richtig erkennen.
    return '﻿' + zeilen.join('\r\n');
  }

  document.getElementById('uebernehmen').addEventListener('click', function () {
    var e = eintragLesen();
    if (!e.bezeichnung) {
      e.bezeichnung = 'Ohne Bezeichnung';
    }
    verzeichnis.push(e);
    zeichnen();
    document.getElementById('eintrag-formular').reset();
  });

  document.getElementById('leeren').addEventListener('click', function () {
    document.getElementById('eintrag-formular').reset();
    document.getElementById('bezeichnung').focus();
  });

  document.getElementById('csv').addEventListener('click', function () {
    if (!verzeichnis.length) return;
    window.ISSEC.download('verarbeitungsverzeichnis-' + new Date().toISOString().slice(0, 10) + '.csv',
      csvErzeugen(), 'text/csv');
  });

  document.getElementById('drucken').addEventListener('click', function () { window.print(); });

  document.getElementById('verzeichnisleeren').addEventListener('click', function () {
    verzeichnis = [];
    zeichnen();
  });
})();
