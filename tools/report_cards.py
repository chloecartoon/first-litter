#!/usr/bin/env python3
"""
Snoopy puppy growth report cards.

Reads a Snoopy backup JSON (Settings -> Export backup) and writes one
print-ready growth report card per puppy, to hand to their new pawrent.

Usage:
    python3 tools/report_cards.py                        # newest snoopy-backup-*.json
    python3 tools/report_cards.py path/to/backup.json
    python3 tools/report_cards.py backup.json --outdir reports

Output:
    reports/report-cards.html          all cards, one per printed page
    reports/card-<slug>.html           one file per puppy (easier to share)
"""

import argparse
import base64
import datetime as dt
import glob
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

# Brand palette — BRAND_AND_DESIGN_SYSTEM.md §3
PALETTE = {
    "bg": "#FBF6EC",
    "surface": "#FFFDF8",
    "ink": "#1F1B17",
    "muted": "#6E665C",
    "divider": "#EFE7D7",
    "success": "#5BA66A",
}

# Collar colour -> brand pastel, so each card is instantly identifiable
COLLAR_PASTEL = {
    "yellow": ("#FFE9A8", "Sunny Butter"),
    "orange": ("#FFCFB0", "Peach Warm"),
    "red": ("#FFD3D8", "Belly Pink"),
    "blue": ("#CFE4F5", "Sky Wash"),
    "green": ("#C8EBD0", "Mint Calm"),
    "purple": ("#E2D6F2", "Lavender Soft"),
    "pink": ("#FFD3D8", "Belly Pink"),
}
DEFAULT_PASTEL = ("#EFE7D7", "Divider")

# Developmental milestones, in days from birth. Purely biological — the health
# and care record below comes from the app's own care plan instead.
MILESTONES = [
    (3, "Umbilical stump falls off"),
    (10, "Eyes start to open"),
    (14, "Ears open, first wobbly steps"),
    (21, "Baby teeth come in, starts to play"),
    (35, "Confident on their feet, playing with littermates"),
]

# Care items, keyed to CARE_PLAN_ITEMS in app.html (~line 3538) and ordered by the
# app's schedule. Labels are deliberately plainer than the app's: the card only
# lists what's already been DONE, so vaccine-series detail would just confuse a
# new owner. The `info` items in the app are developmental notes, not care tasks.
CARE_PLAN = [
    ("checkup", "First vet check-up"),
    ("wean", "Started weaning (gruel)"),
    ("deworm1", "Deworming #1 (Valley Pets)"),
    ("nailtrim1", "Nail trim #1"),
    ("deworm2", "Deworming #2"),
    ("firstbath", "First bath"),
    ("vacc1", "1st vaccine"),
    ("vacc2", "2nd vaccine"),
    ("microchip", "Microchip"),
]


def parse_date(s):
    return dt.date.fromisoformat(s)


def slugify(s):
    s = re.sub(r"[^\w\s-]", "", s).strip().lower()
    return re.sub(r"[\s_-]+", "-", s) or "puppy"


