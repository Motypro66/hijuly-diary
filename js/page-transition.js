/**
 * 螃蟹一口吃掉转场（v4.4）
 *
 * 流程：
 *   1) 用户点击跳转链接
 *   2) 螃蟹从下方滑入，两只钳子从左右合上
 *   3) 屏幕被「咬」进一圈，缩放到螃蟹嘴巴（中心圆）
 *   4) 圆扩张 → 进入新页面，钳子滑开
 *
 * 同时支持「网格地球 + 螃蟹绕走」的 loading 态（数据 fetch > 600ms 时出现）
 */
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function buildOverlay() {
    if (document.getElementById("crab-transition")) return;
    const html = `
      <div class="crab-transition" id="crab-transition" aria-hidden="true">
        <div class="crab-transition__bg"></div>
        <svg class="crab-claw crab-claw--left" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <path class="claw-shape" d="M 0,80
            C 60,60 100,70 120,90
            L 160,80 L 170,100 L 130,115
            C 100,130 60,140 0,120 Z"/>
          <circle class="claw-eye" cx="40" cy="92" r="4"/>
        </svg>
        <svg class="crab-claw crab-claw--right" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <path class="claw-shape" d="M 200,80
            C 140,60 100,70 80,90
            L 40,80 L 30,100 L 70,115
            C 100,130 140,140 200,120 Z"/>
          <circle class="claw-eye" cx="160" cy="92" r="4"/>
        </svg>
        <div class="crab-mouth" aria-hidden="true"></div>
        <div class="crab-loader" id="crab-loader" hidden>
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
      </div>`;
    document.body.insertAdjacentHTML("beforeend", html);
  }

  buildOverlay();

  const overlay = document.getElementById("crab-transition");
  const loader = document.getElementById("crab-loader");
  const BITE_MS = 760;
  const REVEAL_MS = 560;

  function bite(nextHref) {
    if (reduceMotion) {
      window.location.href = nextHref;
      return;
    }
    overlay.classList.remove("is-exit");
    overlay.classList.add("is-bite");
    document.body.classList.add("is-page-leaving");
    setTimeout(() => {
      window.location.href = nextHref;
    }, BITE_MS);
  }

  function reveal() {
    if (reduceMotion) return;
    overlay.classList.add("is-bite", "is-exit");
    setTimeout(() => {
      overlay.classList.remove("is-bite", "is-exit");
      document.body.classList.remove("is-page-leaving");
    }, REVEAL_MS + 100);
  }

  function showLoader(label) {
    if (!loader) return;
    if (label) loader.querySelector(".loader-text").textContent = label;
    loader.hidden = false;
    overlay.classList.add("is-bite", "is-loading");
  }

  function hideLoader() {
    if (!loader) return;
    loader.hidden = true;
    overlay.classList.remove("is-loading");
    reveal();
  }

  function bindTransition(anchor) {
    if (anchor.target === "_blank") return;
    if (anchor.dataset.noTransition === "1") return;
    const url = anchor.getAttribute("href");
    if (!url || url.startsWith("#") || url.startsWith("http")) return;

    anchor.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      bite(url);
    });
  }

  document
    .querySelectorAll('a[href$=".html"], a.nav-to-map, a.nav-to-home')
    .forEach(bindTransition);

  if (document.body.classList.contains("page-home") || document.body.classList.contains("page-map")) {
    requestAnimationFrame(reveal);
  }

  window.CrabTransition = { bite, reveal, showLoader, hideLoader };
})();
