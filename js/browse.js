function applyBranding() {
  const cfg = window.SITE;
  if (!cfg) return;
  document.querySelectorAll("[data-site-name]").forEach((el) => {
    el.innerHTML = `${cfg.nameAccent}<span>${cfg.nameSuffix || ""}</span>`;
  });
  const fx = document.getElementById("footer-xhs");
  if (fx && cfg.xhsProfileUrl) fx.href = cfg.xhsProfileUrl;
}

document.addEventListener("DOMContentLoaded", applyBranding);
