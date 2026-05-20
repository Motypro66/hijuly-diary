const TAG_LABELS = {
  hawker: "路边摊",
  kopitiam: "茶室",
  cafe: "Cafe",
  restaurant: "餐厅",
  haokang: "好康",
  haowu: "好物",
};

const PU = window.PostUtils;
const ARCHIVE_INITIAL = 8;

function applySiteBranding() {
  const cfg = window.SITE;
  if (!cfg) return;

  document.querySelectorAll("[data-site-name]").forEach((el) => {
    el.innerHTML = `${cfg.nameAccent}<span>${cfg.nameSuffix || ""}</span>`;
  });

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el && val != null) el.textContent = val;
  };

  set("profile-bio", cfg.bio);
  set("profile-bio-sub", cfg.bioSub || "美食 · 好康 · 好物");
  set("series-name", cfg.seriesName);
  if (cfg.stats) {
    set("stat-following", cfg.stats.following);
    set("stat-followers", cfg.stats.followers);
    set("stat-likes", cfg.stats.likes);
  }

  const pills = document.getElementById("identity-pills");
  if (pills && cfg.identityTags) {
    pills.innerHTML = cfg.identityTags
      .map((t) => `<span class="identity-pill">${t}</span>`)
      .join("");
  }

  const url = cfg.xhsProfileUrl;
  ["home-xhs-btn", "nav-xhs", "footer-xhs"].forEach((id) => {
    const el = document.getElementById(id);
    if (el && url) el.href = url;
  });
}

function postCard(p, opts = {}) {
  const { featured = false, revealDelay = 0 } = opts;
  const xhs = PU.xhsUrl(p);
  const mapUrl = `map.html?id=${encodeURIComponent(p.id)}`;
  const delayAttr = revealDelay ? ` data-reveal-delay="${revealDelay}"` : "";
  const title = p.title || "笔记";
  const hook = PU.hook(p);
  const location = p.location || "";
  const showMap = (p.lat != null && p.lng != null) || PU.hasMaps(p);

  return `
    <article class="post-card reveal${featured ? " post-card--featured" : ""}"${delayAttr}>
      ${PU.coverImage(p)}
      <div class="post-info">
        <div class="post-tags">
          ${featured ? '<span class="pick-badge">精选</span>' : ""}
          <span class="post-tag tag-${p.category}">${TAG_LABELS[p.category] || p.category}</span>
        </div>
        <h3 class="post-title">${title}</h3>
        ${hook ? `<p class="post-hook">${hook}</p>` : ""}
        ${location ? `<p class="post-meta">${location}</p>` : ""}
      </div>
      <div class="post-actions">
        ${showMap ? `<a class="btn btn-sm post-link-map" href="${mapUrl}">地图</a>` : ""}
        <a class="btn btn-sm btn-outline post-link-xhs" href="${xhs}" target="_blank" rel="noopener noreferrer" data-post-id="${p.id}">见原帖</a>
      </div>
    </article>`;
}

function renderCategoryChips(posts, active = "all") {
  const el = document.getElementById("category-chips");
  if (!el) return;

  const counts = {};
  posts.forEach((p) => {
    counts[p.category] = (counts[p.category] || 0) + 1;
  });

  const items = [
    { key: "all", label: "全部", count: posts.length },
    ...Object.entries(TAG_LABELS).map(([key, label]) => ({
      key,
      label,
      count: counts[key] || 0,
    })),
  ].filter((x) => x.key === "all" || x.count > 0);

  el.innerHTML = items
    .map(
      (x) => `
    <a href="map.html${x.key === "all" ? "" : `?cat=${x.key}`}"
       class="chip ${active === x.key ? "is-active" : ""}">
      ${x.label}<span class="chip-count">${x.count}</span>
    </a>`
    )
    .join("");
}

let archiveAll = [];

function renderArchive(posts, expanded) {
  const recentEl = document.getElementById("recent-posts");
  const moreWrap = document.getElementById("archive-more-wrap");
  if (!recentEl) return;

  const show = expanded ? posts : posts.slice(0, ARCHIVE_INITIAL);
  recentEl.innerHTML = show
    .map((p, i) => postCard(p, { revealDelay: (i % 6) * 50 }))
    .join("");
  window.observeReveals?.(recentEl);

  if (moreWrap) {
    if (posts.length <= ARCHIVE_INITIAL) {
      moreWrap.hidden = true;
    } else {
      moreWrap.hidden = false;
      const btn = document.getElementById("btn-show-more");
      if (btn) {
        btn.textContent = expanded
          ? "收起"
          : `看更多（还有 ${posts.length - ARCHIVE_INITIAL} 篇）`;
        btn.dataset.expanded = expanded ? "1" : "0";
      }
    }
  }

  window.initCrabWalker?.();
  bindPostXhsLinks(recentEl);
}

function bindPostXhsLinks(root) {
  if (!root || !PU) return;
  root.querySelectorAll(".post-link-xhs[data-post-id]").forEach((el) => {
    el.addEventListener("click", (e) => {
      const id = el.dataset.postId;
      const post = archiveAll.find((p) => p.id === id);
      if (!post) return;
      e.stopPropagation();
      e.preventDefault();
      PU.openXhs(post);
    });
  });
}

async function loadHomePosts() {
  const featuredEl = document.getElementById("featured-posts");
  const archiveDesc = document.getElementById("archive-desc");

  try {
    const res = await fetch("data/posts.json");
    if (!res.ok) throw new Error(String(res.status));
    archiveAll = await res.json();

    const statPosts = document.getElementById("stat-posts");
    if (statPosts) statPosts.textContent = String(archiveAll.length);
    if (archiveDesc) {
      archiveDesc.textContent = `共 ${archiveAll.length} 篇 · 先显示 ${ARCHIVE_INITIAL} 篇 · 点「看更多」浏览全部`;
    }

    if (featuredEl) {
      const list = archiveAll.slice(0, 3);
      featuredEl.innerHTML = list
        .map((p, i) => postCard(p, { featured: true, revealDelay: i * 70 }))
        .join("");
      window.observeReveals?.(featuredEl);
      bindPostXhsLinks(featuredEl);
    }

    renderCategoryChips(archiveAll);
    renderArchive(archiveAll, false);
  } catch {
    const recentEl = document.getElementById("recent-posts");
    if (recentEl) {
      recentEl.innerHTML = `<p class="recent-empty">无法加载笔记。</p>`;
    }
    if (featuredEl) {
      featuredEl.innerHTML = `<p class="recent-empty">精选加载失败</p>`;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  applySiteBranding();
  loadHomePosts();

  document.getElementById("btn-show-more")?.addEventListener("click", () => {
    const btn = document.getElementById("btn-show-more");
    const expanded = btn?.dataset.expanded === "1";
    renderArchive(archiveAll, !expanded);
    if (!expanded) {
      document.getElementById("archive-more-wrap")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });
});
