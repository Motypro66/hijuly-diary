import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

JSON_PATH = Path(__file__).resolve().parent.parent / "data" / "posts.json"

def clean_text(s):
    if not s:
        return ""
    s = s.replace("📍", "")
    s = re.sub(r"^\[打卡R\]\s*", "", s, flags=re.I)
    s = re.sub(r"^-\s*", "", s)
    s = re.sub(r"-\s*$", "", s)
    return s.strip()

def extract_maps(body):
    if not body:
        return None
    m = re.search(r"(?:^|\n)📍\s*(.+?)\n([^\n#@]+(?:\n[^\n#@]+)?)", body)
    if m:
        name = clean_text(m.group(1))
        addr = re.sub(r"\n", ", ", m.group(2)).strip().rstrip(",")
        if re.match(r"^(Jalan|Lot|G-|No\.|\d)", addr):
            return {"placeName": name, "address": addr, "mapsQuery": f"{name}, {addr}"}
        if re.search(r"[，,]", name):
            short = re.split(r"[，,]", name)[0].strip()
            return {"placeName": short, "mapsQuery": f"{name}, Malaysia"}
        return {"placeName": name, "mapsQuery": f"{name}, Malaysia"}
    m = re.search(r"(?:^|\n)\[打卡R\](.+?)(?:\n([^\n#@]+))?", body)
    if m:
        name = clean_text(m.group(1))
        nxt = (m.group(2) or "").strip()
        if re.match(r"^(Jalan|Lot|G-|No\.|\d|Menara|Level|L\d)", nxt):
            return {"placeName": name, "address": nxt, "mapsQuery": f"{name}, {nxt}"}
        return {"placeName": name, "mapsQuery": f"{name}, Malaysia"}
    m = re.search(r"^-\s*(.+?)-\s*$", body, re.M)
    if m:
        name = clean_text(m.group(1))
        return {"placeName": name, "mapsQuery": f"{name}, Malaysia"}
    return None

non_food = {
    "p-665fd4850000000015013a0c",
    "p-66348881000000001e022408",
    "p-66436ac5000000001e02c7e7",
    "p-66c0df76000000000503acaf",
    "p-6698d281000000000a025bb6",
}

region_fix = {
    "p-671b8c550000000016022a48": "jb",
    "p-68023fe30000000009039499": "kv",
    "p-668d34d2000000000a025c38": "klang",
    "p-68a87f7b000000001d02f439": "kv",
}

manual = {
    "p-661a2677000000001b00dde0": {"placeName": "麻辣客栈", "mapsQuery": "麻辣客栈 SS15 Subang Jaya, Malaysia"},
    "p-661d01d4000000001c00a611": {"placeName": "人人食堂", "mapsQuery": "人人食堂 Subang Jaya, Malaysia"},
}

posts = json.loads(JSON_PATH.read_text(encoding="utf-8"))

for p in posts:
    p.pop("lat", None)
    p.pop("lng", None)

    if p["id"] in non_food:
        p["isFood"] = False
        if p["id"] == "p-665fd4850000000015013a0c":
            p["category"] = "other"
        elif p["id"] == "p-66436ac5000000001e02c7e7":
            p["category"] = "haowu"
        else:
            p["category"] = "haokang"

    if p["id"] in region_fix:
        p["region"] = region_fix[p["id"]]

    ex = extract_maps(p.get("body", ""))
    if ex:
        p["placeName"] = ex["placeName"]
        if ex.get("address"):
            p["address"] = ex["address"].replace("Kuala Lumpu", "Kuala Lumpur")
        p["mapsQuery"] = ex["mapsQuery"].replace("Kuala Lumpu", "Kuala Lumpur")

    if p["id"] in manual:
        p["placeName"] = manual[p["id"]]["placeName"]
        p["mapsQuery"] = manual[p["id"]]["mapsQuery"]

    if p.get("placeName"):
        p["placeName"] = clean_text(p["placeName"])
    if p.get("address"):
        p["address"] = clean_text(p["address"].replace("Kuala Lumpu", "Kuala Lumpur"))
    if p.get("mapsQuery"):
        p["mapsQuery"] = clean_text(p["mapsQuery"].replace("Kuala Lumpu", "Kuala Lumpur"))
        if p.get("placeName") and p.get("address") and p["address"] not in p["mapsQuery"]:
            p["mapsQuery"] = f"{p['placeName']}, {p['address']}"

    if p["id"] == "p-68023fe30000000009039499":
        p["location"] = "Klang Valley · Kepong"

ua = "hijuly-diary/4.6"
for p in [x for x in posts if x.get("mapsQuery")]:
    p.pop("lat", None)
    p.pop("lng", None)
    time.sleep(1.1)
    q = urllib.parse.quote(p["mapsQuery"])
    req = urllib.request.Request(
        f"https://nominatim.openstreetmap.org/search?q={q}&format=json&limit=1",
        headers={"User-Agent": ua},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode())
            if data:
                p["lat"] = float(data[0]["lat"])
                p["lng"] = float(data[0]["lon"])
    except Exception:
        print("Geocode failed:", p["id"])

JSON_PATH.write_text(json.dumps(posts, ensure_ascii=False, indent=4) + "\n", encoding="utf-8")
food = sum(1 for p in posts if p.get("isFood"))
maps = sum(1 for p in posts if p.get("mapsQuery"))
geo = sum(1 for p in posts if p.get("lat") is not None)
print(f"Done. Food={food} Maps={maps} Geocoded={geo}")
