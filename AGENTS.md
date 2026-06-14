# AGENTS.md

## 项目概览
影视资源聚合站，基于 Bun + Hono + JSX/TSX 技术栈开发。从多个 XML API 源抓取影视数据，服务端渲染 HTML 页面。

## 项目结构
```
src/
├── index.tsx              # 主程序（路由、API 逻辑、类型定义、配置加载、数据获取）
└── views/
    └── default/           # 默认模板
        ├── Layout.tsx     # 页面布局（Header + Footer + 内联样式）
        ├── List.tsx       # 视频列表页
        ├── Info.tsx       # 视频详情页（含播放器脚本）
        └── Search.tsx     # 搜索结果页
```

## 构建与运行
- 安装依赖：`bun install`
- 开发模式：`bun run --hot src/index.tsx`
- 生产模式：`bun run src/index.tsx`
- 端口：通过 `DEPLOY_RUN_PORT` 环境变量读取，默认 5000

## 技术栈
- **运行时**：Bun
- **框架**：Hono (SSR)
- **JSX 引擎**：hono/jsx（服务端渲染，jsxImportSource: "hono/jsx"）
- **XML 解析**：fast-xml-parser
- **模板系统**：动态 import，支持多套模板切换（default / default2 / ...）

## 核心类型（从 index.tsx 导出）
- `PageContext` — 页面渲染上下文
- `Video` — 视频数据结构
- `Category` — 分类（分类号/分类名）
- `Pagination` — 分页信息
- `ApiConfig` — API 源配置

## 设计规范
参见 DESIGN.md：深色影院风格，主色 #09C878，5列PC/3列移动端网格，内联 CSS。

## 多模板切换
模板通过 `config.templateName` 配置，`loadTemplate()` 函数动态 import `./views/${templateName}/` 下的四个组件。新增模板只需在 `src/views/` 下创建新目录并导出 Layout/List/Info/Search 四个组件。

## 注意事项
- Hono JSX 中使用 `class` 而非 `className`
- 分类属性使用中文 key（分类号/分类名），与外部 XML API 数据结构一致
- API 请求使用随机国内 IP + X-Forwarded-For 头绕过地域限制
- 视频播放通过 iframe + 第三方解析器实现
