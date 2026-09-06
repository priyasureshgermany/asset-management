/* Expense-tracker's own test for "are these two colours actually different":
   OkLab distance, because hue degrees lie — 10° apart in the greens is
   invisible where the same 10° in the reds is obvious. Its threshold for
   too-close is 14. Assets and investment kinds share one chart, so every one
   of those has to clear every other one. */
const CAT_SAT = 82;

function okLab(h, s2, l){
  h = ((h % 360) + 360) % 360; s2 /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s2,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
  let r, g, b;
  if (h < 60){ r = c; g = x; b = 0; } else if (h < 120){ r = x; g = c; b = 0; }
  else if (h < 180){ r = 0; g = c; b = x; } else if (h < 240){ r = 0; g = x; b = c; }
  else if (h < 300){ r = x; g = 0; b = c; } else { r = c; g = 0; b = x; }
  const f = u => { u += m; return u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4); };
  const R = f(r), G = f(g), B = f(b);
  const L = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const M = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const S = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [0.2104542553 * L + 0.7936177850 * M - 0.0040720468 * S,
          1.9779984951 * L - 2.4285922050 * M + 0.4505937099 * S,
          0.0259040371 * L + 0.7827717662 * M - 0.8086757660 * S];
}
const okDist = (a, b) => Math.hypot(a[0]-b[0], a[1]-b[1], a[2]-b[2]) * 100;

const SHARED = JSON.parse(process.argv[2]);   // assets + investments, one chart
const LIAB = JSON.parse(process.argv[3]);     // its own chart

function report(name, list){
  console.log(`\n${name} — ${list.length} colours`);
  let worst = { d: Infinity };
  const bad = [];
  for (let i = 0; i < list.length; i++){
    for (let j = i + 1; j < list.length; j++){
      const d = okDist(okLab(list[i].h, CAT_SAT, list[i].l),
                       okLab(list[j].h, CAT_SAT, list[j].l));
      if (d < worst.d) worst = { d, a: list[i].k, b: list[j].k };
      if (d < 14) bad.push(`  ${d.toFixed(1)}  ${list[i].k}  vs  ${list[j].k}`);
    }
  }
  if (bad.length){ console.log("TOO CLOSE:"); bad.forEach(b => console.log(b)); }
  else console.log("  all pairs clear");
  console.log(`  closest: ${worst.d.toFixed(1)} (${worst.a} vs ${worst.b})`);
  return bad.length === 0;
}

const ok1 = report("Assets + investments (one donut)", SHARED);
const ok2 = report("Liabilities", LIAB);
process.exit(ok1 && ok2 ? 0 : 1);
