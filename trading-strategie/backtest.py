#!/usr/bin/env python3
"""
Backtest + Signal-Check für die "Simple Trend"-Strategie.

Die Strategie destilliert die Gemeinsamkeiten der erfolgreichsten Trader
(Turtles/Dennis, Seykota, Paul Tudor Jones, Druckenmiller, Minervini/O'Neil,
Faber-Timing-Modell) in ein mechanisches Regelwerk:

  Stufe A  ("Monats-Check", 5 Minuten pro Monat)
      Investiert, wenn Monatsschluss > 10-Monats-SMA (≈ 200-Tage-Linie),
      sonst Cash/Geldmarkt.   -> Faber (2007), Paul Tudor Jones' 200-Tage-Regel

  Stufe B  ("Trend-Trader", 10 Minuten pro Tag nach Börsenschluss)
      Regime-Filter : nur long, wenn Schluss > SMA200
      Einstieg      : Schluss über dem Hoch der letzten 20 Tage (Donchian-Breakout)
      Positionsgröße: 1 % des Kapitals Risiko, Stop-Distanz = 3 x ATR(20)
      Initial-Stop  : Einstieg - 3 x ATR(20)
      Trailing-Exit : Schluss unter dem Tief der letzten 100 Tage (≈ 20 Wochen)
      Regime-Exit   : Schluss unter SMA200
      Kein Nachkaufen bei Verlust. Ausführung am nächsten Eröffnungskurs.

Benutzung:
    python backtest.py                      # kompletter Backtest, Tabellen + Charts
    python backtest.py --signal             # aktueller Status/Signal (letzte Zeile der Daten)
    python backtest.py --csv meine_daten.csv --capital 20000 --risk 0.01 --signal
    python backtest.py --download SPY       # frische Daten via yfinance (pip install yfinance)

CSV-Format: Spalten date, open, high, low, close (volume optional).
"""
from __future__ import annotations

import argparse
import itertools
import math
import os
import sys
from dataclasses import dataclass, field

import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(HERE, "data")
RESULTS_DIR = os.path.join(HERE, "results")


