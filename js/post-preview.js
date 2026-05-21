/**
 * 笔记封面放大预览 — 背景模糊，不跳转随机页
 */
(function () {
  const PU = window.PostUtils;
  let postsById = new Map();

  function ensureModal() {
    let el = document.getElementById("post-preview");
    if (el) return el;
    el = document.createElement("div");
    el.id = "post-preview";
    el.className = "post-preview";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = `
      <div class="post-preview__backdrop" data-close-preview></div>
      <div class="post-preview__dialog" role="dialog" aria-modal="true" aria-labelledby="post-preview-title">
        <button type="button" class="post-preview__close" data-close-preview aria-label="关闭">×</button>
        <div class="post-preview__media" id="post-preview-media"></div>
        <div class="post-preview__body">
          <span class="post-tag" id="post-preview-tag"></span>
          <h2 id="post-preview-title" class="post-preview__title"></h2>
          <p id="post-preview-hook" class="post-preview__hook" hidden></p>
          <p id="post-preview-loc" class="post-preview__loc" hidden></p>
          <div class="post-preview__actions">
            <button type="button" class="btn btn-primary" id="post-preview-xhs">见原帖 →</button>
            <a class="btn btn-sm" id="post-preview-map" href="#" target="_blank" rel="noopener noreferrer" hidden></a>
          </div>
        </div>
      </div>`;
    document.body.appendChild(el);

    el.querySelectorAll("[data-close-preview]").forEach((node) => {
      node.addEventListener("click", close);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && el.classList.contains("is-open")) close();
    });
    return el;
  }

  function open(post) {
    if (!post) return;
    const modal = ensureModal();
    const src = PU?.imageSrc(post);
    const media = document.getElementById("post-preview-media");
    const tag = document.getElementById("post-preview-tag");
    const title = document.getElementById("post-preview-title");
    const hook = document.getElementById("post-preview-hook");
    const loc = document.getElementById("post-preview-loc");
    const xhsBtn = document.getElementById("post-preview-xhs");
    const mapLink = document.getElementById("post-preview-map");

    if (media) {
      media.innerHTML = src
        ? `<img src="${src}" alt="${(post.title || "").replace(/"/g, "&quot;")}" decoding="async">`
        : `<div class="post-preview__empty">🦀</div>`;
    }

    if (tag) {
      tag.className = `post-tag tag-${post.category}`;
      tag.textContent = window.POST_LABELS?.[post.category] || post.category;
    }
    if (title) title.textContent = post.title || "笔记";

    const hookText = PU?.hook(post);
    if (hook) {
      hook.hidden = !hookText;
      hook.textContent = hookText || "";
    }

    const locText = PU?.mapsLinkLabel(post) || post.location || "";
    if (loc) {
      loc.hidden = !locText;
      loc.textContent = locText;
    }

    if (xhsBtn) {
      xhsBtn.onclick = () => PU?.openXhs(post);
    }

    const gurl = PU?.googleMapsUrl(post);
    if (mapLink) {
      if (gurl) {
        mapLink.href = gurl;
        mapLink.hidden = false;
        mapLink.textContent = `📍 ${PU.mapsLinkLabel(post) || "导航"}`;
      } else {
        mapLink.hidden = true;
      }
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("preview-open");
  }

  function close() {
    const modal = document.getElementById("post-preview");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("preview-open");
  }

  function registerPosts(posts) {
    postsById = new Map((posts || []).map((p) => [p.id, p]));
  }

  function bindPreviews(root) {
    if (!root) return;
    root.querySelectorAll("[data-post-preview]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const id = el.dataset.postPreview;
        const post = postsById.get(id);
        if (post) open(post);
      });
    });
  }

  window.PostPreview = { registerPosts, bindPreviews, open, close };
})();
