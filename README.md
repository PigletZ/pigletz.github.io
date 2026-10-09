# Cepher Piglet

分布式存储、Linux 运维与工程实践的个人博客。

## 本地运行

需要 Node.js 22 或更新版本。项目没有第三方运行或构建依赖，无需安装依赖。

~~~sh
npm run dev
~~~

Windows PowerShell 如提示 npm.ps1 无法加载，将命令里的 npm 换成 npm.cmd，例如 npm.cmd run dev。

打开 http://127.0.0.1:4173 。修改内容或模板后运行 npm run build，刷新预览。

~~~sh
npm run build   # 重新生成所有页面、搜索索引、RSS 和站点地图
npm test        # 校验迁移后的链接、正文代码、截图及元数据
npm run check   # 构建并校验
~~~

## 文件结构

- content/posts.json：文章标题、原始日期、分类、标签、网址、摘要及正文文件路径。
- content/posts/*.html：从旧 Hexo 页面恢复的文章正文，保留代码、截图和锚点。
- scripts/generate.mjs：统一模板和静态生成逻辑。
- scripts/build.mjs：构建入口。
- scripts/serve.mjs：本地预览服务器，仅监听本机。
- scripts/site.test.mjs：迁移与站内链接检查。
- assets/site.css：响应式布局及深浅主题。
- assets/site.js：本地全文搜索、代码复制、目录高亮与快捷键。
- assets/theme.js：首次绘制前恢复主题，避免闪烁。
- index.html、2020/、archives/、categories/、tags/、about/、search/：生成的静态页面，请通过内容源或模板修改。

## 添加文章

1. 在 content/posts/ 中添加 HTML 正文（可信的作者内容）。标题建议使用带唯一 id 的 h2、h3、h4，以生成文章目录。
2. 在 content/posts.json 中添加一条记录，包含 title、date（YYYY-MM-DD）、category、tags、url（/YYYY/MM/DD/slug/）、summary、file（posts/slug.html）。
3. 运行 npm run check，提交内容源与生成文件。

正文可以使用标准 pre/code（例如 <pre><code class="language-bash">...</code></pre>），构建时会增加复制按钮；从旧站迁移的 Hexo figure.highlight 也会自动转换。分类和标签页面随文章自动生成。删除或改名文章时，应自行处理旧 URL 的兼容与对应生成文件，构建器不会删除历史文件。

## GitHub Pages

保留原仓库从分支根目录发布静态文件的方式。构建结果直接写入根目录；无需 Node.js 运行服务或 SPA 路由重写。提交并推送生成文件后，由仓库现有 Pages 配置发布。本次翻新没有推送代码或修改线上设置。

根目录 .nojekyll 用于跳过 Jekyll 处理，参见 [GitHub Pages 官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)。如果以后改用自定义域名，请修改 scripts/generate.mjs 的 site.url 并重新构建。

## 迁移说明

原仓库仅包含 Hexo 4.2.0 生成结果，没有 Markdown 或 Hexo 配置。因此以原 HTML 正文为内容源，避免反向转换造成代码、表格或图片丢失。

6 篇原文、发布日期、全部旧文章路径和章节锚点均保留。2020 年的命令和配置保持原文，页面注明原始日期；没有将旧技术内容改写为未经验证的当前建议。

新版页面不再加载 jQuery 2、Fancybox、Font Awesome、远程字体或 Google 搜索。旧 css/、js/ 和 fancybox/ 文件作为历史资产保留，不参与新版运行。

搜索在浏览器本地执行，支持标题、标签、分类和正文；/ 键打开搜索，搜索地址可分享。主题偏好保存于本地；存储不可用时仍能切换。文章导航在禁用 JavaScript 时可用，只有交互增强需要脚本。
