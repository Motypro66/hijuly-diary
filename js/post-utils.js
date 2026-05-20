/** Shared post helpers */
window.PostUtils = {
  imageSrc(post) {
    if (!post?.image) return "";
    return post.image;
  },

  hook(post) {
    return post.hook || post.excerpt || "";
  },

  xhsUrl(post) {
    if (post.xhsLink && !post.xhsLink.includes("/user/profile")) return post.xhsLink;
    if (post.xhsNoteId) {
      return `https://www.xiaohongshu.com/explore/${post.xhsNoteId}`;
    }
    return window.SITE?.xhsProfileUrl || "#";
  },

  googleMapsUrl(post) {
    if (post.googleMapsUrl) return post.googleMapsUrl;
    if (post.mapsQuery) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(post.mapsQuery)}`;
    }
    if (post.lat != null && post.lng != null) {
      return `https://www.google.com/maps/search/?api=1&query=${post.lat},${post.lng}`;
    }
    if (post.location) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(post.location + ", Malaysia")}`;
    }
    return "";
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
