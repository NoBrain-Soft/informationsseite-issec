/* =========================================================================
   Passphrasen- und Passwort-Generator
   Zufall ausschließlich aus crypto.getRandomValues, Auswahl gleichverteilt
   durch Verwerfungsmethode (kein Modulo-Bias). Kein Netzwerkzugriff.
   ========================================================================= */
(function () {
  'use strict';

  var werkzeug = document.getElementById('werkzeug');
  var listenKnoten = document.getElementById('wortliste');
  if (!werkzeug || !listenKnoten) return;
  if (!window.crypto || !window.crypto.getRandomValues) return;

  var LISTE;
  try { LISTE = JSON.parse(listenKnoten.textContent); } catch (e) { return; }
  var WOERTER = LISTE.woerter;
  werkzeug.hidden = false;

  /* ---- Gleichverteilte Zufallszahl 0 .. max-1 ------------------------ */
  function zufallsindex(max) {
    if (max <= 0) throw new Error('max muss positiv sein');
    var grenze = Math.floor(4294967296 / max) * max;   // 2^32
    var puffer = new Uint32Array(1);
    var wert;
    do {
      window.crypto.getRandomValues(puffer);
      wert = puffer[0];
    } while (wert >= grenze);                          // Verwerfen: kein Modulo-Bias
    return wert % max;
  }

  /* ---- Erzeugung ----------------------------------------------------- */
  function passphrase() {
    var anzahl = Number(document.getElementById('woerter').value);
    var trenner = document.getElementById('trenner').value;
    var grossErstes = document.getElementById('grossbuchstabe').checked;
    var mitZahl = document.getElementById('zahl').checked;

    var teile = [];
    for (var i = 0; i < anzahl; i++) teile.push(WOERTER[zufallsindex(WOERTER.length)]);
    if (grossErstes) teile[0] = teile[0].charAt(0).toUpperCase() + teile[0].slice(1);

    var text = teile.join(trenner);
    var bits = anzahl * Math.log2(WOERTER.length);

    if (mitZahl) {
      var zahl = zufallsindex(100);
      text += trenner + (zahl < 10 ? '0' + zahl : String(zahl));
      bits += Math.log2(100);
    }

    return {
      text: text,
      bits: bits,
      erklaerung: anzahl + ' Wörter aus einer Liste von ' + WOERTER.length + ' Einträgen' +
        (mitZahl ? ' plus zweistellige Zufallszahl' : '') +
        ' — je Wort ' + (Math.log2(WOERTER.length)).toFixed(2) + ' Bit.' +
        (grossErstes ? ' Die Großschreibung ist Angreifern bekannt und erhöht die Entropie praktisch nicht.' : '')
    };
  }

  var VORRAT = {
    klein:   'abcdefghijkmnopqrstuvwxyz',        // ohne l
    kleinAll:'abcdefghijklmnopqrstuvwxyz',
    gross:   'ABCDEFGHJKLMNPQRSTUVWXYZ',         // ohne I und O
    grossAll:'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    ziffern: '23456789',
    ziffernAll: '0123456789',
    sonder:  '!#$%&()*+-=?@[]^_{}~'
  };

  function zufallspasswort() {
    var laenge = Number(document.getElementById('laenge').value);
    var eindeutig = document.getElementById('eindeutig').checked;
    var gruppen = [];

    if (document.getElementById('klein').checked)   gruppen.push(eindeutig ? VORRAT.klein : VORRAT.kleinAll);
    if (document.getElementById('gross').checked)   gruppen.push(eindeutig ? VORRAT.gross : VORRAT.grossAll);
    if (document.getElementById('ziffern').checked) gruppen.push(eindeutig ? VORRAT.ziffern : VORRAT.ziffernAll);
    if (document.getElementById('sonder').checked)  gruppen.push(VORRAT.sonder);

    if (!gruppen.length) {
      return { fehler: 'Bitte wählen Sie mindestens einen Zeichenvorrat aus.' };
    }

    var alle = gruppen.join('');
    if (laenge < gruppen.length) {
      return { fehler: 'Die Länge muss mindestens der Anzahl der gewählten Zeichenvorräte entsprechen.' };
    }

    // Aus jeder gewählten Gruppe mindestens ein Zeichen, dann auffüllen und mischen.
    var zeichen = gruppen.map(function (g) { return g.charAt(zufallsindex(g.length)); });
    while (zeichen.length < laenge) zeichen.push(alle.charAt(zufallsindex(alle.length)));

    for (var i = zeichen.length - 1; i > 0; i--) {   // Fisher-Yates
      var j = zufallsindex(i + 1);
      var tmp = zeichen[i]; zeichen[i] = zeichen[j]; zeichen[j] = tmp;
    }

    return {
      text: zeichen.join(''),
      // Die Gruppengarantie schränkt den Ergebnisraum gegenüber freier Auswahl
      // geringfügig ein; der Wert ist damit eine leichte Obergrenze. Der
      // Unterschied liegt bei üblichen Längen deutlich unter einem Bit.
      bits: laenge * Math.log2(alle.length),
      erklaerung: laenge + ' Zeichen aus einem Vorrat von ' + alle.length + ' Zeichen — je Zeichen ' +
        Math.log2(alle.length).toFixed(2) + ' Bit. Aus jedem gewählten Vorrat ist mindestens ein Zeichen enthalten; ' +
        'der ausgewiesene Wert ist dadurch eine geringfügig optimistische Näherung.'
    };
  }

  /* ---- Bewertung ----------------------------------------------------- */
  function einordnung(bits) {
    if (bits >= 100) return { stufe: 'Sehr stark', klasse: 'high', text: 'Auch gegen Angreifer mit erheblichen Mitteln auf absehbare Zeit nicht durch Ausprobieren zu finden.' };
    if (bits >= 75)  return { stufe: 'Stark', klasse: 'high', text: 'Für alle üblichen Anwendungsfälle ausreichend, auch für privilegierte Konten.' };
    if (bits >= 55)  return { stufe: 'Ausreichend', klasse: '', text: 'Für persönliche Benutzerkonten in Ordnung, sofern zusätzlich Multi-Faktor-Authentifizierung aktiv ist.' };
    if (bits >= 40)  return { stufe: 'Knapp', klasse: 'mid', text: 'Nur mit zweitem Faktor vertretbar. Für administrative Konten nicht geeignet.' };
    return { stufe: 'Zu schwach', klasse: 'low', text: 'Nicht verwenden. Erhöhen Sie die Anzahl der Wörter oder die Länge.' };
  }

  /* ---- Oberfläche ---------------------------------------------------- */
  var ausgabe = document.getElementById('ausgabe');
  var bewertung = document.getElementById('bewertung');
  var bereich = document.getElementById('ergebnisbereich');
  var letzterWert = '';

  function optionenUmschalten() {
    var art = document.querySelector('input[name="art"]:checked').value;
    document.getElementById('phrase-optionen').hidden = art !== 'phrase';
    document.getElementById('zufall-optionen').hidden = art !== 'zufall';
  }
  document.querySelectorAll('input[name="art"]').forEach(function (el) {
    el.addEventListener('change', optionenUmschalten);
  });
  optionenUmschalten();

  var woerterRegler = document.getElementById('woerter');
  var woerterWert = document.getElementById('woerter-wert');
  woerterRegler.addEventListener('input', function () { woerterWert.textContent = woerterRegler.value; });

  var laengeRegler = document.getElementById('laenge');
  var laengeWert = document.getElementById('laenge-wert');
  laengeRegler.addEventListener('input', function () { laengeWert.textContent = laengeRegler.value; });

  document.getElementById('erzeugen').addEventListener('click', function () {
    var art = document.querySelector('input[name="art"]:checked').value;
    var r = art === 'phrase' ? passphrase() : zufallspasswort();

    bewertung.innerHTML = '';
    if (r.fehler) {
      ausgabe.textContent = '';
      letzterWert = '';
      var f = document.createElement('p');
      f.setAttribute('role', 'alert');
      f.style.color = 'var(--crit)';
      f.textContent = r.fehler;
      bewertung.appendChild(f);
      bereich.hidden = false;
      return;
    }

    letzterWert = r.text;
    ausgabe.textContent = r.text;

    var e = einordnung(r.bits);

    var kopf = document.createElement('p');
    kopf.innerHTML = '<strong>' + window.ISSEC.escapeHTML(e.stufe) + '</strong> — rund ' +
      Math.round(r.bits) + ' Bit Entropie';
    bewertung.appendChild(kopf);

    var meter = document.createElement('span');
    meter.className = 'meter';
    var bar = document.createElement('span');
    bar.className = 'meter__bar' + (e.klasse ? ' meter__bar--' + e.klasse : '');
    bar.style.width = Math.min(100, Math.round((r.bits / 128) * 100)) + '%';
    meter.appendChild(bar);
    bewertung.appendChild(meter);

    var pe = document.createElement('p');
    pe.className = 'small muted';
    pe.textContent = e.text;
    bewertung.appendChild(pe);

    var pd = document.createElement('p');
    pd.className = 'small muted';
    pd.textContent = r.erklaerung;
    bewertung.appendChild(pd);

    bereich.hidden = false;
    document.getElementById('ergebnis-titel').focus();
  });

  document.getElementById('kopieren').addEventListener('click', function (ev) {
    if (letzterWert) window.ISSEC.copy(letzterWert, ev.currentTarget);
  });
})();
