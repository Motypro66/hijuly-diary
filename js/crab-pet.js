/**
 * 小螃蟹只在「封面图顶边」走路，避开所有文字区
 */
(function () {
  if (!document.body.classList.contains("page-home")) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pet = document.getElementById("crab-pet");
  const bubble = document.getElementById("crab-bubble");
  if (!pet || !bubble) return;

  const CRAB_W = 52;
  const CRAB_H = 42;
  const WALK_SPEED = 85;
  const lines = window.SITE?.crabLines || ["你饿了？来找吃吗？🦀"];
  let lineIdx = 0;
  let platforms = [];
  let currentIdx = -1;
  let walking = false;
  let walkTimer;

  function say(msg) {
    bubble.textContent = msg;
    bubble.hidden = false;
    pet.classList.add("is-talking");
    clearTimeout(pet._hideTimer);
    pet._hideTimer = setTimeout(() => {
      bubble.hidden = true;
      pet.classList.remove("is-talking");
    }, 3800);
  }

  function nextLine() {
    say(lines[lineIdx++ % lines.length]);
  }

  /** 文字禁区：螃蟹不可进入 */
  function textZones() {
    const sel = [
      ".hero-copy",
      ".post-info",
      ".post-actions",
      ".section-head",
      ".step-card",
      ".stat-card",
      ".chip-row",
      ".cta-inner",
      ".site-footer-july",
      ".site-bar-july",
      "h1",
      "h2",
      "h3",
      "p",
      ".btn",
    ];
    const zones = [];
    sel.forEach((s) => {
      document.querySelectorAll(s).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width < 8 || r.height < 8) return;
        zones.push({
          left: r.left - 12,
          right: r.right + 12,
          top: r.top - 8,
          bottom: r.bottom + 8,
        });
      });
    });
    return zones;
  }

  function hitsText(x, y) {
    const cx = x + CRAB_W / 2;
    const cy = y + CRAB_H / 2;
    for (const z of textZones()) {
      if (cx >= z.left && cx <= z.right && cy >= z.top && cy <= z.bottom) {
        return true;
      }
    }
    return false;
  }

  /** 只收集封面图顶边 */
  function collectPlatforms() {
    const list = [];
    document.querySelectorAll(".crab-walk-surface").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 60 || r.height < 40) return;
      if (r.bottom < 80 || r.top > window.innerHeight + 40) return;

      const x = r.left + r.width / 2 - CRAB_W / 2;
      const y = r.top - CRAB_H + 8;
      if (hitsText(x, y)) return;

      list.push({ el, x, y, w: r.width });
    });
    list.sort((a, b) => a.y - b.y || a.x - b.x);
    return list;
  }

  function setFacing(dx) {
    pet.style.setProperty("--face", dx >= 0 ? "1" : "-1");
  }

  function moveTo(index) {
    const p = platforms[index];
    if (!p || walking) return;

    walking = true;
    pet.classList.add("is-walking");

    const curX = parseFloat(pet.dataset.x || "0");
    const curY = parseFloat(pet.dataset.y || "0");
    const targetX = p.x;
    const targetY = p.y;

    const dist = Math.hypot(targetX - curX, targetY - curY);
    const sec = Math.max(0.5, Math.min(3, dist / WALK_SPEED));

    setFacing(targetX - curX);
    pet.style.transition = `left ${sec}s linear, top ${sec}s linear`;
    pet.style.left = `${targetX}px`;
    pet.style.top = `${targetY}px`;
    pet.dataset.x = String(targetX);
    pet.dataset.y = String(targetY);
    currentIdx = index;

    setTimeout(() => {
      walking = false;
      pet.classList.remove("is-walking");
    }, sec * 1000 + 50);
  }

  function pickNextIndex() {
    if (platforms.length === 0) return -1;
    if (platforms.length === 1) return 0;

    const cur = currentIdx >= 0 ? platforms[currentIdx] : null;
    const nearby = platforms
      .map((p, i) => ({ i, p }))
      .filter(({ i, p }) => {
        if (i === currentIdx) return false;
        if (!cur) return true;
        return Math.abs(p.y - cur.y) < 280 && Math.abs(p.x - cur.x) < window.innerWidth * 0.7;
      });

    const pool = nearby.length ? nearby : platforms.map((p, i) => ({ i, p }));
    return pool[Math.floor(Math.random() * pool.length)].i;
  }

  function stepWalk() {
    if (reduceMotion || walking) return;
    platforms = collectPlatforms();
    if (!platforms.length) return;
    const next = pickNextIndex();
    if (next >= 0) moveTo(next);
  }

  function refresh() {
    platforms = collectPlatforms();
    if (currentIdx < 0 && platforms.length) {
      moveTo(0);
    }
  }

  pet.addEventListener("click", (e) => {
    e.stopPropagation();
    nextLine();
    stepWalk();
  });

  document.addEventListener("click", () => {
    if (!bubble.hidden) {
      bubble.hidden = true;
      pet.classList.remove("is-talking");
    }
  });
  bubble.addEventListener("click", (e) => e.stopPropagation());

  let scrollT;
  window.addEventListener(
    "scroll",
    () => {
      clearTimeout(scrollT);
      pet.classList.add("is-paused");
      scrollT = setTimeout(() => {
        pet.classList.remove("is-paused");
        refresh();
      }, 450);
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    currentIdx = -1;
    refresh();
  });

  window.initCrabWalker = function () {
    setTimeout(refresh, 300);
    if (!reduceMotion) {
      walkTimer = setInterval(stepWalk, 4800);
    } else {
      pet.style.cssText = "right:1rem;bottom:5rem;left:auto;top:auto;";
    }
  };

  window.addEventListener("beforeunload", () => clearInterval(walkTimer));
})();
