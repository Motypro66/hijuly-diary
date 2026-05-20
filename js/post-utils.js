/** Shared post helpers */
window.PostUtils = {
  imageSrc(post) {
    if (!post?.image) return "";
    return post.image;
  },

  hook(post) {
    return post.hook || post.excerpt?.split("\n")[0]?.replace(/^\[.*?\]\s*/, "") || "";
  },

  xhsNoteId(post) {
    if (post.xhsNoteId) return post.xhsNoteId;
    const link = post.xhsLink || "";
    const m = link.match(/(?:explore|discovery\/item|item)\/([a-f0-9]+)/i);
    return m ? m[1] : "";
  },

  xhsUrl(post) {
    if (post.xhsLink && post.xhsLink.includes("xsec_token=")) return post.xhsLink;
    const id = this.xhsNoteId(post);
    if (!id) return window.SITE?.xhsProfileUrl || "#";
    let url = `https://www.xiaohongshu.com/explore/${id}`;
    if (post.xsecToken) url += `?xsec_token=${post.xsecToken}&xsec_source=pc_user`;
    return url;
  },

  /** 清理 emoji 前缀，只用帖子里的店名+地址 */
  cleanMapsText(str) {
    if (!str) return "";
    return str.replace(/^📍\s*/u, "").replace(/📍/gu, "").replace(/^\[打卡R\]\s*/i, "").trim();
  },

  mapsSearchQuery(post) {
    const q = post.mapsQuery ? this.cleanMapsText(post.mapsQuery) : "";
    if (q) return q;
    const name = this.cleanMapsText(post.placeName || "");
    const addr = this.cleanMapsText(post.address || "");
    if (name && addr) return `${name}, ${addr}`;
    if (name) return name;
    return this.cleanMapsText(post.address || "");
  },

  mapsLinkLabel(post) {
    const name = this.cleanMapsText(post.placeName || "");
    if (name) return name;
    const q = this.mapsSearchQuery(post);
    if (!q) return "";
    return q.split(",")[0].trim();
  },

  googleMapsUrl(post) {
    const q = this.mapsSearchQuery(post);
    if (!q) return "";
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  },

  hasMaps(post) {
    return !!this.mapsSearchQuery(post);
  },

  isFoodPost(post) {
    return post.isFood === true;
  },

  openXhs(post) {
    if (window.XhsModal) {
      window.XhsModal.open(post);
      return true;
    }
    const url = this.xhsUrl(post);
    if (url && url !== "#") {
      window.open(url, "_blank", "noopener,noreferrer");
      return true;
    }
    return false;
  },

  coverImage(post, className = "post-cover") {
    const src = this.imageSrc(post);
    const alt = (post.title || "笔记封面").replace(/"/g, "&quot;");
    if (!src) {
      return `<div class="${className} post-cover--empty crab-walk-surface" aria-hidden="true"><span>🦀</span></div>`;
    }
    const href = this.hasMaps(post)
      ? `map.html?id=${encodeURIComponent(post.id)}`
      : `random.html?pick=${encodeURIComponent(post.id)}`;
    return `
      <a class="${className} crab-walk-surface" href="${href}" tabindex="-1" aria-hidden="true">
        <img src="${src}" alt="${alt}" loading="lazy" decoding="async"
             onerror="this.closest('.post-cover').classList.add('is-broken')">
      </a>`;
  },
};
