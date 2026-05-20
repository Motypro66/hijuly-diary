/** 见原帖：手机 / 电脑均直接打开小红书链接 */
(function () {
  function open(post) {
    if (!window.PostUtils) return;
    const url = window.PostUtils.xhsUrl(post);
    if (!url || url === "#") return;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  window.XhsModal = { open, close() {} };
})();
