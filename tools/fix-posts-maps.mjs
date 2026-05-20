import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(__dirname, "../data/posts.json");
const posts = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

function cleanText(s) {
  if (!s) return "";
  return s.replace(/📍/g, "").replace(/^\[打卡R\]\s*/i, "").replace(/^-\s*/, "").replace(/\-\s*$/, "").trim();
}

function extractMaps(body) {
  if (!body) return null;
  let m = body.match(/(?:^|\n)📍\s*(.+?)\n([^\n#@]+(?:\n[^\n#@]+)?)/);
  if (m) {
    const name = cleanText(m[1]);
    const addr = m[2].replace(/\n/g, ", ").trim().replace(/,\s*$/, "");
    if (/^(Jalan|Lot|G-|No\.|\d)/.test(addr)) {
      return { placeName: name, address: addr, mapsQuery: `${name}, ${addr}` };
    }
    if (/[，,]/.test(name)) {
      const short = name.split(/[，,]/)[0].trim();
      return { placeName: short, mapsQuery: `${name}, Malaysia` };
    }
    return { placeName: name, mapsQuery: `${name}, Malaysia` };
  }
  m = body.match(/(?:^|\n)\[打卡R\](.+?)(?:\n([^\n#@]+))?/);
  if (m) {
    const name = cleanText(m[1]);
    const next = (m[2] || "").trim();
    if (/^(Jalan|Lot|G-|No\.|\d|Menara|Level|L\d)/.test(next)) {
      return { placeName: name, address: next, mapsQuery: `${name}, ${next}` };
    }
    return { placeName: name, mapsQuery: `${name}, Malaysia` };
  }
  m = body.match(/^-\s*(.+?)-\s*$/m);
  if (m) {
    const name = cleanText(m[1]);
    return { placeName: name, mapsQuery: `${name}, Malaysia` };
  }
  return null;
}

const nonFoodIds = new Set([
  "p-665fd4850000000015013a0c",
  "p-66348881000000001e022408",
  "p-66436ac5000000001e02c7e7",
  "p-66c0df76000000000503acaf",
  "p-6698d281000000000a025bb6",
]);

const regionFix = {
  "p-671b8c550000000016022a48": "jb",
  "p-68023fe30000000009039499": "kv",
  "p-668d34d2000000000a025c38": "klang",
  "p-68a87f7b000000001d02f439": "kv",
};

const manualMaps = {
  "p-661a2677000000001b00dde0": {
    placeName: "麻辣客栈",
    mapsQuery: "麻辣客栈 SS15 Subang Jaya, Malaysia",
  },
  "p-661d01d4000000001c00a611": {
    placeName: "人人食堂",
    mapsQuery: "人人食堂 Subang Jaya, Malaysia",
  },
};

for (const p of posts) {
  delete p.lat;
  delete p.lng;

  if (nonFoodIds.has(p.id)) {
    p.isFood = false;
    if (p.id === "p-665fd4850000000015013a0c") p.category = "other";
    else if (p.id === "p-66436ac5000000001e02c7e7") p.category = "haowu";
    else p.category = "haokang";
  }

  if (regionFix[p.id]) p.region = regionFix[p.id];

  const extracted = extractMaps(p.body);
  if (extracted) {
    p.placeName = extracted.placeName;
    if (extracted.address) p.address = extracted.address.replace(/Kuala Lumpu\b/g, "Kuala Lumpur");
    p.mapsQuery = extracted.mapsQuery.replace(/Kuala Lumpu\b/g, "Kuala Lumpur");
  }

  if (manualMaps[p.id]) {
    p.placeName = manualMaps[p.id].placeName;
    p.mapsQuery = manualMaps[p.id].mapsQuery;
  }

  if (p.placeName) p.placeName = cleanText(p.placeName);
  if (p.address) p.address = cleanText(p.address.replace(/Kuala Lumpu\b/g, "Kuala Lumpur"));
  if (p.mapsQuery) {
    p.mapsQuery = cleanText(p.mapsQuery.replace(/Kuala Lumpu\b/g, "Kuala Lumpur"));
    if (p.placeName && p.address && !p.mapsQuery.includes(p.address)) {
      p.mapsQuery = `${p.placeName}, ${p.address}`;
    }
  }

  if (p.id === "p-68023fe30000000009039499") {
    p.location = "Klang Valley · Kepong";
  }
}

const ua = "hijuly-diary/4.6";
for (const p of posts.filter((x) => x.mapsQuery)) {
  delete p.lat;
  delete p.lng;
  await new Promise((r) => setTimeout(r, 1100));
  try {
    const q = encodeURIComponent(p.mapsQuery);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
      headers: { "User-Agent": ua },
    });
    const data = await res.json();
    if (data?.[0]) {
      p.lat = parseFloat(data[0].lat);
      p.lng = parseFloat(data[0].lon);
    }
  } catch {
    console.warn("Geocode failed:", p.id);
  }
}

fs.writeFileSync(jsonPath, JSON.stringify(posts, null, 4) + "\n", "utf8");
const food = posts.filter((p) => p.isFood).length;
const maps = posts.filter((p) => p.mapsQuery).length;
const geo = posts.filter((p) => p.lat != null).length;
console.log(`Done. Food=${food} Maps=${maps} Geocoded=${geo}`);
