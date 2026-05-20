const TAG_LABELS = {
  hawker: "路边摊",
  kopitiam: "茶室",
  cafe: "Cafe",
  restaurant: "餐厅",
  haokang: "好康",
  haowu: "好物",
};

let POSTS = [];
let map = null;
let markers = [];
let activeFilter = "all";
let activeId = null;

async function loadPosts() {
  try {
    const res = await fetch("data/posts.json");
    if (!res.ok) throw new Error(`posts.json HTTP ${res.status}`);
    POSTS = await res.json();
  } catch (e) {
    console.warn("Could not load posts.json:", e);
    POSTS = [];
    const list = document.getElementById("post-list");
    if (list) {
      list.innerHTML = `
        <div class="panel-empty">
          <div class="emoji">⚠️</div>
          <p><strong>数据文件未找到</strong></p>
          <p style="margin-top:0.5rem;font-size:12px;line-height:1.6">
            请确认部署时包含整个文件夹：<br>
            <code>data/posts.json</code>、<code>css/</code>、<code>js/</code>
          </p>
        </div>`;
    }
    const stat = document.getElementById("map-stat");
    if (stat) stat.textContent = "数据加载失败";
  }
}

function getFiltered() {
  if (activeFilter === "all") return POSTS;
  return POSTS.filter((p) => p.category === activeFilter);
}

function initMap() {
  map = L.map("map", {
    center: [4.2, 109.0],
    zoom: 6,
    zoomControl: true,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
    maxZoom: 19,
  }).addTo(map);

  renderAll();

  if (POSTS.length > 0) {
    const bounds = L.latLngBounds(POSTS.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds.pad(0.15));
  }
}

function renderAll() {
  renderList();
  renderMarkers();
  updateStat();
}

function renderList() {
  const list = document.getElementById("post-list");
  if (!list) return;

  const posts = getFiltered();

  if (posts.length === 0) {
    list.innerHTML = `
      <div class="panel-empty">
        <div class="emoji">🍜</div>
        <p><strong>地图还是空的</strong></p>
        <p style="margin-top:0.5rem">发第一篇小红书笔记后，这里会出现标点。</p>
      </div>`;
    return;
  }

  const PU = window.PostUtils;
  list.innerHTML = posts
    .map(
      (p) => `
    <article class="post-item ${activeId === p.id ? "active" : ""} ${p.isDemo ? "demo" : ""}"
             data-id="${p.id}" role="button" tabindex="0">
      ${PU && PU.imageSrc(p) ? `<div class="post-thumb"><img src="${PU.imageSrc(p)}" alt="" loading="lazy"></div>` : ""}
      <div class="post-item-body">
        <span class="post-tag tag-${p.category}">${TAG_LABELS[p.category] || p.category}</span>
        <h3>${p.title}</h3>
        <div class="post-meta">${p.location}</div>
      </div>
    </article>`
    )
    .join("");

  list.querySelectorAll(".post-item").forEach((el) => {
    el.addEventListener("click", () => selectPost(el.dataset.id));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectPost(el.dataset.id);
      }
    });
  });
}

function renderMarkers() {
  markers.forEach((m) => map.removeLayer(m));
  markers = [];

  const posts = getFiltered();

  posts.forEach((p, i) => {
    const icon = L.divIcon({
      html: `<div class="pin-wrap ${activeId === p.id ? "active" : ""} ${p.isDemo ? "demo-pin" : ""}">
               <span class="pin-num">${i + 1}</span>
             </div>`,
      className: "",
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -28],
    });

    const PU = window.PostUtils;
    const xhs = PU ? PU.xhsUrl(p) : p.xhsLink || "#";
    const gmap = PU ? PU.googleMapsUrl(p) : "";
    const mapLabel = PU ? PU.mapsLinkLabel(p) : "Google 地图";
    const gmapBtn = gmap
      ? `<a class="popup-link popup-maps" href="${gmap}" target="_blank" rel="noopener noreferrer">📍 ${mapLabel}</a>`
      : "";

    const marker = L.marker([p.lat, p.lng], { icon })
      .addTo(map)
      .bindPopup(
        `<div class="popup-box">
          <span class="post-tag tag-${p.category}">${TAG_LABELS[p.category] || ""}</span>
          <h3>${p.title}</h3>
          <p class="popup-loc">${p.location}</p>
          <div class="popup-actions">
            ${gmapBtn}
            <a class="popup-link popup-xhs" href="${xhs}" target="_blank" rel="noopener noreferrer">见原帖 →</a>
            <button type="button" class="popup-detail" onclick="window.selectPost('${p.id}')">详情</button>
          </div>
        </div>`
      );

    marker.on("click", () => selectPost(p.id));
    markers.push(marker);
  });
}

function selectPost(id) {
  activeId = id;
  const post = POSTS.find((p) => p.id === id);
  if (!post || !map) return;

  renderList();
  renderMarkers();

  map.flyTo([post.lat, post.lng], 15, { duration: 0.8 });

  const idx = getFiltered().findIndex((p) => p.id === id);
  if (idx >= 0 && markers[idx]) markers[idx].openPopup();

  showDetail(post);

  if (window.innerWidth < 900) {
    document.getElementById("post-panel")?.classList.remove("open");
  }
}

