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
- **Investment** — mutual funds, Indian and European shares, cash and debt:
  what went in against what it is worth, per holding and in total. Six tabs —
  All, MFs, IN, EU, Cash, Debt — which fit across a phone only because the
  labels are short; each carries an `aria-label` with the full name, since
  "IN" read aloud on its own is not a word. The bar still scrolls if a very
  narrow screen or a large text setting pushes them over, rather than
  clipping a label.
- **More** — Settings, Reports, What's new, About.

### Two currencies

Every entry keeps the currency it was entered in — euro for what is held in
Germany, rupees for what is held in India. Only totals convert, using the
rate under Settings → Rates & gold, and the top bar switches which currency
those totals are shown in. A row whose currency differs from the one on
display is tagged, and shows its converted figure underneath.

### Physical gold

Gold is held by weight, so it is entered that way: grams, the month it was
bought, a description, and optionally what was paid. No purity field — the
karat that decides worth is the single one in Settings, and per-entry purity
never fed the calculation anyway. No kind chips either: you reach this sheet
from the Gold tab, so the answer is already known. The month is stored as
`YYYY-MM`; entries made when this was a full date are trimmed on the way in,
so an old one still shows rather than arriving empty. Its worth is never a number you
keep updating by hand — it is `grams × price per gram` in the entry's own
currency, from Settings → Rates & gold, worked out fresh every time it is
read (`investWorth()`). The Investment tab totals the grams across every
gold holding and what they come to at today's price.

### Payments coming due

An investment can carry an instalment: an amount, the day of the month it
goes out, and how often — **monthly, quarterly, half-yearly or yearly**. On
or after that day the dashboard says so, and the banner opens onto the list
with a tick against each. Ticking one records the *month* it went out, so it
stays quiet for the rest of that month and comes back when its turn is next.
An instalment set for the 31st falls on the 28th, 29th or 30th where the
month is shorter.

Anything but monthly is anchored to a month, and comes round only on months a
whole number of steps away from it — an August premium is due each August and
silent for the other eleven. The modulo is written the long way in
`fallsThisMonth()` because a plain `%` goes negative for months before the
anchor. Records written before frequency existed read as monthly, which is
what they were.

The banner says *payment*, not *SIP*: an insurance premium falls due the same
way and the old wording named it wrongly.

**It cannot reach a phone with the app shut.** A notification arriving on the
day needs a server pushing it, and this is a page with no server behind it —
the browser API for scheduling one locally was abandoned. So the app says it
when you open it, which is the honest version of the same thing.

### The figures belong to the tab

The portfolio value, what went in and the gain at the top of the Investment
screen are those of **the tab selected**, not of the whole book. Totalling
everything above a list of one kind put two subjects on one screen and left
the reader to work out which was which — and the gain shown was never the gain
of the thing being looked at.

They are worked out from the same `items` the list below is drawn from, so the
two cannot disagree, and the subtitle names the scope: *2 holdings in Indian
shares*. The parts still add to the whole: each tab's total summed comes to
what **All** shows.

### A goal says what it is made of

A goal is usually not "these particular seven things" but *my Indian shares*
or *the cash I keep for emergencies*. So it names a **kind**, and fills itself:

| made of | counts |
|---|---|
| Mutual funds | every fund |
| Indian shares | every IN stocks holding |
| European shares | every EU stocks holding |
| Cash & bank in India | rupee bank accounts, cash, and cash holdings |
| Cash & bank in Europe | the same in euro |
| Holdings I choose | a hand-picked list |
| A figure I keep myself | whatever you type |

Said once, it stays right as holdings come and go, instead of needing to be
re-ticked every time something is bought.

Cash looks on **both sides of the book** — a bank balance is an asset, a cash
holding is an investment — or the emergency fund would miss the account it
actually sits in.

What a goal has is `goalItems()` priced through the same `investWorth()` as
everything else, so a NAV that moved this morning moves the goal too, and the
list the sheet shows you is the list the total counts. Every reader goes
through `goalSaved()`: the card, the totals, the reports, the overdue
reminder. A goal made of a kind it holds none of is at zero, not at whatever
figure was typed before it was pointed there.

Two goals made of the same kind would each count all of it. The sheet says so
rather than preventing it — there may be a reason — but not silently, which is
how a total quietly doubles. A hand-picked list still refuses holdings behind
another goal outright, since that one has no reason to be deliberate.

Each goal card lists **what it is actually made of** — the accounts, funds or
shares behind it, with what each is worth — under the figures rather than
hidden in the edit sheet. A figure with nothing behind it is a claim; the same
figure with its constituents under it is something you can check. Long lists
stop at eight and say how many more.

The card also carries what kind it draws on, with the flag of that book. That flag is read from **what it actually counts**, not from what the goal
is called: a goal of Indian shares is Indian because every holding in it is
held in rupees. One reaching across both books gets no flag, since claiming
either would be half wrong. With nothing in it yet, its own currency is the
best answer available.

### Which book a holding is in

