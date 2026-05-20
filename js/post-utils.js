/** Shared post helpers */
window.PostUtils = {
  imageSrc(post) {
    if (!post?.image) return "";
    return post.image;
  },

  hook(post) {
    return post.hook || post.excerpt || "";
  },

  xhsNoteId(post) {
    if (post.xhsNoteId) return post.xhsNoteId;
    const link = post.xhsLink || "";
    const m = link.match(/(?:explore|discovery\/item|item)\/([a-f0-9]+)/i);
    return m ? m[1] : "";
  },

  /** 电脑浏览器更稳的笔记链接 */
  xhsUrl(post) {
    const id = this.xhsNoteId(post);
    if (id) {
      return `https://www.xiaohongshu.com/discovery/item/${id}`;
    }
    if (post.xhsLink && !post.xhsLink.includes("/user/profile")) {
      return post.xhsLink.replace(/\/explore\//, "/discovery/item/");
    }
    return window.SITE?.xhsProfileUrl || "#";
  },

  /** Google 地图搜索词：优先店名 */
  mapsSearchQuery(post) {
    if (post.mapsQuery) return post.mapsQuery;
    if (post.placeName) {
      const loc = (post.location || "").replace(/\s*·\s*/g, ", ");
      return loc ? `${post.placeName}, ${loc}, Malaysia` : `${post.placeName}, Malaysia`;
    }
    const eat = ["restaurant", "cafe", "hawker", "kopitiam"];
    if (eat.includes(post.category) && post.location && !/居家|食谱/.test(post.location)) {
      return `${post.location}, Malaysia`;
    }
    if (post.lat != null && post.lng != null) {
      return `${post.lat},${post.lng}`;
    }
    if (post.location) {
      return `${post.location}, Malaysia`;
    }
    return "";
  },

  mapsLinkLabel(post) {
    if (post.placeName) return post.placeName;
    if (post.location && !/居家|食谱/.test(post.location)) {
      return post.location.split("·")[0].trim();
    }
    return "Google 地图";
  },

  googleMapsUrl(post) {
    if (post.googleMapsUrl) return post.googleMapsUrl;
    const q = this.mapsSearchQuery(post);
    if (!q) return "";
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  },

  openXhs(post) {
    const url = this.xhsUrl(post);
    if (!url || url === "#") return false;
    window.open(url, "_blank", "noopener,noreferrer");
    return true;
  },

  coverImage(post, className = "post-cover") {
    const src = this.imageSrc(post);
    const alt = (post.title || "笔记封面").replace(/"/g, "&quot;");
    if (!src) {
      return `<div class="${className} post-cover--empty crab-walk-surface" aria-hidden="true"><span>🦀</span></div>`;
    }
    return `
      <a class="${className} crab-walk-surface" href="map.html?id=${encodeURIComponent(post.id)}" tabindex="-1" aria-hidden="true">
        <img src="${src}" alt="${alt}" loading="lazy" decoding="async"
             onerror="this.closest('.post-cover').classList.add('is-broken')">
      </a>`;
  },
};
