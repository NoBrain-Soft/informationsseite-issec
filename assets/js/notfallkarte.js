/* =========================================================================
   Notfallkarte
   Erzeugt eine druckbare Karte mit Erstmaßnahmen, Meldewegen und Fristen.
   Leere Angaben werden zu Ausfülllinien, damit die Karte auch unvollständig
   brauchbar bleibt. Arbeitet ausschließlich lokal.
   ========================================================================= */
(function () {
  'use strict';

  var werkzeug = document.getElementById('werkzeug');
  if (!werkzeug) return;
  werkzeug.hidden = false;

  var LINIE = '________________________';

  function feld(id) {
    var el = document.getElementById(id);
    var wert = el ? el.value.trim() : '';
    return wert || LINIE;
  }

  var karte = document.getElementById('karte');
  var bereich = document.getElementById('kartenbereich');

  function nisgErfasst() {
    var el = document.querySelector('input[name="einstufung"]:checked');
    return !el || el.value === 'ja';
  }

  function kontaktliste(paare) {
    var dl = document.createElement('dl');
    dl.className = 'karte__kontakte';
    paare.forEach(function (p) {
      var block = document.createElement('div');
      block.className = 'karte__kontakt';
      var dt = document.createElement('dt');
      dt.textContent = p[0];
      var dd = document.createElement('dd');
      dd.textContent = p[1];
      block.appendChild(dt);
      block.appendChild(dd);
      dl.appendChild(block);
    });
    return dl;
  }

  function abschnitt(ziel, titel) {
    var h = document.createElement('h3');
    h.textContent = titel;
    ziel.appendChild(h);
  }

  function erzeugen() {
    var nisg = nisgErfasst();
    karte.innerHTML = '';

    var box = document.createElement('div');
    box.className = 'karte';

    var kopf = document.createElement('div');
    kopf.className = 'karte__kopf';
    var titel = document.createElement('p');
    titel.className = 'karte__titel';
    titel.textContent = 'Notfallkarte — Sicherheitsvorfall';
    var org = document.createElement('span');
    org.className = 'karte__org';
    org.textContent = (document.getElementById('org').value.trim() || LINIE) +
      ' · Stand ' + new Date().toLocaleDateString('de-AT');
    kopf.appendChild(titel);
    kopf.appendChild(org);
    box.appendChild(kopf);

    abschnitt(box, 'Sofort — die ersten Minuten');
    var sofort = document.createElement('ol');
    [
      'Ruhe bewahren. Nicht selbst analysieren, nicht abwarten.',
      'Uhrzeit notieren: Wann und wodurch haben Sie Kenntnis erlangt? Dieser Zeitpunkt bestimmt alle Fristen.',
      'Meldestelle anrufen (siehe Kontakte). Ein Verdacht genügt.',
      'Nichts löschen, nichts neu aufsetzen, Protokolle nicht überschreiben. Beweise sichern.',
      'Betroffene Geräte vom Netz trennen — Netzwerkkabel ziehen, WLAN aus. Nicht ausschalten.',
      'Keine Lösegeldforderung beantworten, keine Zahlung ohne Entscheidung der Geschäftsleitung.'
    ].forEach(function (t) {
      var li = document.createElement('li');
      li.textContent = t;
      sofort.appendChild(li);
    });
    box.appendChild(sofort);

    abschnitt(box, 'Interne Meldekette');
    box.appendChild(kontaktliste([
      ['Meldestelle', feld('meldestelle')],
      ['Telefon rund um die Uhr', feld('meldestelle_tel')],
      ['Vertretung', feld('vertretung')],
      ['Abschaltung entscheidet', feld('entscheider')],
      ['Ausweichkanal', feld('ausweich')]
    ]));

    abschnitt(box, 'Fristen ab Kenntnis');
    var fristen = document.createElement('div');
    fristen.className = 'karte__fristen';
    var eintraege = [];
    if (nisg) {
      eintraege.push(['24 h', 'Frühwarnung an das CSIRT — knapp halten, Vollständigkeit kommt später']);
      eintraege.push(['72 h', 'Meldung an das CSIRT — Schweregrad, Auswirkungen, betroffene Systeme']);
    }
    eintraege.push(['72 h', 'Meldung an die Datenschutzbehörde, wenn personenbezogene Daten betroffen sind']);
    if (nisg) {
      eintraege.push(['1 Monat', 'Abschlussbericht an das CSIRT — Ursache, Auswirkungen, Maßnahmen']);
    }
    eintraege.push(['unverzüglich', 'Betroffene Personen benachrichtigen, wenn ein hohes Risiko für sie besteht']);

    eintraege.forEach(function (e) {
      var block = document.createElement('div');
      block.className = 'karte__frist';
      var b = document.createElement('b');
      b.textContent = e[0];
      var s = document.createElement('span');
      s.textContent = e[1];
      block.appendChild(b);
      block.appendChild(s);
      fristen.appendChild(block);
    });
    box.appendChild(fristen);

    var fristHinweis = document.createElement('p');
    fristHinweis.style.fontSize = '.84rem';
    fristHinweis.style.margin = '.4rem 0 0';
    fristHinweis.textContent = nisg
      ? 'Höchstfristen. Im Zweifel melden: Eine Meldung zu viel hat keine Sanktion zur Folge, eine zu wenig schon.'
      : 'Freiwillige Meldungen an das CSIRT sind auch für nicht erfasste Einrichtungen ausdrücklich vorgesehen.';
    box.appendChild(fristHinweis);

    abschnitt(box, 'Externe Stellen');
    box.appendChild(kontaktliste([
      ['Hotline WKO', '0800 888 133 — rund um die Uhr'],
      ['IT-Dienstleister', feld('itdienst')],
      ['Forensik / IR', feld('forensik')],
      ['Cyberversicherung', feld('versicherung')],
      ['Datenschutz', feld('datenschutz')],
      ['Kommunikation', feld('kommunikation')],
      ['Polizei', '133 bei Straftatverdacht']
    ]));

    abschnitt(box, 'Was Sie NICHT tun');
    var nicht = document.createElement('ul');
    [
      'Keine betroffenen Systeme neu aufsetzen, bevor Beweise gesichert und die Ursache geklärt sind.',
      'Keine Sicherungen überschreiben — im Zweifel den Sicherungslauf anhalten.',
      'Nicht über kompromittierte Systeme kommunizieren: Angreifer lesen mit.',
      'Keine Aussagen nach außen ohne abgestimmte Sprachregelung.',
      'Niemanden für die Meldung tadeln. Wer meldet, hilft — auch bei falschem Alarm.'
    ].forEach(function (t) {
      var li = document.createElement('li');
      li.textContent = t;
      nicht.appendChild(li);
    });
    box.appendChild(nicht);

    var fuss = document.createElement('p');
    fuss.className = 'karte__fuss';
    fuss.textContent = 'Diese Karte ausgedruckt bereithalten — im Ernstfall ist das Intranet ' +
      'möglicherweise genau das, was nicht mehr erreichbar ist. ' +
      (nisg ? 'Rechtsgrundlage der Fristen: NISG 2026 sowie Art. 33 und 34 DSGVO. ' : 'Rechtsgrundlage der Fristen: Art. 33 und 34 DSGVO. ') +
      'Bei jeder Personaländerung neu erzeugen.';
    box.appendChild(fuss);

    karte.appendChild(box);
    bereich.hidden = false;
    document.getElementById('karte-titel').focus();
  }

  function textErzeugen() {
    var nisg = nisgErfasst();
    var z = [];
    var breit = 66;
    z.push('='.repeat(breit));
    z.push('NOTFALLKARTE — SICHERHEITSVORFALL');
    z.push((document.getElementById('org').value.trim() || LINIE) + '  ·  Stand ' + new Date().toLocaleDateString('de-AT'));
    z.push('='.repeat(breit));
    z.push('');
    z.push('SOFORT — DIE ERSTEN MINUTEN');
    z.push('-'.repeat(breit));
    z.push('1. Ruhe bewahren. Nicht selbst analysieren, nicht abwarten.');
    z.push('2. Uhrzeit notieren: wann und wodurch Kenntnis erlangt?');
    z.push('   -> Dieser Zeitpunkt bestimmt alle Fristen.');
    z.push('3. Meldestelle anrufen. Ein Verdacht genuegt.');
    z.push('4. Nichts loeschen, nichts neu aufsetzen, Protokolle sichern.');
    z.push('5. Betroffene Geraete vom Netz trennen. Nicht ausschalten.');
    z.push('6. Keine Zahlung ohne Entscheidung der Geschaeftsleitung.');
    z.push('');
    z.push('INTERNE MELDEKETTE');
    z.push('-'.repeat(breit));
    z.push('Meldestelle:          ' + feld('meldestelle'));
    z.push('Telefon rund um Uhr:  ' + feld('meldestelle_tel'));
    z.push('Vertretung:           ' + feld('vertretung'));
    z.push('Abschaltung:          ' + feld('entscheider'));
    z.push('Ausweichkanal:        ' + feld('ausweich'));
    z.push('');
    z.push('FRISTEN AB KENNTNIS');
    z.push('-'.repeat(breit));
    if (nisg) {
      z.push('  24 h        Fruehwarnung an das CSIRT (knapp halten)');
      z.push('  72 h        Meldung an das CSIRT');
    }
    z.push('  72 h        Meldung an die Datenschutzbehoerde, wenn');
    z.push('              personenbezogene Daten betroffen sind');
    if (nisg) {
      z.push('  1 Monat     Abschlussbericht an das CSIRT');
    }
    z.push('  unverzuegl. Betroffene benachrichtigen bei hohem Risiko');
    z.push('');
    z.push('  Im Zweifel melden. Eine Meldung zu viel kostet nichts.');
    z.push('');
    z.push('EXTERNE STELLEN');
    z.push('-'.repeat(breit));
    z.push('Cyber-Security-Hotline WKO:  0800 888 133 (rund um die Uhr)');
    z.push('Polizei:                     133 (bei Straftatverdacht)');
    z.push('IT-Dienstleister:            ' + feld('itdienst'));
    z.push('Forensik:                    ' + feld('forensik'));
    z.push('Cyberversicherung:           ' + feld('versicherung'));
    z.push('Datenschutz:                 ' + feld('datenschutz'));
    z.push('Kommunikation:               ' + feld('kommunikation'));
    z.push('');
    z.push('WAS SIE NICHT TUN');
    z.push('-'.repeat(breit));
    z.push('- Keine Systeme neu aufsetzen vor Beweissicherung.');
    z.push('- Keine Sicherungen ueberschreiben.');
    z.push('- Nicht ueber kompromittierte Systeme kommunizieren.');
    z.push('- Keine Aussagen nach aussen ohne Sprachregelung.');
    z.push('- Niemanden fuer die Meldung tadeln.');
    z.push('');
    z.push('='.repeat(breit));
    z.push('Ausgedruckt bereithalten. Bei Personaländerung neu erzeugen.');
    return z.join('\n');
  }

  document.getElementById('erzeugen').addEventListener('click', erzeugen);
  document.getElementById('drucken').addEventListener('click', function () { window.print(); });
  document.getElementById('txt').addEventListener('click', function () {
    window.ISSEC.download('notfallkarte-' + new Date().toISOString().slice(0, 10) + '.txt', textErzeugen());
  });
})();
