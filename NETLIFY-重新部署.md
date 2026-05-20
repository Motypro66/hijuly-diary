# Netlify 重新部署（修复地图黑屏）

## 问题原因

当前站点 **只有 HTML**，缺少子文件夹，所以：

- `data/posts.json` → 404（地图无标点）
- `css/main.css` → 404（页面发黑、无样式）
- `js/map.js` → 404（地图不工作）

## 正确做法

拖入 / 上传时，文件夹里**必须同时有**：

```
index.html
map.html
css/main.css
js/map.js
data/posts.json
```

## 步骤

1. 打开文件夹：`C:\Users\timot\Documents\I Have a Plan\ihcr-diary`
2. **全选**里面所有文件和文件夹（不要只选两个 html）
3. https://app.netlify.com → 你的站点 **ifood-diary** → **Deploys**
4. 把**全部内容**拖到 **Drag and drop** 区域（或 Deploys → Upload）
5. 等完成后打开：https://ifood-diary.netlify.app/map.html

## 自检

浏览器打开应能访问（不能 404）：

- https://ifood-diary.netlify.app/data/posts.json
- https://ifood-diary.netlify.app/css/main.css
