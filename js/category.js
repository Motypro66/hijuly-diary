const PU = window.PostUtils;
const LABELS = window.POST_LABELS;

const CATEGORIES = [
  { key: "all", label: "全部" },
  { key: "restaurant", label: "餐厅" },
  { key: "cafe", label: "Cafe" },
  { key: "kopitiam", label: "茶室" },
  { key: "hawker", label: "路边摊" },
  { key: "haokang", label: "好康" },
  { key: "haowu", label: "好物" },
];

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

function renderTabs(active, counts) {
  const el = document.getElementById("category-tabs");
  if (!el) return;
  el.innerHTML = CATEGORIES.filter((c) => c.key === "all" || (counts[c.key] || 0) > 0)
    .map(
      (c) =>
        `<a href="category.html?c=${c.key}" class="chip nav-to-category ${c.key === active ? "is-active" : ""}">${c.label}<span class="chip-count">${c.key === "all" ? counts.all : counts[c.key] || 0}</span></a>`
    )
    .join("");
}

async function init() {
  applyBranding();
  const params = new URLSearchParams(window.location.search);
  const cat = params.get("c") || "all";
  const meta = CATEGORIES.find((c) => c.key === cat) || CATEGORIES[0];

  document.getElementById("category-title").textContent =
    cat === "all" ? "按类型逛" : meta.label;
  document.getElementById("category-desc").textContent =
    cat === "all"
      ? "餐厅 · Cafe · 茶室 · 路边摊 · 好康 · 好物"
      : `${meta.label}类笔记`;
  document.getElementById("category-tagline").textContent = meta.label;

  try {
    const res = await fetch("data/posts.json");
    const all = await res.json();
    const counts = { all: all.length };
    all.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    renderTabs(cat, counts);

    const posts = cat === "all" ? all : all.filter((p) => p.category === cat);
    const grid = document.getElementById("category-posts");
    if (!posts.length) {
      grid.innerHTML = `<p class="recent-empty">这个类型还没有笔记。</p>`;
      return;
    }
    grid.innerHTML = posts.map((p) => postCard(p)).join("");
    bindXhs(grid, all);
    window.observeReveals?.(grid);
  } catch {
    document.getElementById("category-posts").innerHTML = `<p class="recent-empty">加载失败</p>`;
  }
}

document.addEventListener("DOMContentLoaded", init);
