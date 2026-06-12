/* ═══════════════════════════════════════════════
   小螃蟹看世界 · Visual Effects JavaScript
   React Bits-style: SpotlightCard, ShinyText,
   Aurora, DotGrid, Sparkles, BlurReveal, Counter,
   Tilt, Parallax, Shimmer Cards
   ═══════════════════════════════════════════ */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ═══════════════════════════════════════════
  // 1. Sparkle Particle System
  // ═══════════════════════════════════════════

  function createSparkles(container, count) {
    if (!container || container.dataset.sparklesReady) return;
    container.dataset.sparklesReady = "1";
    const fragment = document.createDocumentFragment();
    const colors = ["#ff5c4d", "#ffb347", "#ff9a5c", "#2a6b7c", "#4a9db0"];

    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement("span");
      const isStar = Math.random() > 0.7;
      sparkle.className = "sparkle" + (isStar ? " sparkle--star" : "");

      const x = Math.random() * 100;
      const delay = Math.random() * 6;
      const duration = 3 + Math.random() * 5;
      const size = 2 + Math.random() * 4;
      const color = colors[Math.floor(Math.random() * colors.length)];

      sparkle.style.left = x + "%";
      sparkle.style.bottom = "-10px";
      sparkle.style.width = size + "px";
      sparkle.style.height = size + "px";
      sparkle.style.background = color;
      sparkle.style.animationDelay = delay + "s";
      sparkle.style.animationDuration = duration + "s";
      sparkle.style.boxShadow = `0 0 ${size * 2}px ${color}`;

      fragment.appendChild(sparkle);
    }
    container.appendChild(fragment);
  }

  // ═══════════════════════════════════════════
  // 2. Blur Text Reveal (React Bits BlurText)
  // ═══════════════════════════════════════════

  function initBlurReveal(selector, stagger) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      if (el.dataset.blurReady) return;
      el.dataset.blurReady = "1";

      if (stagger) {
        el.classList.add("blur-reveal", "blur-reveal--stagger");
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const textNodes = [];
        while (walker.nextNode()) textNodes.push(walker.currentNode);

        textNodes.forEach((node) => {
          const text = node.textContent;
          const frag = document.createDocumentFragment();
          let charIndex = 0;
          text.split("").forEach((char) => {
            const span = document.createElement("span");
            span.className = "blur-reveal-char";
            span.textContent = char === " " ? "\u00a0" : char;
            span.style.transitionDelay = charIndex * 25 + "ms";
            frag.appendChild(span);
            charIndex++;
          });
          node.parentNode.replaceChild(frag, node);
        });
      } else {
        el.classList.add("blur-reveal");
      }
    });
  }

  function revealBlurText(root) {
    const els = root
      ? root.querySelectorAll(".blur-reveal")
      : document.querySelectorAll(".blur-reveal");
    els.forEach((el) => {
      requestAnimationFrame(() => el.classList.add("is-visible"));
    });
  }

  // ═══════════════════════════════════════════
  // 3. Number Counter Animation
  // ═══════════════════════════════════════════

  function parseStatValue(text) {
    text = text.trim();
    const match = text.match(/([\d.]+)\s*(K)?/i);
    if (!match) return null;
    const num = parseFloat(match[1]);
    const suffix = match[2] ? match[2].toUpperCase() : "";
    return { value: num, suffix, isK: suffix === "K" };
  }

  function animateCounter(el, targetText) {
    const parsed = parseStatValue(targetText);
    if (!parsed || el.dataset.counted) return;
    el.dataset.counted = "1";

    const startTime = performance.now();
    const duration = 1800;
    const isK = parsed.isK;

    el.classList.add("is-counted");

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const currentValue = easedProgress * parsed.value;

      if (isK) {
        el.textContent = currentValue.toFixed(1) + "K";
      } else {
        el.textContent = Math.floor(currentValue).toLocaleString();
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = targetText;
      }
    }

    requestAnimationFrame(update);
  }

  function initCounters(root) {
    const els = root ? root.querySelectorAll(".stat-val") : document.querySelectorAll(".stat-val");
    els.forEach((el) => {
      const target = el.textContent.trim();
      if (target && parseStatValue(target)) {
        el.dataset.target = target;
      }
    });
  }

  function runCounters(root) {
    const els = root ? root.querySelectorAll(".stat-val") : document.querySelectorAll(".stat-val");
    els.forEach((el, i) => {
      if (el.dataset.target && !el.dataset.counted) {
        setTimeout(() => animateCounter(el, el.dataset.target), i * 120);
      }
    });
  }

  // ═══════════════════════════════════════════
  // 4. Parallax on Mouse Move (hero blobs)
  // ═══════════════════════════════════════════

  function initParallax() {
    if (reduceMotion) return;
    const hero = document.querySelector(".hero-july");
    if (!hero || hero.dataset.parallaxReady) return;
    hero.dataset.parallaxReady = "1";

    const blobs = hero.querySelectorAll(".hero-blob[data-parallax]");
    if (!blobs.length) return;

    let ticking = false;

    function onMouseMove(e) {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = hero.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;

          blobs.forEach((blob) => {
            const speed = parseFloat(blob.dataset.parallax) || 0.05;
            blob.style.transform = `translate(${x * speed * 80}px, ${y * speed * 80}px)`;
          });

          ticking = false;
        });
        ticking = true;
      }
    }

    if (window.matchMedia("(hover: hover)").matches) {
      hero.addEventListener("mousemove", onMouseMove, { passive: true });
    }
  }

  // ═══════════════════════════════════════════
  // 5. Spotlight Card (React Bits SpotlightCard)
  // ═══════════════════════════════════════════

  function initSpotlightCards(root) {
    const scope = root || document;
    scope.querySelectorAll(".spotlight-card:not([data-spotlight-ready])").forEach((card) => {
      card.dataset.spotlightReady = "1";
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
        card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
      });
      card.addEventListener("mouseleave", () => {
        card.style.setProperty("--mouse-x", "50%");
        card.style.setProperty("--mouse-y", "50%");
      });
    });
  }

  // ═══════════════════════════════════════════
  // 6. Tilt Card (React Bits TiltedCard)
  // ═══════════════════════════════════════════

  function initTiltCards(root) {
    if (reduceMotion || !window.matchMedia("(hover: hover)").matches) return;
    const scope = root || document;
    scope.querySelectorAll(".tilt-card:not([data-tilt-ready])").forEach((card) => {
      card.dataset.tiltReady = "1";
      if (!card.querySelector(".tilt-card__shine")) {
        const shine = document.createElement("div");
        shine.className = "tilt-card__shine";
        shine.setAttribute("aria-hidden", "true");
        card.appendChild(shine);
      }

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rotateX = (0.5 - y) * 10;
        const rotateY = (x - 0.5) * 10;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        card.style.setProperty("--tilt-x", `${x * 100}%`);
        card.style.setProperty("--tilt-y", `${y * 100}%`);
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  // ═══════════════════════════════════════════
  // 7. Dot Grid Background (React Bits DotGrid)
  // ═══════════════════════════════════════════

  function initDotGrid() {
    const hero = document.querySelector(".hero-july");
    if (!hero || hero.querySelector(".hero-dotgrid") || reduceMotion) return;

    const wrap = document.createElement("div");
    wrap.className = "hero-dotgrid";
    const canvas = document.createElement("canvas");
    wrap.appendChild(canvas);
    hero.insertBefore(wrap, hero.firstChild);

    const ctx = canvas.getContext("2d");
    let w = 0;
    let h = 0;
    let mouse = { x: -9999, y: -9999 };
    const gap = 28;
    const baseRadius = 1.2;
    const activeRadius = 3.5;
    const proximity = 120;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = wrap.clientWidth;
      h = wrap.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (let x = gap / 2; x < w; x += gap) {
        for (let y = gap / 2; y < h; y += gap) {
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const t = Math.max(0, 1 - dist / proximity);
          const r = baseRadius + t * (activeRadius - baseRadius);
          const alpha = 0.12 + t * 0.35;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = t > 0.3 ? `rgba(255, 92, 77, ${alpha})` : `rgba(42, 107, 124, ${alpha})`;
          ctx.fill();
        }
      }
      requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize, { passive: true });

    if (window.matchMedia("(hover: hover)").matches) {
      hero.addEventListener(
        "mousemove",
        (e) => {
          const rect = wrap.getBoundingClientRect();
          mouse.x = e.clientX - rect.left;
          mouse.y = e.clientY - rect.top;
        },
        { passive: true }
      );
      hero.addEventListener("mouseleave", () => {
        mouse.x = -9999;
        mouse.y = -9999;
      });
    }
  }

  // ═══════════════════════════════════════════
  // 8. Aurora Background
  // ═══════════════════════════════════════════

  function addAurora() {
    const hero = document.querySelector(".hero-july");
    if (!hero || hero.querySelector(".hero-aurora") || reduceMotion) return;

    const aurora = document.createElement("div");
    aurora.className = "hero-aurora";
    aurora.setAttribute("aria-hidden", "true");
    aurora.innerHTML =
      '<div class="hero-aurora__strip"></div><div class="hero-aurora__strip"></div><div class="hero-aurora__strip"></div>';
    hero.insertBefore(aurora, hero.firstChild);
  }

  // ═══════════════════════════════════════════
  // 9. Animated Background + Sparkles
  // ═══════════════════════════════════════════

  function addAnimatedBg() {
    const hero = document.querySelector(".hero-july");
    if (!hero) return;

    if (!hero.querySelector(".hero-noise")) {
      const noise = document.createElement("div");
      noise.className = "hero-noise";
      hero.appendChild(noise);
    }

    if (!hero.querySelector(".hero-sparkles")) {
      const sparkles = document.createElement("div");
      sparkles.className = "hero-sparkles";
      hero.appendChild(sparkles);
      createSparkles(sparkles, window.innerWidth < 768 ? 12 : 28);
    }

    if (!hero.querySelector(".hero-animated-bg")) {
      const bg = document.createElement("div");
      bg.className = "hero-animated-bg";
      hero.insertBefore(bg, hero.firstChild);
    }
  }

  // ═══════════════════════════════════════════
  // 10. Glass Cards
  // ═══════════════════════════════════════════

  function addGlassCards(root) {
    const scope = root || document;
    scope.querySelectorAll(".page-v4 .post-card:not(.glass-card)").forEach((card) => {
      card.classList.add("glass-card", "glass", "tilt-card");
    });
  }

  // ═══════════════════════════════════════════
  // 11. Scroll Hint
  // ═══════════════════════════════════════════

  function addScrollIndicator() {
    const hero = document.querySelector(".hero-july");
    if (!hero || hero.querySelector(".scroll-hint") || reduceMotion) return;

    const hint = document.createElement("div");
    hint.className = "scroll-hint";
    hint.innerHTML = "<span>向下滚动</span><div class=\"scroll-hint__line\"></div>";
    hero.appendChild(hint);

    let hidden = false;
    window.addEventListener(
      "scroll",
      () => {
        if (!hidden && window.scrollY > 100) {
          hint.style.opacity = "0";
          hint.style.transition = "opacity 0.3s";
          hidden = true;
        }
      },
      { passive: true }
    );
  }

  // ═══════════════════════════════════════════
  // 12. Magnetic Buttons
  // ═══════════════════════════════════════════

  function initMagneticButtons() {
    if (reduceMotion || !window.matchMedia("(hover: hover)").matches) return;
    document.querySelectorAll(".btn-magnetic:not([data-magnetic-ready])").forEach((btn) => {
      btn.dataset.magneticReady = "1";
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  // ═══════════════════════════════════════════
  // 13. Post Cover Reveal
  // ═══════════════════════════════════════════

  function revealPostImages(root) {
    const scope = root || document;
    scope.querySelectorAll(".post-cover img").forEach((img) => {
      const cover = img.parentElement;
      if (cover.classList.contains("is-revealing")) return;
      if (img.complete) {
        cover.classList.add("is-revealing");
      } else {
        img.addEventListener("load", () => cover.classList.add("is-revealing"), { once: true });
      }
    });
  }

  // ═══════════════════════════════════════════
  // 14. Staggered Card Entrance
  // ═══════════════════════════════════════════

  function staggerCards(gridSelector, root) {
    const scope = root || document;
    scope.querySelectorAll(gridSelector).forEach((grid) => {
      const cards = grid.querySelectorAll(".post-card:not(.stagger-in)");
      cards.forEach((card, i) => {
        card.classList.add("stagger-in");
        card.style.animationDelay = i * 55 + "ms";
      });
    });
  }

  // ═══════════════════════════════════════════
  // 15. Floating Decorative Elements
  // ═══════════════════════════════════════════

  function addFloatingEmojis() {
    const hero = document.querySelector(".hero-july");
    if (!hero || hero.dataset.floatReady || reduceMotion) return;
    hero.dataset.floatReady = "1";

    const emojis = ["🦀", "🍜", "🍰", "☕", "🌶️"];
    emojis.forEach((emoji) => {
      const el = document.createElement("span");
      el.textContent = emoji;
      el.setAttribute("aria-hidden", "true");
      el.style.cssText = `
        position: absolute;
        font-size: ${1.4 + Math.random() * 0.8}rem;
        left: ${10 + Math.random() * 80}%;
        top: ${20 + Math.random() * 60}%;
        z-index: 2;
        pointer-events: none;
        opacity: 0.1;
        animation: float ${3 + Math.random() * 2}s ease-in-out ${Math.random() * 2}s infinite;
      `;
      hero.appendChild(el);
    });
  }

  // ═══════════════════════════════════════════
  // 16. Apply gradient-text to hero em
  // ═══════════════════════════════════════════

  function enhanceHeroText() {
    document.querySelectorAll(".display em").forEach((el) => {
      el.classList.add("gradient-text");
    });
    document.querySelectorAll(".section-label").forEach((el) => {
      if (!el.classList.contains("shiny-text")) {
        el.classList.add("shiny-text");
      }
    });
  }

  // ═══════════════════════════════════════════
  // Boot & Refresh
  // ═══════════════════════════════════════════

  function bootHero() {
    addAurora();
    addAnimatedBg();
    initDotGrid();
    addFloatingEmojis();
    initParallax();
    addScrollIndicator();
    enhanceHeroText();

    initBlurReveal(".display", true);
    setTimeout(() => revealBlurText(), 200);

    initCounters();

    document.querySelectorAll(".btn-primary, .btn-ghost, .nav-cta").forEach((btn) => {
      btn.classList.add("btn-magnetic");
    });
    initMagneticButtons();
    initSpotlightCards();
  }

  function refreshDynamic(root) {
    addGlassCards(root);
    initTiltCards(root);
    initSpotlightCards(root);
    staggerCards(".picks-grid", root);
    staggerCards(".notes-grid", root);
    revealPostImages(root);
    window.observeReveals?.(root);
  }

  function boot() {
    bootHero();
    refreshDynamic(document);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.VisualEffects = {
    initCounters,
    runCounters,
    animateCounter,
    staggerCards,
    revealPostImages,
    initBlurReveal,
    revealBlurText,
    addGlassCards,
    initSpotlightCards,
    initTiltCards,
    refreshDynamic,
    bootHero,
  };
})();
