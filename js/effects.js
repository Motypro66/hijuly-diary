/* ═══════════════════════════════════════════════
   小螃蟹看世界 · Visual Effects JavaScript
   React Bits-style: Sparkles, BlurReveal, Counter,
   Parallax, Shimmer Cards, Typewriter
   ═══════════════════════════════════════════ */

(function() {
  'use strict';

  // ═══════════════════════════════════════════
  // 1. Sparkle Particle System
  // ═══════════════════════════════════════════

  function createSparkles(container, count) {
    if (!container) return;
    const fragment = document.createDocumentFragment();
    const colors = ['#ff5c4d', '#ffb347', '#ff9a5c', '#2a6b7c', '#4a9db0'];

    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement('span');
      const isStar = Math.random() > 0.7;
      sparkle.className = 'sparkle' + (isStar ? ' sparkle--star' : '');

      const x = Math.random() * 100;
      const delay = Math.random() * 6;
      const duration = 3 + Math.random() * 5;
      const size = 2 + Math.random() * 4;
      const color = colors[Math.floor(Math.random() * colors.length)];

      sparkle.style.left = x + '%';
      sparkle.style.bottom = '-10px';
      sparkle.style.width = size + 'px';
      sparkle.style.height = size + 'px';
      sparkle.style.background = color;
      sparkle.style.animationDelay = delay + 's';
      sparkle.style.animationDuration = duration + 's';
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
      const text = el.textContent;
      el.innerHTML = '';
      el.classList.add('blur-reveal');

      if (stagger) {
        el.classList.add('blur-reveal--stagger');
        text.split('').forEach((char, i) => {
          const span = document.createElement('span');
          span.className = 'blur-reveal-char';
          span.textContent = char === ' ' ? ' ' : char;
          span.style.transitionDelay = (i * 30) + 'ms';
          el.appendChild(span);
        });
      } else {
        el.textContent = text;
      }
    });
  }

  function revealBlurText(root) {
    const els = root ? root.querySelectorAll('.blur-reveal') : document.querySelectorAll('.blur-reveal');
    els.forEach((el) => {
      setTimeout(() => el.classList.add('is-visible'), 100);
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
    const suffix = match[2] ? match[2].toUpperCase() : '';
    return { value: num, suffix, isK: suffix === 'K' };
  }

  function animateCounter(el, targetText) {
    const parsed = parseStatValue(targetText);
    if (!parsed) return;

    const startTime = performance.now();
    const duration = 1800;
    const isK = parsed.isK;

    el.classList.add('is-counted');

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);

      const currentValue = easedProgress * parsed.value;

      if (isK) {
        el.textContent = currentValue.toFixed(1) + 'K';
      } else {
        el.textContent = Math.floor(currentValue).toLocaleString();
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        // Final: ensure exact target
        el.textContent = targetText;
      }
    }

    requestAnimationFrame(update);
  }

  function initCounters(root) {
    const els = root ? root.querySelectorAll('.stat-val') : document.querySelectorAll('.stat-val');
    els.forEach((el) => {
      const target = el.textContent.trim();
      if (target && parseStatValue(target)) {
        el.dataset.target = target;
      }
    });
  }

  function runCounters(root) {
    const els = root ? root.querySelectorAll('.stat-val') : document.querySelectorAll('.stat-val');
    els.forEach((el, i) => {
      if (el.dataset.target) {
        setTimeout(() => animateCounter(el, el.dataset.target), i * 150);
      }
    });
  }

  // ═══════════════════════════════════════════
  // 4. Parallax on Mouse Move
  // ═══════════════════════════════════════════

  function initParallax() {
    const hero = document.querySelector('.hero-july');
    if (!hero) return;

    const blobs = hero.querySelectorAll('[data-parallax]');
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
            blob.style.transform = `translate(${x * speed * 100}px, ${y * speed * 100}px)`;
          });

          ticking = false;
        });
        ticking = true;
      }
    }

    // Only on desktop
    if (window.matchMedia('(hover: hover)').matches) {
      hero.addEventListener('mousemove', onMouseMove, { passive: true });
    }
  }

  // ═══════════════════════════════════════════
  // 5. Shimmer on Card Hover (enhanced)
  // ═══════════════════════════════════════════

  function addGlassCards() {
    document.querySelectorAll('.page-v4 .post-card').forEach((card) => {
      card.classList.add('glass-card', 'glass');
    });
  }

  // ═══════════════════════════════════════════
  // 6. Animated Background
  // ═══════════════════════════════════════════

  function addAnimatedBg() {
    const hero = document.querySelector('.hero-july');
    if (!hero) return;

    // Add noise overlay
    const noise = document.createElement('div');
    noise.className = 'hero-noise';
    hero.appendChild(noise);

    // Add sparkle container
    const sparkles = document.createElement('div');
    sparkles.className = 'hero-sparkles';
    hero.appendChild(sparkles);

    // Add animated gradient bg
    const bg = document.createElement('div');
    bg.className = 'hero-animated-bg';
    hero.insertBefore(bg, hero.firstChild);

    // Populate sparkles
    createSparkles(sparkles, window.innerWidth < 768 ? 15 : 35);
  }

  // ═══════════════════════════════════════════
  // 7. Scroll Hint
  // ═══════════════════════════════════════════

  function addScrollIndicator() {
    const hero = document.querySelector('.hero-july');
    if (!hero) return;

    const hint = document.createElement('div');
    hint.className = 'scroll-hint';
    hint.innerHTML = '<span>向下滚动</span><div class="scroll-hint__line"></div>';
    hero.appendChild(hint);

    // Hide after scrolling
    let hidden = false;
    window.addEventListener('scroll', () => {
      if (!hidden && window.scrollY > 100) {
        hint.style.opacity = '0';
        hint.style.transition = 'opacity 0.3s';
        hidden = true;
      }
    }, { passive: true });
  }

  // ═══════════════════════════════════════════
  // 8. Intersection Observer for Reveals
  // ═══════════════════════════════════════════

  function initRevealObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
      observer.observe(el);
    });
  }

  // ═══════════════════════════════════════════
  // 9. Magnetic Button Effect
  // ═══════════════════════════════════════════

  function initMagneticButtons() {
    document.querySelectorAll('.btn-magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // ═══════════════════════════════════════════
  // 10. Post Cover Reveal
  // ═══════════════════════════════════════════

  function revealPostImages() {
    document.querySelectorAll('.post-cover img').forEach((img) => {
      if (img.complete) {
        img.parentElement.classList.add('is-revealing');
      } else {
        img.addEventListener('load', () => {
          img.parentElement.classList.add('is-revealing');
        });
      }
    });
  }

  // ═══════════════════════════════════════════
  // 11. Staggered Card Entrance
  // ═══════════════════════════════════════════

  function staggerCards(gridSelector) {
    document.querySelectorAll(gridSelector).forEach((grid) => {
      const cards = grid.querySelectorAll('.post-card, .note-card');
      cards.forEach((card, i) => {
        card.classList.add('stagger-in');
        card.style.animationDelay = (i * 60) + 'ms';
      });
    });
  }

  // ═══════════════════════════════════════════
  // 12. Floating Decorative Elements
  // ═══════════════════════════════════════════

  function addFloatingEmojis() {
    const hero = document.querySelector('.hero-july');
    if (!hero) return;

    const emojis = ['🦀', '🍜', '🍰', '☕', '🌶️'];
    emojis.forEach((emoji, i) => {
      const el = document.createElement('span');
      el.textContent = emoji;
      el.style.cssText = `
        position: absolute;
        font-size: ${1.5 + Math.random()}rem;
        left: ${10 + Math.random() * 80}%;
        top: ${20 + Math.random() * 60}%;
        z-index: 2;
        pointer-events: none;
        opacity: 0.12;
        animation: float ${3 + Math.random() * 2}s ease-in-out ${Math.random() * 2}s infinite;
      `;
      hero.appendChild(el);
    });
  }

  // ═══════════════════════════════════════════
  // Boot
  // ═══════════════════════════════════════════

  function boot() {
    // Sparkles + animated bg
    addAnimatedBg();

    // Floating emojis
    addFloatingEmojis();

    // Parallax blobs
    initParallax();

    // Glassmorphism on cards
    addGlassCards();

    // Scroll hint
    addScrollIndicator();

    // Blur reveal on display heading
    const display = document.querySelector('.display');
    if (display) initBlurReveal('.display', true);

    // Counters
    initCounters();
    setTimeout(runCounters, 300);

    // Reveal observer
    initRevealObserver();

    // Stagger cards
    staggerCards('.picks-grid');
    staggerCards('.notes-grid');

    // Post cover reveal
    setTimeout(revealPostImages, 500);

    // Magnetic buttons
    document.querySelectorAll('.btn-primary, .btn-ghost').forEach((btn) => {
      btn.classList.add('btn-magnetic');
    });
    initMagneticButtons();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Expose for dynamic content (e.g., after post loading)
  window.VisualEffects = {
    initCounters,
    runCounters,
    staggerCards,
    revealPostImages,
    initBlurReveal,
    revealBlurText,
    initRevealObserver,
    addGlassCards,
  };

})();
