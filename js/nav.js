/** 导航：滚动进度条 + 顶栏收缩 */
(function () {
  const header = document.getElementById("site-header");
  const progress = document.getElementById("scroll-progress");

  function onScroll() {
    const y = window.scrollY;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = h > 0 ? Math.min(100, (y / h) * 100) : 0;

    if (progress) progress.style.width = `${pct}%`;
    if (header) header.classList.toggle("is-scrolled", y > 24);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
