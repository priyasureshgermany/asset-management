/**
 * Prices for the shares named in data/symbols.json, written to
 * data/quotes.json where the app can read them from its own origin.
 *
 * This exists because a browser cannot fetch them. Yahoo, Stooq and
 * Frankfurter all refuse cross-origin requests, which was checked from the
 * live Pages origin itself rather than assumed. A GitHub runner is not a
 * browser and is not subject to CORS, so the fetch happens here and the app
 * only ever reads a file sitting beside it. Same origin, no headers to argue
 * about, and no key to keep out of a public repo.
 *
 * Prices are converted here rather than in the app, so the app never has to
 * hold a second opinion about an exchange rate.
 */
import { readFileSync, writeFileSync } from "node:fs";

const CHART = "https://query1.finance.yahoo.com/v8/finance/chart/";
const SEARCH = "https://query1.finance.yahoo.com/v1/finance/search";
const UA = { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" };

/* Believable bounds, the same net the app puts under a fetched rate: a price
   of 0, or of ten million, is a broken feed rather than news. */
const sane = (v, lo, hi) => Number.isFinite(v) && v > lo && v < hi;

async function meta(symbol){
  const url = CHART + encodeURIComponent(symbol) + "?interval=1d&range=1d";
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`${symbol}: HTTP ${r.status}`);
  const m = (await r.json())?.chart?.result?.[0]?.meta;
  if (!m) throw new Error(`${symbol}: no result`);
  return m;
}

/* The sector a company trades in, taken from the same place its price is.
   Yahoo's own taxonomy is used verbatim rather than translated into a list of
   my own: it is the same eleven names for a bank in Mumbai and a software
   house in Stockholm, which is exactly what a chart comparing them needs, and
   a translation table would be one more thing to keep true.

   The profile endpoint wants a crumb these days; search does not. */
async function sector(symbol){
  try{
    const url = SEARCH + "?q=" + encodeURIComponent(symbol) + "&quotesCount=6&newsCount=0";
    const r = await fetch(url, { headers: UA });
    if (!r.ok) return "";
    const quotes = (await r.json()).quotes || [];
    const hit = quotes.find(q => String(q.symbol || "").toUpperCase() === symbol.toUpperCase())
             || quotes[0];
    return hit && hit.sector ? String(hit.sector) : "";
  }catch{ return ""; }
}

/* An index fund has no sector of its own — it has whatever it tracks, and the
   issuer says so in the name it registered. "Nippon India ETF Nifty Bank
   BeES" is banks; the feed simply files it as an equity with no sector and
   leaves it out of every chart. Read from the issuer's name rather than from
   what anybody typed, so it is the product speaking, not a guess.

   A broad index is genuinely not a sector, and is labelled as what it is
   rather than pushed into one. */
function fromFundName(name){
  /* A BeES or any other tracker is an index holding, whatever the index
     happens to be made of. Filing Bank BeES under Financial Services would
     put a passive holding beside the shares somebody actually picked, and
     they are not the same decision. */
  return /\betf\b|bees|index/i.test(String(name || "")) ? "Index" : "";
}

async function price(symbol){
  const m = await meta(symbol);
  const px = Number(m.regularMarketPrice);
  if (!sane(px, 0, 10_000_000)) throw new Error(`${symbol}: price ${px}`);
  return {
    raw: px,
    currency: String(m.currency || "").toUpperCase(),
    name: String(m.longName || m.shortName || symbol)
  };
}

async function rate(pair){
  const m = await meta(pair);
  const v = Number(m.regularMarketPrice);
  if (!sane(v, 0.0001, 100000)) throw new Error(`${pair}: rate ${v}`);
  return v;
}

const cfg = JSON.parse(readFileSync("data/symbols.json", "utf8"));
const symbols = Array.isArray(cfg.symbols) ? cfg.symbols : [];
const display = Array.isArray(cfg.display) && cfg.display.length ? cfg.display : ["EUR"];

/* Whatever was written last time. A symbol that fails today keeps yesterday's
   price rather than vanishing: a bad afternoon at Yahoo is not the same as a
   holding being worth nothing. */
let previous = {};
try { previous = JSON.parse(readFileSync("data/quotes.json", "utf8")).quotes || {}; }
catch { /* first run */ }

const quotes = {};
const failed = [];
const needed = new Set();

for (const s of symbols){
  try {
    const p = await price(s);
    /* Kept from last time if the lookup fails: a sector does not change, and
       a blank one would empty a chart for no reason. */
    /* In order: what the feed says, what the issuer's own name says, what we
       knew last time, and failing all three the honest bucket. Nothing is
       left blank, because a blank drops a holding out of every chart it
       belongs in without saying so. */
    /* What the feed says, then what the issuer's own name says, then what we
       knew last time. Nothing is invented past that: "Other" would be a
       label pretending to be an answer. */
    p.sector = (await sector(s))
            || fromFundName(p.name)
            || (previous[s] && previous[s].sector)
            || "";
    quotes[s] = p;
    if (p.currency && p.currency !== "EUR") needed.add("EUR" + p.currency + "=X");
  } catch (e){
    failed.push(String(e.message || e));
    if (previous[s]) quotes[s] = previous[s];
  }
}
for (const d of display) if (d !== "EUR") needed.add("EUR" + d + "=X");

const fx = {};
for (const pair of needed){
  try { fx[pair.replace("=X", "")] = await rate(pair); }
  catch (e){ failed.push(String(e.message || e)); }
}

/* Every price restated in each currency the app displays, so a holding just
   reads the one matching its own and multiplies. */
for (const [s, q] of Object.entries(quotes)){
  const eur = q.currency === "EUR" ? q.raw : q.raw / fx["EUR" + q.currency];
  if (!sane(eur, 0, 10_000_000)){ delete quotes[s]; failed.push(`${s}: no euro rate`); continue; }
  q.in = {};
  for (const d of display){
    const v = d === "EUR" ? eur : eur * fx["EUR" + d];
    if (sane(v, 0, 1_000_000_000)) q.in[d] = Math.round(v * 100) / 100;
  }
}

const out = {
  at: new Date().toISOString(),
  fx,
  quotes,
  /* Said out loud in the file rather than only in a log nobody opens. */
  failed
};
writeFileSync("data/quotes.json", JSON.stringify(out, null, 2) + "\n");
console.log(`${Object.keys(quotes).length} priced, ${failed.length} failed`);
for (const f of failed) console.log("  " + f);
/* A run that priced nothing at all is a broken run, and should say so. */
if (!Object.keys(quotes).length && symbols.length) process.exit(1);
