/** 首页 ↔ 地图 丝滑转场（Bike Bear 式淡入，非跑马灯） */
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const overlay = document.createElement("div");
  overlay.className = "page-transition-overlay";
  overlay.setAttribute("aria-hidden", "true");
  document.body.appendChild(overlay);

  const DURATION = 520;

  function go(href) {
    document.body.classList.add("is-page-leaving");
    overlay.classList.add("is-active");
    setTimeout(() => {
      window.location.href = href;
    }, DURATION);
  }

  function bindTransition(anchor) {
    if (anchor.target === "_blank") return;
    if (anchor.dataset.noTransition === "1") return;
    const url = anchor.getAttribute("href");
    if (!url || url.startsWith("#") || url.startsWith("http")) return;

    anchor.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      go(url);
    });
  }

  document
    .querySelectorAll('a[href*="map.html"], a.nav-to-map, a.nav-to-home')
    .forEach(bindTransition);

  const isMap = document.body.classList.contains("page-map");
  const isHome = document.body.classList.contains("page-home");
  if (isMap || isHome) {
    requestAnimationFrame(() => {
      overlay.classList.add("is-entering");
      setTimeout(() => {
        overlay.classList.remove("is-entering", "is-active");
        document.body.classList.remove("is-page-leaving");
      }, 620);
    });
  }
})();
