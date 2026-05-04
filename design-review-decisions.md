# Design Review Decisions

Stand: 2026-04-30

Dieses Dokument fasst die Design- und UX-Entscheidungen fuer den naechsten Umsetzungsschnitt der LS Stringsmith App zusammen. Ziel ist, dass ein neuer Implementierungs-Chat die Entscheidungen ohne erneutes Interview Schritt fuer Schritt umsetzen kann.

## Nachtrag 2026-04-30: Produktidentitaet, Repository und Lizenz

- Produktname: LS Stringsmith.
- GitHub-Repository: `igotsoul/LS-Stringsmith`.
- Package-Name: `ls-stringsmith`.
- Kurzbeschreibung fuer GitHub: "A browser-first workshop design tool for crafting purposeful Liberating Structures strings from intent to facilitation-ready flow."
- Der Quellcode ist MIT-lizenziert.
- Offizielle Liberating-Structures-Assets bleiben Third-Party-Material und werden nicht durch die MIT-Lizenz dieses Repos relicensed.
- Lizenz- und Quellenhinweise liegen in `LICENSE`, `THIRD_PARTY_NOTICES.md` und `public/icons/official/README.md`.
- Die aktuelle Alpha-UI verwendet eine kuehle neutrale Flaeche, Teal/Navy-Akzente, Inter-basierte Systemtypografie und einen optionalen Light/Dark-Theme-Toggle. Aeltere visuelle Empfehlungen bleiben Kontext, aber die aktuelle CSS-Implementierung ist bis zum naechsten bewussten Visual-Pass die praktische Baseline.

## Zielbild

Die App soll als klare, moderne Facilitation-Werkstatt wirken: funktional, ruhig und gut fuehrend, aber mit sichtbar spielerischer Energie. Die Lebendigkeit kommt vor allem aus den offiziellen Liberating-Structures-Icons, Drag-and-drop-Momenten, Empty States und kleinen Erfolgsmomenten. Das UI selbst bleibt neutral, geordnet und vorhersehbar.

Wichtige Grundsaetze:

- Nicht blind neue Visuals generieren.
- Offizielle Liberating-Structures-Icons verwenden.
- UI ruhig halten, Icons und Interaktionen duerfen lebendig sein.
- Informationen priorisieren: Ablauf und aktuelle Auswahl vor Detailtiefe.
- Karten nur fuer LS, Ablaufbloecke und wiederholte Items verwenden.
- Wiederkehrende Informationen konsistent zwischen Library, Builder, Setup, Preview und Script darstellen.

## Globale Entscheidungen

- Grundmetapher: Facilitation-Werkstatt.
- Spielerisches Level: deutlich sichtbar, aber systematisch kontrolliert.
- Navigation: Workflow-Stepper fuer Setup -> Builder -> Preview.
- Library bleibt eigener Hauptbereich und ist zusaetzlich als linkes Panel im Builder verfuegbar.
- Dichte: Setup luftig, Builder dichter, Preview fokussiert.
- Karten nur fuer LS, Ablaufbloecke und wiederholte Items.
- Farbsystem: neutrales UI, Lebendigkeit durch offizielle LS-Icons und deren Farben.
- Hintergrund: weiss oder sehr helles Grau.
- UI-Akzentfarbe: ruhiges Gruen/Teal.
- Buttons: Iconbuttons wo moeglich, Text nur fuer Hauptaktionen. Je Kontext ein klarer Primaerbutton.
- Cards: weicher Schatten, physischere Kartenwirkung.
- Typografie: modern-sachlich.
- Motion: deutlich bei Drag, Empty State und kleinen Erfolgsmomenten, aber kurz und funktional.

## Offizielle LS-Icons

- Keine neu generierten LS-Icons.
- Offizielle Icons von https://liberatingstructures.de/liberating-structures-menue/alle-liberating-structures-alphabetisch-sortiert/ verwenden.
- Lizenz- und Quellenlage als Third-Party-Boundary dokumentieren; kommerzieller Einsatz sollte zusaetzlich geklaert werden.
- Icons automatisch von den offiziellen LS-Seiten extrahieren und lokal speichern.
- Farben unveraendert lassen.
- Icons sauber je Liberating Structure mappen.
- Das UI soll die Icons einbetten, nicht visuell neu interpretieren.

## Library

### Card-System

