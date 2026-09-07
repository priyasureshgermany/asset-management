Release notes for Asset & Liability Manager, newest first. Shown in-app under More → What's new.

## 1.1.29 — 2026-09-07
- fix: Settings panes after GitHub sync opened empty — import holdings, backup and restore, the lock, the calculator and about were all swallowed by an unclosed tag
- better: Share prices are read fresh rather than from a cache that never expired

## 1.1.28 — 2026-09-07
- better: Goals are folded again — the line naming the kind opens the list of what is behind it

## 1.1.27 — 2026-09-07
- better: The GitHub sync pane is laid out like the expense tracker's, a push that would shrink the backup has to be confirmed, and any earlier backup can be restored

## 1.1.26 — 2026-09-07
- better: Goals can be dragged into whatever order you want them in, and the order is kept

## 1.1.25 — 2026-09-07
- better: Each goal lists the accounts, funds or shares behind it, on the goal itself

## 1.1.24 — 2026-09-07
- better: Each goal shows what it is made of, with the flag of the book it draws on

## 1.1.23 — 2026-09-07
- better: A goal says what it is made of — mutual funds, Indian shares, European shares, cash in India or Europe — and counts every one of them, keeping up as they change

## 1.1.22 — 2026-09-07
- better: A holding can back only one goal, so nothing is counted twice, and the flag sits beside the kind rather than the name

## 1.1.21 — 2026-09-07
- better: A goal can be backed by the funds and shares saving for it, and takes its progress from what they are worth; funds and shares carry a flag for the book they are held in

## 1.1.20 — 2026-09-07
- better: Funds find their own scheme by name and start pricing themselves, so nothing has to be linked by hand

## 1.1.19 — 2026-09-07
- better: The portfolio value, what went in and the gain now belong to the tab you have selected rather than to the whole book

## 1.1.18 — 2026-09-07
- better: A backup keeps what you put in, the units and the grams — never a price fetched from the internet, which is asked for again rather than remembered

## 1.1.17 — 2026-09-07
- better: The rates refresh themselves when you come back to the app, not only when it is loaded from scratch; Indian tickers are worked out from the holding name, so nothing needs typing

## 1.1.16 — 2026-09-07
- better: Indian shares are priced too — one Refresh now brings back every NSE ticker, every European one and every linked fund NAV together

## 1.1.15 — 2026-09-07
- better: Settings carries a Refresh now button that brings the rate, the gold price, every fund NAV and every share price up to date in one go

## 1.1.14 — 2026-09-07
- better: Share prices arrive daily: a workflow fetches them where CORS does not apply and writes a file the app reads from its own origin, so a holding with a ticker is worth units times price

## 1.1.13 — 2026-09-07
- better: A mutual fund can be tied to its scheme and is then priced from the live NAV — units times the figure fetched each time the app opens, the way gold already works

## 1.1.12 — 2026-09-07
- better: An instalment can be monthly, quarterly, half-yearly or yearly, so an annual insurance premium reminds you in its own month rather than every month

## 1.1.11 — 2026-09-07
- better: ULIP becomes Cash, sharing the wedge cash assets already use; cash counts towards what you own but never towards a target allocation

## 1.1.10 — 2026-09-07
- better: The IN and EU tabs say stocks underneath, so a country code on its own does not have to carry the meaning

## 1.1.9 — 2026-09-07
- better: Investment tabs shortened to All, MFs, IN, EU, ULIP and Debt so all six fit across a phone without scrolling

## 1.1.8 — 2026-09-07
- better: Investment tabs are All, Mutual Funds, IN stocks, EU stocks, ULIP and Debt; gold asks for the month it was bought instead of a purity that never changed; physical gold and fixed deposits are no longer offered as investment kinds

## 1.1.7 — 2026-09-07
- better: The investment panel offers IN stocks, EU stocks, ULIP and Debt; DE stocks became EU stocks and Bonds became Debt, with what you already hold carried across

## 1.1.6 — 2026-09-07
- better: Shares split into IN stocks and DE stocks, each with its own share of the chart and its own sectors; the importer now reads a Trade Republic transactions export as well as a Zerodha holdings one

## 1.1.5 — 2026-09-07
- better: Choosing one kind in Investments draws the pie by holding; In depth breaks stocks down by sector and funds by mandate

## 1.1.4 — 2026-09-07
- better: In depth reports on the portfolio alone — gold, cash and property are no longer measured against a target allocation

