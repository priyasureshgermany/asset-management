# Asset & Liability Manager

Offline-first net worth tracker: assets, liabilities, goals and investments,
with an optional GitHub backup. A single-file PWA (`index.html`), same
architecture as [expense-tracker](../expense-tracker) — no build step, no
server, no dependencies.

## Structure

- **Dashboard** — net worth, total assets, total liabilities, and the list of
  individual assets/liabilities (add/edit/delete from here, via the + button).
- **Goal** — savings goals with a target amount, amount saved so far, and an
  optional target date.
- **Investment** — SIP/mutual funds, stocks, fixed deposits, PPF/EPF, bonds:
  invested amount vs current value, with gain/loss shown per item.
- **More** — Settings, Reports, What's new, About.

### Settings

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