- Card-Layout: horizontal.
- Card-Hoehe: mittel, das Icon bekommt Luft.
- Icon-Darstellung: offizielles Icon in fester heller Bildflaeche.
- Layout: responsives Grid mit 2 bis 3 Spalten, solange horizontale Cards genug Breite haben. Falls nicht, Liste/Grid-Umschalter anbieten.
- Dauer, Gruppengroesse und Kategorie dauerhaft sichtbar.
- Metadaten als leise Textzeile mit kleinen Icons.
- Kategorie als dezenter farbiger Punkt plus Text.
- Hover/Focus: leichter Lift plus Border-Akzent.
- Selected State: subtile Teal Border plus sehr heller Teal-Hintergrund.
- LS-Name ist klar gewichtet, Kurzbeschreibung bleibt sichtbar.
- Der aktuelle Card-Inhalt ist inhaltlich gut und soll grundsaetzlich erhalten bleiben.

### Card-Interaktion

- Klick auf Card oeffnet rechtes Detailpanel.
- Hinzufuegen erfolgt im Detailpanel.
- Drag and drop aus der Card in den Builder ist ebenfalls erlaubt.
- Eine kleine Drag-Handle auf der Card reicht als Affordance.
- Kein zusaetzlicher Drag-Erklaertext auf der Card.

### Suche und Filter

- Suche/Filter als kompakte Toolbar.
- Erweiterte Filter einklappbar.
- Im Builder-Drawer koennen passende LS durch Empfehlungen markiert werden.

## Library Detailpanel

- Platzierung: rechte Seitenleiste.
- Panel-Kopf: grosses Icon, Name, Kurzbeschreibung, primaerer Button.
- Primaerbutton: "Zum Ablauf hinzufuegen".
- Button oeffnet Positionsauswahl.
- Inhalte: offene Sektionen fuer wichtigste Inhalte.
- Laengere Details optional als Akkordeons.
- Ablaufphasen der LS als kleine nummerierte Steps.
- Panel-Tiefe: mittel. Genug Substanz fuer Auswahl, aber kein vollstaendiges Handbuch.
- Empty State in Library: kuratierte Startpunkte oder Empfehlungen.

## Builder

### Layout

- Hauptlayout: Ablauf zentral, Details rechts, Library als oeffnbares linkes Panel.
- Library Panel erscheint per linker Hover-Flaeche oder Pinning und schiebt den Builder-Inhalt nach rechts.
- Permanent sichtbar: Ablaufstruktur, Gesamtzeit, aktuelle Auswahl, wichtigste Warnungen.
- Top Utility Bar: sehr kompakt, mit Workshop-Ziel, Gesamtzeit, LS-Anzahl, Checks, Preview.
- Kein klassischer grosser Header.
- Rechtes Panel: stabile, klar abgegrenzte Seitenleiste mit Tabs.
- Panel-Tabs: Details, Checks, Notizen, Empfehlungen, Workshop.
- Empty State: grosse zentrale Einladung "Struktur hinzufuegen".
- Sobald erste LS existiert, leise Drop-Zonen in den Phasen zeigen.
- Mobile/kleine Screens: sequenzieller Modus Timeline -> Details -> Library.

### Timeline

- Ablaufdarstellung: vertikale Timeline.
- Grobe Phasen: Einstieg, Exploration, Entscheidung, Abschluss.
- Phasen sind collapsible, standardmaessig offen.
- Eingeklappte Phasen zeigen Name, Dauer, Warnmarker und Mini-Liste der LS.
- Drag ueber eingeklappter Phase klappt die Phase automatisch auf.
- Auswahl aus Library Drawer: Drag and drop in die Timeline plus Button "nach Auswahl einfuegen".

### Ablaufbloecke

- Platzierte LS als kompakter Ablaufblock.
- Inhalt: Icon, Name, Dauer, Gruppengroesse, kleine Marker, leise Zweckzeile.
- Staerkstes Element ist der LS-Name.
- Dauer als rechte Meta.
- Warnungen als ruhige Marker am Block.
- Details der Warnungen im Checks-Tab, nicht als Text im Block.

### Checks und Empfehlungen

- Qualitaetschecks: globale Kurz-Zusammenfassung plus lokale Marker.
- Warnungston: ruhig, kurze Hinweise, starke Farben nur bei echten Problemen.
- Empfehlungen: eigener Tab rechts plus passende Treffer im Library Drawer markiert.
- KI-/Assistenz-Vorschlaege erscheinen erst im Builder, nicht im Setup.

## Setup

### Rolle und Struktur