def esc(s):
    return (
        str(s)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def infer_sex(pup):
    """The app writes sex as '♀ F' / '♂ M', or leaves it '?'. Older records only
    carried it in the name ('Pup 1 - girl')."""
    raw = (pup.get("sex") or "").strip()
    if "♂" in raw or "♀" in raw:
        return "Boy" if "♂" in raw else "Girl"
    token = raw.lower().strip("? ")
    if token in ("m", "male", "boy"):
        return "Boy"
    if token in ("f", "female", "girl"):
        return "Girl"
    name = (pup.get("name") or "").lower()
    if "boy" in name:
        return "Boy"
    if "girl" in name:
        return "Girl"
    return None


def care_done(pup, key):
    """Mirrors careIsDone() in app.html: absent = not done, True = done without a
    date (legacy), 'YYYY-MM-DD' = done on that date."""
    v = (pup.get("care") or {}).get(key)
    return v is True or isinstance(v, str)


def care_date(pup, key):
    v = (pup.get("care") or {}).get(key)
    return parse_date(v) if isinstance(v, str) else None


def display_name(pup):
    """Strip the '- girl'/'- boy' suffix the app appends to placeholder names."""
    name = (pup.get("name") or "Puppy").strip()
    return re.sub(r"\s*[-–]\s*(girl|boy)\s*$", "", name, flags=re.I).strip() or name


def clean_weights(pup):
    """Sorted, de-duplicated (last value wins per date) weight series."""
    by_date = {}
    for w in pup.get("weights") or []:
        try:
            d = parse_date(w["date"])
            g = float(w["g"])
        except (KeyError, TypeError, ValueError):
            continue
        by_date[d] = g
    return sorted(by_date.items())


def growth_stats(pup):
    ws = clean_weights(pup)
    if not ws:
        return None
    first_d, first_g = ws[0]
    last_d, last_g = ws[-1]
    span_days = (last_d - first_d).days
    gain = last_g - first_g
    stats = {
        "series": ws,
        "birth_date": parse_date(pup["birthDate"]) if pup.get("birthDate") else first_d,
        "first_date": first_d,
        "last_date": last_d,
        "birth_g": first_g,
        "current_g": last_g,
        "gain_g": gain,
        "pct_gain": (gain / first_g * 100) if first_g else 0.0,
        "span_days": span_days,
        "avg_per_day": (gain / span_days) if span_days else 0.0,
        "n_weigh_ins": len(ws),
    }
    # Change between consecutive weigh-ins: the ACTUAL grams gained, plus how many
    # days that covers. Weigh-ins aren't always daily, so the two must travel
    # together — dividing by the gap and calling the result "change" understates
    # every gain that spans more than one day.
    deltas = []
    for (d0, g0), (d1, g1) in zip(ws, ws[1:]):
        days = max((d1 - d0).days, 1)
        deltas.append({"date": d1, "change": g1 - g0, "days": days})
    stats["deltas"] = deltas
    # Biggest gain between two weigh-ins, by actual grams.
    stats["best_gain"] = max(deltas, key=lambda x: x["change"]) if deltas else None
    return stats


def age_label(days):
    if days < 0:
        return "—"
    if days < 14:
        return f"{days} day{'s' if days != 1 else ''}"
    weeks, rem = divmod(days, 7)
    if rem == 0:
        return f"{weeks} weeks"
    return f"{weeks} weeks, {rem} day{'s' if rem != 1 else ''}"


def photo_src(pup):
    """First photo as a data: URI. Already base64 in the backup."""
    for p in pup.get("photos") or []:
        if isinstance(p, dict) and p.get("src"):
            return p["src"], p.get("date")
    return None, None


def sparkline(series, colour, w=520, h=150):
    """Weight-over-time area chart. Plain SVG, no dependencies."""
    if len(series) < 2:
        return ""
    gs = [g for _, g in series]
    lo, hi = min(gs), max(gs)
    pad = max((hi - lo) * 0.15, 5)
    lo, hi = lo - pad, hi + pad
    n = len(series)
    pl, pr, pt, pb = 8, 8, 10, 22

    def x(i):
        return pl + i * (w - pl - pr) / (n - 1)

    def y(g):
        return pt + (hi - g) * (h - pt - pb) / (hi - lo)

    pts = [(x(i), y(g)) for i, (_, g) in enumerate(series)]
    line = " ".join(f"{'M' if i == 0 else 'L'}{px:.1f},{py:.1f}" for i, (px, py) in enumerate(pts))
    area = line + f" L{pts[-1][0]:.1f},{h - pb:.1f} L{pts[0][0]:.1f},{h - pb:.1f} Z"

    dots = "".join(
        f'<circle cx="{px:.1f}" cy="{py:.1f}" r="3.5" fill="{PALETTE["surface"]}" '
        f'stroke="{PALETTE["ink"]}" stroke-width="1.8"/>'
        for px, py in pts
    )
    # Label first and last only — keeps a small chart readable
    labels = (
        f'<text x="{pts[0][0]:.1f}" y="{h - 6}" class="ax" text-anchor="start">'
        f'{series[0][0].strftime("%-d %b")}</text>'
        f'<text x="{pts[-1][0]:.1f}" y="{h - 6}" class="ax" text-anchor="end">'
        f'{series[-1][0].strftime("%-d %b")}</text>'
    )
    return f"""<svg class="chart" viewBox="0 0 {w} {h}" role="img"
  aria-label="Weight from {series[0][1]:.0f}g to {series[-1][1]:.0f}g">
  <path d="{area}" fill="{colour}" opacity="0.55"/>
  <path d="{line}" fill="none" stroke="{PALETTE['ink']}" stroke-width="2.2"
    stroke-linejoin="round" stroke-linecap="round"/>
  {dots}{labels}
</svg>"""


def weight_table(series, deltas):
    """Change column = actual grams gained since the previous weigh-in. When that
    spans more than a day the gap is spelled out, so the number can't be misread
    as a per-day figure."""
    by_date = {x["date"]: x for x in deltas}
    rows = []
    for i, (d, g) in enumerate(series):
        if i == 0:
            change = '<span class="mut">birth</span>'
        else:
            x = by_date.get(d)
            dv = x["change"] if x else 0
            sign = "+" if dv >= 0 else "−"
            cls = "up" if dv >= 0 else "dn"
            change = f'<span class="{cls}">{sign}{abs(dv):.0f} g</span>'
            if x and x["days"] > 1:
                change += f'<span class="gap">over {x["days"]} days</span>'
        rows.append(
            f'<tr><td>{d.strftime("%-d %b")}</td>'
            f'<td class="num">{g:.0f} g</td><td class="num">{change}</td></tr>'
        )
    return (
        '<table class="wt"><thead><tr><th>Date</th><th class="num">Weight</th>'
        '<th class="num">Change</th></tr></thead><tbody>'
        + "".join(rows)
        + "</tbody></table>"
    )


def milestone_list(birth_date, as_of):
    age = (as_of - birth_date).days
    out = []
    for day, text in MILESTONES:
        done = age >= day
        date = birth_date + dt.timedelta(days=day)
        mark = "✓" if done else "○"
        cls = "done" if done else "todo"
        out.append(
            f'<li class="{cls}"><span class="mk">{mark}</span>'
            f'<span class="ms-t">{esc(text)}</span>'
            f'<span class="ms-d">day {day} · {date.strftime("%-d %b")}</span></li>'
        )
    return '<ul class="ms">' + "".join(out) + "</ul>"


def weights_by_age(pup):
    """Age in days from birth -> weight. Lets us compare littermates fairly even
    when they were last weighed on different dates."""
    st = growth_stats(pup)
    if not st:
        return {}
    birth = st["birth_date"]
    return {(d - birth).days: g for d, g in st["series"]}


def litter_context(pup, litter):
    """Compare this puppy to their littermates at the most recent age where EVERY
    puppy has a weight recorded. Comparing latest-recorded weights instead would
    silently compare different dates — some pups get weighed more often than
    others — and produce a misleading result on a document a new owner reads.
    Returns a sentence, or '' when there's no fair comparison to make."""
    if len(litter) < 2:
        return ""
    curves = [weights_by_age(p) for p in litter]
    mine = weights_by_age(pup)
    if not mine:
        return ""
    common = set(mine)
    for c in curves:
        if not c:
            return ""
        common &= set(c)
    if not common:
        return ""
    age = max(common)
    vals = sorted(c[age] for c in curves)
    my_w = mine[age]
    rank = vals.index(my_w) + 1
    n = len(vals)
    avg = sum(vals) / n

    at = f"At {age_label(age)} old"
    if rank == n:
        return f"{at} they were the biggest of the {n} — {my_w:.0f} g."
    if rank == 1:
        return (
            f"{at} they were the smallest of the {n} at {my_w:.0f} g "
            f"(litter average {avg:.0f} g), and gaining steadily."
        )
    return (
        f"{at} they were {my_w:.0f} g, right in the middle of the litter "
        f"(average {avg:.0f} g)."
    )


def care_record(pup):
    """What's already been done, and when. Deliberately does NOT list what's still
    due: the remaining schedule depends on the new owner's own vet, and guessing
    dates on their behalf caused more confusion than it solved."""
    done = []
    for key, label in CARE_PLAN:
        if not care_done(pup, key):
            continue
        d = care_date(pup, key)
        when = d.strftime("%-d %b %Y") if d else "date not recorded"
        done.append(
            f'<tr><td class="ck">✓</td><td>{esc(label)}</td>'
            f'<td class="num">{when}</td></tr>'
        )
    if not done:
        return ""
    return (
        '<div class="block"><h3>Health &amp; care record</h3>'
        '<table class="wt care"><tbody>' + "".join(done) + "</tbody></table></div>"
    )


def card_html(pup, idx, litter, settings, as_of):
    st = growth_stats(pup)
    name = display_name(pup)
    sex = infer_sex(pup)
    collar = (pup.get("collar") or "").lower()
    pastel, pastel_name = COLLAR_PASTEL.get(collar, DEFAULT_PASTEL)
    src, pdate = photo_src(pup)

    birth = st["birth_date"] if st else (
        parse_date(pup["birthDate"]) if pup.get("birthDate") else as_of
    )
    age_days = (as_of - birth).days

    litter_note = litter_context(pup, litter)

    meta = [("Born", f'{birth.strftime("%-d %B %Y")} at {esc(pup.get("time") or "—")}')]
    if sex:
        meta.append(("Sex", sex))
    if collar:
        meta.append(("Collar", f'{collar.title()} <span class="sw" style="background:{pastel}"></span>'))
    meta.append(("Birth order", f"{idx + 1} of {len(litter)}"))
    meta.append(("Age today", age_label(age_days)))
    meta_html = "".join(
        f'<div class="mrow"><dt>{k}</dt><dd>{v}</dd></div>' for k, v in meta
    )

    if st:
        stat_tiles = f"""
      <div class="tiles">
        <div class="tile"><div class="tn">{st['birth_g']:.0f}<span class="tu">g</span></div>
          <div class="tl">Birth weight</div></div>
        <div class="tile hero"><div class="tn">{st['current_g']:.0f}<span class="tu">g</span></div>
          <div class="tl">Latest · {st['last_date'].strftime('%-d %b')}</div></div>
        <div class="tile"><div class="tn">+{st['gain_g']:.0f}<span class="tu">g</span></div>
          <div class="tl">Total gained</div></div>
        <div class="tile"><div class="tn">{st['pct_gain']:.0f}<span class="tu">%</span></div>
          <div class="tl">Above birth weight</div></div>
      </div>"""
        growth_note = (
            f"Gained an average of <strong>{st['avg_per_day']:.1f} g a day</strong> across "
            f"{st['span_days']} day{'s' if st['span_days'] != 1 else ''} "
            f"and {st['n_weigh_ins']} weigh-in{'s' if st['n_weigh_ins'] != 1 else ''}."
        )
        if st["best_gain"]:
            b = st["best_gain"]
            if b["days"] == 1:
                growth_note += (
                    f" Biggest single-day jump was <strong>+{b['change']:.0f} g</strong>, "
                    f"on {b['date'].strftime('%-d %B')}."
                )
            else:
                growth_note += (
                    f" Biggest jump was <strong>+{b['change']:.0f} g</strong> in the "
                    f"{b['days']} days to {b['date'].strftime('%-d %B')}."
                )
        if litter_note:
            growth_note += " " + litter_note
        chart = sparkline(st["series"], pastel)
        table = weight_table(st["series"], st["deltas"])
    else:
        stat_tiles = ""
        growth_note = "No weigh-ins recorded yet."
        chart = ""
        table = ""

    photo_html = (
        f'<div class="photo"><img src="{src}" alt="{esc(name)}">'
        + (f'<span class="pcap">{parse_date(pdate).strftime("%-d %b")}</span>' if pdate else "")
        + "</div>"
        if src
        else '<div class="photo empty"><span>🐾</span></div>'
    )

    notes = (pup.get("notes") or "").strip()
    notes_html = (
        f'<div class="block"><h3>Little things to know</h3>'
        f'<p class="note">{esc(notes)}</p></div>'
        if notes
        else ""
    )

    care_html = care_record(pup)

    vet = settings.get("vetName")
    food = settings.get("foodBrand")
    hand = []
    if food:
        hand.append(f"Currently eating <strong>{esc(food)}</strong>")
    if vet:
        phone = settings.get("vetPhone")
        hand.append(f"Vet on record: <strong>{esc(vet)}</strong>" + (f" · {esc(phone)}" if phone else ""))
    handover = (
        '<div class="block"><h3>For the handover</h3><ul class="plain">'
        + "".join(f"<li>{h}</li>" for h in hand)
        + "</ul></div>"
        if hand
        else ""
    )

    return f"""
<article class="card" style="--pastel:{pastel}">
  <header class="head">
    {photo_html}
    <div class="id">
      <p class="eyebrow">Puppy growth report card</p>
      <h1 class="name">{esc(name)}</h1>
      <dl class="meta">{meta_html}</dl>
    </div>
  </header>

  {stat_tiles}

  <div class="block">
    <h3>How they've grown</h3>
    {chart}
    <p class="note">{growth_note}</p>
  </div>

  <div class="cols">
    <div class="block">
      <h3>Every weigh-in</h3>
      {table}
    </div>
    <div class="block">
      <h3>Milestones</h3>
      {milestone_list(birth, as_of)}
    </div>
  </div>

  {care_html}
  {notes_html}
  {handover}

  <footer class="foot">
    <span>Raised with a lot of love by Snoopy 🖤</span>
    <span>Report generated {as_of.strftime('%-d %B %Y')}</span>
  </footer>
</article>"""


CSS = """
:root{
  --bg:#FBF6EC; --surface:#FFFDF8; --ink:#1F1B17; --muted:#6E665C;
  --divider:#EFE7D7; --success:#5BA66A; --warning:#E0A23A; --alert:#D86A5A;
  --pastel:#EFE7D7;
}
*{box-sizing:border-box}
body{
  margin:0; padding:28px 16px; background:var(--bg); color:var(--ink);
  font-family:'Poppins','Avenir Next','Helvetica Neue',system-ui,sans-serif;
  font-size:15px; line-height:1.5; -webkit-font-smoothing:antialiased;
}
.wrap{max-width:820px;margin:0 auto;display:flex;flex-direction:column;gap:28px}
.card{
  background:var(--surface); border:1px solid var(--divider);
  border-radius:22px; padding:30px 32px 22px;
  box-shadow:0 1px 0 rgba(31,27,23,.04), 0 12px 32px -20px rgba(31,27,23,.28);
  position:relative; overflow:hidden;
}
.card::before{
  content:""; position:absolute; inset:0 0 auto 0; height:9px; background:var(--pastel);
}

/* header */
.head{display:flex;gap:22px;align-items:flex-start;margin-bottom:24px}
.photo{
  flex:0 0 132px; width:132px; height:132px; border-radius:50%;
  background:var(--surface); border:5px solid var(--pastel);
  overflow:hidden; position:relative; display:grid; place-items:center;
}
.photo img{width:100%;height:100%;object-fit:cover;display:block}
.photo.empty span{font-size:44px;opacity:.35}
.pcap{
  position:absolute; bottom:0; left:0; right:0; text-align:center;
  background:rgba(31,27,23,.62); color:#fff; font-size:10px;
  letter-spacing:.4px; padding:2px 0;
}
.id{flex:1;min-width:0}
.eyebrow{
  margin:2px 0 4px; font-size:11px; font-weight:600; letter-spacing:1.2px;
  text-transform:uppercase; color:var(--muted);
}
.name{
  margin:0 0 14px; font-family:'Caveat','Bradley Hand',cursive;
  font-size:46px; font-weight:700; line-height:1;
}
.meta{margin:0;display:grid;grid-template-columns:1fr 1fr;gap:5px 20px}
.mrow{display:flex;gap:8px;font-size:13px;align-items:baseline}
.mrow dt{color:var(--muted);flex:0 0 82px}
.mrow dd{margin:0;font-weight:600}
.sw{
  display:inline-block;width:9px;height:9px;border-radius:50%;
  border:1px solid rgba(31,27,23,.25);vertical-align:middle;margin-left:2px;
}

/* stat tiles */
.tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:24px}
.tile{
  background:var(--bg); border:1px solid var(--divider); border-radius:14px;
  padding:14px 12px; text-align:center;
}
.tile.hero{background:var(--pastel);border-color:transparent}
.tn{font-size:29px;font-weight:700;line-height:1.05;letter-spacing:-.5px}
.tu{font-size:14px;font-weight:600;margin-left:2px}
.tl{font-size:10.5px;color:var(--muted);margin-top:3px;letter-spacing:.3px}
.tile.hero .tl{color:rgba(31,27,23,.7)}

/* blocks */
.block{margin-bottom:22px}
.block h3{
  margin:0 0 11px; font-size:12px; font-weight:600; letter-spacing:1px;
  text-transform:uppercase; color:var(--muted);
  padding-bottom:7px; border-bottom:1px solid var(--divider);
}
.note{margin:11px 0 0;font-size:13.5px;color:#453f38}
.cols{display:grid;grid-template-columns:1fr 1.15fr;gap:26px}

/* chart */
.chart{width:100%;height:auto;display:block}
.chart .ax{font-size:10px;fill:var(--muted);font-family:inherit}

/* weight table */
.wt{width:100%;border-collapse:collapse;font-size:13px}
.wt th{
  text-align:left;font-size:10px;letter-spacing:.6px;text-transform:uppercase;
  color:var(--muted);font-weight:600;padding:0 0 6px;
}
.wt td{padding:5px 0;border-top:1px solid var(--divider)}
.wt .num{text-align:right;font-variant-numeric:tabular-nums}
.wt tbody tr:last-child td{font-weight:700}
.up{color:var(--success);font-weight:600}
.dn{color:var(--alert);font-weight:600}
.mut{color:var(--muted)}
.gap{display:block;font-size:9.5px;color:var(--muted);font-weight:400;line-height:1.3}

/* care record */
.wt.care td{font-size:12.5px}
.wt.care tbody:first-child tr:last-child td{font-weight:400}
.wt.care .ck{width:18px;color:var(--success);font-weight:700}
.wt.care .num{font-size:11.5px;color:var(--muted);white-space:nowrap}

/* milestones */
.ms{list-style:none;margin:0;padding:0;font-size:13px}
.ms li{display:flex;align-items:baseline;gap:8px;padding:4.5px 0}
.ms .mk{flex:0 0 14px;font-size:12px}
.ms li.done .mk{color:var(--success)}
.ms li.todo{color:var(--muted)}
.ms li.todo .mk{color:var(--divider)}
.ms-t{flex:1}
.ms-d{font-size:10.5px;color:var(--muted);white-space:nowrap}

.chips{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:7px}
.chips li{
  background:var(--pastel);border-radius:999px;padding:5px 13px;
  font-size:12px;font-weight:600;
}
.plain{margin:0;padding-left:17px;font-size:13.5px}
.plain li{margin-bottom:3px}

.foot{
  display:flex;justify-content:space-between;align-items:center;gap:12px;
  border-top:1px solid var(--divider); margin-top:4px; padding-top:13px;
  font-size:11px;color:var(--muted);
}

@media (max-width:640px){
  body{padding:14px 10px}
  .card{padding:22px 18px 16px;border-radius:18px}
  .head{flex-direction:column;align-items:center;text-align:center}
  .meta{grid-template-columns:1fr;justify-items:start;text-align:left}
  .tiles{grid-template-columns:repeat(2,1fr)}
  .cols{grid-template-columns:1fr;gap:0}
  .name{font-size:38px}
  .foot{flex-direction:column;align-items:flex-start;gap:3px}
}

@media print{
  @page{size:A4 portrait;margin:11mm}
  body{background:#fff;padding:0}
  .wrap{gap:0;max-width:none}
  .card{
    break-after:page; page-break-after:always;
    box-shadow:none; border-radius:0; border:none;
    /* The pastel bar becomes a real border here. On screen it's an absolutely
       positioned ::before, which the page box clips and which overlaps the
       header once print padding is reduced. */
    border-top:9px solid var(--pastel);
    padding:20px 0 10mm; overflow:visible;
  }
  .card:last-child{break-after:auto;page-break-after:auto}
  .card::before{display:none}
  .block,.tiles{break-inside:avoid;page-break-inside:avoid}
  .head{break-inside:avoid;page-break-inside:avoid}
  .photo{border-width:4px}

  /* The weigh-in table runs to ~30 rows. Kept in a grid column with
     break-inside:avoid it can't fit the remainder of page 1, so the whole block
     jumps to page 2 and leaves half a page blank. Let it flow instead: single
     column, breakable, with the header repeated on each new page and individual
     rows kept whole. */
  .cols{display:block}
  .cols .block{break-inside:auto;page-break-inside:auto}
  .wt thead{display:table-header-group}
  .wt tr{break-inside:avoid;page-break-inside:avoid}
  .ms li{break-inside:avoid;page-break-inside:avoid}
}
"""


# Where to find Caveat-Bold.ttf. Set CAVEAT_TTF in the environment to point
# somewhere else; otherwise these are tried in order. If none exist the card
# still renders, just with a fallback face.
CAVEAT_TTF_CANDIDATES = [
    os.environ.get("CAVEAT_TTF"),
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "fonts", "Caveat-Bold.ttf"),
    os.path.expanduser("~/Library/Fonts/Caveat-Bold.ttf"),
    "/Library/Fonts/Caveat-Bold.ttf",
    os.path.expanduser("~/.local/share/fonts/Caveat-Bold.ttf"),
]