# --------------------------------------------------------------------------- #
# Daten
# --------------------------------------------------------------------------- #
def load_daily(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df.columns = [c.strip().lower() for c in df.columns]
    if "date" not in df.columns:
        df = df.rename(columns={df.columns[0]: "date"})
    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date").sort_index()
    df = df[~df.index.duplicated(keep="last")]
    need = {"open", "high", "low", "close"}
    missing = need - set(df.columns)
    if missing:
        raise SystemExit(f"CSV fehlt Spalten: {sorted(missing)}")
    return df[["open", "high", "low", "close"] + (["volume"] if "volume" in df.columns else [])].astype(float)


def download_yfinance(ticker: str, path: str) -> pd.DataFrame:
    try:
        import yfinance as yf  # type: ignore
    except ImportError:
        raise SystemExit("yfinance nicht installiert:  pip install yfinance")
    raw = yf.download(ticker, period="max", auto_adjust=False, progress=False)
    if isinstance(raw.columns, pd.MultiIndex):
        raw.columns = raw.columns.get_level_values(0)
    df = raw.rename(columns=str.lower)[["open", "high", "low", "close", "volume"]].dropna()
    df.index.name = "date"
    df.to_csv(path)
    print(f"{ticker}: {len(df)} Tage gespeichert -> {path}")
    return df


# --------------------------------------------------------------------------- #
# Indikatoren
# --------------------------------------------------------------------------- #
def add_indicators(df: pd.DataFrame, sma_len=200, entry_len=20, exit_len=100, atr_len=20) -> pd.DataFrame:
    d = df.copy()
    d["sma"] = d["close"].rolling(sma_len).mean()
    prev_close = d["close"].shift(1)
    tr = pd.concat(
        [d["high"] - d["low"], (d["high"] - prev_close).abs(), (d["low"] - prev_close).abs()], axis=1
    ).max(axis=1)
    d["atr"] = tr.ewm(alpha=1 / atr_len, adjust=False, min_periods=atr_len).mean()  # Wilder-ATR ("N" der Turtles)
    # Kanäle aus den *vorherigen* Tagen (der heutige Tag darf das Hoch/Tief nicht selbst stellen)
    d["entry_hi"] = d["high"].rolling(entry_len).max().shift(1)
    d["exit_lo"] = d["low"].rolling(exit_len).min().shift(1)
    return d


# --------------------------------------------------------------------------- #
# Kennzahlen
# --------------------------------------------------------------------------- #
def perf_stats(equity: pd.Series, periods_per_year: int) -> dict:
    equity = equity.dropna()
    rets = equity.pct_change().dropna()
    years = (equity.index[-1] - equity.index[0]).days / 365.25
    cagr = (equity.iloc[-1] / equity.iloc[0]) ** (1 / years) - 1 if years > 0 else np.nan
    vol = rets.std() * math.sqrt(periods_per_year)
    sharpe = (rets.mean() * periods_per_year) / vol if vol > 0 else np.nan
    dd = equity / equity.cummax() - 1
    max_dd = dd.min()
    # längste Durststrecke (Zeit bis zum neuen Hoch)
    peak_dates = equity[equity == equity.cummax()].index
    longest = max((b - a).days for a, b in zip(peak_dates[:-1], peak_dates[1:])) if len(peak_dates) > 1 else 0
    longest = max(longest, (equity.index[-1] - peak_dates[-1]).days)
    return {
        "CAGR": cagr,
        "Volatilität": vol,
        "Sharpe": sharpe,
        "Max. Drawdown": max_dd,
        "Längste Durststrecke (Tage)": longest,
        "Endkapital (Start=1)": equity.iloc[-1] / equity.iloc[0],
    }


def fmt_stats(stats: dict) -> dict:
    out = {}
    for k, v in stats.items():
        if k in ("CAGR", "Volatilität", "Max. Drawdown", "Zeit investiert", "Trefferquote"):
            out[k] = f"{v * 100:.1f} %"
        elif isinstance(v, float):
            out[k] = f"{v:.2f}"
        else:
            out[k] = v
    return out


# --------------------------------------------------------------------------- #
# Stufe A: Monats-Check (Faber 10-Monats-SMA / 200-Tage-Linie)
# --------------------------------------------------------------------------- #
def backtest_monthly_sma(close_m: pd.Series, sma_len=10, cost=0.0005, dividend_annual: pd.Series | None = None
                         ) -> tuple[pd.Series, pd.Series, pd.Series]:
    """Signal am Monatsende (Kurs vs. SMA), Position im Folgemonat.
    dividend_annual: annualisierte Dividende je Monat (Shiller-Format) -> Total-Return-Rechnung.
    Cash wird mit 0 % verzinst (konservativ; real gäbe es Geldmarktzins).
    Gibt (Equity Strategie, Equity Buy&Hold, Positionsserie) zurück."""
    sma = close_m.rolling(sma_len).mean()
    pos = (close_m > sma).astype(float).shift(1)  # Signal vom Vormonat
    rets = close_m.pct_change()
    if dividend_annual is not None:
        rets = rets + (dividend_annual / 12.0) / close_m.shift(1)
    valid = pos.notna() & sma.shift(1).notna()
    pos, rets = pos[valid], rets[valid]
    trades = pos.diff().abs().fillna(0)
    strat = (1 + rets * pos - trades * cost).cumprod()
    bh = (1 + rets).cumprod()
    return strat, bh, pos


# --------------------------------------------------------------------------- #
# Stufe B: Trend-Trader (Breakout + ATR-Risiko + Trailing-Stop)
# --------------------------------------------------------------------------- #
@dataclass
class Params:
    sma_len: int = 200
    entry_len: int = 20
    exit_len: int = 100
    atr_len: int = 20
    atr_stop_mult: float = 3.0
    risk_per_trade: float = 0.01  # 1 % des Kapitals
    max_position_pct: float = 1.0  # kein Hebel
    use_sma_filter: bool = True
    use_sma_exit: bool = True
    cost_per_side: float = 0.0005  # 0,05 % Gebühren + Slippage je Seite
    start_capital: float = 10_000.0


@dataclass
class Trade:
    entry_date: pd.Timestamp
    entry_price: float
    units: float
    initial_stop: float
    risk_amount: float
    exit_date: pd.Timestamp | None = None
    exit_price: float | None = None
    reason: str = ""

    @property
    def pnl(self) -> float:
        return (self.exit_price - self.entry_price) * self.units

    @property
    def r_multiple(self) -> float:
        return self.pnl / self.risk_amount if self.risk_amount else np.nan

    @property
    def pct(self) -> float:
        return self.exit_price / self.entry_price - 1


@dataclass
class Result:
    equity: pd.Series
    exposure: pd.Series
    trades: list[Trade] = field(default_factory=list)
    params: Params = field(default_factory=Params)

    def trade_stats(self) -> dict:
        if not self.trades:
            return {}
        pnl = np.array([t.pnl for t in self.trades])
        r = np.array([t.r_multiple for t in self.trades])
        wins, losses = pnl[pnl > 0], pnl[pnl <= 0]
        hold = np.array([(t.exit_date - t.entry_date).days for t in self.trades])
        return {
            "Trades": len(self.trades),
            "Trefferquote": len(wins) / len(pnl),
            "Ø Gewinn-Trade (R)": r[pnl > 0].mean() if len(wins) else 0.0,
            "Ø Verlust-Trade (R)": r[pnl <= 0].mean() if len(losses) else 0.0,
            "Erwartungswert je Trade (R)": r.mean(),
            "Profitfaktor": wins.sum() / abs(losses.sum()) if len(losses) and losses.sum() != 0 else np.inf,
            "Größter Verlust-Trade (R)": r.min(),
            "Größter Gewinn-Trade (R)": r.max(),
            "Ø Haltedauer (Tage)": hold.mean(),
            "Zeit investiert": float(self.exposure.mean()),
        }


def backtest_trend(df: pd.DataFrame, p: Params) -> Result:
    d = add_indicators(df, p.sma_len, p.entry_len, p.exit_len, p.atr_len)
    first_valid = d[["sma", "atr", "entry_hi", "exit_lo"]].dropna().index[0]
    d = d.loc[first_valid:]

    cash = p.start_capital
    units = 0.0
    trade: Trade | None = None
    pending: str | None = None  # "buy" / "sell" -> Ausführung an der nächsten Eröffnung
    pending_units = 0.0
    pending_stop = 0.0
    pending_risk = 0.0
    pending_reason = ""
    equity_vals, expo_vals, trades = [], [], []

    dates = d.index
    o, h, l, c = d["open"].values, d["high"].values, d["low"].values, d["close"].values
    sma, atr, ehi, elo = d["sma"].values, d["atr"].values, d["entry_hi"].values, d["exit_lo"].values

    for i in range(len(d)):
        # 1) Pending-Order an der heutigen Eröffnung ausführen
        if pending == "buy":
            px = o[i] * (1 + p.cost_per_side)
            u = min(pending_units, (cash * p.max_position_pct) / px)
            u = math.floor(u * 1000) / 1000  # Bruchstücke ok (ETF-Sparplan), aber sauber runden
            if u > 0:
                cash -= u * px
                units = u
                # R = tatsächlich riskierter Betrag (Einstieg bis Initial-Stop), nicht der nominale Plan-Betrag
                trade = Trade(dates[i], px, u, pending_stop, u * max(px - pending_stop, 1e-9))
            pending = None
        elif pending == "sell" and units > 0:
            px = o[i] * (1 - p.cost_per_side)
            cash += units * px
            trade.exit_date, trade.exit_price, trade.reason = dates[i], px, pending_reason
            trades.append(trade)
            units, trade, pending = 0.0, None, None

        # 2) Tagesschluss: Equity festhalten
        equity_vals.append(cash + units * c[i])
        expo_vals.append(1.0 if units > 0 else 0.0)

        # 3) Signale auf Schlusskursbasis -> Order für morgen
        if i == len(d) - 1:
            break
        if units > 0:
            stop_level = max(trade.initial_stop, elo[i])  # Trailing: 100-Tage-Tief, nie unter Initial-Stop
            if c[i] < stop_level:
                pending, pending_reason = "sell", ("Initial-Stop" if c[i] < trade.initial_stop else "Trailing-Stop")
            elif p.use_sma_exit and c[i] < sma[i]:
                pending, pending_reason = "sell", "Regime-Exit (SMA200)"
        else:
            regime_ok = (c[i] > sma[i]) if p.use_sma_filter else True
            if regime_ok and c[i] > ehi[i] and atr[i] > 0:
                equity_now = cash
                stop_dist = p.atr_stop_mult * atr[i]
                pending_risk = p.risk_per_trade * equity_now
                pending_units = pending_risk / stop_dist
                pending_stop = c[i] - stop_dist  # Referenz: Schluss (Eröffnung morgen unbekannt)
                pending = "buy"

    equity = pd.Series(equity_vals, index=dates, name="equity")
    exposure = pd.Series(expo_vals, index=dates, name="exposure")
    # offene Position am Ende zum letzten Schluss bewerten (nicht als Trade zählen)
    return Result(equity, exposure, trades, p)


def buy_and_hold(df: pd.DataFrame, start: pd.Timestamp, start_capital: float) -> pd.Series:
    c = df.loc[start:, "close"]
    return start_capital * c / c.iloc[0]


def sma_only_daily(df: pd.DataFrame, start: pd.Timestamp, sma_len=200, cost=0.0005, start_capital=10_000.0) -> pd.Series:
    """Vergleich: täglicher 200-Tage-Filter ohne Breakout/Stops (Signal Schluss, Ausführung nächster Tag)."""
    d = df.copy()
    d["sma"] = d["close"].rolling(sma_len).mean()
    d = d.loc[start:]
    pos = (d["close"] > d["sma"]).astype(float).shift(1).fillna(0)
    rets = d["close"].pct_change().fillna(0)
    trades = pos.diff().abs().fillna(0)
    return start_capital * (1 + rets * pos - trades * cost).cumprod()


# --------------------------------------------------------------------------- #
# Signal-Check (was tun heute?)
# --------------------------------------------------------------------------- #
def signal_check(df: pd.DataFrame, p: Params, capital: float, symbol: str = "") -> None:
    d = add_indicators(df, p.sma_len, p.entry_len, p.exit_len, p.atr_len).dropna()
    row = d.iloc[-1]
    above = row["close"] > row["sma"]
    breakout = row["close"] > row["entry_hi"]
    stop_dist = p.atr_stop_mult * row["atr"]
    risk_amt = capital * p.risk_per_trade
    units = risk_amt / stop_dist
    pos_value = min(units * row["close"], capital * p.max_position_pct)
    units = pos_value / row["close"]
    print("=" * 66)
    print(f" SIGNAL-CHECK {symbol}  Stand: {d.index[-1].date()}   Schluss: {row['close']:.2f}")
    print("=" * 66)
    print(f" SMA{p.sma_len}:                 {row['sma']:.2f}   -> {'ÜBER (Regime: long erlaubt)' if above else 'UNTER (kein Kauf, Cash)'}")
    print(f" {p.entry_len}-Tage-Hoch (gestern):  {row['entry_hi']:.2f}   -> {'AUSBRUCH ✔' if breakout else 'kein Ausbruch'}")
    print(f" {p.exit_len}-Tage-Tief (gestern):  {row['exit_lo']:.2f}   (Trailing-Stop-Referenz für offene Position)")
    print(f" ATR({p.atr_len}):               {row['atr']:.2f}   ({row['atr'] / row['close'] * 100:.2f} % vom Kurs)")
    print("-" * 66)
    if above and breakout:
        print(" => KAUFSIGNAL für morgen zur Eröffnung")
    elif above:
        print(" => Kein neues Signal. Offene Position halten, Stop nachziehen; ohne Position: warten.")
    else:
        print(" => Unter SMA200: nichts kaufen, offene Position schließen bzw. in Cash bleiben.")
    print("-" * 66)
    print(f" Positionsgröße bei {capital:,.0f} Kapital und {p.risk_per_trade * 100:.1f} % Risiko:")
    print(f"   Risiko-Betrag:   {risk_amt:,.2f}")
    print(f"   Stop-Distanz:    {stop_dist:.2f}  (= {p.atr_stop_mult} x ATR)  -> Initial-Stop {row['close'] - stop_dist:.2f}")
    print(f"   Stückzahl:       {units:.2f}  (Positionswert {pos_value:,.0f} = {pos_value / capital * 100:.0f} % des Kapitals)")
    print("=" * 66)


# --------------------------------------------------------------------------- #
# Reporting
# --------------------------------------------------------------------------- #
def _clean(v) -> str:
    if v is None or (isinstance(v, float) and math.isnan(v)) or str(v) in ("nan", "NaN", "None"):
        return "–"
    return str(v)


def print_table(title: str, rows: dict[str, dict]) -> None:
    df = pd.DataFrame(rows).T.map(_clean)
    print(f"\n### {title}\n")
    print(df.to_string())


def to_markdown_table(rows: dict[str, dict]) -> str:
    df = pd.DataFrame(rows).map(_clean)
    lines = ["| Kennzahl | " + " | ".join(df.columns) + " |", "|---|" + "---|" * len(df.columns)]
    for idx, r in df.iterrows():
        lines.append(f"| {idx} | " + " | ".join(r.values) + " |")
    return "\n".join(lines)


def plot_equity(curves: dict[str, pd.Series], title: str, path: str, log=True) -> None:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8), sharex=True, gridspec_kw={"height_ratios": [3, 1]})
    for name, s in curves.items():
        ax1.plot(s.index, s / s.iloc[0], label=name, linewidth=1.3)
        dd = s / s.cummax() - 1
        ax2.fill_between(dd.index, dd * 100, 0, alpha=0.35, label=name)
    if log:
        ax1.set_yscale("log")
    ax1.set_title(title)
    ax1.set_ylabel("Kapital (Start = 1, log)")
    ax1.grid(alpha=0.3, which="both")
    ax1.legend()
    ax2.set_ylabel("Drawdown %")
    ax2.grid(alpha=0.3)
    fig.tight_layout()
    fig.savefig(path, dpi=130)
    plt.close(fig)
    print(f"Chart gespeichert: {path}")


