/**
 * 小红书原帖打开策略：
 *   - 手机：直接打开（XHS App 接管或浏览器版正常显示）
 *   - 电脑：弹窗显示二维码 + 复制链接 + 在 App 打开 的友好引导
 *           （XHS 网页版对未登录用户会显示 "Page Not Available"，这是平台限制）
 */
(function () {
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  function buildModal() {
    if (document.getElementById("xhs-modal")) return;
    const html = `
      <div class="xhs-modal" id="xhs-modal" aria-hidden="true">
        <div class="xhs-modal__backdrop" data-close></div>
        <div class="xhs-modal__panel" role="dialog" aria-modal="true" aria-label="在小红书打开">
          <button type="button" class="xhs-modal__close" data-close aria-label="关闭">×</button>
          <div class="xhs-modal__cover" id="xhs-modal-cover"></div>
          <h3 class="xhs-modal__title" id="xhs-modal-title">在小红书 App 打开原帖</h3>
          <p class="xhs-modal__hint">
            小红书网页版未登录会拦截。用手机扫码，<br>
            或复制链接到 App 内打开 ↓
          </p>
          <div class="xhs-modal__qrwrap">
            <img id="xhs-modal-qr" class="xhs-modal__qr" alt="扫码打开小红书原帖">
          </div>
          <div class="xhs-modal__actions">
            <button type="button" class="xhs-modal__btn primary" id="xhs-modal-copy">复制链接</button>
            <a class="xhs-modal__btn ghost" id="xhs-modal-open" href="#" target="_blank" rel="noopener noreferrer">仍要在浏览器试试</a>
          </div>
          <p class="xhs-modal__note">复制后，打开小红书 App → 粘贴到首页搜索栏 → 直达原帖。</p>
        </div>
      </div>`;
    document.body.insertAdjacentHTML("beforeend", html);

    const modal = document.getElementById("xhs-modal");
    modal.addEventListener("click", (e) => {
      if (e.target.dataset.close !== undefined) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

    document.getElementById("xhs-modal-copy").addEventListener("click", async () => {
      const url = modal.dataset.url || "";
      try {
        await navigator.clipboard.writeText(url);
        const btn = document.getElementById("xhs-modal-copy");
        btn.textContent = "已复制 ✓";
        setTimeout(() => (btn.textContent = "复制链接"), 1800);
      } catch {
        prompt("复制下面的链接：", url);
      }
    });
  }

  function open(post) {
    if (!window.PostUtils) return;
    const url = window.PostUtils.xhsUrl(post);
    if (!url || url === "#") return;

    if (isMobile) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    buildModal();
    const modal = document.getElementById("xhs-modal");
    modal.dataset.url = url;
    document.getElementById("xhs-modal-open").href = url;

    const titleEl = document.getElementById("xhs-modal-title");
    if (titleEl && post.title) titleEl.textContent = post.title;

    const coverEl = document.getElementById("xhs-modal-cover");
    const src = window.PostUtils.imageSrc(post);
    coverEl.innerHTML = src
      ? `<img src="${src}" alt="" loading="lazy">`
      : `<div class="xhs-modal__placeholder">🦀</div>`;

    const qr = document.getElementById("xhs-modal-qr");
    qr.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(url)}`;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    const modal = document.getElementById("xhs-modal");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  window.XhsModal = { open, close };
})();
