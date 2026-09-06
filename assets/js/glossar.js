/* Glossar: Volltextfilter und Themenfilter.
   Die Einträge stehen vollständig im HTML — ohne JavaScript ist das Glossar
   also weiterhin vollständig lesbar, nur eben ungefiltert. */
(function () {
  'use strict';

  var liste = document.getElementById('glossar-liste');
  if (!liste) return;

  var eintraege = Array.prototype.slice.call(liste.querySelectorAll('.glossary__entry'));
  var suche = document.getElementById('suche');
  var zaehler = document.getElementById('trefferzahl');
  var leer = document.getElementById('leer');
  var knoepfe = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var aktiveKategorie = 'alle';

  function normalisieren(s) {
    return s.toLowerCase()
      .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function anwenden() {
    var q = normalisieren(suche ? suche.value : '');
    var begriffe = q ? q.split(' ') : [];
    var treffer = 0;

    eintraege.forEach(function (el) {
      var kategorien = (el.dataset.kat || '').split(' ');
      var passtKategorie = aktiveKategorie === 'alle' || kategorien.indexOf(aktiveKategorie) !== -1;
      var heuhaufen = normalisieren(el.dataset.suche || el.textContent);
      var passtSuche = begriffe.every(function (b) { return heuhaufen.indexOf(b) !== -1; });
      var sichtbar = passtKategorie && passtSuche;
      el.hidden = !sichtbar;
      if (sichtbar) treffer++;
    });

    if (leer) leer.hidden = treffer !== 0;
    if (zaehler) {
      zaehler.textContent = treffer === eintraege.length
        ? eintraege.length + ' Einträge'
        : treffer + ' von ' + eintraege.length + ' Einträgen';
    }
  }

  if (suche) suche.addEventListener('input', anwenden);

  knoepfe.forEach(function (btn) {
    btn.addEventListener('click', function () {
      aktiveKategorie = btn.dataset.filter;
      knoepfe.forEach(function (b) {
        var aktiv = b === btn;
        b.setAttribute('aria-pressed', String(aktiv));
        b.classList.toggle('btn--tool', aktiv);
        b.classList.toggle('btn--ghost', !aktiv);
      });
      anwenden();
    });
  });

  anwenden();
})();
