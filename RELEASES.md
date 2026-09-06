Release notes for Asset & Liability Manager, newest first. Shown in-app under More → What's new.

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
