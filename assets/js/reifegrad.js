/* =========================================================================
   Reifegrad-Bewertung nach § 32 NISG 2026
   40 Fragen, vier Stufen, Auswertung je Maßnahmenbereich. Rechnet lokal;
   die Fragen stehen als JSON im Dokument, kein Netzwerkzugriff.
   ========================================================================= */
(function () {
  'use strict';

  var knoten = document.getElementById('massnahmen-daten');
  var werkzeug = document.getElementById('werkzeug');
  if (!knoten || !werkzeug) return;

  var DATEN;
  try { DATEN = JSON.parse(knoten.textContent); } catch (e) { return; }
  werkzeug.hidden = false;

  var STUFEN = [
    { wert: 0, kurz: 'Nein', lang: 'Nicht umgesetzt oder unbekannt' },
    { wert: 1, kurz: 'Ansatzweise', lang: 'Informell, nicht geregelt' },
    { wert: 2, kurz: 'Weitgehend', lang: 'Geregelt und gelebt, mit Lücken' },
    { wert: 3, kurz: 'Nachweisbar', lang: 'Geregelt, gelebt und belegbar' }
  ];

  var host = document.getElementById('bereiche');
  var gesamtFragen = 0;

  DATEN.bereiche.forEach(function (bereich) {
    var section = document.createElement('section');
    section.className = 'tool';
    section.id = 'bereich-' + bereich.id;

    var kopf = document.createElement('div');
    kopf.className = 'tool__head';
    var h = document.createElement('h2');
    h.textContent = bereich.nr + '. ' + bereich.titel;
    var tag = document.createElement('span');
    tag.className = 'tag tag--nisg';
    tag.textContent = '§ 32 Z ' + bereich.nr;
    kopf.appendChild(h);
    kopf.appendChild(tag);
    section.appendChild(kopf);

    var klartext = document.createElement('div');
    klartext.className = 'callout callout--plain';
    klartext.innerHTML = '<p class="callout__title">Klartext</p>';
    var kp = document.createElement('p');
    kp.className = 'mb-0';
    kp.textContent = bereich.klartext;
    klartext.appendChild(kp);
    section.appendChild(klartext);

    var fieldset = document.createElement('fieldset');
    var legend = document.createElement('legend');
    legend.className = 'visually-hidden';
    legend.textContent = 'Fragen zu ' + bereich.titel;
    fieldset.appendChild(legend);

    bereich.fragen.forEach(function (frage, i) {
      gesamtFragen++;
      var name = bereich.id + '-f' + i;
      var block = document.createElement('div');
      block.className = 'field field--wide';

      var gruppe = document.createElement('fieldset');
      gruppe.style.border = '0';
      gruppe.style.padding = '0';
      gruppe.style.margin = '0';
      var frageLegend = document.createElement('legend');
      frageLegend.className = 'field__label';
      frageLegend.style.fontFamily = 'inherit';
      frageLegend.style.fontSize = '.95rem';
      frageLegend.style.fontWeight = '600';
      frageLegend.textContent = frage;
      gruppe.appendChild(frageLegend);

      var reihe = document.createElement('div');
      reihe.className = 'choices choices--2';
      STUFEN.forEach(function (stufe) {
        var label = document.createElement('label');
        label.className = 'choice';
        var input = document.createElement('input');
        input.type = 'radio';
        input.name = name;
        input.value = String(stufe.wert);
        input.dataset.bereich = bereich.id;
        input.addEventListener('change', fortschrittAktualisieren);
        var text = document.createElement('span');
        text.className = 'choice__text';
        var t = document.createElement('span');
        t.className = 'choice__title';
        t.textContent = stufe.wert + ' — ' + stufe.kurz;
        var d = document.createElement('span');
        d.className = 'choice__desc';
        d.textContent = stufe.lang;
        text.appendChild(t);
        text.appendChild(d);
        label.appendChild(input);
        label.appendChild(text);
        reihe.appendChild(label);
      });
      gruppe.appendChild(reihe);
      block.appendChild(gruppe);
      fieldset.appendChild(block);
    });

    section.appendChild(fieldset);

    var zuordnung = document.createElement('details');
    zuordnung.innerHTML = '<summary>Zuordnung zu ISO 27001 und DSGVO sowie typische Nachweise</summary>';
    var body = document.createElement('div');
    body.className = 'details__body';
    body.innerHTML =
      '<p class="small"><span class="tag tag--iso">ISO 27001</span> ' + escape(bereich.iso.join(' · ')) + '</p>' +
      '<p class="small"><span class="tag tag--dsgvo">DSGVO</span> ' + escape(bereich.dsgvo.join(' · ')) + '</p>' +
      '<p class="small"><span class="tag">Typische Nachweise</span> ' + escape(bereich.nachweis) + '</p>';
    zuordnung.appendChild(body);
    section.appendChild(zuordnung);

    host.appendChild(section);
  });

  function escape(s) { return window.ISSEC.escapeHTML(s); }

  /* ---- Fortschritt --------------------------------------------------- */
  var balken = document.getElementById('fortschritt-balken');
  var fortschrittText = document.getElementById('fortschritt-text');

  function beantwortet() {
    var namen = {};
    document.querySelectorAll('#bereiche input[type="radio"]:checked').forEach(function (el) {
      namen[el.name] = true;
    });
    return Object.keys(namen).length;
  }

  function fortschrittAktualisieren() {
    var n = beantwortet();
    var anteil = Math.round((n / gesamtFragen) * 100);
    balken.style.width = anteil + '%';
    fortschrittText.textContent = n + ' von ' + gesamtFragen + ' Fragen beantwortet';
  }

  /* ---- Auswertung ---------------------------------------------------- */
  function auswerten() {
    return DATEN.bereiche.map(function (bereich) {
      var punkte = 0;
      var max = bereich.fragen.length * 3;
      var offen = 0;
      bereich.fragen.forEach(function (_, i) {
        var gewaehlt = document.querySelector('input[name="' + bereich.id + '-f' + i + '"]:checked');
        if (gewaehlt) punkte += Number(gewaehlt.value); else offen++;
      });
      return {
        bereich: bereich,
        punkte: punkte,
        max: max,
        offen: offen,
        anteil: max ? punkte / max : 0
      };
    });
  }

  function stufeName(anteil) {
    if (anteil >= 0.85) return 'Belastbar';
    if (anteil >= 0.6) return 'Tragfähig mit Lücken';
    if (anteil >= 0.35) return 'Im Aufbau';
    return 'Kritische Lücke';
  }

  function balkenKlasse(anteil) {
    if (anteil >= 0.85) return 'meter__bar meter__bar--high';
    if (anteil >= 0.6) return 'meter__bar';
    if (anteil >= 0.35) return 'meter__bar meter__bar--mid';
    return 'meter__bar meter__bar--low';
  }

  var ausgabe = document.getElementById('auswertung');
  var ausgabeInhalt = document.getElementById('auswertung-inhalt');
  var letzterBericht = '';

  function auswertungAnzeigen() {
    var werte = auswerten();
    var summe = werte.reduce(function (a, w) { return a + w.punkte; }, 0);
    var maxSumme = werte.reduce(function (a, w) { return a + w.max; }, 0);
    var gesamt = maxSumme ? summe / maxSumme : 0;
    var offenGesamt = werte.reduce(function (a, w) { return a + w.offen; }, 0);

    ausgabeInhalt.innerHTML = '';

    var box = document.createElement('div');
    box.className = 'result';
    var titel = document.createElement('p');
    titel.className = 'verdict';
    titel.textContent = 'Gesamtreifegrad: ' + Math.round(gesamt * 100) + ' % — ' + stufeName(gesamt);
    box.appendChild(titel);

    var meter = document.createElement('span');
    meter.className = 'meter';
    var bar = document.createElement('span');
    bar.className = balkenKlasse(gesamt);
    bar.style.width = Math.round(gesamt * 100) + '%';
    meter.appendChild(bar);
    box.appendChild(meter);

    var erl = document.createElement('p');
    erl.style.marginTop = '.9rem';
    erl.className = 'mb-0';
    erl.textContent = summe + ' von ' + maxSumme + ' möglichen Punkten' +
      (offenGesamt ? ' — ' + offenGesamt + ' Fragen wurden nicht beantwortet und als „nicht umgesetzt" gewertet.' : '.');
    box.appendChild(erl);
    ausgabeInhalt.appendChild(box);

    var hProfil = document.createElement('h3');
    hProfil.textContent = 'Profil nach Maßnahmenbereich';
    ausgabeInhalt.appendChild(hProfil);

    var profil = document.createElement('div');
    werte.forEach(function (w) {
      var zeile = document.createElement('div');
      zeile.className = 'scorerow';
      var links = document.createElement('div');
      var lab = document.createElement('div');
      lab.className = 'scorerow__label';
      lab.textContent = w.bereich.nr + '. ' + w.bereich.titel;
      var meta = document.createElement('div');
      meta.className = 'scorerow__meta';
      meta.textContent = stufeName(w.anteil) + ' · ' + w.punkte + ' von ' + w.max + ' Punkten';
      var m = document.createElement('span');
      m.className = 'meter';
      m.style.marginTop = '.35rem';
      var b = document.createElement('span');
      b.className = balkenKlasse(w.anteil);
      b.style.width = Math.round(w.anteil * 100) + '%';
      m.appendChild(b);
      links.appendChild(lab);
      links.appendChild(meta);
      links.appendChild(m);
      var rechts = document.createElement('div');
      rechts.className = 'scorerow__val';
      rechts.textContent = Math.round(w.anteil * 100) + ' %';
      zeile.appendChild(links);
      zeile.appendChild(rechts);
      profil.appendChild(zeile);
    });
    ausgabeInhalt.appendChild(profil);

    var luecken = werte.slice().sort(function (a, b) { return a.anteil - b.anteil; })
      .filter(function (w) { return w.anteil < 0.85; }).slice(0, 5);

    var hL = document.createElement('h3');
    hL.textContent = luecken.length ? 'Diese Lücken zuerst schließen' : 'Keine wesentlichen Lücken';
    ausgabeInhalt.appendChild(hL);

    if (!luecken.length) {
      var ok = document.createElement('p');
      ok.textContent = 'Alle Bereiche liegen bei mindestens 85 %. Der nächste sinnvolle Schritt ist eine ' +
        'unabhängige Überprüfung — die Selbsteinschätzung stößt hier an ihre Grenze.';
      ausgabeInhalt.appendChild(ok);
    } else {
      var ol = document.createElement('ol');
      luecken.forEach(function (w) {
        var li = document.createElement('li');
        var strong = document.createElement('strong');
        strong.textContent = w.bereich.titel + ' (' + Math.round(w.anteil * 100) + ' %)';
        li.appendChild(strong);
        var p = document.createElement('p');
        p.style.margin = '.3rem 0 0';
        p.textContent = w.bereich.klartext;
        li.appendChild(p);
        var q = document.createElement('p');
        q.className = 'small muted';
        q.style.margin = '.3rem 0 0';
        q.textContent = 'Typische Nachweise: ' + w.bereich.nachweis + '. ISO 27001: ' +
          w.bereich.iso.join(', ') + '. DSGVO: ' + w.bereich.dsgvo.join(', ') + '.';
        li.appendChild(q);
        ol.appendChild(li);
      });
      ausgabeInhalt.appendChild(ol);
    }

    var hinweis = document.createElement('div');
    hinweis.className = 'callout callout--note no-print';
    hinweis.innerHTML =
      '<p class="callout__title">Was Sie mit diesem Ergebnis tun</p>' +
      '<p>Legen Sie es der Geschäftsleitung vor. Es ist die Grundlage für den Managementbeschluss ' +
      'nach dem NISG 2026: Welche Maßnahmen werden mit welchem Budget bis wann umgesetzt — und ' +
      'welche Restrisiken werden bewusst getragen?</p>' +
      '<p class="mb-0"><a href="richtlinien-generator.html">Vorlage für den Managementbeschluss erzeugen</a> · ' +
      '<a href="../umsetzung.html">Umsetzungsfahrplan</a></p>';
    ausgabeInhalt.appendChild(hinweis);

    letzterBericht = berichtErzeugen(werte, gesamt, summe, maxSumme, offenGesamt);

    ausgabe.hidden = false;
    document.getElementById('auswertung-titel').focus();
  }

  function berichtErzeugen(werte, gesamt, summe, maxSumme, offen) {
    var z = [];
    z.push('REIFEGRAD-SELBSTBEWERTUNG NACH § 32 NISG 2026');
    z.push('='.repeat(64));
    z.push('');
    z.push('Datum:            ' + new Date().toLocaleDateString('de-AT', { day: '2-digit', month: 'long', year: 'numeric' }));
    z.push('Bewertet durch:   ______________________________________');
    z.push('Zur Kenntnis:     ______________________________________');
    z.push('');
    z.push('GESAMTERGEBNIS: ' + Math.round(gesamt * 100) + ' % — ' + stufeName(gesamt));
    z.push(summe + ' von ' + maxSumme + ' möglichen Punkten' + (offen ? ' (' + offen + ' Fragen unbeantwortet, als nicht umgesetzt gewertet)' : ''));
    z.push('');
    z.push('PROFIL NACH MASSNAHMENBEREICH');
    z.push('-'.repeat(64));
    werte.forEach(function (w) {
      var prozent = Math.round(w.anteil * 100);
      var block = '#'.repeat(Math.round(prozent / 5)) + '.'.repeat(20 - Math.round(prozent / 5));
      z.push(('§ 32 Z ' + w.bereich.nr).padEnd(10) + block + ' ' + String(prozent).padStart(3) + ' %  ' + w.bereich.titel);
    });
    z.push('');
    z.push('LÜCKEN NACH PRIORITÄT');
    z.push('-'.repeat(64));
    var luecken = werte.slice().sort(function (a, b) { return a.anteil - b.anteil; })
      .filter(function (w) { return w.anteil < 0.85; });
    if (!luecken.length) {
      z.push('Keine Bereiche unter 85 %. Nächster Schritt: unabhängige Überprüfung.');
    } else {
      luecken.forEach(function (w, i) {
        z.push('');
        z.push((i + 1) + '. ' + w.bereich.titel + ' (' + Math.round(w.anteil * 100) + ' %)');
        z.push('   Ziel:      ' + w.bereich.klartext);
        z.push('   Nachweise: ' + w.bereich.nachweis);
        z.push('   ISO 27001: ' + w.bereich.iso.join(', '));
        z.push('   DSGVO:     ' + w.bereich.dsgvo.join(', '));
        z.push('   Maßnahme:  ______________________________________');
        z.push('   Bis wann:  ____________  Verantwortlich: __________');
      });
    }
    z.push('');
    z.push('-'.repeat(64));
    z.push('Selbstbewertung, kein Audit. Ersetzt nicht die Bewertung der Wirksamkeit');
    z.push('nach § 32 Z 6 NISG 2026 durch eine unabhängige Stelle. Die Zuordnung zu');
    z.push('ISO/IEC 27001:2022 und zur DSGVO ist eine redaktionelle Arbeitshilfe.');
    return z.join('\n');
  }

  document.getElementById('auswerten').addEventListener('click', auswertungAnzeigen);

  document.getElementById('zuruecksetzen').addEventListener('click', function () {
    document.getElementById('bewertung').reset();
    ausgabe.hidden = true;
    ausgabeInhalt.innerHTML = '';
    letzterBericht = '';
    fortschrittAktualisieren();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.getElementById('drucken').addEventListener('click', function () { window.print(); });

  document.getElementById('herunterladen').addEventListener('click', function () {
    if (!letzterBericht) return;
    var stempel = new Date().toISOString().slice(0, 10);
    window.ISSEC.download('reifegrad-nisg-2026-' + stempel + '.txt', letzterBericht);
  });

  fortschrittAktualisieren();
})();