# --------------------------------------------------------------------------- #
# Main
# --------------------------------------------------------------------------- #
def _monthly_check_from_daily(df: pd.DataFrame, start: pd.Timestamp, cost: float, start_capital: float
                              ) -> tuple[pd.Series, pd.Series]:
    """Stufe A auf Tagesdaten: Monatsschluss vs. 10-Monats-SMA. Gibt (Equity, Positionsserie) zurück."""
    me = df["close"].resample("ME").last().dropna()
    strat, _, pos = backtest_monthly_sma(me, sma_len=10, cost=cost)
    strat = strat.loc[start:]
    return start_capital * strat / strat.iloc[0], pos.loc[start:]


def run_full_backtest(args) -> None:
    os.makedirs(RESULTS_DIR, exist_ok=True)
    md = ["# Backtest-Ergebnisse (automatisch erzeugt von `backtest.py`)\n"]

    # ---------- Stufe A: 155 Jahre S&P 500, monatlich, Total Return ----------
    mdf = pd.read_csv(os.path.join(DATA_DIR, "SP500_monthly.csv"), parse_dates=["date"]).set_index("date")
    div = mdf["dividend"].replace(0.0, np.nan).ffill()  # ab Mitte 2023 fehlen Dividendendaten -> fortgeschrieben
    rows, curves = {}, {}
    for label, start in [("1871–2026", "1871"), ("1950–2026", "1950"), ("2000–2026", "2000")]:
        strat, bh, pos = backtest_monthly_sma(mdf.loc[start:, "close"], sma_len=10, cost=args.cost,
                                              dividend_annual=div.loc[start:])
        s_stats, b_stats = perf_stats(strat, 12), perf_stats(bh, 12)
        s_stats["Zeit investiert"] = float(pos.mean())
        s_stats["Umschichtungen"] = int(pos.diff().abs().sum())
        rows[f"Monats-Check {label}"] = fmt_stats(s_stats)
        rows[f"Buy & Hold {label}"] = fmt_stats(b_stats)
        if label == "1871–2026":
            curves = {"Monats-Check (10-Monats-SMA)": strat, "Buy & Hold S&P 500": bh}
    print_table("Stufe A – Monats-Check (S&P 500 inkl. Dividenden, monatlich, Cash = 0 %)", rows)
    md += ["## Stufe A – Monats-Check (S&P 500 inkl. Dividenden, monatlich; Cash unverzinst)\n",
           "Regel: am Monatsende investiert, wenn Schlusskurs > 10-Monats-Durchschnitt, sonst Cash. "
           "Daten: Shiller/`datasets/s-and-p-500` (Dividenden ab 07/2023 fortgeschrieben).\n",
           to_markdown_table(rows), "\n"]
    plot_equity(curves, "Stufe A: S&P 500 (Total Return) – Monats-Check (über/unter 10-Monats-SMA) vs. Buy & Hold, 1871–2026",
                os.path.join(RESULTS_DIR, "stufe_a_monatscheck_1871_2026.png"))

    # ---------- Stufe B: SPY täglich ----------
    df = load_daily(args.csv)
    p = Params(risk_per_trade=args.risk, cost_per_side=args.cost)
    res = backtest_trend(df, p)
    start = res.equity.index[0]
    bh = buy_and_hold(df, start, p.start_capital)
    sma_only = sma_only_daily(df, start, cost=args.cost, start_capital=p.start_capital)
    monthly_eq, monthly_pos = _monthly_check_from_daily(df, start, args.cost, p.start_capital)

    rows = {}
    s = perf_stats(res.equity, 252)
    s.update(res.trade_stats())
    rows[f"Trend-Trader (Risiko {p.risk_per_trade * 100:.0f} %)"] = fmt_stats(s)
    p_full = Params(risk_per_trade=0.10, cost_per_side=args.cost)  # wird durch 100 %-Kappung zur Vollposition
    res_full = backtest_trend(df, p_full)
    s_full = perf_stats(res_full.equity, 252)
    s_full.update(res_full.trade_stats())
    rows["Trend-Trader (Vollposition)"] = fmt_stats(s_full)
    mo = perf_stats(monthly_eq, 12)
    mo["Zeit investiert"] = float(monthly_pos.mean())
    mo["Trades"] = int(monthly_pos.diff().abs().sum())
    rows["Monats-Check (10M-SMA)"] = fmt_stats(mo)
    so = perf_stats(sma_only, 252)
    so["Zeit investiert"] = float((df.loc[start:, "close"] > df["close"].rolling(200).mean().loc[start:]).mean())
    rows["SMA200-Filter täglich"] = fmt_stats(so)
    rows["Buy & Hold SPY"] = fmt_stats(perf_stats(bh, 252))
    period = f"{start.date()} bis {res.equity.index[-1].date()}"
    print_table(f"Stufe B – Trend-Trader auf SPY täglich ({period}) im Vergleich", rows)
    md += [f"## Stufe B – Trend-Trader auf SPY (täglich, {period}, Kosten {args.cost * 100:.2f} % je Seite)\n",
           "Regeln: Schluss > SMA200, Einstieg bei Schluss über 20-Tage-Hoch, Initial-Stop 3×ATR(20), "
           "Ausstieg bei Schluss unter 100-Tage-Tief oder unter SMA200, Ausführung nächste Eröffnung. "
           "SPY-Kurse ohne Dividenden (benachteiligt Buy & Hold um ca. 1,5–2 % p.a.).\n",
           to_markdown_table(rows), "\n"]
    plot_equity({"Trend-Trader 1 % Risiko": res.equity, "Trend-Trader Vollposition": res_full.equity,
                 "Monats-Check (10M-SMA)": monthly_eq, "SMA200-Filter täglich": sma_only, "Buy & Hold SPY": bh},
                "Stufe B: SPY – Trend-Trader (SMA200 + 20-Tage-Breakout + 3xATR-Stop + 100-Tage-Trailing) vs. Vergleiche",
                os.path.join(RESULTS_DIR, "stufe_b_trendtrader_spy.png"))

    # Jahresrenditen
    def yearly(eq: pd.Series) -> pd.Series:
        ye = eq.resample("YE").last()
        out = ye.pct_change()
        out.iloc[0] = ye.iloc[0] / p.start_capital - 1
        return out
    yr = pd.DataFrame({"Trend-Trader 1 %": yearly(res.equity), "Trend-Trader Vollpos.": yearly(res_full.equity),
                       "Monats-Check": yearly(monthly_eq), "Buy & Hold": yearly(bh)})
    yr.index = yr.index.year
    yr_fmt = (yr * 100).round(1).astype(str) + " %"
    print("\n### Jahresrenditen (SPY)\n")
    print(yr_fmt.to_string())
    md += ["### Jahresrenditen (SPY)\n", "| Jahr | " + " | ".join(yr_fmt.columns) + " |", "|---|" + "---|" * len(yr_fmt.columns)]
    md += [f"| {y} | " + " | ".join(r.values) + " |" for y, r in yr_fmt.iterrows()]
    md.append("")

    # Trade-Liste
    tl = pd.DataFrame([{
        "Einstieg": t.entry_date.date(), "Ausstieg": t.exit_date.date(), "Einstiegskurs": round(t.entry_price, 2),
        "Ausstiegskurs": round(t.exit_price, 2), "Ergebnis %": round(t.pct * 100, 1), "R-Multiple": round(t.r_multiple, 2),
        "Tage": (t.exit_date - t.entry_date).days, "Grund": t.reason} for t in res.trades])
    tl.to_csv(os.path.join(RESULTS_DIR, "trades_spy_1pct.csv"), index=False)
    print(f"\nTrade-Liste gespeichert: {os.path.join(RESULTS_DIR, 'trades_spy_1pct.csv')}")
    r = tl["R-Multiple"]
    bins = [-10, -1.5, -1, -0.5, 0, 0.5, 1, 2, 3, 5, 100]
    dist = pd.cut(r, bins).value_counts().sort_index()
    print("\nVerteilung der Trade-Ergebnisse (R-Multiples):")
    print(dist.to_string())
    md += ["### Trade-Ergebnisse Trend-Trader (1 % Risiko)\n",
           f"Anzahl: {len(tl)} · Trefferquote: {(tl['Ergebnis %'] > 0).mean() * 100:.0f} % · Ø {r.mean():.2f} R je Trade · "
           f"bester Trade: {r.max():.1f} R · schlechtester: {r.min():.1f} R · Ø Haltedauer {tl['Tage'].mean():.0f} Tage\n",
           "| R-Multiple | Anzahl Trades |", "|---|---|"]
    md += [f"| {iv} | {n} |" for iv, n in dist.items()]
    md += ["", "Ausstiegsgründe: " + ", ".join(f"{k}: {v}" for k, v in tl["Grund"].value_counts().items()),
           "", "Die vollständige Liste steht in `results/trades_spy_1pct.csv`.\n"]

    # ---------- Robustheit 1: andere Märkte ----------
    rows = {}
    for sym in ["SPY", "GLD", "QQQ"]:
        path = os.path.join(DATA_DIR, f"{sym}_daily.csv")
        if not os.path.exists(path):
            continue
        d = load_daily(path)
        r1 = backtest_trend(d, Params(risk_per_trade=args.risk, cost_per_side=args.cost))
        rf = backtest_trend(d, Params(risk_per_trade=0.10, cost_per_side=args.cost))
        st0 = r1.equity.index[0]
        b = perf_stats(buy_and_hold(d, st0, 1.0), 252)
        m_eq, m_pos = _monthly_check_from_daily(d, st0, args.cost, 1.0)
        m = perf_stats(m_eq, 12)
        s1, sf, t1 = perf_stats(r1.equity, 252), perf_stats(rf.equity, 252), r1.trade_stats()
        rows[f"{sym} ({st0.year}–{r1.equity.index[-1].year})"] = {
            "Trend-Trader 1 %: CAGR / MaxDD": f"{s1['CAGR'] * 100:.1f} % / {s1['Max. Drawdown'] * 100:.0f} %",
            "Trend-Trader Vollpos.: CAGR / MaxDD / Sharpe": f"{sf['CAGR'] * 100:.1f} % / {sf['Max. Drawdown'] * 100:.0f} % / {sf['Sharpe']:.2f}",
            "Trades / Treffer / Ø R / Profitfaktor": f"{t1['Trades']} / {t1['Trefferquote'] * 100:.0f} % / {t1['Erwartungswert je Trade (R)']:.2f} / {t1['Profitfaktor']:.1f}",
            "Monats-Check: CAGR / MaxDD / Sharpe": f"{m['CAGR'] * 100:.1f} % / {m['Max. Drawdown'] * 100:.0f} % / {m['Sharpe']:.2f}",
            "Buy & Hold: CAGR / MaxDD / Sharpe": f"{b['CAGR'] * 100:.1f} % / {b['Max. Drawdown'] * 100:.0f} % / {b['Sharpe']:.2f}",
        }
    print_table("Robustheit 1 – andere Märkte (Kurse ohne Ausschüttungen)", rows)
    md += ["## Robustheit 1 – andere Märkte (gleiche Regeln, keine Anpassung)\n", to_markdown_table(rows), "\n"]

    # ---------- Robustheit 2: Parameter-Raster ----------
    grid_rows = {}
    for entry_len, exit_len, mult in itertools.product([20, 55], [10, 20, 50, 100], [2.0, 3.0]):
        pp = Params(entry_len=entry_len, exit_len=exit_len, atr_stop_mult=mult, risk_per_trade=args.risk, cost_per_side=args.cost)
        rr = backtest_trend(df, pp)
        st = perf_stats(rr.equity, 252)
        ts = rr.trade_stats()
        grid_rows[f"E{entry_len} / X{exit_len} / {mult:.0f}×ATR"] = {
            "CAGR": f"{st['CAGR'] * 100:.1f} %", "MaxDD": f"{st['Max. Drawdown'] * 100:.1f} %",
            "Sharpe": f"{st['Sharpe']:.2f}", "Trades": ts.get("Trades", 0),
            "Treffer": f"{ts.get('Trefferquote', 0) * 100:.0f} %", "Ø R": f"{ts.get('Erwartungswert je Trade (R)', 0):.2f}",
            "Profitfaktor": f"{ts.get('Profitfaktor', 0):.1f}", "Investiert": f"{ts.get('Zeit investiert', 0) * 100:.0f} %",
        }
    g = pd.DataFrame(grid_rows).T
    print("\n### Robustheit 2 – Parameter-Raster (SPY, 1 % Risiko, mit SMA200-Filter)\n")
    print(g.to_string())
    md += ["## Robustheit 2 – Parameter-Raster (SPY, 1 % Risiko, mit SMA200-Filter)\n",
           "E = Einstiegskanal (Tage), X = Ausstiegskanal (Tage), ATR-Multiplikator des Initial-Stops. "
           "Befund: je länger der Ausstiegskanal, desto besser – enge Trailing-Stops (10/20 Tage) werden auf Indizes ständig ausgestoppt.\n",
           "| Variante | " + " | ".join(g.columns) + " |", "|---|" + "---|" * len(g.columns)]
    md += [f"| {i} | " + " | ".join(str(v) for v in r.values) + " |" for i, r in g.iterrows()]
    md.append("")

    # Filter an/aus für die gewählte Variante
    rows = {}
    for label, f_on, x_on in [("mit SMA200-Filter und -Exit", True, True), ("nur SMA200-Filter (Exit nur Stops)", True, False), ("ohne SMA200", False, False)]:
        rr = backtest_trend(df, Params(use_sma_filter=f_on, use_sma_exit=x_on, risk_per_trade=0.10, cost_per_side=args.cost))
        st, ts = perf_stats(rr.equity, 252), rr.trade_stats()
        rows[label] = {"CAGR": f"{st['CAGR'] * 100:.1f} %", "MaxDD": f"{st['Max. Drawdown'] * 100:.1f} %", "Sharpe": f"{st['Sharpe']:.2f}",
                       "Trades": ts["Trades"], "Treffer": f"{ts['Trefferquote'] * 100:.0f} %", "Profitfaktor": f"{ts['Profitfaktor']:.1f}"}
    print_table("Robustheit 3 – Rolle der 200-Tage-Linie (SPY, Vollposition)", rows)
    md += ["## Robustheit 3 – Rolle der 200-Tage-Linie (SPY, Vollposition)\n", to_markdown_table(rows), "\n"]

    md.append("Allgemeine Hinweise: ETF-Kurse ohne Ausschüttungen, Kosten 0,05 % je Seite, Ausführung am nächsten Eröffnungskurs, "
              "keine Steuern, Cash unverzinst. Backtests sind Vergangenheitsbetrachtungen und keine Garantie für die Zukunft.")
    with open(os.path.join(RESULTS_DIR, "ERGEBNISSE.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(md))
    print(f"\nZusammenfassung gespeichert: {os.path.join(RESULTS_DIR, 'ERGEBNISSE.md')}")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--csv", default=os.path.join(DATA_DIR, "SPY_daily.csv"), help="Tagesdaten (date,open,high,low,close)")
    ap.add_argument("--download", metavar="TICKER", help="Daten via yfinance laden und als CSV speichern (dann verwenden)")
    ap.add_argument("--signal", action="store_true", help="nur aktuellen Signal-Status ausgeben")
    ap.add_argument("--capital", type=float, default=10_000, help="Kapital für die Positionsgrößen-Berechnung")
    ap.add_argument("--risk", type=float, default=0.01, help="Risiko je Trade (0.01 = 1 %%)")
    ap.add_argument("--cost", type=float, default=0.0005, help="Kosten je Seite (0.0005 = 0,05 %%)")
    args = ap.parse_args()

    if args.download:
        args.csv = os.path.join(DATA_DIR, f"{args.download}_daily.csv")
        download_yfinance(args.download, args.csv)

    if args.signal:
        df = load_daily(args.csv)
        signal_check(df, Params(risk_per_trade=args.risk), args.capital, symbol=os.path.basename(args.csv))
        return

    run_full_backtest(args)


if __name__ == "__main__":
    sys.exit(main())
