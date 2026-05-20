# 项目目录（层级）

```
I Have a Plan/
├── sites/                      # 所有地图站
│   ├── hijuly-diary/           # 空调17度 · 小螃蟹看世界
│   │   ├── index.html, map.html
│   │   ├── assets/
│   │   │   ├── brand/          # crab.svg 等品牌素材
│   │   │   └── posts/{id}/     # 每篇笔记 cover.webp
│   │   ├── css/
│   │   ├── data/posts.json
│   │   ├── js/
│   │   ├── docs/               # 创意说明、结构说明
│   │   ├── deploy/netlify-upload/  # 拖 Netlify 用
│   │   └── scripts/
│   ├── ihcr-diary/             # I人的馋嘴日记
│   └── shared/agents/          # 品牌 marketing 文档
├── tools/                      # 导入图片、同步链接等脚本
├── reference/saved-webpages/     # 另存的小红书 HTML（建议移入）
└── dashboards/                 # 检测仪表盘
```

部署时上传 **`deploy/netlify-upload/` 里的全部内容** 到站点根目录（含 `assets/`）。
