/** 页脚显示：project | name | version */
(async function () {
  const el = document.getElementById("site-version");
  if (!el) return;
  try {
    const res = await fetch("data/version.json");
    if (!res.ok) return;
    const v = await res.json();
    el.textContent = `${v.project} | ${v.name} | v${v.version}`;
    el.title = v.codename ? `代号：${v.codename}` : "";
  } catch {
    /* ignore */
  }
})();
