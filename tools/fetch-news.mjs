/**
 * Headlines and corporate actions for the shares named in data/symbols.json,
 * written to data/news.json where the app can read them from its own origin.
 *
 * Here for the same reason the prices are: a browser cannot fetch a news feed
 * from Yahoo any more than it can fetch a quote — the CORS headers are not
 * there, which was checked from the live Pages origin rather than assumed. A
 * runner is not a browser, so the fetching happens here.
 *
 * One provider throughout. Yahoo publishes a syndication feed per symbol,
 * which is what this reads, and the same chart endpoint that prices a share
 * will also list its dividends and splits — so a corporate action needs no
 * second source and no key. A search-engine news query was tried first and
 * came back full of "share price prediction" pages; a feed the exchange's own
 * data provider publishes is the better-behaved neighbour.
 *
 * Every headline keeps its link and the publication's name, and the app shows
 * both: this is a reader, and the reading happens at the publisher's page.
 *
 * The file covers every symbol in data/symbols.json, which is public and says
 * only which companies appear in the book. Which of them you hold, and how
 * much, never leaves your device — the app does that filtering itself.
 */
import { readFileSync, writeFileSync } from "node:fs";

const RSS = "https://feeds.finance.yahoo.com/rss/2.0/headline?region=US&lang=en-US&s=";
const CHART = "https://query1.finance.yahoo.com/v8/finance/chart/";
const UA = { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" };

/* How the day went, on each side of the book: the index's own feed, plus a
   paper where the index's feed alone is thin. Yahoo carries the DAX well and
   the Nifty barely at all — one item against eight — so the Indian side reads
   a market desk's feed as well, and the two are merged by date. */
const MARKETS = {
  IN: {
    symbol: "^NSEI",
    name: "Indian markets",
    feeds: ["https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms"]
  },
  GLOBAL: { symbol: "^GDAXI", name: "European markets", feeds: [] }
};

/* Publishers whose own name is worth more than their hostname. */
const SOURCE_NAMES = {
  "economictimes.indiatimes.com": "Economic Times",
  "m.economictimes.com": "Economic Times"
};

const PER_SYMBOL = 5, PER_MARKET = 8, PER_ACTIONS = 3;
const NEWS_DAYS = 14, ACTION_DAYS = 120;

const fresh = (iso, days) => {
  const t = Date.parse(iso || "");
  return Number.isFinite(t) && Date.now() - t <= days * 864e5;
};

/* Enough of an XML reader for a feed: the entities a headline actually
   contains, and the CDATA the feed wraps some of them in. &amp; is undone
   last, or "&amp;lt;" would turn into a tag. */
function decode(s){
  return String(s || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}
function tag(block, name){
  const m = new RegExp("<" + name + "[^>]*>([\\s\\S]*?)</" + name + ">").exec(block);
  return m ? decode(m[1]) : "";
}
/* The publication, from the feed where it names one and from the link where
   it does not — a headline with no attribution is not one worth showing. */
function sourceOf(block, link){
  const named = tag(block, "source");
  if (named) return named;
  try {
    const host = new URL(link).hostname.replace(/^www\./, "");
    return SOURCE_NAMES[host] || host;
  }
  catch { return ""; }
}

/* Any feed at all: every one of these is ordinary RSS, whoever publishes it. */
async function rss(url, what){
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`${what}: HTTP ${r.status}`);
  const xml = await r.text();
  return xml.split("<item>").slice(1).map(b => {
    const title = tag(b, "title"), link = tag(b, "link");
    const when = Date.parse(tag(b, "pubDate"));
    return { title, link, source: sourceOf(b, link),
             at: Number.isFinite(when) ? new Date(when).toISOString() : "" };
  }).filter(x => x.title && x.link && fresh(x.at, NEWS_DAYS));
}

const headlines = (symbol) => rss(RSS + encodeURIComponent(symbol), symbol + " news");

/* Newest first, and one link only once however many feeds carried it. */
function merge(lists, cap){
  const seen = new Set(), out = [];
  for (const x of lists.flat().sort((a, b) => String(b.at).localeCompare(String(a.at)))){
    if (seen.has(x.link)) continue;
    seen.add(x.link);
    out.push(x);
    if (out.length >= cap) break;
  }
  return out;
}

/* Dividends and splits, off the endpoint that already prices the share. Both
   are what has happened rather than what is about to: an announced date needs
   an endpoint that wants a crumb, and a wrong "upcoming" date is worse than
   no date at all. */
async function actions(symbol){
  const url = CHART + encodeURIComponent(symbol) + "?interval=1d&range=1y&events=div%2Csplit";
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`${symbol}: actions HTTP ${r.status}`);
  const res = (await r.json())?.chart?.result?.[0];
  const ev = (res && res.events) || {};
  const currency = String(res?.meta?.currency || "").toUpperCase();
  const out = [];
  for (const d of Object.values(ev.dividends || {})){
    const amount = Number(d.amount);
    if (amount > 0) out.push({ kind: "dividend", amount, currency,
                               at: new Date(d.date * 1000).toISOString() });
  }
  for (const s of Object.values(ev.splits || {})){
    const ratio = s.splitRatio || `${s.numerator || 0}:${s.denominator || 0}`;
    out.push({ kind: "split", ratio: String(ratio),
               at: new Date(s.date * 1000).toISOString() });
  }
  return out.filter(a => fresh(a.at, ACTION_DAYS))
            .sort((a, b) => b.at.localeCompare(a.at))
            .slice(0, PER_ACTIONS);
}

