const PU = window.PostUtils;

function applyBranding() {
  const cfg = window.SITE;
  if (!cfg) return;
  document.querySelectorAll("[data-site-name]").forEach((el) => {
    el.innerHTML = `${cfg.nameAccent}<span>${cfg.nameSuffix || ""}</span>`;
  });
  const fx = document.getElementById("footer-xhs");
  if (fx && cfg.xhsProfileUrl) fx.href = cfg.xhsProfileUrl;
}

function pickPost(posts, forcedId) {
  if (forcedId) {
    const found = posts.find((p) => p.id === forcedId);
    if (found) return found;
  }
  const food = posts.filter((p) => PU.isFoodPost(p));
  if (!food.length) return null;
  return food[Math.floor(Math.random() * food.length)];
}

function renderCard(post) {
  const el = document.getElementById("random-card");
  if (!el || !post) return;

  const src = PU.imageSrc(post);
  const hook = PU.hook(post);
  const maps = PU.googleMapsUrl(post);
  const mapBtn = maps
    ? `<a class="btn btn-sm" href="${maps}" target="_blank" rel="noopener noreferrer">📍 ${PU.mapsLinkLabel(post)}</a>`
    : "";

  el.innerHTML = `
    <div class="random-card__media">
      ${src ? `<img src="${src}" alt="" loading="lazy">` : `<div class="random-card__empty">🦀</div>`}
    </div>
    <div class="random-card__body">
      <h2 class="random-card__title">${post.title || "笔记"}</h2>
      ${hook ? `<p class="random-card__hook">${hook}</p>` : ""}
      ${post.address ? `<p class="random-card__addr">📍 ${PU.cleanMapsText(post.address)}</p>` : post.location ? `<p class="random-card__addr">${post.location}</p>` : ""}
      <div class="random-card__actions">
        <button type="button" class="btn btn-primary" id="random-xhs">见原帖</button>
        ${mapBtn}
      </div>
    </div>`;

  document.getElementById("random-xhs")?.addEventListener("click", () => PU.openXhs(post));
}

async function init() {
  applyBranding();
  const params = new URLSearchParams(window.location.search);
  const forced = params.get("pick");

  try {
    const res = await fetch("data/posts.json");
    const posts = await res.json();
    const post = pickPost(posts, forced);
    if (!post) {
      document.getElementById("random-card").innerHTML =
        `<p class="random-loading">美食笔记加载中…</p>`;
      return;
    }
    renderCard(post);
    window.observeReveals?.(document.querySelector(".random-main"));
  } catch {
    document.getElementById("random-card").innerHTML = `<p class="random-loading">加载失败，请刷新。</p>`;
  }
}

document.addEventListener("DOMContentLoaded", init);