function showDetail(post) {
  const sheet = document.getElementById("detail-sheet");
  if (!sheet) return;

  const tagEl = document.getElementById("detail-tag");
  if (tagEl) {
    tagEl.className = `post-tag tag-${post.category}`;
    tagEl.textContent = TAG_LABELS[post.category] || post.category;
  }

  const demoBadge = document.getElementById("detail-demo-badge");
  if (demoBadge) demoBadge.hidden = !post.isDemo;

  document.getElementById("detail-title").textContent = post.title;
  document.getElementById("detail-loc").textContent = post.location;
  const priceEl = document.getElementById("detail-price");
  if (priceEl) priceEl.hidden = true;

  document.getElementById("detail-body").textContent =
    post.body || post.excerpt || "";

  const tipEl = document.getElementById("detail-tip");
  if (post.introvertTip) {
    tipEl.hidden = false;
    tipEl.querySelector(".tip-text").textContent = post.introvertTip;
  } else {
    tipEl.hidden = true;
  }

  const coverEl = document.getElementById("detail-cover");
  const PU = window.PostUtils;
  if (coverEl && PU) {
    const src = PU.imageSrc(post);
    if (src) {
      coverEl.hidden = false;
      coverEl.innerHTML = `<img src="${src}" alt="${post.title.replace(/"/g, "&quot;")}" loading="lazy">`;
    } else {
      coverEl.hidden = true;
      coverEl.innerHTML = "";
    }
  }

  const link = document.getElementById("detail-xhs");
  if (link) {
    const url = PU ? PU.xhsUrl(post) : post.xhsLink;
    if (url && url !== "#") {
      link.href = url;
      link.hidden = false;
      link.textContent = "见原帖 →";
      link.onclick = (e) => {
        e.preventDefault();
        window.open(url, "_blank", "noopener,noreferrer");
      };
    } else {
      link.hidden = true;
      link.removeAttribute("href");
      link.onclick = null;
    }
  }

  const mapsEl = document.getElementById("detail-maps");
  if (mapsEl && PU) {
    const gurl = PU.googleMapsUrl(post);
    if (gurl) {
      mapsEl.href = gurl;
      mapsEl.hidden = false;
      mapsEl.classList.add("is-named");
      mapsEl.textContent = `📍 ${PU.mapsLinkLabel(post)}`;
    } else {
      mapsEl.hidden = true;
      mapsEl.classList.remove("is-named");
    }
  }

  sheet.classList.add("open");
}

function closeDetail() {
  document.getElementById("detail-sheet")?.classList.remove("open");
  activeId = null;
  renderList();
  renderMarkers();
}

function filterPosts(cat, btn) {
  activeFilter = cat;
  activeId = null;
  closeDetail();

  document.querySelectorAll(".filter-pill").forEach((b) => b.classList.remove("active"));
  btn?.classList.add("active");

  renderAll();

  const posts = getFiltered();
  if (posts.length > 0) {
    const bounds = L.latLngBounds(posts.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds.pad(0.12));
  }
}

function updateStat() {
  const el = document.getElementById("map-stat");
  if (el) {
    const n = getFiltered().length;
    const demo = getFiltered().some((p) => p.isDemo);
    el.textContent = `${n} 个足迹`;
  }
}

function togglePanel() {
  document.getElementById("post-panel")?.classList.toggle("open");
}

function setupUI() {
  document.querySelectorAll(".filter-pill").forEach((btn) => {
    btn.addEventListener("click", () => filterPosts(btn.dataset.filter, btn));
  });

  document.getElementById("btn-list")?.addEventListener("click", togglePanel);
  document.getElementById("sheet-close")?.addEventListener("click", closeDetail);

  if (window.innerWidth >= 900) {
    document.getElementById("post-panel")?.classList.remove("collapsed");
  }
}

window.selectPost = selectPost;
window.filterPosts = filterPosts;

function openPostFromQuery() {
  const id = new URLSearchParams(window.location.search).get("id");
  if (id) selectPost(id);
}

function applySiteBranding() {
  const cfg = window.SITE;
  if (!cfg) return;
  const suffix = cfg.nameSuffix || "";
  document.querySelectorAll("[data-site-name]").forEach((el) => {
    el.innerHTML = `${cfg.nameAccent}<span>${suffix}</span>`;
  });
  const tipLabel = document.querySelector("[data-tip-label]");
  if (tipLabel && cfg.tipLabel) tipLabel.textContent = cfg.tipLabel;
  const navXhs = document.getElementById("nav-xhs");
  if (navXhs && cfg.xhsProfileUrl) navXhs.href = cfg.xhsProfileUrl;
}

function openCategoryFromQuery() {
  const cat = new URLSearchParams(window.location.search).get("cat");
  if (!cat) return;
  const btn = document.querySelector(`.filter-pill[data-filter="${cat}"]`);
  if (btn) filterPosts(cat, btn);
}

document.addEventListener("DOMContentLoaded", async () => {
  applySiteBranding();
  await loadPosts();
  if (document.getElementById("map")) {
    initMap();
    setupUI();
    openPostFromQuery();
    openCategoryFromQuery();
  }
});
