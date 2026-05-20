# GitHub Pages 上线（不用 Netlify）

网站文件夹：`sites/hijuly-diary`  
部署方式：推送到 GitHub 后，Actions 自动发布。

---

## 一次性设置（约 5 分钟）

### 1. 用 GitHub Desktop 发布仓库

1. 打开 **GitHub Desktop**
2. **File → Add local repository**
3. 选择：`C:\Users\timot\Documents\I Have a Plan\sites\hijuly-diary`
4. 若不是仓库 → **Create a repository**
5. **Publish repository**
   - Name：`hijuly-diary`（建议）
   - 勾选 **Public**（免费 Pages 需要公开仓库）
6. 点 **Publish**

### 2. 开启 GitHub Pages（网页）

1. 打开仓库 → **Settings → Pages**
2. **Build and deployment → Source** 选 **GitHub Actions**（不是 Deploy from branch）
3. 保存后，回到 **Actions** 标签，应看到 **Deploy to GitHub Pages** 在跑
4. 等 1–3 分钟变绿 ✅

### 3. 你的网站地址

```
https://你的GitHub用户名.github.io/hijuly-diary/
```

地图：

```
https://你的GitHub用户名.github.io/hijuly-diary/map.html
```

---

## 以后每次改完代码

1. GitHub Desktop 里写 **Summary**（例如 `v4.2 更新布局`）
2. 点 **Commit to main**
3. 点 **Push origin**
4. Actions 会自动重新部署（约 1–2 分钟）

---

## 必须一起上传的文件

根目录要有这些（缺一不可）：

```
index.html
map.html
.nojekyll
css/
js/
data/
assets/          ← 含 posts 封面图，否则图全挂
.github/workflows/deploy-pages.yml
```

---

## 常见问题

| 问题 | 处理 |
|------|------|
| 图不显示 | 确认 `assets/posts/` 已 push，且用上面的 Pages 网址访问（不要 file:// 打开） |
| Actions 失败 | Settings → Pages → Source 必须是 **GitHub Actions** |
| 404 | 仓库名要和 URL 里一致，例如 `hijuly-diary` |

---

完成后把 **GitHub 用户名** 和 **仓库名** 发我，我帮你核对链接。
