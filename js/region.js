const PU = window.PostUtils;
const LABELS = window.POST_LABELS;

const REGIONS = {
  kv: { label: "雪隆区", desc: "KL · PJ · Setapak · SS15 · Kepong · Cheras" },
  jb: { label: "新山 JB", desc: "Johor Bahru · Mount Austin" },
  klang: { label: "巴生", desc: "Klang · 巴生区" },
  other: { label: "其他", desc: "全马其他足迹" },
};

function applyBranding() {
  const cfg = window.SITE;
  if (!cfg) return;
  document.querySelectorAll("[data-site-name]").forEach((el) => {
    el.innerHTML = `${cfg.nameAccent}<span>${cfg.nameSuffix || ""}</span>`;
  });
  const fx = document.getElementById("footer-xhs");
  if (fx && cfg.xhsProfileUrl) fx.href = cfg.xhsProfileUrl;
}

function postCard(p) {
  const xhs = PU.xhsUrl(p);
  const showMap = PU.hasMaps(p);
  const hook = PU.hook(p);
  const tag = window.categoryLabel(p.category);
  return `
    <article class="post-card reveal">
      ${PU.coverImage(p)}
      <div class="post-info">
        <span class="post-tag tag-${p.category}">${tag}</span>
        <h3 class="post-title">${p.title}</h3>
        ${hook ? `<p class="post-hook">${hook}</p>` : ""}
        ${p.location ? `<p class="post-meta">${p.location}</p>` : ""}
      </div>
      <div class="post-actions">
        ${showMap ? `<a class="btn btn-sm" href="${PU.googleMapsUrl(p)}" target="_blank" rel="noopener noreferrer">📍 ${PU.mapsLinkLabel(p)}</a>` : ""}
        <a class="btn btn-sm btn-outline post-link-xhs" href="${xhs}" target="_blank" rel="noopener noreferrer" data-post-id="${p.id}">见原帖</a>
      </div>
    </article>`;
}

function bindXhs(root, posts) {
  root.querySelectorAll(".post-link-xhs[data-post-id]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const post = posts.find((p) => p.id === el.dataset.postId);
      if (post) PU.openXhs(post);
    });
  });
}

function renderTabs(active) {
  const el = document.getElementById("region-tabs");
  if (!el) return;
  el.innerHTML = Object.entries(REGIONS)
    .map(
      ([key, r]) =>
        `<a href="region.html?r=${key}" class="chip nav-to-region ${key === active ? "is-active" : ""}">${r.label}</a>`
    )
    .join("");
}

async function init() {
  applyBranding();
  const params = new URLSearchParams(window.location.search);
  const region = params.get("r") || "kv";
  const meta = REGIONS[region] || REGIONS.kv;

  document.getElementById("region-title").textContent = meta.label;
  document.getElementById("region-desc").textContent = meta.desc;
  document.getElementById("region-tagline").textContent = meta.label;

  renderTabs(region);

  try {
    const res = await fetch("data/posts.json");
    const all = await res.json();
    const posts = all.filter((p) => (p.region || "other") === region);
    const grid = document.getElementById("region-posts");
    if (!posts.length) {
      grid.innerHTML = `<p class="recent-empty">这个地区还没有笔记，看看其他地区吧。</p>`;
      return;
    }
    grid.innerHTML = posts.map((p) => postCard(p)).join("");
    bindXhs(grid, all);
    window.PostPreview?.registerPosts(all);
    window.PostPreview?.bindPreviews(grid);
    window.observeReveals?.(grid);
  } catch {
    document.getElementById("region-posts").innerHTML = `<p class="recent-empty">加载失败</p>`;
  }
}

document.addEventListener("DOMContentLoaded", init);