Funds and shares carry a small flag **on the line naming the kind** — beside
*IN stocks* or *SIP / Mutual fund*, not beside the holding's own name. The
flag says which book the kind belongs to, so that is the word it belongs
next to; against the name it competed with the thing being named.

Indian tricolour for rupee holdings, the German one for euro. Taken from the
currency rather than the kind, because
the euro book is the German one whatever the company happens to be, and a fund
bought in rupees is Indian however it invests. Deposits and balances carry
none — they are not held anywhere in particular.

They are drawn as inline SVG rather than typed as emoji. A flag emoji renders
as two letters on Windows and as a picture on a phone, and a mark that changes
shape by device is not a mark.

### Two stock books

Shares are held as **IN stocks** and **EU stocks**, because a portfolio held
in two countries is two things: they move on different exchanges, in different
currencies, and one number over both can hide being all-in on one. They are
separate buckets, so each gets its own share of the chart, its own target and
its own sector breakdown. The Investments tab still lists them together —
the split is about reporting, and a list of what you hold in shares is still
one list.

Alongside them the panel offers **Cash** and **Debt**. Debt replaced Bonds
rather than joining it: a bond is one kind of debt, and two buckets that
overlap only make a person choose between them for no gain. It keeps the hue
Bonds had, so a chart that already showed one does not change colour.

Names that have changed meaning are translated in `stateFromPayload`, the one
place a payload becomes state, so nothing else has to know an old word ever
existed:

| written as | read as | why |
|---|---|---|
| `Stocks` | `IN stocks` | before the book was split by country, Indian was all it could hold |
| `DE stocks` | `EU stocks` | the holdings are European, not only German |
| `Bonds` | `Debt` | a bond is one kind of debt, not a kind apart |
| `ULIP` | `Cash` | the bucket was never used for what it named |

A target set against an old bucket moves with it, or it would be silently
dropped for naming a bucket that no longer exists.

### Importing holdings

Settings → Import holdings reads two shapes of file, and works out which
arrived rather than asking:

- **A list of positions** — a Zerodha Console export. It states what is held,
  what it cost and what it is worth.
- **A ledger** — a Trade Republic transactions export. It states events, and
  the position is whatever is left when they are added up.

A ledger is recognised by having a type column with `BUY`/`SELL` in it. Buys
add shares and the money that left the account, the fee included; sells take
shares away along with the same proportion of the cost, which is the
average-cost view and the only one such a file supports, since it never says
which lot was sold. Everything that is not a trade is skipped — and that
matters more than it sounds, because a **dividend row carries the size of the
position it was paid on**, so counting those would quietly double every
holding.

A ledger knows what things cost and never what they are worth today. Worth is
set to cost, the screen says so, and re-importing one **will not overwrite a
worth already on a holding** with a cost.

The file's own currency column decides which book a new holding lands in —
euro to EU stocks, rupee to IN stocks — and every read starts from your home
currency rather than from whatever the last file was, or a Zerodha export
opened after a Trade Republic one would inherit euros. The toggle moves a
whole file between the books if the guess is ever wrong.

It is read in the browser with `FileReader` and goes nowhere.

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

### Live fund NAVs

A fund can be tied to its AMFI scheme, and is then priced the way gold is:
`units × NAV`, worked out fresh every time it is read rather than kept by
hand and quietly going stale. The NAV is fetched on app open, alongside the
exchange and gold rates and under the same switch.

