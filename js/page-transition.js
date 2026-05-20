/** 首页 → 地图 丝滑转场 */
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const overlay = document.createElement("div");
  overlay.className = "page-transition-overlay";
  overlay.setAttribute("aria-hidden", "true");
  document.body.appendChild(overlay);

  function go(href) {
    overlay.classList.add("is-active");
    setTimeout(() => {
      window.location.href = href;
    }, 380);
  }

  document.querySelectorAll('a[href*="map.html"], a.nav-to-map').forEach((a) => {
    if (a.target === "_blank") return;
    a.addEventListener("click", (e) => {
      const url = a.getAttribute("href");
      if (!url || url.startsWith("#")) return;
      e.preventDefault();
      go(url);
    });
  });

  if (document.body.classList.contains("page-map")) {
    requestAnimationFrame(() => {
      overlay.classList.add("is-entering");
      setTimeout(() => overlay.classList.remove("is-entering"), 500);
    });
  }
})();
