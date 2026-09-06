/* =========================================================================
   Betroffenheits-Check NISG 2026
   Bildet die Prüfschritte des Gesetzes ab: Sektor -> Tätigkeit -> Größe ->
   Sonderfälle. Rechnet vollständig lokal; die Sektorendaten stehen als
   JSON im Dokument, es findet kein Netzwerkzugriff statt.
   ========================================================================= */
(function () {
  'use strict';

  var datenKnoten = document.getElementById('sektoren-daten');
  var werkzeug = document.getElementById('werkzeug');
  if (!datenKnoten || !werkzeug) return;

  var DATEN;
  try {
    DATEN = JSON.parse(datenKnoten.textContent);
  } catch (e) {
    return; // Ohne Daten bleibt der noscript-Hinweis stehen.
  }
  werkzeug.hidden = false;

  /* ---- Nachschlagewerk aufbauen -------------------------------------- */
  var SEKTOREN = {};   // sektorId -> {sektor, anlage}
  var TEILE = {};      // teilId   -> {teil, sektor, anlage}
  DATEN.anlagen.forEach(function (anlage) {
    anlage.sektoren.forEach(function (sektor) {
      SEKTOREN[sektor.id] = { sektor: sektor, anlage: anlage };
      sektor.teilsektoren.forEach(function (teil) {
        TEILE[sektor.id + '/' + teil.id] = { teil: teil, sektor: sektor, anlage: anlage };
      });
    });
  });

  var zustand = { sektor: null, teil: null, sonderfaelle: [] };

  /* ---- Schritt 1: Sektoren rendern ----------------------------------- */
  var sektorHost = document.getElementById('sektor-auswahl');

  DATEN.anlagen.forEach(function (anlage) {
    var gruppe = document.createElement('fieldset');
    var legende = document.createElement('legend');
    legende.textContent = anlage.kurz + ' — ' + anlage.titel;
    gruppe.appendChild(legende);

    var beschreibung = document.createElement('p');
    beschreibung.className = 'field__hint';
    beschreibung.textContent = anlage.beschreibung;
    gruppe.appendChild(beschreibung);

    var liste = document.createElement('div');
    liste.className = 'choices choices--2';
    anlage.sektoren.forEach(function (sektor) {
      liste.appendChild(auswahlfeld('radio', 'sektor', sektor.id, sektor.name,
        sektor.teilsektoren.map(function (t) { return t.name; }).join(' · ')));
    });
    gruppe.appendChild(liste);
    sektorHost.appendChild(gruppe);
  });

  var keiner = document.createElement('fieldset');
  var keinerLegende = document.createElement('legend');
  keinerLegende.textContent = 'Keiner dieser Sektoren';
  keiner.appendChild(keinerLegende);
  var keinerListe = document.createElement('div');
  keinerListe.className = 'choices';
  keinerListe.appendChild(auswahlfeld('radio', 'sektor', 'keiner',
    'Unsere Tätigkeit fällt in keinen der 18 Sektoren',
    'Dann sind Sie nicht unmittelbar erfasst — der Check zeigt Ihnen trotzdem, was über die Lieferkette auf Sie zukommt.'));
  keiner.appendChild(keinerListe);
  sektorHost.appendChild(keiner);

  function auswahlfeld(typ, name, wert, titel, beschreibung) {
    var label = document.createElement('label');
    label.className = 'choice';
    var input = document.createElement('input');
    input.type = typ;
    input.name = name;
    input.value = wert;
    var text = document.createElement('span');
    text.className = 'choice__text';
    var t = document.createElement('span');
    t.className = 'choice__title';
    t.textContent = titel;
    text.appendChild(t);
    if (beschreibung) {
      var d = document.createElement('span');
      d.className = 'choice__desc';
      d.textContent = beschreibung;
      text.appendChild(d);
    }
    label.appendChild(input);
    label.appendChild(text);
    return label;
  }

  /* ---- Schritt 2: Teilsektoren nachziehen ---------------------------- */
  var teilHost = document.getElementById('teilsektor-auswahl');
  var teilIntro = document.getElementById('teilsektor-intro');

  function teilsektorenAufbauen(sektorId) {
    teilHost.innerHTML = '';
    var eintrag = SEKTOREN[sektorId];
    if (!eintrag) return;
    teilIntro.textContent = 'Sektor ' + eintrag.sektor.name + ' (' + eintrag.anlage.kurz +
      '). Wählen Sie die Tätigkeit, die Ihre Organisation am besten beschreibt.';
    eintrag.sektor.teilsektoren.forEach(function (teil) {
      var zusatz = teil.arten.join(' · ');
      if (teil.einschraenkung) zusatz += ' — ' + teil.einschraenkung;
      if (teil.groessenunabhaengig) {
        zusatz += ' — unabhängig von der Unternehmensgröße erfasst.';
      }
      teilHost.appendChild(auswahlfeld('radio', 'teilsektor', sektorId + '/' + teil.id, teil.name, zusatz));
    });
  }

  /* ---- Größenklasse -------------------------------------------------- */
  function zahl(id) {
    var el = document.getElementById(id);
    if (!el) return NaN;
    var roh = String(el.value).trim().replace(/\s/g, '').replace(',', '.');
    if (roh === '') return NaN;
    var n = parseFloat(roh);
    return isFinite(n) ? n : NaN;
  }

  function groessenklasse() {
    var ma = zahl('mitarbeitende');
    var umsatz = zahl('umsatz');
    var bilanz = zahl('bilanz');

    var finanzGross = isFinite(umsatz) && isFinite(bilanz) && umsatz > 50 && bilanz > 43;
    var finanzMittel = isFinite(umsatz) && isFinite(bilanz) && umsatz > 10 && bilanz > 10;

    if ((isFinite(ma) && ma >= 250) || finanzGross) return 'gross';
    if ((isFinite(ma) && ma >= 50) || finanzMittel) return 'mittel';
    if (!isFinite(ma) && !isFinite(umsatz) && !isFinite(bilanz)) return null;
    return 'klein';
  }

  var GROESSE_TEXT = {
    gross: 'Großes Unternehmen — mindestens 250 Beschäftigte oder über 50 Mio. € Umsatz und über 43 Mio. € Bilanzsumme.',
    mittel: 'Mittleres Unternehmen — mindestens 50 Beschäftigte oder über 10 Mio. € Umsatz und über 10 Mio. € Bilanzsumme.',
    klein: 'Kleines oder Kleinstunternehmen — die Schwelle zum mittleren Unternehmen wird nicht erreicht.'
  };

  var groessenHinweis = document.getElementById('groessen-hinweis');
  ['mitarbeitende', 'umsatz', 'bilanz'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', groessenHinweisAktualisieren);
  });

  function groessenHinweisAktualisieren() {
    var k = groessenklasse();
    groessenHinweis.textContent = k ? 'Einstufung nach Ihren Angaben: ' + GROESSE_TEXT[k] : '';
  }

  /* ---- Bewertung ----------------------------------------------------- */
  function bewerten() {
    var sf = zustand.sonderfaelle;
    var eintrag = zustand.teil ? TEILE[zustand.teil] : null;
    var klasse = groessenklasse();
    var begruendung = [];

    if (zustand.sektor === 'keiner') {
      return {
        stufe: 'keine',
        titel: 'Nicht unmittelbar vom NISG 2026 erfasst',
        begruendung: ['Ihre Tätigkeit fällt nach Ihren Angaben in keinen der 18 Sektoren der Anlagen 1 und 2.'],
        klasse: klasse
      };
    }
    if (!eintrag) return null;

    var teil = eintrag.teil;
    var anlageEins = eintrag.anlage.id === 'a1';

    begruendung.push('Sektor: ' + eintrag.sektor.name + ' (' + eintrag.anlage.kurz + ' — ' + eintrag.anlage.titel + ').');
    begruendung.push('Teilsektor: ' + teil.name + '.');
    if (klasse) begruendung.push('Größenklasse: ' + GROESSE_TEXT[klasse]);

    var stufe = null;

    // 0. Ausdrücklich ausgenommene Teilsektoren: hier endet die Prüfung für
    //    diesen Sektor, eine Erfassung über einen anderen Sektor bleibt möglich.
    if (teil.ausgenommen) {
      begruendung.push(teil.einschraenkung || 'Dieser Teilsektor ist ausdrücklich ausgenommen.');
      return {
        stufe: 'keine',
        titel: 'In diesem Sektor nicht erfasst',
        begruendung: begruendung,
        klasse: klasse,
        ausgenommen: true,
        teil: teil,
        sektor: eintrag.sektor,
        anlage: eintrag.anlage,
        dora: sf.indexOf('dora') !== -1,
        stoerung: sf.indexOf('stoerung') !== -1
      };
    }

    // 1. Sonderfälle und größenunabhängige Tätigkeiten schlagen die Größenlogik.
    if (teil.groessenunabhaengig === 'wesentlich') {
      stufe = 'wesentlich';
      begruendung.push('Diese Tätigkeit gilt unabhängig von der Unternehmensgröße als wesentliche Einrichtung.');
      if (teil.optIn) begruendung.push(teil.hinweis);
    }
    if (sf.indexOf('alleinanbieter') !== -1) {
      stufe = 'wesentlich';
      begruendung.push('Als alleiniger Anbieter eines wesentlichen Dienstes in Österreich erfolgt die Einstufung unabhängig von der Größe.');
    }
    if (sf.indexOf('cer') !== -1) {
      stufe = 'wesentlich';
      begruendung.push('Als nach der CER-Richtlinie identifizierte kritische Einrichtung gilt die Einstufung als wesentliche Einrichtung.');
    }
    if (sf.indexOf('altbetreiber') !== -1) {
      stufe = 'wesentlich';
      begruendung.push('Eine frühere Einstufung als Betreiber wesentlicher Dienste nach dem NISG 2018 wirkt fort.');
    }

    // 2. Regelfall über Anlage und Größenklasse.
    if (!stufe) {
      if (teil.wesentlichAbMittel && (klasse === 'mittel' || klasse === 'gross')) {
        stufe = 'wesentlich';
        begruendung.push('Anbieter öffentlicher elektronischer Kommunikationsnetze und -dienste gelten ab mittlerer Unternehmensgröße als wesentliche Einrichtung.');
      } else if (anlageEins && klasse === 'gross') {
        stufe = 'wesentlich';
        begruendung.push('Große Unternehmen aus Anlage 1 gelten als wesentliche Einrichtungen.');
      } else if (anlageEins && klasse === 'mittel') {
        stufe = 'wichtig';
        begruendung.push('Mittlere Unternehmen aus Anlage 1 gelten als wichtige Einrichtungen.');
      } else if (!anlageEins && (klasse === 'mittel' || klasse === 'gross')) {
        stufe = 'wichtig';
        begruendung.push('Mittlere und große Unternehmen aus Anlage 2 gelten als wichtige Einrichtungen.');
      } else if (teil.groessenunabhaengig === 'wichtig') {
        stufe = 'wichtig';
        begruendung.push('Diese Tätigkeit ist unabhängig von der Unternehmensgröße erfasst und wird als wichtige Einrichtung eingestuft.');
      } else if (klasse === 'klein') {
        stufe = 'keine';
        begruendung.push('Die Größenschwelle zum mittleren Unternehmen wird nicht erreicht, und es greift keine größenunabhängige Sonderregel.');
      } else if (!klasse) {
        stufe = 'unklar';
        begruendung.push('Ohne Angaben zur Unternehmensgröße lässt sich die Einstufung nicht abschließen.');
      }
    }

    if (teil.groessenunabhaengig === 'wichtig' && stufe === 'keine') {
      stufe = 'wichtig';
      begruendung.push('Diese Tätigkeit ist unabhängig von der Unternehmensgröße erfasst.');
    }

    var titel = {
      wesentlich: 'Wesentliche Einrichtung',
      wichtig: 'Wichtige Einrichtung',
      keine: 'Nicht unmittelbar vom NISG 2026 erfasst',
      unklar: 'Angaben unvollständig'
    }[stufe];

    return {
      stufe: stufe,
      titel: titel,
      begruendung: begruendung,
      klasse: klasse,
      dora: sf.indexOf('dora') !== -1,
      stoerung: sf.indexOf('stoerung') !== -1,
      teil: teil,
      sektor: eintrag.sektor,
      anlage: eintrag.anlage
    };
  }

  /* ---- Ergebnisdarstellung ------------------------------------------- */
  var ergebnisHost = document.getElementById('ergebnis');
  var letzterBericht = '';

  function pflichtenListe(stufe) {
    var strafe = stufe === 'wesentlich'
      ? 'bis 10 Mio. € oder 2 % des weltweiten Jahresumsatzes — der jeweils höhere Betrag'
      : 'bis 7 Mio. € oder 1,4 % des weltweiten Jahresumsatzes — der jeweils höhere Betrag';
    var aufsicht = stufe === 'wesentlich'
      ? 'Vorausschauende und nachträgliche Aufsicht: Die Behörde darf auch ohne konkreten Anlass prüfen.'
      : 'Nachträgliche Aufsicht: Die Behörde wird bei Anhaltspunkten für einen Verstoß tätig.';
    return [
      ['Registrierung', 'Bei der Cybersicherheitsbehörde bis spätestens 31. Dezember 2026.'],
      ['Risikomanagement', 'Geeignete und verhältnismäßige Maßnahmen in den zehn Bereichen des § 32 NISG 2026.'],
      ['Meldepflichten', 'Frühwarnung binnen 24 Stunden, Meldung binnen 72 Stunden, Abschlussbericht binnen eines Monats — an das zuständige CSIRT.'],
      ['Selbstdeklaration', 'Strukturierte Erklärung an die Cybersicherheitsbehörde bis 30. September 2027.'],
      ['Leitungspflichten', 'Die Geschäftsleitung muss die Maßnahmen billigen, ihre Umsetzung überwachen und selbst an Schulungen teilnehmen.'],
      ['Aufsicht', aufsicht],
      ['Strafrahmen', strafe]
    ];
  }

  function ergebnisAnzeigen() {
    var r = bewerten();
    ergebnisHost.innerHTML = '';
    if (!r) {
      ergebnisHost.appendChild(absatz('Bitte wählen Sie zuerst einen Sektor und eine Tätigkeit aus.'));
      return;
    }

    var klassenName = { wesentlich: 'essential', wichtig: 'important', keine: 'none', unklar: 'none' }[r.stufe];
    var box = document.createElement('div');
    box.className = 'result result--' + klassenName;

    var h = document.createElement('p');
    h.className = 'verdict verdict--' + klassenName;
    h.textContent = r.titel;
    box.appendChild(h);

    if (r.stufe === 'wesentlich' || r.stufe === 'wichtig') {
      box.appendChild(absatz('Nach Ihren Angaben fällt Ihre Organisation in den Anwendungsbereich des NISG 2026. Die Pflichten gelten seit 1. Oktober 2026.'));
    } else if (r.stufe === 'keine') {
      box.appendChild(absatz('Nach Ihren Angaben besteht keine unmittelbare Pflicht aus dem NISG 2026. Anforderungen können Sie dennoch über die Lieferkette Ihrer Kunden erreichen.'));
    } else {
      box.appendChild(absatz('Ergänzen Sie bitte die Angaben zur Unternehmensgröße in Schritt 3, damit die Einstufung abgeschlossen werden kann.'));
    }

    var hb = document.createElement('h3');
    hb.textContent = 'Begründung';
    box.appendChild(hb);
    var ul = document.createElement('ul');
    r.begruendung.forEach(function (z) {
      var li = document.createElement('li');
      li.textContent = z;
      ul.appendChild(li);
    });
    box.appendChild(ul);
    ergebnisHost.appendChild(box);

    if (r.stufe === 'wesentlich' || r.stufe === 'wichtig') {
      var hp = document.createElement('h3');
      hp.textContent = 'Was daraus folgt';
      ergebnisHost.appendChild(hp);

      var wrap = document.createElement('div');
      wrap.className = 'table-wrap';
      var tabelle = document.createElement('table');
      var caption = document.createElement('caption');
      caption.textContent = 'Pflichten und Fristen für Ihre Einstufung als ' +
        (r.stufe === 'wesentlich' ? 'wesentliche' : 'wichtige') + ' Einrichtung.';
      tabelle.appendChild(caption);
      var thead = document.createElement('thead');
      thead.innerHTML = '<tr><th scope="col">Pflicht</th><th scope="col">Inhalt</th></tr>';
      tabelle.appendChild(thead);
      var tbody = document.createElement('tbody');
      pflichtenListe(r.stufe).forEach(function (zeile) {
        var tr = document.createElement('tr');
        var th = document.createElement('th');
        th.scope = 'row';
        th.textContent = zeile[0];
        var td = document.createElement('td');
        td.textContent = zeile[1];
        tr.appendChild(th);
        tr.appendChild(td);
        tbody.appendChild(tr);
      });
      tabelle.appendChild(tbody);
      wrap.appendChild(tabelle);
      ergebnisHost.appendChild(wrap);
    }

    if (r.ausgenommen) {
      ergebnisHost.appendChild(hinweisKasten('warn', 'Prüfen Sie Ihre übrigen Tätigkeiten',
        'Die Ausnahme gilt nur für den Sektor öffentliche Verwaltung. Betreiben Sie daneben etwa die ' +
        'Trinkwasser- oder Abwasserversorgung, die Abfallbewirtschaftung, Energie- oder Verkehrsdienste ' +
        'oder digitale Infrastruktur, kann eine Erfassung über diesen Sektor bestehen, sobald die ' +
        'Größenschwelle erreicht wird. Führen Sie den Check für jede dieser Tätigkeiten gesondert durch.'));
    }

    if (r.stufe === 'keine' && !r.ausgenommen) {
      ergebnisHost.appendChild(hinweisKasten('note', 'Was trotzdem auf Sie zukommt',
        'Betroffene Einrichtungen müssen nach § 32 Z 4 NISG 2026 die Sicherheit ihrer unmittelbaren Anbieter steuern. ' +
        'Rechnen Sie mit Lieferantenfragebögen sowie mit Sicherheits-, Melde- und Auditklauseln in Verträgen. ' +
        'Unabhängig davon gilt die DSGVO ohne Größenschwelle, sobald Sie personenbezogene Daten verarbeiten.'));
    }

    if (r.dora) {
      ergebnisHost.appendChild(hinweisKasten('warn', 'DORA geht vor',
        'Sie haben angegeben, ein von der Finanzmarktaufsicht beaufsichtigtes Finanzunternehmen zu sein. ' +
        'Für den Finanzsektor gilt die Verordnung (EU) 2022/2554 (DORA) als sektorspezifische Spezialregelung; ' +
        'die entsprechenden Anforderungen sind über DORA und nicht zusätzlich über das NISG zu erfüllen. ' +
        'Prüfen Sie gesondert, ob Tochtergesellschaften außerhalb des Finanzsektors dennoch unter das NISG fallen.'));
    }

    if (r.stoerung && r.stufe !== 'wesentlich') {
      ergebnisHost.appendChild(hinweisKasten('warn', 'Mögliche Höherstufung im Einzelfall',
        'Sie haben angegeben, dass eine Störung erhebliche Auswirkungen auf die öffentliche Ordnung, Sicherheit oder ' +
        'Gesundheit hätte. Das Gesetz erlaubt es, einzelne Einrichtungen aufgrund solcher Umstände unabhängig von ' +
        'der Größe zu erfassen oder strenger einzustufen. Diese Beurteilung ist behördlich und lässt sich nicht ' +
        'automatisiert vorwegnehmen — hier ist eine fachliche Prüfung angezeigt.'));
    }

    var naechste = document.createElement('div');
    naechste.className = 'no-print';
    naechste.innerHTML =
      '<h3>Nächste Schritte</h3>' +
      (r.stufe === 'wesentlich' || r.stufe === 'wichtig'
        ? '<ol>' +
          '<li>Dieses Ergebnis mit Datum ablegen — es ist der Nachweis Ihrer Selbsteinschätzung.</li>' +
          '<li>Eine verantwortliche Person namentlich benennen, mit Vertretung.</li>' +
          '<li>Meldeweg festlegen und aushängen, bevor Sie mit den Maßnahmen beginnen.</li>' +
          '<li>Registrieren — Frist 31. Dezember 2026.</li>' +
          '<li>Ist-Aufnahme entlang der zehn Maßnahmenbereiche durchführen.</li>' +
          '</ol>'
        : '<ol>' +
          '<li>Dieses Ergebnis mit Datum und Datenbasis ablegen — auch die negative Feststellung gehört dokumentiert.</li>' +
          '<li>Bei wesentlichen Änderungen erneut prüfen: Wachstum, Zukäufe, neue Geschäftsfelder.</li>' +
          '<li>DSGVO-Pflichten prüfen — sie gelten unabhängig von der Größe.</li>' +
          '</ol>') +
      '<div class="btn-row">' +
      '<a class="btn btn--tool" href="reifegrad.html">Reifegrad bewerten</a>' +
      '<a class="btn btn--ghost" href="notfallkarte.html">Notfallkarte erstellen</a>' +
      '<a class="btn btn--ghost" href="../umsetzung.html">Umsetzungsfahrplan</a>' +
      '</div>';
    ergebnisHost.appendChild(naechste);

    letzterBericht = berichtErzeugen(r);
  }

  function absatz(text) {
    var p = document.createElement('p');
    p.textContent = text;
    return p;
  }

  function hinweisKasten(art, titel, text) {
    var div = document.createElement('div');
    div.className = 'callout callout--' + art;
    var h = document.createElement('p');
    h.className = 'callout__title';
    h.textContent = titel;
    var p = document.createElement('p');
    p.className = 'mb-0';
    p.textContent = text;
    div.appendChild(h);
    div.appendChild(p);
    return div;
  }

  function berichtErzeugen(r) {
    var zeilen = [];
    zeilen.push('BETROFFENHEITSPRÜFUNG NACH DEM NISG 2026');
    zeilen.push('='.repeat(60));
    zeilen.push('');
    zeilen.push('Datum der Prüfung: ' + new Date().toLocaleDateString('de-AT', { day: '2-digit', month: 'long', year: 'numeric' }));
    zeilen.push('Geprüft durch:    ______________________________________');
    zeilen.push('Freigegeben von:  ______________________________________');
    zeilen.push('');
    zeilen.push('ERGEBNIS: ' + r.titel.toUpperCase());
    zeilen.push('');
    zeilen.push('BEGRÜNDUNG');
    zeilen.push('-'.repeat(60));
    r.begruendung.forEach(function (z, i) { zeilen.push((i + 1) + '. ' + z); });
    zeilen.push('');

    if (r.stufe === 'wesentlich' || r.stufe === 'wichtig') {
      zeilen.push('PFLICHTEN UND FRISTEN');
      zeilen.push('-'.repeat(60));
      pflichtenListe(r.stufe).forEach(function (p) {
        zeilen.push(p[0] + ': ' + p[1]);
      });
      zeilen.push('');
      zeilen.push('NÄCHSTE SCHRITTE');
      zeilen.push('-'.repeat(60));
      zeilen.push('1. Dieses Ergebnis mit Datum ablegen (Nachweis der Selbsteinschätzung).');
      zeilen.push('2. Verantwortliche Person und Vertretung namentlich benennen.');
      zeilen.push('3. Meldeweg festlegen und aushängen.');
      zeilen.push('4. Registrierung bei der Cybersicherheitsbehörde bis 31.12.2026.');
      zeilen.push('5. Ist-Aufnahme entlang der zehn Maßnahmenbereiche des § 32.');
    } else {
      zeilen.push('HINWEIS');
      zeilen.push('-'.repeat(60));
      zeilen.push('Keine unmittelbare Pflicht aus dem NISG 2026. Anforderungen können über die');
      zeilen.push('Lieferkette von Kunden auf Sie zukommen. Die DSGVO gilt unabhängig von der Größe.');
      zeilen.push('Bei wesentlichen Änderungen (Wachstum, Zukäufe, neue Geschäftsfelder) erneut prüfen.');
    }

    if (r.dora) {
      zeilen.push('');
      zeilen.push('SONDERHINWEIS: Für Finanzunternehmen geht DORA (VO (EU) 2022/2554) als');
      zeilen.push('sektorspezifische Spezialregelung vor.');
    }

    zeilen.push('');
    zeilen.push('-'.repeat(60));
    zeilen.push('Grundlage: Anlagen 1 und 2 NISG 2026 (BGBl. I Nr. 94/2025); Größendefinition');
    zeilen.push('nach Empfehlung 2003/361/EG. Diese Auswertung ist eine Orientierungshilfe und');
    zeilen.push('keine rechtsverbindliche Feststellung. Grenzfälle - Konzernstrukturen,');
    zeilen.push('Mischtätigkeiten, grenzüberschreitende Sachverhalte - erfordern fachliche Prüfung.');
    return zeilen.join('\n');
  }

  /* ---- Ablaufsteuerung ----------------------------------------------- */
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-panel]'));
  var schritte = Array.prototype.slice.call(document.querySelectorAll('#schrittanzeige li'));

  function zeigeSchritt(nr) {
    panels.forEach(function (p) { p.hidden = p.dataset.panel !== String(nr); });
    schritte.forEach(function (li) {
      var n = Number(li.dataset.schritt);
      li.classList.toggle('is-current', n === nr);
      li.classList.toggle('is-done', n < nr);
      if (n === nr) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });
    var h = document.getElementById('h-schritt-' + nr);
    if (h) h.focus();
  }

  document.querySelectorAll('[data-weiter]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var ziel = Number(btn.dataset.weiter);

      if (ziel === 2) {
        var gewaehlt = document.querySelector('input[name="sektor"]:checked');
        if (!gewaehlt) { meldung('Bitte wählen Sie zuerst einen Sektor aus.'); return; }
        zustand.sektor = gewaehlt.value;
        if (zustand.sektor === 'keiner') {
          zustand.teil = null;
          zeigeSchritt(5);
          ergebnisAnzeigen();
          return;
        }
        teilsektorenAufbauen(zustand.sektor);
      }

      if (ziel === 3) {
        var teil = document.querySelector('input[name="teilsektor"]:checked');
        if (!teil) { meldung('Bitte wählen Sie eine Tätigkeit aus.'); return; }
        zustand.teil = teil.value;
        groessenHinweisAktualisieren();
      }

      if (ziel === 4) {
        if (!groessenklasse()) {
          meldung('Bitte machen Sie mindestens eine Angabe zur Größe — Beschäftigte oder Umsatz und Bilanzsumme.');
          return;
        }
      }

      if (ziel === 5) {
        zustand.sonderfaelle = Array.prototype.map.call(
          document.querySelectorAll('input[name="sonderfall"]:checked'),
          function (el) { return el.value; }
        );
        zeigeSchritt(5);
        ergebnisAnzeigen();
        return;
      }

      zeigeSchritt(ziel);
    });
  });

  document.querySelectorAll('[data-zurueck]').forEach(function (btn) {
    btn.addEventListener('click', function () { zeigeSchritt(Number(btn.dataset.zurueck)); });
  });

  function meldung(text) {
    var ziel = document.querySelector('[data-panel]:not([hidden]) h2');
    if (!ziel) return;
    var vorhanden = ziel.parentNode.querySelector('.js-meldung');
    if (vorhanden) vorhanden.remove();
    var p = document.createElement('p');
    p.className = 'js-meldung notice-inline';
    p.setAttribute('role', 'alert');
    p.style.color = 'var(--crit)';
    p.textContent = text;
    ziel.parentNode.insertBefore(p, ziel.nextSibling);
  }

  var drucken = document.getElementById('drucken');
  if (drucken) drucken.addEventListener('click', function () { window.print(); });

  var herunterladen = document.getElementById('herunterladen');
  if (herunterladen) {
    herunterladen.addEventListener('click', function () {
      if (!letzterBericht) return;
      var stempel = new Date().toISOString().slice(0, 10);
      window.ISSEC.download('betroffenheitspruefung-nisg-2026-' + stempel + '.txt', letzterBericht);
    });
  }

  var neu = document.getElementById('neu');
  if (neu) {
    neu.addEventListener('click', function () {
      document.getElementById('check').reset();
      zustand = { sektor: null, teil: null, sonderfaelle: [] };
      teilHost.innerHTML = '';
      ergebnisHost.innerHTML = '';
      groessenHinweis.textContent = '';
      zeigeSchritt(1);
    });
  }

  zeigeSchritt(1);
})();