## 1.1.3 — 2026-09-07
- fix: The sync tile carried a mark every time Settings was opened. The live rates rewrite themselves and their timestamp on each open, and that counted as something to push — so the mark was always lit and said nothing. Only what you change counts now.
- new: See what would be pushed: the things here that are not in the backup, each named, and whether it was added, changed or removed.

## 1.1.2 — 2026-09-07
- better: In depth shows two bars a kind at a time, one labelled now and one labelled target, on the same scale. The mark that stood for the target is gone — it was read as a fault once and as progress toward a goal the next time, and two lengths need no explaining.
- fix: A row said 91.0% of 20%, which reads as most of the way to a target when it means a share against one. It says the amount at the top and labels each bar instead.

## 1.1.1 — 2026-09-07
- fix: The target in the in-depth report was a white line drawn through the bar, which on a kind held at nothing had no bar to belong to and read as a stray mark. It is a small arrow above the bar now, it says its figure when pointed at, and the block says once what it means.

## 1.1.0 — 2026-09-07
- new: Gold has a tab of its own, out of Investment: what it weighs, what it is worth, and each piece with its kind, purity and date. A piece with no recorded cost says so rather than counting as all profit.
- new: Its own figure on the dashboard, beside what you own and what you owe.
- new: A bell beside the eye, counting what is outstanding: SIPs due, a goal past its date and not reached, and gold with no price set — which would otherwise value at nothing and quietly understate everything.
- fix: The tab bar was fixed at four columns, so a fifth tab pushed More onto a line of its own.

## 1.0.19 — 2026-09-06
- better: The sync pane is shaped like the expense tracker's: the state said at the top, and Push, Pull and Turn off only once it is on.
- better: No branch to fill in. Without one GitHub reads and writes the repository's own default, which is the branch anyone wanted and one less thing to get wrong.
- new: It says how far behind the backup is — on the Settings tile and in the pane — counting what has been added, changed or dropped since the last push.
- better: Save & enable becomes Update these settings once sync is on, rather than inviting you to turn on what is already running.

## 1.0.18 — 2026-09-06
- new: A Check it button under GitHub sync asks GitHub what the token may actually do — read, write, and whether the branch is there — rather than leaving you to find out by pushing.
- fix: The message when a push is refused now says what to change: which permission a fine-grained token needs, and which scope a classic one does.

## 1.0.17 — 2026-09-06
- new: Settings takes a holdings export from Zerodha Console — stocks, ETFs and funds together. Every row is listed with a tick and marked new or update, and nothing is written until you say so.
- better: Updating a holding from a file writes only what the file knows: what it cost and what it is worth. The SIP you set, the day it goes out and your notes stay as they are.
- new: A holding can carry its number of units, which the import fills in.

## 1.0.16 — 2026-09-06
- new: Both calculators take a starting month, and then say the months rather than counting them: Oct 26 – Sep 27, and Oct 2026 inside it.
- new: The exchange rate and the gold price are asked for from the internet when the app opens, and you say which karat the gold price is for. Switch it off and the figures are yours again.
- new: Bracelet and Aruna join the kinds of gold.
- better: The investment tab called Other is called Fixed, and says what belongs in it: deposits, PPF and EPF, bonds — anything paying a set return.

## 1.0.15 — 2026-09-06
- new: A SIP can carry the day it goes out, and the dashboard says when one has come round. Tick it off and it stays quiet until its day next month.

## 1.0.14 — 2026-09-06
- new: Reports come in three now: an overview, investments on their own, and an in-depth allocation.
- new: A pie on each report, the same solid the dashboard draws — several can sit on a page at once, each with its own lit slice.
- new: Investments report by kind, filtered, with every holding listed against what it cost.
- new: In depth: what each kind is against what it was meant to be, with the target set on the same screen you notice the drift on.
- new: A year in either calculator opens onto the twelve months inside it.

## 1.0.13 — 2026-09-06
- new: The app tells you when a newer build is out: a dot on More and an Update badge on What's new and About, instead of you pressing Update to find out.

## 1.0.12 — 2026-09-06
- better: A new mark: a rising bar chart with the euro and the rupee in gold over it, no frame. The bars are the app's own chart colours, so the icon and the charts are one system.

## 1.0.11 — 2026-09-06
- new: An eye in the top bar hides every amount at once, for reading the app somewhere public. Weights, counts and percentages stay — on their own they give nothing away.
- new: An asset can carry what you paid for it as well as what it is worth, and shows the difference the way an investment does.
- new: Physical gold takes a date and what the piece actually is — necklace, aram, chain, ring, stud, dollar, bangles — and the Gold tab filters on it.
- new: Funds and Stocks have tabs of their own now, with Other for deposits, PPF and bonds.
- better: Under All, gold is one line for the whole drawer rather than piece by piece; the pieces are what the Gold tab is for.
- better: The net worth no longer sits under the app name — it is the first thing on the dashboard already.