def font_face_css():
    """Embed Caveat, the display face the brand system specifies for puppy names.
    It isn't installed system-wide, so without this the name silently falls back
    to Bradley Hand. Embedded (not linked) so a card stays correct when it's
    emailed to a new owner. Poppins is left to the system copy — where it's
    installed, Chrome embeds it into the PDF anyway."""
    path = next((p for p in CAVEAT_TTF_CANDIDATES if p and os.path.exists(p)), None)
    if not path:
        return ""  # falls back to the rest of the stack
    try:
        with open(path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("ascii")
    except OSError:
        return ""
    return (
        "@font-face{font-family:'Caveat';font-style:normal;font-weight:700;"
        f"src:url(data:font/ttf;base64,{b64}) format('truetype');font-display:block}}"
    )


def page(title, body):
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)}</title>
<style>{font_face_css()}{CSS}</style>
</head>
<body><div class="wrap">{body}</div></body>
</html>"""


def main():
    ap = argparse.ArgumentParser(description="Build puppy growth report cards from a Snoopy backup.")
    ap.add_argument("input", nargs="?", help="Snoopy backup JSON (default: newest in project root)")
    ap.add_argument("--outdir", default=os.path.join(ROOT, "reports"))
    ap.add_argument("--as-of", help="Date to treat as today, YYYY-MM-DD (default: actual today)")
    args = ap.parse_args()

    path = args.input
    if not path:
        candidates = glob.glob(os.path.join(ROOT, "snoopy-backup-*.json"))
        if not candidates:
            sys.exit("No snoopy-backup-*.json found. Export one from the app: Settings -> Export backup.")
        # Newest by date in the filename; prefer the rename_puppies.py output for
        # that date, since '-named.json' sorts *before* '.json' alphabetically.
        def rank(p):
            base = os.path.basename(p)
            return (base.replace("-named.json", ".json"), "-named.json" in base)
        path = sorted(candidates, key=rank)[-1]

    with open(path) as f:
        data = json.load(f)

    puppies = data.get("puppies") or []
    if not puppies:
        sys.exit(f"No puppies found in {path}")
    settings = data.get("settings") or {}

    # The report date is genuinely today: a puppy's age doesn't pause because she
    # skipped a weigh-in, and "Age today" has to mean today. Weight figures stay
    # tied to their own dates ("Latest · 2 Aug") and stale ones are flagged below.
    as_of = parse_date(args.as_of) if args.as_of else dt.date.today()

    os.makedirs(args.outdir, exist_ok=True)

    cards = []
    for i, pup in enumerate(puppies):
        html = card_html(pup, i, puppies, settings, as_of)
        cards.append(html)
        slug = slugify(display_name(pup))
        out = os.path.join(args.outdir, f"card-{slug}.html")
        with open(out, "w") as f:
            f.write(page(f"{display_name(pup)} — Growth Report Card", html))
        print(f"  {os.path.relpath(out, ROOT)}")

    # Flag pups whose latest weigh-in lags the report date, so a card never
    # quietly presents a two-week-old weight as current.
    stale = []
    for pup in puppies:
        s = growth_stats(pup)
        if s and (as_of - s["last_date"]).days > 7:
            stale.append((display_name(pup), s["last_date"], (as_of - s["last_date"]).days))
    if stale:
        print("\n! Not weighed recently — card shows their last recorded weight:")
        for nm, d, days in stale:
            print(f"    {nm}: last weighed {d.strftime('%-d %b')} ({days} days before {as_of.strftime('%-d %b')})")

    combined = os.path.join(args.outdir, "report-cards.html")
    with open(combined, "w") as f:
        f.write(page("Puppy Growth Report Cards", "".join(cards)))
    print(f"  {os.path.relpath(combined, ROOT)}  ({len(cards)} cards, one per printed page)")
    print(f"\nSource: {os.path.relpath(path, ROOT)} · data through {as_of.isoformat()}")


if __name__ == "__main__":
    main()
