/**
 * 转场：只保留「网格地球 + 螃蟹绕圈」
 */
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function buildOverlay() {
    if (document.getElementById("crab-transition")) return;
    document.body.insertAdjacentHTML(
      "beforeend",
      `<div class="crab-transition" id="crab-transition" aria-hidden="true">
        <div class="crab-transition__bg"></div>
        <div class="crab-loader" id="crab-loader">
          <svg class="loader-globe" viewBox="-100 -100 200 200" aria-hidden="true">
            <circle r="80" class="globe-bg"/>
            <ellipse rx="80" ry="30" class="globe-grid"/>
            <ellipse rx="80" ry="55" class="globe-grid"/>
            <ellipse rx="55" ry="80" class="globe-grid"/>
            <ellipse rx="30" ry="80" class="globe-grid"/>
            <circle r="80" class="globe-ring"/>
          </svg>
          <div class="loader-orbit">
            <span class="loader-crab" aria-hidden="true">🦀</span>
          </div>
          <p class="loader-text">小螃蟹绕地球找好吃…</p>
        </div>
      </div>`
    );
  }

  buildOverlay();

  const overlay = document.getElementById("crab-transition");
  const loader = document.getElementById("crab-loader");
  const MIN_MS = 900;

  function show(label) {
    if (reduceMotion) return;
    if (label) loader.querySelector(".loader-text").textContent = label;
    overlay.classList.add("is-active");
    document.body.classList.add("is-page-leaving");
  }

  function hide() {
    if (reduceMotion) return;
    overlay.classList.add("is-fade-out");
    setTimeout(() => {
      overlay.classList.remove("is-active", "is-fade-out");
      document.body.classList.remove("is-page-leaving");
    }, 480);
  }

  function go(href, label) {
    if (reduceMotion) {
      window.location.href = href;
      return;
    }
    show(label || "小螃蟹绕地球找好吃…");
    setTimeout(() => {
      window.location.href = href;
    }, MIN_MS);
  }

  function bindTransition(anchor) {
    if (anchor.target === "_blank") return;
    if (anchor.dataset.noTransition === "1") return;
    const url = anchor.getAttribute("href");
    if (!url || url.startsWith("#") || url.startsWith("http")) return;

    anchor.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      const label = anchor.dataset.transitionLabel || "小螃蟹绕地球找好吃…";
      go(url, label);
    });
  }

  document
    .querySelectorAll('a[href$=".html"], a.nav-to-map, a.nav-to-home, a.nav-to-random')
    .forEach(bindTransition);

  if (
    document.body.classList.contains("page-home") ||
    document.body.classList.contains("page-map") ||
    document.body.classList.contains("page-random")
  ) {
    requestAnimationFrame(() => {
      show("到了，开吃！");
      setTimeout(hide, MIN_MS);
    });
  }

  window.CrabTransition = {
    show,
    hide,
    go,
    showLoader: show,
    hideLoader: hide,
  };
})();
