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
  currency. Everything that converts or weighs reads these two.
- **GitHub sync** — manual Pull/Push only. Nothing syncs automatically; see
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

A brass vault door on the same engraved plate the expense tracker uses, so the
two sit together on a home screen. It is generated, not hand-drawn — edit and
re-run to change it:

```bash
python tools/make-icons.py
```

That writes all four PNGs in `icons/`, including the maskable one, which drops
the dashed frame and shrinks the door into the safe circle because Android
supplies the outline itself. Needs Pillow.

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
