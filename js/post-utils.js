/** Shared post helpers */
window.PostUtils = {
  imageSrc(post) {
    if (!post?.image) return "";
    return post.image;
  },

  hook(post) {
    return post.hook || post.excerpt?.split("\n")[0] || "";
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
    if (post.xsecToken) {
      url += `?xsec_token=${post.xsecToken}&xsec_source=pc_user`;
    }
    return url;
  },

  /** Google 地图：只用帖子里的完整地址（address / mapsQuery），没有就不显示 */
  mapsSearchQuery(post) {
    if (post.address) return post.address;
    if (post.mapsQuery) return post.mapsQuery;
    return "";
  },

  mapsLinkLabel(post) {
    if (post.placeName) return post.placeName;
    const q = this.mapsSearchQuery(post);
    if (!q) return "";
    if (post.location && post.location.length > 2 && !/^\d+$/.test(post.location)) {
      return post.location;
    }
    const parts = q.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2 && /^\d/.test(parts[0])) {
      return parts.slice(0, 2).join(", ");
    }
    return parts[0] || "导航";
  },

  googleMapsUrl(post) {
    if (post.googleMapsUrl) return post.googleMapsUrl;
    const q = this.mapsSearchQuery(post);
    if (!q) return "";
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  },

  hasMaps(post) {
    return !!this.googleMapsUrl(post);
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
    const mapHref = post.lat != null && post.lng != null
      ? `map.html?id=${encodeURIComponent(post.id)}`
      : this.hasMaps(post)
        ? `map.html?id=${encodeURIComponent(post.id)}`
        : `random.html?pick=${encodeURIComponent(post.id)}`;
    return `
      <a class="${className} crab-walk-surface" href="${mapHref}" tabindex="-1" aria-hidden="true">
        <img src="${src}" alt="${alt}" loading="lazy" decoding="async"
             onerror="this.closest('.post-cover').classList.add('is-broken')">
      </a>`;
  },
};
