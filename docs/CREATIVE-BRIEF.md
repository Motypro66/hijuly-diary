# 小螃蟹看世界 · Creative Brief (v3)

## Insight

马来西亚探店粉丝想**抄作业吃遍全马**，但小红书笔记散在 feed 里、很难按地区复盘；小螃蟹账号正好在做「真实试吃 + 好康好物」，缺一个**可跟着爬的地图档案**。

## Big idea（一句话）

**跟着小螃蟹在世界线上爬，scroll 到哪，吃到哪。**

## 视觉系统

| 元素 | 执行 |
|------|------|
| 系列名 | **小螃蟹看世界**（账号名仍显示 空调17度） |
| 符号 | 螃蟹 × 世界（虚线轨道 + 蓝色星球光晕） |
| 行为 | 底部固定小螃蟹，随滚动进度横向移动；向下走、向上跳 |
| 卡片 | 封面图 + 双 CTA：地图 / 小红书单篇 |

## 数据

- 封面：`assets/posts/{id}/cover.webp`（从保存的小红书网页导入）
- 链接：`xhsLink` → `https://www.xiaohongshu.com/explore/{noteId}`

## 维护

```powershell
# 从根目录保存的 rednote 网页重新导入封面
..\..\tools\import-hijuly-images.ps1

# 从 rednote.html 同步 explore 链接（按主页顺序）
..\..\tools\sync-hijuly-xhs-links.ps1

# 同步 Netlify 部署文件夹
.\scripts\sync-netlify.ps1
```