## 1.0.10 — 2026-09-06
- better: Rupees are what the app starts in now, with euro a tap away in the top bar and under Settings → Profile.
- better: The calculators open on the sums actually being asked rather than an empty form: 20.000 a month at 14% over 10 years, and a 30,00,000 loan at 10.10% over 20.

## 1.0.9 — 2026-09-06
- new: A PIN lock: four digits asked for when the app opens and again after five minutes away, with a question of your own to fall back on if the PIN goes.
- new: Deleting everything now asks for the PIN, and the recovery question is put away while it asks — a question that could authorise a wipe is not a lock.

## 1.0.8 — 2026-09-06
- better: The + on the dashboard is real glass again, at the expense tracker's own strength — the page shows through it, with a specular cap and a hot spot on the surface and the glyph left fully opaque so a see-through button is still readable.
- fix: Asset and Liability were both offered under the same plus. Each now carries the icon the thing it makes will wear in the list, so what you pick from looks like what you get.

## 1.0.7 — 2026-09-06
- better: The pie and the shares sit together at the left of the card rather than being spread to its two edges — the pie takes the width it wants and no more, and the shares take only what they need beside it.

## 1.0.6 — 2026-09-06
- better: The pie sits on the left again with the shares reading down the right, the way it did before the solid arrived.
- better: Pick a colour and the amount appears over the chart itself rather than in a panel below it; the list beside it goes back to being shares.

## 1.0.5 — 2026-09-06
- better: The dashboard chart is the expense tracker's pie: drawn in projection with a wall dropping from its edge, lit across the whole solid rather than slice by slice, and standing on its own shadow.
- better: Choosing a slice polishes it — a sheen and a hotspot sized to the wedge, the rest falling back — and names it underneath in its own colour, with the amount.
- better: Nothing goes in or out in this app, so the tracker's money-in and money-out colours are not carried over; the block colour keeps its reasoning without its vocabulary.

## 1.0.4 — 2026-09-06
- better: Pick a colour on the dashboard chart and that row answers in money rather than a share — the donut's middle already did, and now the legend beside it agrees.

## 1.0.3 — 2026-09-06
- better: Charts follow the expense tracker's colour system: hsl(h 82% L) inside the same 22–42 band, placed by OkLab distance so no two wedges look alike, and the shared tokens for the figures that mean income or debt.
- fix: Gold held as jewellery and gold held as an investment were drawn in the very same colour and counted as two wedges. They are one wedge now, which is what they are — and so is a fixed deposit, whichever list it was entered from.

## 1.0.2 — 2026-09-06
- fix: A rate typed with a comma — 8,75 — was read as nothing, so a loan quietly worked itself out at 0% interest. Every amount now takes either decimal mark, and a rate is shown with the one you use.
- new: SIP and loan results open into a year-by-year table: what went in and what it came to, or what is principal, what is interest, and what is left to pay.
- new: A logo of its own — a brass vault door, in place of the expense tracker's icon.

## 1.0.1 — 2026-09-06
- better: Rebuilt the whole interface on the expense tracker's design — same tokens, shell, top bar, sheets, tiles and tab bar.
- new: Two currencies: every entry keeps the euro or rupee it was entered in, and the top bar switches which one totals are shown in.
- new: Physical gold as an investment kind — grams, purity and a description, valued by weight rather than a figure kept by hand.
- new: The Investment tab totals gold in grams and what it comes to at today's price.
- new: Dashboard you can poke: a donut of where the money sits that lights a slice when tapped, and category bars that open for their share.
- new: Rates & gold under Settings — rupees per euro, and the gold price per gram in each currency.
- better: Reports now say where money is held, euro against rupee.

## 1.0.0 — 2026-09-06
- new: First release — Dashboard with net worth, assets and liabilities.
- new: Goal tracking with progress bars.
- new: Investment tracking (SIP/mutual funds, stocks, FDs, PPF, bonds) with invested-vs-current value.
- new: More menu with Settings, Reports and What's new.
- new: GitHub sync (manual pull/push, same pattern as expense-tracker).
- new: Clipboard-based backup and restore.
- new: Calculator with SIP and Loan (EMI) tabs.