- Setup ist eine eigene Seite.
- Wizard in 3 bis 4 Schritten.
- Horizontaler Stepper oben.
- Layout je Schritt: bevorzugt zwei Spalten mit Live-Zusammenfassung rechts, falls diese echten Nutzen bringt. Sonst ein Fokusbereich mit wenigen Fragen.
- Antworttypen: Mischung aus Textinputs, Selects, Segmented Controls, Slidern und Choice Controls.
- Frageton: direkt und sachlich.
- Kleine Korrektur zur Tonlage: sachliche Labels, aber hilfreiche Platzhalter/Hilfetexte.
- Dezente kleine Illustrationen oder Icons je Schritt.
- Automatisch speichern.

### Felder

Schritt 1: Ziel und Anlass

- Pflicht: Workshop-Titel.
- Pflicht: Ziel.
- Pflicht: Kontext/Anlass.

Schritt 2: Rahmen

- Pflicht: Dauer.
- Pflicht: Gruppengroesse.
- Pflicht: Format online/vor Ort/hybrid.

Schritt 3: Gruppe und Dynamik

- Optional: Energie.
- Optional: Vertrauen.
- Optional: Konflikt.
- Optional: Entscheidungsbedarf.

Schritt 4: Review

- Zusammenfassung plus editierbare Schluesselwerte.
- Warnungen bei widerspruechlichem Setup optional spaeter.
- Abschluss mit "Builder oeffnen".

### Nachtraegliche Aenderung

- Setup-Daten im Builder rechts im Panel unter "Workshop" editierbar.

## Preview Live-Modus

- Preview ist ein Moderationsmodus mit Timer, Schritten und Notizen.
- Fokusmodus: aktueller Schritt links gross, Agenda rechts.
- Timer kompakt in einer festen Leiste.
- Aktueller Schritt priorisiert Moderationsanweisung bzw. Einladung.
- Darunter Zeit, Gruppenform und Material.
- Agenda zeigt nur Phase, LS-Name und Dauer.
- Notizen als ausklappbares Notizpanel.
- Navigation: Tastatur, Buttons und Agenda-Sprung.
- Visuell sind Weiter/Zurueck-Buttons und Agenda am wichtigsten.
- Detailtiefe: mittel, mit Zweck, Einladung, Ablaufphasen, Hinweisen und Material.

## Script- und Printmodus

- Es gibt eine klare Option, den Ablauf als Moderations-Script zu drucken.
- Aktion "Script drucken" gut sichtbar im Preview, sekundaer auch im Builder.
- Vor dem Drucken eigene Print-/Script-Vorschau.
- Export zuerst ueber Browser-Druck/PDF mit Print-Styles.
- Script ist primaer fuer Moderator:innen intern.
- Dichte: mittel.
- Kopf kompakt mit Titel, Ziel, Dauer, Gruppengroesse und Format.
- Ueberblicksteil: Tabelle mit Phasen, LS und Zeiten.
- Detailteil pro LS: Zweck, Einladung, Ablaufsteps, Material, Notizen.
- Offizielle LS-Icons klein neben jedem Abschnitt.
- Moderatorennotizen standardmaessig enthalten.
- Erste Print-Option: Notizen an/aus.

## Priorisierte Umsetzungs-Milestones

### Milestone 1: Icon-Pipeline und Library

Status: erledigt am 2026-04-29.

Ziel: Offizielle Icons lokal verfuegbar machen und das Library Card-System fertigstellen.

Aufgaben:

- Offizielle Icons automatisch aus den LS-Seiten extrahieren.
- Icons lokal speichern und stabil je LS mappen.
- Farben unveraendert lassen.
- Fallback fuer fehlende Icons definieren, aber keine neuen generieren.
- Horizontale Library Cards bauen oder ueberarbeiten.
- Feste helle Iconflaeche einfuehren.
- Meta-Zeile fuer Dauer, Gruppengroesse und Kategorie beruhigen.
- Kategorie als Punkt plus Text darstellen.
- Hover, Focus und Selected States umsetzen.
- Card-Klick an rechtes Detailpanel anbinden.
- Drag and drop aus Cards in den Builder ermoeglichen.

### Milestone 2: Library Detailpanel

Status: erledigt am 2026-04-29.

Ziel: Auswahlentscheidung im Detailpanel klar und ruhig machen.

Aufgaben:

- Panel-Kopf mit grossem Icon, Name, Kurzbeschreibung und Primaerbutton.
- "Zum Ablauf hinzufuegen" mit Positionsauswahl verbinden.
- Offene Sektionen fuer Zweck, Metadaten und zentrale Hinweise.
- Ablaufphasen als nummerierte Steps.
- Laengere Details als Akkordeons, falls noetig.
- Library Empty State mit kuratierten Startpunkten/Empfehlungen.

### Milestone 3: Builder beruhigen

Status: erledigt am 2026-04-29.

