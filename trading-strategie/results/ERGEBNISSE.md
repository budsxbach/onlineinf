# Backtest-Ergebnisse (automatisch erzeugt von `backtest.py`)

## Stufe A – Monats-Check (S&P 500 inkl. Dividenden, monatlich; Cash unverzinst)

Regel: am Monatsende investiert, wenn Schlusskurs > 10-Monats-Durchschnitt, sonst Cash. Daten: Shiller/`datasets/s-and-p-500` (Dividenden ab 07/2023 fortgeschrieben).

| Kennzahl | Monats-Check 1871–2026 | Buy & Hold 1871–2026 | Monats-Check 1950–2026 | Buy & Hold 1950–2026 | Monats-Check 2000–2026 | Buy & Hold 2000–2026 |
|---|---|---|---|---|---|---|
| CAGR | 9.4 % | 9.4 % | 10.8 % | 11.5 % | 10.2 % | 8.8 % |
| Volatilität | 9.5 % | 14.0 % | 8.8 % | 12.0 % | 8.7 % | 12.9 % |
| Sharpe | 1.00 | 0.71 | 1.21 | 0.97 | 1.16 | 0.72 |
| Max. Drawdown | -46.3 % | -81.8 % | -19.0 % | -49.0 % | -19.0 % | -49.0 % |
| Längste Durststrecke (Tage) | 2252 | 5601 | 1034 | 2252 | 670 | 1887 |
| Endkapital (Start=1) | 1145991.37 | 1076083.88 | 2377.48 | 3766.65 | 12.30 | 8.83 |
| Zeit investiert | 63.9 % | – | 72.1 % | – | 72.0 % | – |
| Umschichtungen | 209 | – | 96 | – | 29 | – |


## Stufe B – Trend-Trader auf SPY (täglich, 2000-08-15 bis 2025-06-16, Kosten 0.05 % je Seite)

Regeln: Schluss > SMA200, Einstieg bei Schluss über 20-Tage-Hoch, Initial-Stop 3×ATR(20), Ausstieg bei Schluss unter 100-Tage-Tief oder unter SMA200, Ausführung nächste Eröffnung. SPY-Kurse ohne Dividenden (benachteiligt Buy & Hold um ca. 1,5–2 % p.a.).

| Kennzahl | Trend-Trader (Risiko 1 %) | Trend-Trader (Vollposition) | Monats-Check (10M-SMA) | SMA200-Filter täglich | Buy & Hold SPY |
|---|---|---|---|---|---|
| CAGR | 1.4 % | 5.0 % | 6.5 % | 4.6 % | 5.8 % |
| Volatilität | 2.7 % | 10.2 % | 9.8 % | 10.8 % | 19.4 % |
| Sharpe | 0.51 | 0.53 | 0.69 | 0.47 | 0.39 |
| Max. Drawdown | -5.3 % | -17.0 % | -23.5 % | -21.9 % | -56.5 % |
| Längste Durststrecke (Tage) | 1096 | 1013 | 1034 | 1096 | 2450 |
| Endkapital (Start=1) | 1.40 | 3.38 | 4.72 | 3.07 | 4.04 |
| Trades | 38 | 38 | 38 | – | – |
| Trefferquote | 44.7 % | 44.7 % | – | – | – |
| Ø Gewinn-Trade (R) | 2.54 | 2.54 | – | – | – |
| Ø Verlust-Trade (R) | -0.52 | -0.52 | – | – | – |
| Erwartungswert je Trade (R) | 0.85 | 0.85 | – | – | – |
| Profitfaktor | 4.28 | 4.13 | – | – | – |
| Größter Verlust-Trade (R) | -1.86 | -1.86 | – | – | – |
| Größter Gewinn-Trade (R) | 9.10 | 9.10 | – | – | – |
| Ø Haltedauer (Tage) | 155.76 | 155.76 | – | – | – |
| Zeit investiert | 65.7 % | 65.7 % | 71.8 % | 70.3 % | – |


### Jahresrenditen (SPY)

