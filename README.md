# Asset & Liability Manager

Offline-first net worth tracker: assets, liabilities, goals and investments,
with an optional GitHub backup. A single-file PWA (`index.html`), same
architecture as [expense-tracker](../expense-tracker) — no build step, no
server, no dependencies.

The design is deliberately the expense tracker's: the same tokens, shell,
top bar, sheets, tiles, chips and tab bar, so the two apps read as one
family rather than two apps by the same person.

## Structure

- **Dashboard** — net worth, assets against liabilities, a tappable donut of
  where the money sits, category bars that open for their share, and the list
  of individual assets/liabilities (added and edited from here, via +).
- **Goal** — savings goals with a target, what is saved so far, and a date.
- **Investment** — SIP/mutual funds, stocks, fixed deposits, PPF/EPF, bonds
  and physical gold: what went in against what it is worth, per holding and
  in total.
- **More** — Settings, Reports, What's new, About.

### Two currencies

Every entry keeps the currency it was entered in — euro for what is held in
Germany, rupees for what is held in India. Only totals convert, using the
rate under Settings → Rates & gold, and the top bar switches which currency
those totals are shown in. A row whose currency differs from the one on
display is tagged, and shows its converted figure underneath.

### Physical gold

Gold is held by weight, so it is entered that way: grams, purity, a
description, and optionally what was paid. Its worth is never a number you
keep updating by hand — it is `grams × price per gram` in the entry's own
currency, from Settings → Rates & gold, worked out fresh every time it is
read (`investWorth()`). The Investment tab totals the grams across every
gold holding and what they come to at today's price.

### SIPs coming due

An investment can carry the day of the month its SIP goes out. On or after
that day the dashboard says so, and the banner opens onto the list with a
tick against each. Ticking one records the *month* it went out, so it stays
quiet for the rest of that month and comes back on its day in the next. A
SIP set for the 31st falls on the 28th, 29th or 30th where the month is
shorter.

**It cannot reach a phone with the app shut.** A notification arriving on the
day needs a server pushing it, and this is a page with no server behind it —
the browser API for scheduling one locally was abandoned. So the app says it
when you open it, which is the honest version of the same thing.

### Importing holdings

Settings → Import holdings takes a holdings export from Zerodha Console —
stocks, ETFs and funds in one file. It is read in the browser with
`FileReader` and goes nowhere.

Columns are found **by their heading**, not their position, so an export that
gains a column does not silently shift every figure one to the left. The CSV
reader handles quoted fields, because a fund named `Kotak, Equity` would
otherwise arrive as two columns and do the same. An all-capitals ticker is
taken for a stock or ETF and anything with ordinary words for a fund — a
guess, changeable afterwards like any other.

Nothing is written until you say so: every row is listed with a tick, marked
**new** or **update**, with *tick all*, *tick none* and *only the new*.
Updating a holding writes only what the file knows — what it cost and what it
is worth — and leaves the SIP, the day it goes out and your notes alone.

Connecting to Zerodha directly is not possible from here: signing the login
needs an API secret, and there is nowhere in a page that anyone can view-source
to keep one.

### Sectors and mandates

Stocks carry a **sector**, funds a **mandate** — two lists rather than one,
because "Large cap" is not a sector and "Banking" is not a mandate. The field
appears on a holding only where it means something, so a fixed deposit is
never asked for one.

Reports → In depth breaks each kind down by it: a pie, a bar per group with
its share and its gain, and a line naming the largest group and the largest
single holding. Holdings nobody has classified stay in the chart as their own
grey wedge — dropping them would inflate every other share, and the size of
what is unknown is worth seeing.

Tagging happens on that screen, where the gap is visible: a dropdown per
untagged holding, and a button that reads the sector out of the name where the
name actually says it. That last part is deliberately literal. An Indian fund
states its mandate in its own title (*Nifty 50 Index*, *Flexi Cap*) and some
companies state their trade, so those are read; a Zerodha export names stocks
by ticker, and `RELIANCE` or `TCS` says nothing a rule could read. There is no
ticker-to-sector table here on purpose — one would have to be kept correct
forever, and a sector guessed wrong silently moves every share above it, while
a blank one only says that nobody has said yet.

### App lock

A four-digit PIN, asked for when the app opens and again after five minutes
away — an installed app is usually resumed from memory rather than reloaded,
so locking at boot alone would only ever fire once. The class that hides the
app is set by a small script in `<head>`, because the app's own script runs
at the foot of the document and a lock applied there would come one frame of
readable figures too late.

Only hashes are stored: the PIN and the recovery answer are salted and run
through SHA-256. The recovery answer is matched with case and spacing taken
out. Deleting everything asks for the PIN, and the recovery question is
hidden during that ask — otherwise the question could authorise a wipe.

