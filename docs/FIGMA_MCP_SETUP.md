# 在 Cursor 接上 Figma MCP

当前这台 Cursor **还没有启用 Figma MCP**（对话里看不到 `figma` 工具）。按下面做一次即可。

## 方式 A：远程 MCP（推荐）

1. 打开 **Cursor**
2. 按 **Ctrl + Shift + P**（Mac：`Cmd + Shift + P`）
3. 搜索并运行：**Install Figma Plugin** 或 **Figma MCP**
4. 按提示登录 Figma 账号（需要 Dev / Full 席位）
5. 打开 **Cursor Settings → MCP**，确认列表里有 **Figma**，状态为 **Enabled**

完成后新开一条 Agent 对话，让 AI「列出 Figma 文件」测试是否接通。

官方说明：[Cursor and Figma: Set up the MCP server](https://help.figma.com/hc/en-us/articles/39889260656407-Cursor-and-Figma-Set-up-the-MCP-server)

## 方式 B：桌面版 MCP（本机 Figma App）

1. 安装并打开 **Figma 桌面版**
2. 打开你的设计文件 → 切到 **Dev Mode**
3. 右侧边栏打开 **MCP server** → 复制地址（一般是 `http://127.0.0.1:3845/mcp`）
4. 在 Cursor：**Settings → MCP → Add custom MCP**，粘贴：

```json
{
  "mcpServers": {
    "figma-desktop": {
      "url": "http://127.0.0.1:3845/mcp"
    }
  }
}
```

5. 保存后 **重启 Cursor**，再开新对话测试

## 接通后可以做什么

- 把首页 / 地图 / 随机页的布局推到 Figma 里微调
- 从 Figma 组件对齐颜色、圆角、字号
- 用 Code Connect 对照现有 HTML/CSS

## 给 AI 的测试句

接通后发一句：

> 用 Figma MCP 读取我当前打开的文件，列出顶层 Frame 名称。

若 AI 能返回 Frame 列表，说明已接通。