| Jahr | Trend-Trader 1 % | Trend-Trader Vollpos. | Monats-Check | Buy & Hold |
|---|---|---|---|---|
| 2000 | -0.9 % | -3.7 % | -0.0 % | -12.0 % |
| 2001 | 0.0 % | 0.0 % | 0.0 % | -12.9 % |
| 2002 | -0.7 % | -3.7 % | -5.9 % | -22.8 % |
| 2003 | 3.6 % | 21.4 % | 21.0 % | 26.1 % |
| 2004 | 0.6 % | 1.8 % | 6.2 % | 8.6 % |
| 2005 | -0.8 % | -2.0 % | -0.3 % | 3.0 % |
| 2006 | 3.1 % | 10.2 % | 13.7 % | 13.7 % |
| 2007 | -0.4 % | -2.7 % | 3.2 % | 3.2 % |
| 2008 | -0.1 % | -0.4 % | -0.0 % | -38.3 % |
| 2009 | 2.2 % | 10.0 % | 21.1 % | 23.5 % |
| 2010 | 0.7 % | 1.5 % | 3.1 % | 12.8 % |
| 2011 | -0.7 % | -4.9 % | -2.9 % | -0.2 % |
| 2012 | 0.2 % | 1.4 % | 8.4 % | 13.5 % |
| 2013 | 9.5 % | 29.7 % | 29.7 % | 29.7 % |
| 2014 | 2.1 % | 6.6 % | 11.3 % | 11.3 % |
| 2015 | -2.0 % | -5.9 % | -5.9 % | -0.8 % |
| 2016 | 1.3 % | 4.3 % | 8.7 % | 9.6 % |
| 2017 | 5.7 % | 19.4 % | 19.4 % | 19.4 % |
| 2018 | -0.2 % | -0.3 % | -8.2 % | -6.3 % |
| 2019 | 2.2 % | 6.8 % | 8.3 % | 28.8 % |
| 2020 | -0.8 % | 3.7 % | 13.0 % | 16.2 % |
| 2021 | 5.6 % | 27.0 % | 27.0 % | 27.0 % |
| 2022 | -3.0 % | -12.9 % | -21.5 % | -19.5 % |
| 2023 | 2.4 % | 8.6 % | 6.9 % | 24.3 % |
| 2024 | 6.8 % | 23.3 % | 23.3 % | 23.3 % |
| 2025 | -1.1 % | -1.5 % | -2.5 % | 2.8 % |

### Trade-Ergebnisse Trend-Trader (1 % Risiko)

Anzahl: 38 · Trefferquote: 45 % · Ø 0.85 R je Trade · bester Trade: 9.1 R · schlechtester: -1.9 R · Ø Haltedauer 156 Tage

| R-Multiple | Anzahl Trades |
|---|---|
| (-10.0, -1.5] | 1 |
| (-1.5, -1.0] | 1 |
| (-1.0, -0.5] | 7 |
| (-0.5, 0.0] | 12 |
| (0.0, 0.5] | 6 |
| (0.5, 1.0] | 2 |
| (1.0, 2.0] | 2 |
| (2.0, 3.0] | 1 |
| (3.0, 5.0] | 2 |
| (5.0, 100.0] | 4 |

Ausstiegsgründe: Regime-Exit (SMA200): 34, Trailing-Stop: 2, Initial-Stop: 2

Die vollständige Liste steht in `results/trades_spy_1pct.csv`.

## Robustheit 1 – andere Märkte (gleiche Regeln, keine Anpassung)

| Kennzahl | SPY (2000–2025) | GLD (2005–2019) | QQQ (1999–2018) |
|---|---|---|---|
| Trend-Trader 1 %: CAGR / MaxDD | 1.4 % / -5 % | 2.1 % / -11 % | 1.2 % / -6 % |
| Trend-Trader Vollpos.: CAGR / MaxDD / Sharpe | 5.0 % / -17 % / 0.53 | 8.0 % / -24 % / 0.61 | 3.2 % / -45 % / 0.29 |
| Trades / Treffer / Ø R / Profitfaktor | 38 / 45 % / 0.85 / 4.3 | 20 / 45 % / 1.24 / 4.5 | 33 / 21 % / 0.28 / 1.6 |
| Monats-Check: CAGR / MaxDD / Sharpe | 6.5 % / -24 % / 0.69 | 6.1 % / -39 % / 0.49 | 5.1 % / -37 % / 0.44 |
| Buy & Hold: CAGR / MaxDD / Sharpe | 5.8 % / -56 % / 0.39 | 8.3 % / -46 % / 0.52 | 3.5 % / -83 % / 0.26 |


