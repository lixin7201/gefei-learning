# 哥飞公众号文章全集

一个纯静态网站，用于展示、搜索和筛选哥飞公众号的所有文章。

## 功能特性

✅ **搜索功能**
- 按标题关键词搜索
- 中文直接包含匹配
- 不区分大小写
- 关键词高亮显示

✅ **表格展示**
- 三列布局：序号、标题、发布日期
- 原创标签显示
- 悬停高亮
- 按发布时间倒序排列

✅ **分页浏览**
- 每页10/20/50/100条可选
- 智能分页器
- 显示当前范围统计

✅ **响应式设计**
- 桌面端和移动端完美适配
- 支持深色模式
- 最小点击区域 ≥ 44px

✅ **安全性**
- 所有外链添加 `rel="noopener noreferrer nofollow"`
- Referrer-Policy: no-referrer
- 无凭证、无登录

## 技术栈

- **前端**: 纯HTML + CSS + JavaScript（无框架）
- **构建**: Node.js
- **部署**: Vercel / Netlify / GitHub Pages

## 快速开始

### 1. 数据构建

首次部署或更新Excel数据后，执行构建：

```bash
npm run build
```

这会将CSV文件转换为JSON并保存到 `public/articles.json`

### 2. 本地开发

```bash
npm run dev
```

访问: http://localhost:8000

### 3. 部署到Vercel

#### 方式一：通过Vercel CLI

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

#### 方式二：通过GitHub（推荐）

1. 推送代码到GitHub仓库
2. 在Vercel中导入仓库
3. Vercel会自动检测配置（vercel.json）
4. 直接点击部署

> **注意**：`articles.json` 已经包含在仓库中，无需在部署时构建

## 目录结构

```
.
├── build.js              # 数据转换脚本（CSV → JSON）
├── package.json          # 项目配置
├── vercel.json          # Vercel部署配置
└── public/              # 静态资源目录
    ├── index.html       # 主页面
    ├── style.css        # 样式文件
    ├── app.js           # 应用逻辑
    └── articles.json    # 文章数据（构建生成）
```

## 数据更新流程

当有新的CSV数据时：

1. 将新的CSV文件放到正确路径：`../哥飞所有文章/公众号文章_全部数据_YYYYMMDD_HHMMSS.csv`
2. 运行构建命令生成新的JSON：
   ```bash
   npm run build
   ```
3. 提交并推送更改：
   ```bash
   git add public/articles.json
   git commit -m "更新文章数据"
   git push
   ```

Vercel会自动检测到推送并重新部署（无需重新构建，直接使用更新后的JSON）。

## 数据字段说明

### CSV格式

- `ID`: 文章ID
- `公众号`: 公众号名称
- `文章标题`: 标题
- `发布时间↓`: 发布时间 (YYYY-MM-DD HH:mm:ss)
- `位置`: 文章位置
- `原创`: 是否原创 (是/否)
- `文章链接`: 微信原文链接

### JSON格式 (articles.json)

```json
{
  "id": "1",
  "title": "文章标题",
  "url": "https://mp.weixin.qq.com/s/...",
  "published_at": "2025-11-07T07:42:46.000Z",
  "account_name": "哥飞",
  "is_original": true,
  "position": 1,
  "source_row_id": 1
}
```

## 性能指标

- ✅ 支持1000-5000条文章流畅检索
- ✅ 首屏加载 < 2秒
- ✅ 搜索响应 < 100ms
- ✅ 移动端375px断点优化

## 浏览器兼容性

- ✅ Chrome / Edge (最新)
- ✅ Safari (iOS 12+)
- ✅ Firefox (最新)

## 验收用例

### 1. 首屏展示
- [x] 打开首页即可看到全部文章
- [x] 默认按发布时间倒序排列

### 2. 点击跳转
- [x] 点击标题在新标签页打开
- [x] 添加 noopener noreferrer nofollow

### 3. 关键词搜索
- [x] 输入"跨境"仅返回标题包含"跨境"的文章
- [x] 大小写不敏感
- [x] 清空后恢复默认

### 4. 时间筛选
- [x] 设定时间范围仅显示对应文章
- [x] 边界日期包含在内
- [x] 支持快捷时间选项

### 5. 组合查询
- [x] 关键词 + 时间范围同时生效
- [x] 结果按时间倒序排列

### 6. 分页
- [x] 切换每页条数（10/20/50）正常工作
- [x] 翻页功能正常
- [x] 计数与总页数正确

### 7. 移动端适配
- [x] iPhone 375px视口正常浏览
- [x] 点击区域 ≥ 44px
- [x] 支持系统深色模式

## 许可证

MIT License

## 联系方式

如有问题或建议，请联系项目维护者。
