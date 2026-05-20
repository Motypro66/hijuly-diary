/** Shared category labels */
window.POST_LABELS = {
  hawker: "路边摊",
  kopitiam: "茶室",
  cafe: "Cafe",
  restaurant: "餐厅",
  haokang: "好康",
  haowu: "好物",
  other: "其他",
};

window.categoryLabel = (key) => window.POST_LABELS[key] || key;
