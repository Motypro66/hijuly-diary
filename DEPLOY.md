# 上线部署说明 · I人的馋嘴日记

## 你需要准备什么？（二选一）

### 方案 A：零安装（推荐先试）

**不需要下载任何东西到 Desktop。**

只需要：
1. 浏览器
2. 免费注册 [Netlify](https://www.netlify.com/) 或 [Cloudflare](https://dash.cloudflare.com/)（用 Google 登录即可）

步骤见下方「Netlify 拖拽上线」。

---

### 方案 B：长期用 GitHub Pages（推荐长期）

在 Desktop 安装 **一个** 即可：

| 安装 | 用途 | 下载 |
|------|------|------|
| **GitHub Desktop**（推荐） | 含 Git，图形界面上传 | https://desktop.github.com/ |

并注册免费账号：https://github.com/signup

（不必单独装 Git；GitHub Desktop 自带。）

---

## Netlify 拖拽上线（5 分钟）

1. 把文件夹 `ihcr-diary` 打成 ZIP（或让我帮你生成 `ihcr-diary-deploy.zip`）
2. 打开 https://app.netlify.com/drop
3. 把 ZIP **解压后的文件夹内容**拖进去（要能看到 `index.html` 在根目录）
4. 等几十秒，会得到链接，例如 `https://random-name.netlify.app`
5. 打开 `https://你的域名/map.html` 看地图

---

## GitHub Pages（装好 GitHub Desktop 后）

1. GitHub Desktop → File → Add Local Repository → 选 `ihcr-diary` 文件夹  
   （若提示不是 git 仓库，选 create repository）
2. Publish repository → 选 Public  
3. 在 GitHub 网页：Settings → Pages → Branch `main` / folder `/ (root)` → Save  
4. 访问 `https://你的用户名.github.io/仓库名/map.html`

---

## 本地预览（可选）

仅在自己电脑看时，需要 **Python**（Win10/11 一般已有）：

```powershell
cd "c:\Users\timot\Documents\I Have a Plan\ihcr-diary"
python -m http.server 8080
```

打开 http://localhost:8080/map.html

---

## 当前测试数据

`data/posts.json` 含一条**非原创**小红书测试帖（薄饼披萨），链接：

http://xhslink.com/o/1e5H6AItoAr

地图坐标为 KL 参考点；你发第一篇真实探店后会替换为真实地址坐标。
