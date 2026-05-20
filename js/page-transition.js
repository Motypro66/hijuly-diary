/**
 * 转场：网格地球 + 螃蟹绕圈（无黑屏）
 * 离开：overlay 淡入 → 跳转
 * 到达：overlay 已在（sessionStorage）→ 直接淡出，不二次闪现
 */
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const KEY = "crabTransition";
  const MIN_MS = 850;

  const overlay = document.getElementById("crab-transition");
  const loaderText = overlay?.querySelector(".loader-text");
  if (!overlay) return;

  function setLabel(text) {
    if (loaderText && text) loaderText.textContent = text;
  }

  function showActive() {
    overlay.classList.remove("is-fade-out");
    overlay.classList.add("is-active");
    overlay.setAttribute("aria-hidden", "false");
  }

  function fadeOut() {
    if (reduceMotion) {
      overlay.classList.remove("is-active", "is-fade-out");
      return;
    }
    overlay.classList.add("is-fade-out");
    setTimeout(() => {
      overlay.classList.remove("is-active", "is-fade-out");
      overlay.setAttribute("aria-hidden", "true");
    }, 520);
  }

  function go(href, label) {
    if (reduceMotion) {
      window.location.href = href;
      return;
    }
    sessionStorage.setItem(KEY, "1");
    setLabel(label || "小螃蟹绕地球找好吃…");
    showActive();
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
      go(url, anchor.dataset.transitionLabel || "小螃蟹绕地球找好吃…");
    });
  }

  document
    .querySelectorAll('a[href$=".html"], a.nav-to-map, a.nav-to-home, a.nav-to-random, a.nav-to-region')
    .forEach(bindTransition);

  const incoming = sessionStorage.getItem(KEY) === "1";
  if (incoming) {
    sessionStorage.removeItem(KEY);
    setLabel("到了，开吃！");
    showActive();
    if (reduceMotion) {
      fadeOut();
    } else {
      setTimeout(fadeOut, 280);
    }
  }

  window.CrabTransition = { show: showActive, hide: fadeOut, go };
})();
