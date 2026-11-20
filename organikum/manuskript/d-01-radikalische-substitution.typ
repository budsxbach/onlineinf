// ============================================================================
//  Musterkapitel D.1 — Radikalische Substitution (Auszug für die Layoutprobe)
// ============================================================================

#import "/vorlage/layout.typ": *

== Radikalische Substitution

Die radikalische Substitution verläuft über kettenförmige Folgen von
Elementarschritten. Der Start erfolgt durch thermische oder photochemische
Bindungsspaltung, die Kette wird über Abstraktion eines Wasserstoffatoms durch
ein Radikal fortgeführt, und der Abbruch wird durch Rekombination oder
Disproportionierung zweier Radikale eingeleitet.

=== Erzeugung und Stabilität von Radikalen

Radikale entstehen bevorzugt aus schwachen Bindungen: O–O-Bindungen in Peroxiden,
N–Br-Bindungen in N-Bromamiden, Halogen-Kohlenstoff-Bindungen in Gegenwart von
Licht oder Radikalstartern. Ihre Stabilität folgt der Reihe

$ "C"("CH"_3)_3 dot > "CH"("CH"_3)_2 dot > "CH"_2"CH"_3 dot > dot "CH"_3 > dot "CH"_2"Cl" $

und wird durch Hyperkonjugation, Delokalisation und sterische Abschirmung
erklärt.

=== Reaktivität und Selektivität

Chlorierung ist wenig selektiv, Bromierung stark selektiv. Für die
Bromierung von 2-Methylbutan beobachtet man statistisch-normiert:

#figure(
  table(
    columns: (auto, auto, auto),
    inset: (x: 5pt, y: 3.5pt),
    align: (left, right, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Wasserstofftyp*], [*rel. Reaktivität (Cl, 25 °C)*], [*rel. Reaktivität (Br, 127 °C)*]),
    [primär], [1], [1],
    [sekundär], [3,8], [82],
    [tertiär], [5,2], [1600],
  ),
  caption: [Selektivität der radikalischen Halogenierung von Alkanen.],
) <tab:selektivitaet>

#vorschrift("D.1.1", [Benzylbromid aus Toluol])[
  #reaktion(
    $ "C"_6"H"_5"CH"_3 + "Br"_2 $,
    [#text(size: 6.5pt)[h $nu$, 80 °C]],
    $ "C"_6"H"_5"CH"_2"Br" + "HBr" $,
  )

  #ansatz[
    92 g (106 mL; 1,0 mol) Toluol, 176 g (55 mL; 1,1 mol) Brom,
  4 g wasserfreies Natriumcarbonat.
  ]

  In einem 500-ml-Rundkolben mit Rückflußkühler und Tropftrichter legt man
  Toluol und Natriumcarbonat vor und erhitzt auf 80 °C. Unter Bestrahlung mit
  einer Wolframlampe tropft man Brom so zu, daß die Umsetzung gleichmäßig
  verläuft und kein freies Halogen in größerer Konzentration vorliegt.

  Nach beendeter Zugabe wird 1 h weiterbelichtet. Man wäscht mit Wasser und
  10-prozentiger Natriumcarbonatlösung, trennt die organische Phase, trocknet
  über Calciumchlorid und destilliert im Vakuum über eine kurze Kolonne.

  #ausbeute[129 g (76 % d. Th.) farblose, stechend riechende Flüssigkeit.]

  #kenndaten[
    Sdp. 198–199 °C (1013 hPa) #h(2em) $n_D^20$ = 1,5751 #h(2em)
    $rho_20$ = 1,455 g·cm#super[−3]
  ]
]

#gefahr[Brom ist stark ätzend und wirkt stark oxidierend; es verursacht schwere
Verbrennungen und ist für Wasserorganismen sehr giftig. Nur im Abzug und in
kleinen Portionen arbeiten, Tropftrichter mit Überdruckventil verwenden. Die
Bestrahlung mit UV-Licht erzeugt zusätzlich Reizstoffe.]