**It is a lock, not a safe.** What is stored on the device stays plain, and
anyone who opens the browser's own tools can read it. It is there for whoever
picks up your phone, not for someone taking the device apart. The app says so
where it is switched on.

### Settings

- **Profile** — your name, and the currency new entries start in.
- **Rates & gold** — rupees per euro, and the gold price per gram in each
  currency. Everything that converts or weighs reads these two. They are
  asked for from the internet once when the app opens (`open.er-api.com` for
  the rate, `api.gold-api.com` for spot gold — no key, no account), and you
  say which karat the single gold price stands for, since spot is 24K and
  most jewellery is not. A figure that does not parse or arrives absurd is
  dropped and what you had stays: a rate sits under every converted total in
  the app, and a wrong one is worse than a stale one. Offline changes
  nothing. Switch it off and both figures are yours to set.
- **GitHub sync** — manual Pull/Push only, with a **Check it** button that
  asks GitHub what the token may actually do rather than making you find out
  by pushing. The repository is public, so a token with no rights to it still
  *reads* fine — which looks like success right up until the first write. The
  check reads the `permissions.push` flag and says so.

  A **fine-grained** token needs the repository picked under *Repository
  access* and *Contents* set to **Read and write**. A **classic** token needs
  the **repo** scope. Nothing syncs automatically; see
  the pitfall this avoids in the project notes. Needs a personal access token
  with Contents read/write on the target repo, entered in-app (stored in
  `localStorage` on this device only).
- **Backup & restore** — copies the whole state as JSON to the clipboard, or
  restores from pasted JSON. Same JSON shape as the GitHub backup file.
- **Calculator** — SIP future-value calculator and a Loan/EMI calculator.

## Running locally

```bash
python -m http.server 4174
```

Then open `http://localhost:4174`. Or use the `.claude/launch.json`
configuration with the `run` skill / Claude's browser preview.

## Chart colour

The expense tracker's system, kept to the letter: `hsl(h 82% L)` with `L`
inside a 22–42 band, and colours placed so no two are near each other in
**OkLab**, which is what the eye actually separates — hue degrees lie, since
10° apart in the greens is invisible where the same 10° in the reds is
obvious.

What is borrowed is the *drawing*, not the subject. Nothing here goes in or
out: there is no income and no spending, only things held and what they are
worth, so the tracker's money-in/money-out pair has no meaning in this app
and is not carried over. A figure that is not a category takes a plain token
(`--pos`, `--pos-block`, `--neg`, `--warn`, `--accent`) — `--pos-block` being
the deeper one for a solid block, since a block of colour reads lighter than
a thin bar or a word does.

The palettes in `index.html` (`BUCKETS`, `LIAB_CATS`) were solved against
that metric and are checked by:

```bash
node tools/check-palette.mjs '<owned palette JSON>' '<owed palette JSON>'
```

It fails on any pair under 14 apart, the tracker's own threshold. Run it
after changing a hue or adding a category. A hue that carries meaning barely
moves (gold is gold); the neutral ones absorb the separation; and red is left
for what you owe, so nothing you own strays into it.

Note the chart groups by *bucket*, not by the label on the entry sheet: gold
held as jewellery and gold held as an investment are one wedge, and so is a
fixed deposit whichever list it came from. They are the same holding, and two
wedges of it would only have to be told apart by a colour that says nothing.

## The icon

A rising bar chart with the euro and the rupee in gold over it, no frame. The
bar colours come from the app's own chart palette, so the icon and the charts
are one system. It is generated, not hand-drawn — edit and re-run to change it:

```bash
python tools/make-icons.py
```

That writes all four PNGs in `icons/`, including the maskable one, which
shrinks the mark into the safe circle and bleeds the ground behind it because
Android supplies the outline itself. Needs Pillow. The brass vault this
replaced is in the history if it is ever wanted back.

## Releasing

Same tooling as expense-tracker:

```bash
node tools/bump-version.mjs --note "What changed in one line"
```

One bump per branch/PR — see `tools/bump-version.mjs` for the version-bump
rules and `tools/pre-commit` (install with `sh tools/install-hooks.sh`) for
the guard that enforces it.

## Data model

Everything funnels through `stateFromPayload()` / `stateCleared()` in
`index.html` — the single points that construct app state from a raw
payload (freshly loaded, pulled from GitHub, or pasted in). Every field is
read back through here on purpose: it's the fix for a bug class where a
field silently drops because one of several copies of the same object
literal forgot about it. Never reconstruct state ad hoc elsewhere.

Figures work the same way. `conv()`/`toDisp()` are the only conversion
between currencies, and `investWorth()` the only answer to what a holding is
worth — gold included. Everything that totals, charts or lists calls those,
so two figures on the same screen cannot disagree about the same thing. When
adding a total, check it the arithmetic way: the buckets must sum to the
total they are drawn from.