The source is [MFapi.in](https://www.mfapi.in/), which serves AMFI's daily
NAVs as JSON with `access-control-allow-origin: *`, no key and no account —
the only shape of source usable from a page with no server behind it. Its
`/mf/search` endpoint finds the scheme code from a name typed into the entry
sheet. The whole scheme name is shown in the results, never trimmed: Direct
against Regular and Growth against IDCW are different schemes at different
prices, and picking the wrong one is the failure mode worth guarding against.

NAVs are cached per scheme rather than per holding — two holdings of one
scheme are at one price, and storing it twice invites them to disagree. They
are fetched rather than typed, so they stay out of what counts as a change
worth pushing, for the same reason the rates and their timestamp do.

### Bringing the figures up to date by hand

The app also asks on its own: once when the page loads, and again whenever it
comes back to the foreground **after a gap of half an hour**. That second one
matters more than it sounds. An installed app is resumed far more often than
it is loaded — tapping its icon brings the page back rather than running it
again — so a fetch wired only to load fired once on the day it was installed
and never again. The gap is there so nothing moves under you while you are
reading it.

Settings → Rates & gold carries **Refresh now**, which fetches everything the
app takes from outside itself in one go: the exchange rate, the gold price,
every linked fund's NAV and every share price. The open-time refresh asks once
and then holds its peace, which is right for something nobody asked for — but
when someone presses a button, they mean now.

It appears only while the live feed is on. With the feed off the figures are
yours, and a button promising to fetch them would be promising to overwrite
what you just typed. The line above it names what was last fetched and when,
so a figure you can see the source of is one you can tell is wrong.

**Funds tie themselves to a scheme.** A fund with none is looked up by its own
name and linked automatically — but only where the answer is not in doubt. A
match must be a *Direct Growth* scheme whose name **starts with** the
holding's, and there must be exactly one of them. That prefix rule is what
separates "Navi Nifty 50 Index Fund" from "Navi Nifty Next 50", and the
Zerodha index fund from its ELSS sibling: neither starts with the other's
name. A name too broad to place — `Nifty 50 Index Fund`, `HDFC` — is left
unlinked, because visibly unset beats quietly wrong, and Direct against
Regular is a different NAV rather than a rounding difference.

### Share prices, fetched the long way round

A browser cannot fetch a share price. Stooq, Yahoo and Frankfurter were each
tried **from the live Pages origin in a real browser**, not assumed about, and
all three refuse cross-origin requests; only MFapi answers. No amount of app
code changes that.

So the fetch happens somewhere that is not a browser. `.github/workflows/
quotes.yml` runs `tools/fetch-quotes.mjs` on a schedule, which reads the
symbols from `data/symbols.json`, asks Yahoo for each price and the exchange
rates, restates every price in each currency the app displays, and writes
`data/quotes.json`. The app reads that file **from its own origin** when it
opens — same origin, so there is no CORS to satisfy, no key to hide in a
public repo, and nothing anyone else has to keep running.

A holding carries a ticker, and is then worth `units × price`, exactly as a
fund is worth `units × NAV` and gold is worth `grams × rate`. Prices are
converted in the workflow rather than in the app, so the app never holds a
second opinion about an exchange rate.

Both books are covered: NSE tickers carry `.NS` and are priced in rupees,
Amsterdam `.AS`, Stockholm `.ST`, US listings plain. A holding is priced only
when the ticker on it also appears in `data/symbols.json`, so adding a share
to the book means adding it to that file too.

**Indian tickers need no typing.** A Zerodha export names holdings by their
ticker already, so `symbolOf()` derives the symbol as the name plus `.NS`.
Derived rather than stored, so it follows the name instead of going stale
beside it — and only where the name really is a ticker: anything with spaces
or lower case is words, and gets nothing. A ticker typed by hand always wins.
European listings still need theirs typed, because the suffix depends on the
exchange rather than the country.

A symbol that fails to fetch keeps the price it had rather than vanishing, and
a run that prices nothing at all exits non-zero instead of committing an empty
file. `data/symbols.json` is public because the workflow reading it is: it
says **which** companies are held, never how many or how much.

### Sectors and mandates

Stocks carry a **sector**, funds a **mandate** — two lists rather than one,
because "Large cap" is not a sector and "Banking" is not a mandate. The field
appears on a holding only where it means something, so a deposit is never asked
for one.

Cash entered as an investment lands in the same wedge as cash held as an
asset — the chart's existing rule that a thing is one thing whichever list it
came from. It counts towards what you own, but never towards a target: gold
and cash are named in `UNALLOCATED` and dropped from `investBuckets()`,
because one is kept and the other is waiting rather than placed. The in-depth
report takes its denominator from the rows it actually shows, so the shares
still come to a whole once those two are out.

Physical gold and fixed deposits are no longer offered when adding an
investment — gold has its own tab, and a deposit is something held rather
than traded, so it belongs in assets. Both stay in `INVEST_TYPES` marked
`offer:false`, because everything already filed under them must still resolve
to a bucket and a colour; delete the row and every one of them silently
becomes Other. Opening such a holding shows its own kind alongside the
offered ones, so saving cannot quietly refile it.

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

### What a backup carries

The things you entered, and not the things worked out from them. A share
price fetched this morning, a fund's NAV, the gold rate — all are asked for
again on the next open, and writing them down only preserves a figure that was
already going stale as it was saved. Gold has never been stored as a value,
only as grams; `backupPayload()` applies that same rule to everything else.

So a backup keeps **what went in, the units, and the grams**. It drops the
worth of any holding that can price itself, the NAV and quote caches, the gold
rate and the time it was fetched. It roughly halves the file.

A figure is dropped only where it can be worked out again:

- A holding with **no ticker and no scheme** has nothing but the worth you gave
  it, so that worth stays. A fixed deposit survives a round trip untouched.
- **Rates you set by hand** with the live feed off are yours, and stay.
- **Rupees per euro is kept** even with the feed on. It is not the value of one
  holding but the unit every total is stated in, and a restore that briefly
  converted the whole book at a fallback rate would misstate all of it rather
  than one line.

`ghFingerprint()` is taken from the same payload, or a device that pushes one
thing and fingerprints another would read as changed the moment it had pulled.

**The gap.** A book that has just arrived has no fetched figures yet, so for a
moment anything priced live reads as nothing and gold falls back to the
starting price a new book is given — a plausible number rather than a true
one. Restore and pull therefore fetch straight away rather than waiting for
the next open, which closes it to about a second. With no connection it stays
open until there is one.

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
