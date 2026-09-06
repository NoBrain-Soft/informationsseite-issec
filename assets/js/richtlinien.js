/* =========================================================================
   Richtlinien-Generator
   Erzeugt Rohfassungen der sechs Kerndokumente als Markdown. Arbeitet
   ausschließlich lokal; es werden keine Eingaben übertragen.
   ========================================================================= */
(function () {
  'use strict';

  var werkzeug = document.getElementById('werkzeug');
  if (!werkzeug) return;
  werkzeug.hidden = false;

  var P = '<< bitte ergänzen >>';

  function feld(id, ersatz) {
    var el = document.getElementById(id);
    var wert = el ? String(el.value).trim() : '';
    return wert || (ersatz || P);
  }

  function heute() {
    return new Date().toLocaleDateString('de-AT', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function kontext() {
    var einstufung = document.querySelector('input[name="einstufung"]:checked');
    var stufe = einstufung ? einstufung.value : 'wichtig';
    return {
      org: feld('org', '<< Name der Organisation >>'),
      bereich: feld('geltungsbereich'),
      verantwortlich: feld('verantwortlich'),
      vertretung: feld('vertretung'),
      leitung: feld('leitung'),
      kontakt: feld('kontakt'),
      stufe: stufe,
      stufeText: { wesentlich: 'wesentliche Einrichtung', wichtig: 'wichtige Einrichtung', keine: 'nicht vom NISG 2026 erfasst' }[stufe],
      strafrahmen: stufe === 'wesentlich'
        ? 'bis 10 Mio. Euro oder 2 % des weltweiten Jahresumsatzes'
        : 'bis 7 Mio. Euro oder 1,4 % des weltweiten Jahresumsatzes',
      aufsicht: stufe === 'wesentlich'
        ? 'vorausschauende und nachträgliche Aufsicht durch die Cybersicherheitsbehörde'
        : 'nachträgliche Aufsicht durch die Cybersicherheitsbehörde',
      datum: heute(),
      nisg: stufe !== 'keine'
    };
  }

  function kopf(k, titel, kuerzel) {
    return [
      '# ' + titel,
      '',
      '| | |',
      '|---|---|',
      '| **Organisation** | ' + k.org + ' |',
      '| **Dokument** | ' + kuerzel + ' |',
      '| **Version** | 0.1 (Entwurf) |',
      '| **Stand** | ' + k.datum + ' |',
      '| **Erstellt von** | ' + k.verantwortlich + ' |',
      '| **Freigegeben von** | ' + k.leitung + ' |',
      '| **Nächste Prüfung** | << spätestens ein Jahr nach Freigabe >> |',
      '| **Geltungsbereich** | ' + k.bereich + ' |',
      ''
    ].join('\n');
  }

  var VORLAGEN = {

    leitlinie: function (k) {
      var t = [];
      t.push(kopf(k, 'Informationssicherheitsleitlinie', 'ISL-01'));
      t.push('## 1. Zweck und Verbindlichkeit');
      t.push('');
      t.push('Diese Leitlinie legt die Grundsätze der Informationssicherheit in der Organisation ' + k.org +
        ' fest. Sie ist für alle Beschäftigten, Lernenden, Leihkräfte und für alle Dienstleister verbindlich, ' +
        'die Zugriff auf Informationen oder Systeme der Organisation haben.');
      t.push('');
      t.push('Die Geschäftsleitung bekennt sich zur Informationssicherheit als Führungsaufgabe und stellt die ' +
        'dafür erforderlichen Mittel bereit.');
      t.push('');
      t.push('## 2. Schutzziele');
      t.push('');
      t.push('| Schutzziel | Bedeutung für ' + k.org + ' |');
      t.push('|---|---|');
      t.push('| **Vertraulichkeit** | Informationen sind nur den Personen zugänglich, die sie für ihre Aufgabe benötigen. |');
      t.push('| **Integrität** | Informationen sind richtig, vollständig und nicht unbemerkt veränderbar. |');
      t.push('| **Verfügbarkeit** | Informationen und Systeme stehen zur Verfügung, wenn sie benötigt werden. |');
      t.push('');
      t.push('## 3. Geltungsbereich');
      t.push('');
      t.push('Diese Leitlinie gilt für: ' + k.bereich);
      t.push('');
      t.push('Ausdrücklich **nicht** erfasst sind: << falls Ausnahmen bestehen, hier benennen und begründen >>');
      t.push('');
      t.push('## 4. Rollen und Verantwortlichkeiten');
      t.push('');
      t.push('| Rolle | Person | Verantwortung |');
      t.push('|---|---|---|');
      t.push('| Geschäftsleitung | ' + k.leitung + ' | Billigt die Maßnahmen, überwacht die Umsetzung, entscheidet über Restrisiken, nimmt an Schulungen teil. |');
      t.push('| Informationssicherheit | ' + k.verantwortlich + ' | Risikoanalyse, Maßnahmenplanung, Dokumentation, Berichterstattung, Entscheidung über Meldepflicht. |');
      t.push('| Vertretung | ' + k.vertretung + ' | Nimmt die Aufgaben bei Abwesenheit wahr. |');
      t.push('| IT-Betrieb | << Person oder Dienstleister >> | Technische Umsetzung, Sicherungen, Patchen, Protokollierung. |');
      t.push('| Datenschutz | << Person, falls benannt >> | Einhaltung der DSGVO, Verarbeitungsverzeichnis, Betroffenenanfragen. |');
      t.push('| Alle Beschäftigten | — | Einhaltung dieser Leitlinie, unverzügliche Meldung von Verdachtsfällen. |');
      t.push('');
      t.push('## 5. Grundsätze');
      t.push('');
      t.push('1. **Risikobasiertes Vorgehen.** Maßnahmen richten sich nach dem Ergebnis der Risikoanalyse, nicht nach Gewohnheit.');
      t.push('2. **Geringste Rechte.** Jede Person und jedes System erhält nur die Berechtigungen, die für die Aufgabe erforderlich sind, und nur so lange wie nötig.');
      t.push('3. **Mehrstufige Absicherung.** Der Schutz beruht nicht auf einer einzelnen Maßnahme.');
      t.push('4. **Nachweisbarkeit.** Entscheidungen, Prüfungen und Vorfälle werden dokumentiert.');
      t.push('5. **Meldung ohne Schuldzuweisung.** Wer einen Verdacht meldet, muss keine Nachteile befürchten. Eine Meldung zu viel ist besser als eine zu spät.');
      t.push('6. **Sicherheit von Anfang an.** Bei Beschaffung, Entwicklung und Änderungen werden Sicherheitsanforderungen von Beginn an berücksichtigt.');
      t.push('7. **Fortlaufende Verbesserung.** Maßnahmen werden regelmäßig auf Wirksamkeit überprüft und angepasst.');
      t.push('');
      t.push('## 6. Mitgeltende Dokumente');
      t.push('');
      t.push('- Risikoregister und Risikobehandlungsplan');
      t.push('- Incident-Response-Plan (IRP-01)');
      t.push('- Backup- und Wiederanlaufkonzept (BWK-01)');
      t.push('- Passwort- und Authentifizierungsrichtlinie (PWR-01)');
      t.push('- Richtlinie zur Lieferantensicherheit (LFS-01)');
      t.push('- Verzeichnis von Verarbeitungstätigkeiten nach Art. 30 DSGVO');
      t.push('');
      t.push('## 7. Verstöße');
      t.push('');
      t.push('Verstöße gegen diese Leitlinie werden nach den geltenden arbeitsrechtlichen Bestimmungen behandelt. ' +
        'Vorsätzliche Verstöße können darüber hinaus zivil- und strafrechtliche Folgen haben.');
      t.push('');
      t.push('## 8. Rechtsgrundlagen');
      t.push('');
      if (k.nisg) {
        t.push('- **NISG 2026** (BGBl. I Nr. 94/2025): Die Organisation ist als **' + k.stufeText + '** erfasst. § 32 verlangt geeignete und verhältnismäßige Risikomanagementmaßnahmen; die Geschäftsleitung hat diese zu billigen, ihre Umsetzung zu überwachen und an Schulungen teilzunehmen.');
      }
      t.push('- **DSGVO**, Art. 32: angemessene technische und organisatorische Maßnahmen zum Schutz personenbezogener Daten.');
      t.push('- **ISO/IEC 27001:2022**, Klausel 5.2 und Maßnahme A.5.1: Informationssicherheitspolitik der obersten Leitung.');
      t.push('');
      t.push('---');
      t.push('');
      t.push('_Freigabe:_ ' + k.leitung + ', Datum: ______________, Unterschrift: ______________');
      return t.join('\n');
    },

    beschluss: function (k) {
      var t = [];
      t.push(kopf(k, 'Beschluss der Geschäftsleitung zu den Risikomanagementmaßnahmen', 'MB-01'));
      t.push('> Dieses Dokument ist im Prüffall der wichtigste einzelne Nachweis. Es belegt, dass die');
      t.push('> Geschäftsleitung die Risiken kannte, bewusst entschieden hat und Mittel bereitgestellt hat.');
      t.push('');
      t.push('## 1. Feststellung der Betroffenheit');
      t.push('');
      if (k.nisg) {
        t.push('Die Geschäftsleitung stellt fest, dass ' + k.org + ' nach dem NISG 2026 als **' + k.stufeText + '** einzustufen ist.');
        t.push('');
        t.push('- **Sektor und Teilsektor:** << aus dem Betroffenheits-Check übernehmen >>');
        t.push('- **Größenklasse:** << klein / mittel / groß, mit den zugrunde liegenden Werten >>');
        t.push('- **Datum der Prüfung:** << Datum >>');
        t.push('- **Datenbasis:** << Geschäftsjahr, Beschäftigte in Jahresarbeitseinheiten, Umsatz, Bilanzsumme >>');
        t.push('- **Folge:** Registrierungspflicht bei der Cybersicherheitsbehörde, Risikomanagementmaßnahmen nach § 32, Meldepflichten, Selbstdeklaration; ' + k.aufsicht + '.');
        t.push('- **Strafrahmen bei Pflichtverletzung:** ' + k.strafrahmen + ' — jeweils der höhere Betrag. Die Leitungsorgane können persönlich zur Verantwortung gezogen werden.');
      } else {
        t.push('Die Geschäftsleitung stellt fest, dass ' + k.org + ' nach derzeitiger Prüfung **nicht unmittelbar** ' +
          'vom NISG 2026 erfasst ist. Die Prüfung ist bei wesentlichen Änderungen zu wiederholen. ' +
          'Unabhängig davon bestehen Pflichten aus der DSGVO sowie Anforderungen aus der Lieferkette von Kunden.');
      }
      t.push('');
      t.push('## 2. Zugrunde liegende Risikoanalyse');
      t.push('');
      t.push('- **Methode:** << z. B. Bewertung nach Eintrittswahrscheinlichkeit und Schadensausmaß in je vier Stufen >>');
      t.push('- **Stand:** << Datum >>');
      t.push('- **Umfang:** << Anzahl bewerteter Szenarien >>');
      t.push('- **Durchgeführt von:** ' + k.verantwortlich);
      t.push('');
      t.push('## 3. Genehmigte Maßnahmen');
      t.push('');
      t.push('Die Geschäftsleitung **billigt** die nachstehenden Maßnahmen entlang der zehn Bereiche des § 32 NISG 2026.');
      t.push('');
      t.push('| Nr. | Maßnahmenbereich | Geplante Maßnahme | Verantwortlich | Termin | Mittel |');
      t.push('|---|---|---|---|---|---|');
      [
        'Risikoanalyse und Sicherheit für Informationssysteme',
        'Bewältigung von Sicherheitsvorfällen',
        'Betriebskontinuität, Backup und Krisenmanagement',
        'Sicherheit der Lieferkette',
        'Sichere Beschaffung, Entwicklung und Wartung',
        'Bewertung der Wirksamkeit',
        'Cyberhygiene und Schulungen',
        'Kryptografie und Verschlüsselung',
        'Personalsicherheit, Zugriffskontrolle, Anlagenmanagement',
        'Multi-Faktor-Authentifizierung und gesicherte Kommunikation'
      ].forEach(function (name, i) {
        t.push('| ' + (i + 1) + ' | ' + name + ' | << Maßnahme >> | << Person >> | << Datum >> | << Betrag >> |');
      });
      t.push('');
      t.push('## 4. Bereitgestellte Mittel');
      t.push('');
      t.push('| Position | Betrag | Zeitraum |');
      t.push('|---|---|---|');
      t.push('| Investitionen | << Betrag >> | << Jahr >> |');
      t.push('| Laufender Betrieb | << Betrag pro Jahr >> | jährlich |');
      t.push('| Externe Unterstützung | << Betrag >> | << Zeitraum >> |');
      t.push('| Personalkapazität | << Anteil einer Vollzeitkraft >> | dauerhaft |');
      t.push('');
      t.push('## 5. Bewusst getragene Restrisiken');
      t.push('');
      t.push('> Dieser Abschnitt ist der wichtigste des gesamten Dokuments. Er zeigt, dass eine Abwägung');
      t.push('> stattgefunden hat. Ein Beschluss ohne benannte Restrisiken wirkt wie eine Kenntnisnahme.');
      t.push('');
      t.push('| Risiko | Warum nicht weiter behandelt | Getragen von | Nächste Überprüfung |');
      t.push('|---|---|---|---|');
      t.push('| << Beschreibung >> | << Begründung: Kosten, Verhältnismäßigkeit, technische Grenzen >> | ' + k.leitung + ' | << Datum >> |');
      t.push('');
      t.push('## 6. Berichterstattung');
      t.push('');
      t.push('Die verantwortliche Person berichtet der Geschäftsleitung << monatlich / quartalsweise >> über:');
      t.push('');
      t.push('1. Abdeckung der Multi-Faktor-Authentifizierung nach Zugangsart');
      t.push('2. Median der Tage bis zur Einspielung kritischer Sicherheitspatches');
      t.push('3. Datum und Dauer des letzten erfolgreichen Wiederherstellungstests');
      t.push('4. Anzahl und Alter offener kritischer Befunde');
      t.push('5. Schulungsquote, einschließlich der Geschäftsleitung');
      t.push('6. Anteil kritischer Dienstleister mit geprüften Vertragsklauseln');
      t.push('');
      t.push('## 7. Schulung der Geschäftsleitung');
      t.push('');
      if (k.nisg) {
        t.push('Die Mitglieder der Geschäftsleitung nehmen an Cybersicherheitsschulungen teil. Die Teilnahme ' +
          'wird mit Datum, Dauer und Inhalt dokumentiert.');
        t.push('');
        t.push('| Person | Schulung | Datum | Dauer |');
        t.push('|---|---|---|---|');
        t.push('| ' + k.leitung + ' | << Titel >> | << Datum >> | << Stunden >> |');
      } else {
        t.push('Die Geschäftsleitung nimmt regelmäßig an Sensibilisierungsmaßnahmen teil. << Termine ergänzen >>');
      }
      t.push('');
      t.push('## 8. Nächste Überprüfung');
      t.push('');
      t.push('Dieser Beschluss wird spätestens am << Datum, längstens ein Jahr >> überprüft, ' +
        'darüber hinaus unverzüglich bei wesentlichen Änderungen der Bedrohungslage, der Organisation ' +
        'oder der Rechtslage sowie nach jedem erheblichen Sicherheitsvorfall.');
      t.push('');
      t.push('---');
      t.push('');
      t.push('Beschlossen am ______________');
      t.push('');
      t.push(k.leitung + ': ______________________________');
      return t.join('\n');
    },

    incident: function (k) {
      var t = [];
      t.push(kopf(k, 'Incident-Response-Plan', 'IRP-01'));
      t.push('> **Im Ernstfall zuerst:** Cyber-Security-Hotline der Wirtschaftskammern, 0800 888 133 (rund um die Uhr).');
      t.push('> Diesen Plan **ausgedruckt** bereithalten — im Ernstfall ist möglicherweise genau das Intranet nicht erreichbar.');
      t.push('');
      t.push('## 1. Wann dieser Plan gilt');
      t.push('');
      t.push('Bei jedem Verdacht auf einen Sicherheitsvorfall. Ein Verdacht genügt — die Bewertung erfolgt später.');
      t.push('');
      t.push('Typische Auslöser: unerwartete Verschlüsselung von Dateien, Ausfall zentraler Systeme ohne erklärbare Ursache, ' +
        'auffällige Anmeldungen, Erpressungsschreiben, Hinweise von außen, Verlust eines Geräts oder Datenträgers, ' +
        'versehentliche Offenlegung von Daten.');
      t.push('');
      t.push('## 2. Rollen');
      t.push('');
      t.push('| Rolle | Person | Erreichbar unter | Aufgabe |');
      t.push('|---|---|---|---|');
      t.push('| Meldestelle | ' + k.verantwortlich + ' | ' + k.kontakt + ' | Nimmt Meldungen entgegen, bewertet, eskaliert. |');
      t.push('| Vertretung | ' + k.vertretung + ' | << Nummer >> | Bei Abwesenheit. |');
      t.push('| Entscheidung | ' + k.leitung + ' | << Nummer >> | Abschaltung, Kommunikation, externe Unterstützung, Zahlungsfragen. |');
      t.push('| Technische Bewältigung | << Person oder Dienstleister >> | << Nummer >> | Eindämmung, Analyse, Wiederherstellung. |');
      t.push('| Datenschutz | << Person >> | << Nummer >> | Bewertung nach Art. 33 f. DSGVO. |');
      t.push('| Kommunikation | << Person >> | << Nummer >> | Sprachregelung nach innen und außen. |');
      t.push('');
      t.push('**Ausweichkommunikation, falls E-Mail und Telefonanlage ausgefallen sind:** << Mobilnummern, alternativer Kanal >>');
      t.push('');
      t.push('## 3. Erste Stunde');
      t.push('');
      t.push('1. **Melden.** Verdacht sofort an die Meldestelle. Nicht selbst analysieren, nicht abwarten.');
      t.push('2. **Zeit festhalten.** Datum und Uhrzeit der Kenntnis, wer wodurch Kenntnis erlangt hat. Dieser Zeitpunkt bestimmt alle Fristen.');
      t.push('3. **Nichts löschen.** Keine Systeme neu aufsetzen, keine Protokolle löschen. Beweise sichern, bevor wiederhergestellt wird.');
      t.push('4. **Eindämmen.** Betroffene Systeme vom Netz trennen — nicht ausschalten, sofern flüchtige Spuren gesichert werden sollen. Entscheidungsbefugnis: << Person >>.');
      t.push('5. **Zugänge sperren.** Verdächtige Konten deaktivieren, Kennwörter privilegierter Konten wechseln.');
      t.push('6. **Bewerten.** Erheblicher Sicherheitsvorfall? Personenbezogene Daten betroffen? Beides führt zu getrennten Meldewegen.');
      t.push('');
      t.push('## 4. Meldewege und Fristen');
      t.push('');
      if (k.nisg) {
        t.push('### 4.1 An das CSIRT (NISG 2026)');
        t.push('');
        t.push('| Stufe | Frist ab Kenntnis | Inhalt |');
        t.push('|---|---|---|');
        t.push('| Frühwarnung | **24 Stunden** | Knapp: erster Verdacht, mutmaßlich rechtswidrige oder böswillige Handlung, mögliche grenzüberschreitende Auswirkungen. |');
        t.push('| Meldung | **72 Stunden** | Erste Bewertung von Schweregrad und Auswirkungen, Art des Vorfalls, betroffene Systeme, Kompromittierungsindikatoren. |');
        t.push('| Abschlussbericht | **1 Monat** nach der Frühwarnung | Ausführliche Beschreibung, Ursache, Abhilfemaßnahmen, grenzüberschreitende Auswirkungen. |');
        t.push('');
        t.push('Dauert der Vorfall länger an, ist zunächst ein Fortschrittsbericht zu erstatten; der Abschlussbericht folgt binnen eines Monats nach Bewältigung.');
        t.push('');
        t.push('**Meldeweg:** << Zugang zum Meldeportal, Zugangsdaten hinterlegt bei: … >>');
        t.push('');
      }
      t.push('### 4.' + (k.nisg ? '2' : '1') + ' An die Datenschutzbehörde (DSGVO)');
      t.push('');
      t.push('Sind personenbezogene Daten betroffen: Meldung nach Art. 33 DSGVO **unverzüglich, möglichst binnen 72 Stunden** ' +
        'ab Bekanntwerden. Entfällt nur, wenn ein Risiko für die Rechte und Freiheiten voraussichtlich nicht besteht — ' +
        'diese Einschätzung ist zu **dokumentieren**.');
      t.push('');
      t.push('Bei voraussichtlich **hohem** Risiko sind zusätzlich die betroffenen Personen nach Art. 34 DSGVO ' +
        'unverzüglich in klarer, einfacher Sprache zu benachrichtigen.');
      t.push('');
      t.push('### 4.' + (k.nisg ? '3' : '2') + ' Weitere Stellen');
      t.push('');
      t.push('| Stelle | Wann | Kontakt |');
      t.push('|---|---|---|');
      t.push('| Cyber-Security-Hotline WKO | bei jedem größeren Vorfall | 0800 888 133 |');
      t.push('| Polizei / Staatsanwaltschaft | bei Straftatverdacht | << Dienststelle >> |');
      t.push('| Cyberversicherung | nach Bedingungen, oft binnen 24–72 Stunden | << Polizzennummer, Nummer >> |');
      t.push('| Wichtigste Kunden | << Schwelle festlegen >> | << Verteiler >> |');
      t.push('| Betriebsrat | bei Betroffenheit von Beschäftigtendaten | << Kontakt >> |');
      t.push('');
      t.push('## 5. Bewältigung');
      t.push('');
      t.push('1. **Ursache finden**, bevor wiederhergestellt wird — sonst wiederholt sich der Vorfall.');
      t.push('2. **Sauber wiederherstellen:** aus geprüften Sicherungen, in einer bereinigten Umgebung.');
      t.push('3. **Zugangsdaten erneuern**, insbesondere alle privilegierten Konten und Dienstkonten.');
      t.push('4. **Überwachung verstärken** in den Wochen nach dem Vorfall.');
      t.push('5. **Freigabe zur Wiederinbetriebnahme** durch << Person >>.');
      t.push('');
      t.push('## 6. Nachbereitung');
      t.push('');
      t.push('Innerhalb von << 4 >> Wochen nach Abschluss:');
      t.push('');
      t.push('- Ursachenanalyse: Was hat den Vorfall ermöglicht?');
      t.push('- Was hat funktioniert, was nicht? Auch die Organisation prüfen, nicht nur die Technik.');
      t.push('- Abgeleitete Maßnahmen mit Verantwortlichen und Terminen');
      t.push('- Aktualisierung dieses Plans');
      t.push('- Bericht an die Geschäftsleitung');
      t.push('');
      t.push('## 7. Übung');
      t.push('');
      t.push('Dieser Plan wird mindestens **jährlich** geübt, mindestens als Planbesprechung von zwei bis drei Stunden. ' +
        'Letzte Übung: << Datum >>. Nächste Übung: << Datum >>.');
      t.push('');
      t.push('---');
      t.push('');
      t.push('_Ein Plan, der nie durchgespielt wurde, hält dem Ernstfall nicht stand._');
      return t.join('\n');
    },

    passwort: function (k) {
      var t = [];
      t.push(kopf(k, 'Passwort- und Authentifizierungsrichtlinie', 'PWR-01'));
      t.push('## 1. Grundsatz');
      t.push('');
      t.push('**Länge schlägt Komplexität.** Eine lange Passphrase aus mehreren Wörtern ist sicherer und ' +
        'merkbarer als ein kurzes Kennwort mit Sonderzeichen. Erzwungene Sonderzeichenregeln führen erfahrungsgemäß ' +
        'zu vorhersehbaren Mustern und werden daher nicht verlangt.');
      t.push('');
      t.push('## 2. Anforderungen an Kennwörter');
      t.push('');
      t.push('| Anwendungsfall | Mindestlänge | Weitere Anforderungen |');
      t.push('|---|---|---|');
      t.push('| Persönliche Benutzerkonten | 12 Zeichen | Keine Wiederverwendung aus anderen Diensten. Passphrase empfohlen. |');
      t.push('| Privilegierte und administrative Konten | 16 Zeichen | Zufällig erzeugt, ausschließlich im Kennwortverwalter, nie in Dokumenten. |');
      t.push('| Dienst- und Systemkonten | 24 Zeichen | Zufällig erzeugt, dokumentierte Verantwortlichkeit, geregelter Wechsel. |');
      t.push('| Wiederherstellungscodes | — | Ausgedruckt im Safe, nicht digital abgelegt. |');
      t.push('');
      t.push('**Kein turnusmäßiger Wechsel** ohne Anlass. Gewechselt wird bei Verdacht auf Kompromittierung, ' +
        'nach einem Vorfall, bei Weitergabe und beim Ausscheiden einer Person mit Kenntnis des Kennworts.');
      t.push('');
      t.push('## 3. Multi-Faktor-Authentifizierung');
      t.push('');
      t.push('MFA ist **verpflichtend** für:');
      t.push('');
      t.push('- alle Zugriffe von außerhalb des internen Netzes, einschließlich VPN und Fernwartung');
      t.push('- alle administrativen und privilegierten Konten, ausnahmslos');
      t.push('- alle E-Mail-Postfächer');
      t.push('- alle Cloud-Dienste mit Zugriff auf Unternehmensdaten');
      t.push('- << weitere Systeme ergänzen >>');
      t.push('');
      t.push('**Bevorzugte Verfahren** in dieser Reihenfolge: Sicherheitsschlüssel oder Passkeys nach FIDO2 · ' +
        'App-basierte Einmalcodes · Push-Bestätigung mit Nummernabgleich.');
      t.push('');
      t.push('**Nicht zulässig** als alleiniger zweiter Faktor: SMS-Codes für privilegierte Konten. ' +
        'Für Standardkonten sind sie besser als kein zweiter Faktor, aber nur als Übergangslösung vorgesehen.');
      t.push('');
      t.push('**Ausnahmen** bedürfen einer befristeten schriftlichen Genehmigung durch ' + k.verantwortlich +
        ' mit Angabe der ausgleichenden Maßnahme. Register der Ausnahmen: << Ort >>.');
      t.push('');
      t.push('## 4. Kennwortverwalter');
      t.push('');
      t.push('Die Organisation stellt einen Kennwortverwalter bereit: << Produkt, Bereitstellung >>. ' +
        'Kennwörter dürfen ausschließlich dort gespeichert werden — nicht in Tabellen, Notizen, ' +
        'Textdateien, E-Mails oder Browsern ohne Hauptkennwort.');
      t.push('');
      t.push('Geteilte Zugänge werden über den Kennwortverwalter freigegeben, nie über E-Mail oder Chat.');
      t.push('');
      t.push('## 5. Umgang mit Zugangsdaten');
      t.push('');
      t.push('- Zugangsdaten werden **niemals** telefonisch, per E-Mail oder Chat erfragt oder weitergegeben. Auch nicht durch die IT.');
      t.push('- Verdacht auf Kompromittierung wird unverzüglich an ' + k.kontakt + ' gemeldet — ohne Nachteil für die meldende Person.');
      t.push('- Bei Verdacht wird das Kennwort sofort gewechselt und die Sitzungen werden beendet.');
      t.push('- Standardkennwörter werden vor Inbetriebnahme geändert; verwaiste Konten werden deaktiviert.');
      t.push('');
      t.push('## 6. Rechtsgrundlagen');
      t.push('');
      if (k.nisg) {
        t.push('- **§ 32 Z 9 NISG 2026:** Personalsicherheit, Konzepte für die Zugriffskontrolle, Management von Anlagen');
        t.push('- **§ 32 Z 10 NISG 2026:** Multi-Faktor-Authentifizierung oder kontinuierliche Authentifizierung');
      }
      t.push('- **ISO/IEC 27001:2022:** A.5.16 Identitätsmanagement, A.5.17 Authentisierungsinformation, A.8.2 privilegierte Zugriffsrechte, A.8.5 sichere Authentifizierung');
      t.push('- **DSGVO**, Art. 32 Abs. 1: Sicherstellung der Vertraulichkeit');
      return t.join('\n');
    },

    backup: function (k) {
      var t = [];
      t.push(kopf(k, 'Backup- und Wiederanlaufkonzept', 'BWK-01'));
      t.push('## 1. Zweck');
      t.push('');
      t.push('Dieses Konzept stellt sicher, dass ' + k.org + ' nach einem Ausfall, einer Verschlüsselung durch ' +
        'Schadsoftware oder einem physischen Schaden in festgelegter Zeit wieder arbeitsfähig ist.');
      t.push('');
      t.push('> **Die entscheidende Frage** ist nicht, ob gesichert wird, sondern ob die Wiederherstellung');
      t.push('> nachweislich funktioniert und wie lange sie dauert.');
      t.push('');
      t.push('## 2. Wiederanlaufanforderungen');
      t.push('');
      t.push('| Prozess oder System | RTO — maximale Ausfalldauer | RPO — maximaler Datenverlust | Priorität |');
      t.push('|---|---|---|---|');
      t.push('| << kritischster Prozess >> | << z. B. 4 Stunden >> | << z. B. 24 Stunden >> | 1 |');
      t.push('| << zweiter Prozess >> | << Stunden >> | << Stunden >> | 2 |');
      t.push('| << dritter Prozess >> | << Stunden >> | << Stunden >> | 3 |');
      t.push('');
      t.push('Diese Werte sind von der Geschäftsleitung festzulegen, nicht von der IT: Sie sind eine ' +
        'betriebswirtschaftliche Entscheidung, keine technische.');
      t.push('');
      t.push('## 3. Sicherungsverfahren');
      t.push('');
      t.push('| Datenbestand | Verfahren | Häufigkeit | Aufbewahrung | Speicherort |');
      t.push('|---|---|---|---|---|');
      t.push('| << Dateiserver >> | << vollständig / inkrementell >> | << täglich >> | << 30 Tage >> | << Ort >> |');
      t.push('| << Datenbanken >> | << Verfahren >> | << Häufigkeit >> | << Dauer >> | << Ort >> |');
      t.push('| << Cloud-Dienste >> | << Verfahren >> | << Häufigkeit >> | << Dauer >> | << Ort >> |');
      t.push('| << Konfigurationen >> | << Verfahren >> | << Häufigkeit >> | << Dauer >> | << Ort >> |');
      t.push('');
      t.push('## 4. Schutz der Sicherungen');
      t.push('');
      t.push('**Mindestens eine Kopie muss so gespeichert sein, dass ein Angreifer mit administrativen ' +
        'Rechten im Produktivnetz sie nicht löschen oder verändern kann.** Das ist die wirksamste ' +
        'Einzelmaßnahme gegen Erpressungssoftware.');
      t.push('');
      t.push('- **Unveränderbarkeit:** << z. B. Object Lock für 30 Tage >>');
      t.push('- **Trennung:** eigene Zugangsdaten, kein gemeinsames Verzeichnisverwaltungssystem mit dem Produktivnetz');
      t.push('- **Räumliche Trennung:** mindestens eine Kopie an einem anderen Standort');
      t.push('- **Verschlüsselung:** Sicherungen sind verschlüsselt; der Schlüssel wird getrennt aufbewahrt: << Ort >>');
      t.push('');
      t.push('Richtwert: drei Kopien, zwei Medienarten, eine außer Haus, eine unveränderbar, null Fehler beim Test.');
      t.push('');
      t.push('## 5. Prüfung der Wiederherstellung');
      t.push('');
      t.push('| Prüfung | Häufigkeit | Verantwortlich | Nachweis |');
      t.push('|---|---|---|---|');
      t.push('| Erfolgskontrolle der Sicherungsläufe | täglich, automatisiert | << Person >> | Protokoll |');
      t.push('| Wiederherstellung einzelner Dateien | monatlich | << Person >> | Kurzprotokoll |');
      t.push('| Wiederherstellung eines vollständigen Systems | mindestens jährlich | << Person >> | Protokoll mit gemessener Dauer |');
      t.push('| Übung des Gesamtausfalls | << jährlich >> | << Person >> | Übungsbericht |');
      t.push('');
      t.push('**Jedes Protokoll hält fest:** Datum, geprüftes System, benötigte Dauer, Vergleich mit dem RTO, ' +
        'aufgetretene Probleme, abgeleitete Maßnahmen.');
      t.push('');
      t.push('Letzter erfolgreicher vollständiger Test: << Datum >>, Dauer: << Stunden >>, Ergebnis: << Befunde >>.');
      t.push('');
      t.push('## 6. Wiederanlauf nach einem Sicherheitsvorfall');
      t.push('');
      t.push('1. **Beweise sichern**, bevor wiederhergestellt wird (siehe IRP-01).');
      t.push('2. **Ursache klären** — sonst wird die Schwachstelle mit wiederhergestellt.');
      t.push('3. **In bereinigter Umgebung** wiederherstellen, nicht in die kompromittierte Infrastruktur.');
      t.push('4. **Sicherungspunkt vor dem Vorfall** wählen; Zeitpunkt der Erstkompromittierung berücksichtigen.');
      t.push('5. **Alle Zugangsdaten erneuern** vor Wiederinbetriebnahme.');
      t.push('6. **Freigabe** durch << Person >>.');
      t.push('');
      t.push('## 7. Rechtsgrundlagen');
      t.push('');
      if (k.nisg) {
        t.push('- **§ 32 Z 3 NISG 2026:** Aufrechterhaltung des Betriebs, Backup-Management, Wiederherstellung nach einem Notfall, Krisenmanagement');
      }
      t.push('- **ISO/IEC 27001:2022:** A.8.13 Sicherung von Informationen, A.8.14 Redundanz, A.5.29 Informationssicherheit bei Störungen, A.5.30 IKT-Bereitschaft für Betriebskontinuität');
      t.push('- **DSGVO**, Art. 32 Abs. 1 lit. b und c: Verfügbarkeit, Belastbarkeit und rasche Wiederherstellbarkeit');
      return t.join('\n');
    },

    lieferanten: function (k) {
      var t = [];
      t.push(kopf(k, 'Richtlinie zur Sicherheit in der Lieferkette', 'LFS-01'));
      t.push('## 1. Zweck');
      t.push('');
      t.push('Ein erheblicher Teil der Sicherheitsvorfälle erreicht Organisationen über Dienstleister. ' +
        'Diese Richtlinie regelt, wie ' + k.org + ' die Sicherheit ihrer unmittelbaren Anbieter steuert.');
      t.push('');
      t.push('## 2. Verzeichnis');
      t.push('');
      t.push('Es wird ein Verzeichnis aller Anbieter geführt, die Zugriff auf Systeme oder Daten haben ' +
        'oder deren Ausfall den Betrieb beeinträchtigen würde. Verantwortlich: ' + k.verantwortlich + '. ' +
        'Ort: << Ablage >>. Überprüfung: mindestens jährlich.');
      t.push('');
      t.push('| Anbieter | Leistung | Zugriffstiefe | Personenbezogene Daten | Kritikalität | Vertrag geprüft | Ansprechperson |');
      t.push('|---|---|---|---|---|---|---|');
      t.push('| << Name >> | << Leistung >> | << keiner / lesend / administrativ >> | << ja / nein >> | << hoch / mittel / gering >> | << ja / nein >> | << Person >> |');
      t.push('');
      t.push('## 3. Kritikalitätseinstufung');
      t.push('');
      t.push('| Stufe | Kriterien | Folge |');
      t.push('|---|---|---|');
      t.push('| **Hoch** | Administrativer Zugriff auf Kernsysteme, oder Ausfall stoppt kritische Prozesse binnen 24 Stunden, oder umfangreiche Verarbeitung besonderer Kategorien personenbezogener Daten. | Vollständige Prüfung vor Beauftragung, jährliche Nachprüfung, Nachweise verlangen, Ausstiegsplan. |');
      t.push('| **Mittel** | Lesender Zugriff auf wesentliche Daten, oder Ausfall wirkt binnen einer Woche. | Fragebogen vor Beauftragung, zweijährliche Nachprüfung. |');
      t.push('| **Gering** | Kein Systemzugriff, Ausfall gut kompensierbar. | Standardvertragsklauseln genügen. |');
      t.push('');
      t.push('## 4. Anforderungen an Verträge');
      t.push('');
      t.push('Verträge mit Anbietern hoher und mittlerer Kritikalität enthalten mindestens:');
      t.push('');
      t.push('1. **Sicherheitsanforderungen**, konkret benannt statt allgemein auf den „Stand der Technik" verwiesen');
      t.push('2. **Meldepflicht** bei Sicherheitsvorfällen, die die Organisation betreffen können — mit Frist: << z. B. 24 Stunden ab Kenntnis >>');
      t.push('3. **Benannte Ansprechperson** für Sicherheitsfragen, mit Erreichbarkeit außerhalb der Geschäftszeiten');
      t.push('4. **Auskunfts- und Prüfrechte**, einschließlich der Vorlage von Nachweisen wie Zertifikaten oder Prüfberichten');
      t.push('5. **Regelung zu Unterauftragnehmern**: Zustimmungsvorbehalt und Weitergabe der Anforderungen');
      t.push('6. **Regelungen zur Beendigung**: Datenrückgabe, nachweisliche Löschung, Übergabeunterstützung');
      t.push('7. Bei personenbezogenen Daten: **Auftragsverarbeitungsvertrag** mit dem Pflichtinhalt des Art. 28 Abs. 3 DSGVO');
      t.push('');
      t.push('## 5. Prüfung vor Beauftragung');
      t.push('');
      t.push('Vor Beauftragung eines Anbieters hoher Kritikalität werden erhoben und dokumentiert:');
      t.push('');
      t.push('- Vorhandene Zertifizierungen oder Prüfberichte und deren Geltungsbereich — ein Zertifikat für einen anderen Unternehmensteil hilft nicht');
      t.push('- Umgang mit Sicherheitsvorfällen und deren Meldung');
      t.push('- Multi-Faktor-Authentifizierung für Zugriffe auf Kundensysteme');
      t.push('- Verfahren zur Behandlung von Schwachstellen und Patch-Fristen');
      t.push('- Aufbewahrungsort der Daten und etwaige Drittlandsbezüge');
      t.push('- Unterauftragnehmer');
      t.push('');
      t.push('## 6. Zugriffe von Anbietern');
      t.push('');
      t.push('- Fernzugriffe sind **nur mit Multi-Faktor-Authentifizierung** zulässig');
      t.push('- Zugriffe werden **auf das Notwendige beschränkt** und sind zeitlich befristet');
      t.push('- Zugriffe werden **protokolliert**; die Protokolle werden << Zeitraum >> aufbewahrt');
      t.push('- Dauerhafte administrative Zugänge werden << halbjährlich >> überprüft und bei Bedarf entzogen');
      t.push('- Nach Vertragsende werden alle Zugänge **binnen << 5 >> Arbeitstagen** entzogen, dokumentiert durch << Person >>');
      t.push('');
      t.push('## 7. Ausstiegsstrategie');
      t.push('');
      t.push('Für jeden Anbieter hoher Kritikalität ist festzuhalten: Wer könnte die Leistung ersetzen? ' +
        'Wie lange dauert ein Wechsel? Wo liegen die Daten und in welchem Format sind sie herauszugeben? ' +
        'Welche Zugangsdaten und Konfigurationen liegen ausschließlich beim Anbieter?');
      t.push('');
      t.push('## 8. Rechtsgrundlagen');
      t.push('');
      if (k.nisg) {
        t.push('- **§ 32 Z 4 NISG 2026:** Sicherheit der Lieferkette einschließlich der Beziehungen zu unmittelbaren Anbietern und Diensteanbietern');
      }
      t.push('- **ISO/IEC 27001:2022:** A.5.19 bis A.5.22 Lieferantenbeziehungen, A.5.23 Informationssicherheit bei Cloud-Diensten');
      t.push('- **DSGVO**, Art. 28: Auftragsverarbeiter, hinreichende Garantien, Pflichtinhalt des Vertrags');
      return t.join('\n');
    }
  };

  var TITEL = {
    leitlinie: 'Informationssicherheitsleitlinie',
    beschluss: 'Managementbeschluss',
    incident: 'Incident-Response-Plan',
    passwort: 'Passwort- und Authentifizierungsrichtlinie',
    backup: 'Backup- und Wiederanlaufkonzept',
    lieferanten: 'Richtlinie zur Lieferantensicherheit'
  };

  var ausgabe = document.getElementById('ausgabe');
  var ausgabeBereich = document.getElementById('ausgabebereich');
  var ausgabeInfo = document.getElementById('ausgabe-info');
  var gesamttext = '';

  document.getElementById('erzeugen').addEventListener('click', function () {
    var k = kontext();
    var gewaehlt = Array.prototype.map.call(
      document.querySelectorAll('input[name="dok"]:checked'),
      function (el) { return el.value; }
    );

    ausgabe.innerHTML = '';
    if (!gewaehlt.length) {
      ausgabeInfo.textContent = 'Bitte wählen Sie mindestens ein Dokument aus.';
      ausgabeBereich.hidden = false;
      return;
    }

    var teile = [];
    gewaehlt.forEach(function (key) {
      var text = VORLAGEN[key](k);
      teile.push(text);

      var block = document.createElement('details');
      block.open = gewaehlt.length === 1;
      var summary = document.createElement('summary');
      summary.textContent = TITEL[key];
      block.appendChild(summary);

      var body = document.createElement('div');
      body.className = 'details__body';

      var pre = document.createElement('pre');
      pre.className = 'output-doc';
      pre.tabIndex = 0;
      pre.setAttribute('role', 'region');
      pre.setAttribute('aria-label', 'Erzeugter Text: ' + TITEL[key]);
      pre.textContent = text;
      body.appendChild(pre);

      var zeile = document.createElement('div');
      zeile.className = 'btn-row no-print';
      var dl = document.createElement('button');
      dl.type = 'button';
      dl.className = 'btn btn--ghost btn--small';
      dl.textContent = 'Nur dieses Dokument sichern';
      dl.addEventListener('click', function () {
        window.ISSEC.download(key + '-' + new Date().toISOString().slice(0, 10) + '.md', text, 'text/markdown');
      });
      var cp = document.createElement('button');
      cp.type = 'button';
      cp.className = 'btn btn--ghost btn--small';
      cp.textContent = 'Kopieren';
      cp.addEventListener('click', function () { window.ISSEC.copy(text, cp); });
      zeile.appendChild(dl);
      zeile.appendChild(cp);
      body.appendChild(zeile);

      block.appendChild(body);
      ausgabe.appendChild(block);
    });

    gesamttext = teile.join('\n\n\\pagebreak\n\n');
    ausgabeInfo.textContent = gewaehlt.length + ' Dokument' + (gewaehlt.length === 1 ? '' : 'e') +
      ' erzeugt. Offene Stellen sind mit doppelten spitzen Klammern gekennzeichnet und müssen von Ihnen ausgefüllt werden.';
    ausgabeBereich.hidden = false;
    document.getElementById('ausgabe-titel').focus();
  });

  document.getElementById('alleherunterladen').addEventListener('click', function () {
    if (!gesamttext) return;
    window.ISSEC.download('sicherheitsdokumentation-' + new Date().toISOString().slice(0, 10) + '.md',
      gesamttext, 'text/markdown');
  });

  document.getElementById('kopieren').addEventListener('click', function (ev) {
    if (gesamttext) window.ISSEC.copy(gesamttext, ev.currentTarget);
  });
})();