Ziel: Builder als zentrale Timeline-Arbeitsflaeche mit Inspector strukturieren.

Aufgaben:

- Zentrale vertikale Timeline etablieren.
- Linkes Library Panel per Hover-Flaeche und Pinning ermoeglichen.
- Kompakte Top Utility Bar mit Workshop-Ziel, Gesamtzeit, LS-Anzahl, Checks und Preview.
- Rechtes Inspector-Panel mit Tabs Details, Checks, Notizen, Empfehlungen, Workshop.
- Phasen Einstieg, Exploration, Entscheidung, Abschluss als collapsible Bereiche.
- Eingeklappte Phasen mit Name, Dauer, Warnmarker und Mini-Liste.
- Ablaufbloecke mit Icon, Name, Dauer, Gruppengroesse, leiser Zweckzeile und ruhigen Warnmarkern.
- Checks im Tab ausfuehrlich anzeigen.
- Drag ueber eingeklappter Phase klappt diese automatisch auf.

### Milestone 4: Setup und Preview abrunden

Status: erledigt am 2026-04-29.

Ziel: Setup, Live-Preview und Scriptansicht konsistent zum restlichen System machen.

Aufgaben:

- Setup als Wizard mit horizontalem Stepper.
- Pflichtfelder fuer Titel, Ziel, Kontext/Anlass, Dauer, Gruppengroesse und Format.
- Optionale Felder fuer Gruppendynamik.
- Live-Zusammenfassung rechts, falls nuetzlich.
- Setup-Werte im Builder-Panel editierbar machen.
- Preview als Moderationsmodus mit aktuellem Schritt links und Agenda rechts.
- Kompakte Timer-Leiste.
- Ausklappbares Notizpanel.
- Separate Script-Vorschau mit Print-Styles.
- Script-Kopf, Ueberblickstabelle und Detailteil pro LS.
- Notizen standardmaessig im Script enthalten, Option zum Ausblenden.

## Review-Kriterien nach Umsetzung

Nach der Umsetzung muessen Screenshots aller Hauptscreens erstellt und bewertet werden:

- Library.
- Builder leer.
- Builder gefuellt.
- Setup.
- Preview Live-Modus.
- Script-/Printvorschau.

Pruefkriterien:

- Wirkt die App ruhiger und klarer gewichtet?
- Sind LS-Icons konsistent eingebettet?
- Sind Cards scanbar, ohne ueberladen zu wirken?
- Sind Details kontextuell statt permanent dominant?
- Ist der Builder klar auf Timeline und aktuelle Auswahl fokussiert?
- Sind Warnungen hilfreich, aber nicht alarmistisch?
- Ist Drag and drop verstaendlich?
- Funktioniert das Layout auf Desktop und kleinen Screens?
- Sind Print-Styles fuer das Script lesbar und brauchbar?

## Anschluss-Prompt fuer neue Implementierungs-Session

```text
Wir setzen jetzt die im Repo dokumentierten Design-Entscheidungen automatisch Schritt fuer Schritt um.

Bitte lies zuerst die Datei:
design-review-decisions.md

Arbeitsweise:
- Nicht erneut designen oder Grundsatzfragen stellen, ausser ein echter technischer Blocker entsteht.
- Erst den Codebestand lesen und die bestehende Struktur verstehen.
- Dann die Umsetzung in Milestones angehen, in dieser Reihenfolge:
  1. Icon-Pipeline und Library Card-System.
  2. Library Detailpanel.
  3. Builder beruhigen.
  4. Setup, Preview und Script-/Printmodus abrunden.
- Bestehende Patterns, Komponenten und Datenmodelle bevorzugen.
- Keine offiziellen LS-Icons neu generieren. Icons automatisch von den offiziellen LS-Seiten extrahieren und lokal speichern.
- Farben der Icons unveraendert lassen.
- UI neutral, ruhig und modern halten. Lebendigkeit kommt durch LS-Icons, Drag and drop, Empty States und kurze funktionale Motion.
- Keine unrelated Refactors.
- Nach jedem Milestone testen und visuell pruefen.
- Nach der Umsetzung Screenshots von Library, Builder leer/gefuellt, Setup, Preview und Scriptansicht erstellen und gegen die Review-Kriterien aus design-review-decisions.md pruefen.

Starte mit:
1. kurzer Codebase-Orientierung,
2. Identifikation der relevanten Dateien/Komponenten/Datenquellen,
3. konkretem Plan fuer Milestone 1,
4. anschliessender Umsetzung von Milestone 1 ohne weitere Rueckfrage, sofern technisch moeglich.
```
