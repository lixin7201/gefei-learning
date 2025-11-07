# 部署指南

## 快速部署到 Vercel

### 方法一：通过 Vercel CLI（推荐）

1. **安装 Vercel CLI**
```bash
npm install -g vercel
```

2. **登录 Vercel**
```bash
vercel login
```

3. **构建数据**
```bash
npm run build
```

4. **部署到生产环境**
```bash
vercel --prod
```

部署完成后，Vercel会提供一个访问链接。

### 方法二：通过 Vercel Dashboard

1. **注册/登录 Vercel**
   - 访问 https://vercel.com
   - 使用 GitHub/GitLab/Bitbucket 账号登录

2. **上传代码到 Git 仓库**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

3. **在 Vercel 中导入项目**
   - 点击 "New Project"
   - 选择你的 Git 仓库
   - 配置构建设置：
     - **Build Command**: `npm run build`
     - **Output Directory**: `public`
     - **Install Command**: `npm install`

4. **点击 Deploy**

### 方法三：直接拖拽部署

1. 访问 https://vercel.com/new
2. 将整个项目文件夹拖拽到页面上
3. 等待部署完成

## 部署到其他平台

### Netlify

1. **通过 Netlify CLI**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=public
```

2. **通过 Netlify Dashboard**
   - 上传代码到 Git
   - 在 Netlify 中导入仓库
   - 设置：
     - Build command: `npm run build`
     - Publish directory: `public`

### GitHub Pages

1. **构建项目**
```bash
npm run build
```

2. **部署到 gh-pages 分支**
```bash
git subtree push --prefix public origin gh-pages
```

3. **在 GitHub 仓库设置中启用 Pages**
   - Settings → Pages
   - Source: gh-pages branch

## 自定义域名

### Vercel

1. 在项目设置中点击 "Domains"
2. 添加你的域名
3. 按照提示配置 DNS 记录

### Netlify

1. 在项目设置中点击 "Domain management"
2. 添加自定义域名
3. 配置 DNS 记录

## 环境变量（如需要）

目前项目不需要环境变量，但如果将来需要，可以这样配置：

### Vercel
```bash
vercel env add API_KEY
```

或在 Vercel Dashboard → Settings → Environment Variables 中添加

### Netlify
在 Site settings → Build & deploy → Environment 中添加

## 更新部署

### 如果通过 Git 部署

```bash
# 更新数据
npm run build

# 提交更改
git add .
git commit -m "Update articles data"
git push
```

Vercel/Netlify 会自动检测到推送并重新部署。

### 如果通过 CLI 部署

```bash
# 更新数据
npm run build

# 重新部署
vercel --prod
# 或
netlify deploy --prod --dir=public
```

## 持续集成（CI/CD）

### GitHub Actions 示例

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Build
        run: |
          npm install
          npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 故障排查

### 部署失败

1. 检查 `build.js` 中的CSV文件路径是否正确
2. 确保 CSV 文件存在
3. 查看构建日志中的错误信息

### 页面空白

1. 检查浏览器控制台是否有错误
2. 确认 `articles.json` 是否生成
3. 检查网络请求是否成功

### 数据不更新

1. 确保执行了 `npm run build`
2. 清除浏览器缓存
3. 在 Vercel 中触发重新部署

## 性能优化建议

1. **启用 Gzip 压缩**（Vercel 默认启用）
2. **配置 CDN 缓存**
3. **如果文章数量超过 5000，考虑分页加载数据**

## 安全建议

1. ✅ 已配置 `Referrer-Policy: no-referrer`
2. ✅ 已配置 `X-Content-Type-Options: nosniff`
3. ✅ 已配置 `X-Frame-Options: DENY`
4. ✅ 所有外链使用 `rel="noopener noreferrer nofollow"`

## 监控和分析

### Vercel Analytics

在 Vercel Dashboard 中启用 Analytics 以跟踪：
- 页面访问量
- 用户地理位置
- 设备类型

### Google Analytics

如需添加 GA，在 `index.html` 的 `<head>` 中添加：

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 联系支持

如遇到部署问题：
- Vercel: https://vercel.com/support
- Netlify: https://www.netlify.com/support/
- GitHub Pages: https://docs.github.com/en/pages
