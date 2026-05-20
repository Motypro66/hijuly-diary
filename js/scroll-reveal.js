/** 滚动淡入 + 视差（Apple 式克制动效） */
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function prime(el) {
    el.classList.add("reveal-ready");
    if (reduceMotion) el.classList.add("is-visible");
  }

  const observer = reduceMotion
    ? null
    : new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const delay = parseInt(el.dataset.revealDelay || "0", 10);
            if (delay > 0) {
              setTimeout(() => el.classList.add("is-visible"), delay);
            } else {
              el.classList.add("is-visible");
            }
            observer.unobserve(el);
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
      );

  window.observeReveals = function (root) {
    const scope = root || document;
    scope.querySelectorAll(".reveal:not(.reveal-ready)").forEach((el) => {
      prime(el);
      if (observer) observer.observe(el);
    });
  };

  document.querySelectorAll(".reveal").forEach(prime);
  if (observer) {
    document.querySelectorAll(".reveal.reveal-ready").forEach((el) => observer.observe(el));
  }

  if (!reduceMotion) {
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          document.querySelectorAll("[data-parallax]").forEach((el) => {
            const speed = parseFloat(el.dataset.parallax, 10) || 0.08;
            el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
          });
          ticking = false;
        });
      },
      { passive: true }
    );
  }
})();