## Robustheit 2 – Parameter-Raster (SPY, 1 % Risiko, mit SMA200-Filter)

E = Einstiegskanal (Tage), X = Ausstiegskanal (Tage), ATR-Multiplikator des Initial-Stops. Befund: je länger der Ausstiegskanal, desto besser – enge Trailing-Stops (10/20 Tage) werden auf Indizes ständig ausgestoppt.

| Variante | CAGR | MaxDD | Sharpe | Trades | Treffer | Ø R | Profitfaktor | Investiert |
|---|---|---|---|---|---|---|---|---|
| E20 / X10 / 2×ATR | 0.7 % | -8.0 % | 0.26 | 102 | 40 % | 0.15 | 1.4 | 42 % |
| E20 / X10 / 3×ATR | 0.5 % | -5.6 % | 0.26 | 101 | 41 % | 0.11 | 1.4 | 42 % |
| E20 / X20 / 2×ATR | 0.8 % | -8.3 % | 0.27 | 78 | 40 % | 0.25 | 1.6 | 49 % |
| E20 / X20 / 3×ATR | 0.7 % | -5.7 % | 0.31 | 74 | 42 % | 0.21 | 1.7 | 50 % |
| E20 / X50 / 2×ATR | 1.6 % | -7.8 % | 0.46 | 52 | 38 % | 0.71 | 2.6 | 59 % |
| E20 / X50 / 3×ATR | 1.2 % | -5.1 % | 0.50 | 47 | 43 % | 0.62 | 3.0 | 61 % |
| E20 / X100 / 2×ATR | 1.8 % | -9.3 % | 0.48 | 41 | 41 % | 1.10 | 3.4 | 65 % |
| E20 / X100 / 3×ATR | 1.4 % | -5.3 % | 0.51 | 38 | 45 % | 0.85 | 4.3 | 66 % |
| E55 / X10 / 2×ATR | 0.5 % | -8.0 % | 0.20 | 80 | 48 % | 0.14 | 1.4 | 34 % |
| E55 / X10 / 3×ATR | 0.3 % | -6.4 % | 0.18 | 79 | 48 % | 0.09 | 1.3 | 34 % |
| E55 / X20 / 2×ATR | 0.7 % | -9.9 % | 0.22 | 62 | 45 % | 0.27 | 1.6 | 39 % |
| E55 / X20 / 3×ATR | 0.5 % | -6.2 % | 0.23 | 58 | 48 % | 0.21 | 1.6 | 41 % |
| E55 / X50 / 2×ATR | 1.4 % | -9.7 % | 0.41 | 41 | 41 % | 0.83 | 2.6 | 50 % |
| E55 / X50 / 3×ATR | 1.2 % | -6.2 % | 0.47 | 36 | 50 % | 0.79 | 3.3 | 53 % |
| E55 / X100 / 2×ATR | 1.4 % | -10.5 % | 0.39 | 33 | 33 % | 1.09 | 2.6 | 57 % |
| E55 / X100 / 3×ATR | 1.2 % | -6.7 % | 0.44 | 29 | 45 % | 0.98 | 3.4 | 60 % |

## Robustheit 3 – Rolle der 200-Tage-Linie (SPY, Vollposition)

| Kennzahl | mit SMA200-Filter und -Exit | nur SMA200-Filter (Exit nur Stops) | ohne SMA200 |
|---|---|---|---|
| CAGR | 5.0 % | 5.4 % | 5.4 % |
| MaxDD | -17.0 % | -23.4 % | -40.0 % |
| Sharpe | 0.53 | 0.50 | 0.46 |
| Trades | 38 | 21 | 25 |
| Treffer | 45 % | 62 % | 52 % |
| Profitfaktor | 4.1 | 5.1 | 3.9 |


Allgemeine Hinweise: ETF-Kurse ohne Ausschüttungen, Kosten 0,05 % je Seite, Ausführung am nächsten Eröffnungskurs, keine Steuern, Cash unverzinst. Backtests sind Vergangenheitsbetrachtungen und keine Garantie für die Zukunft.