const cfg = JSON.parse(readFileSync("data/symbols.json", "utf8"));
const symbols = Array.isArray(cfg.symbols) ? cfg.symbols : [];

/* Whatever was written last time. A feed that fails today keeps yesterday's
   headlines rather than emptying the screen: quiet is not the same as gone. */
let previous = { symbols: {}, market: {} };
try { previous = JSON.parse(readFileSync("data/news.json", "utf8")); }
catch { /* first run */ }

const failed = [];
const out = { at: new Date().toISOString(), market: {}, symbols: {}, failed };

for (const [region, m] of Object.entries(MARKETS)){
  const lists = [];
  for (const [url, what] of [[RSS + encodeURIComponent(m.symbol), m.symbol],
                             ...m.feeds.map(u => [u, region + " market feed"])]){
    try { lists.push(await rss(url, what)); }
    catch (e){ failed.push(String(e.message || e)); }
  }
  const items = merge(lists, PER_MARKET);
  out.market[region] = (items.length ? items : (previous.market || {})[region] || [])
    .map(x => Object.assign({}, x, { market: m.name }));
}

for (const s of symbols){
  const had = (previous.symbols || {})[s] || {};
  const rec = { news: had.news || [], actions: had.actions || [] };
  try { rec.news = (await headlines(s)).slice(0, PER_SYMBOL); }
  catch (e){ failed.push(String(e.message || e)); }
  try { rec.actions = await actions(s); }
  catch (e){ failed.push(String(e.message || e)); }
  /* A symbol nothing is written about is left out rather than kept as an
     empty shelf — the app reads "no news" from its absence just as well. */
  if (rec.news.length || rec.actions.length) out.symbols[s] = rec;
}

writeFileSync("data/news.json", JSON.stringify(out, null, 2) + "\n");
const items = Object.values(out.symbols).reduce((n, r) => n + r.news.length, 0);
const acts = Object.values(out.symbols).reduce((n, r) => n + r.actions.length, 0);
console.log(`${items} headlines and ${acts} corporate actions across ${Object.keys(out.symbols).length} symbols, ${failed.length} failed`);
for (const f of failed) console.log("  " + f);
/* Every feed failing is a broken run, not a quiet news day. */
if (!items && !Object.values(out.market).some(x => x.length) && symbols.length) process.exit(1);
