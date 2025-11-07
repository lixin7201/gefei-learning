const fs = require('fs');
const path = require('path');

// CSV文件路径
const csvFilePath = path.join(__dirname, '../哥飞所有文章/公众号文章_全部数据_20251107_123341.csv');
const outputJsonPath = path.join(__dirname, 'public/articles.json');

/**
 * 解析CSV行 - 处理可能包含逗号的字段
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // 双引号转义
        current += '"';
        i++;
      } else {
        // 切换引号状态
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // 字段分隔符
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // 添加最后一个字段
  result.push(current.trim());
  return result;
}

/**
 * 解析时间字符串为ISO 8601格式（UTC）
 */
function parseDateTime(dateStr) {
  if (!dateStr || dateStr.trim() === '') {
    return new Date().toISOString();
  }

  // 格式：2025-11-07 15:42:46
  // 假设时区为 Asia/Shanghai (UTC+8)
  const [datePart, timePart] = dateStr.trim().split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);

  // 创建本地时间（假设为北京时间）
  const localDate = new Date(year, month - 1, day, hour, minute, second);

  // 转换为UTC（北京时间减8小时）
  const utcDate = new Date(localDate.getTime() - 8 * 60 * 60 * 1000);

  return utcDate.toISOString();
}

/**
 * 规范化URL - 保留关键参数
 */
function normalizeUrl(url) {
  if (!url) return '';

  try {
    const urlObj = new URL(url);

    // 如果是微信文章链接
    if (urlObj.hostname.includes('mp.weixin.qq.com')) {
      // 保留关键参数
      const params = new URLSearchParams(urlObj.search);
      const keyParams = ['__biz', 'mid', 'idx', 'sn'];
      const newParams = new URLSearchParams();

      keyParams.forEach(key => {
        if (params.has(key)) {
          newParams.set(key, params.get(key));
        }
      });

      return `${urlObj.origin}${urlObj.pathname}?${newParams.toString()}`;
    }

    return url;
  } catch (e) {
    return url;
  }
}

/**
 * 主处理函数
 */
function buildArticlesData() {
  console.log('开始读取CSV文件...');

  // 读取CSV文件
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');

  console.log(`共读取 ${lines.length} 行数据`);

  // 解析CSV
  const articles = [];
  const seenUrls = new Set(); // 用于去重

  // 跳过标题行
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);

    // CSV格式：ID,公众号,文章标题,发布时间↓,位置,原创,文章链接
    if (fields.length >= 7) {
      const [id, accountName, title, publishTime, position, isOriginal, url] = fields;

      // 规范化URL
      const normalizedUrl = normalizeUrl(url.trim());

      // 去重检查（可选，根据需求开启）
      // if (seenUrls.has(normalizedUrl)) {
      //   console.log(`跳过重复URL: ${normalizedUrl}`);
      //   continue;
      // }

      seenUrls.add(normalizedUrl);

      // 构建文章对象
      const article = {
        id: id.trim(),
        title: title.trim(),
        url: url.trim(), // 使用原始URL
        published_at: parseDateTime(publishTime),
        account_name: accountName.trim(),
        is_original: isOriginal.trim() === '是',
        position: parseInt(position.trim()) || 1,
        source_row_id: parseInt(id.trim()) || i
      };

      articles.push(article);
    }
  }

  console.log(`成功解析 ${articles.length} 篇文章`);

  // 按发布时间倒序排序
  articles.sort((a, b) => {
    return new Date(b.published_at) - new Date(a.published_at);
  });

  // 保存为JSON
  fs.writeFileSync(outputJsonPath, JSON.stringify(articles, null, 2), 'utf-8');

  console.log(`数据已保存到: ${outputJsonPath}`);
  console.log(`最早文章: ${articles[articles.length - 1].published_at}`);
  console.log(`最新文章: ${articles[0].published_at}`);

  // 生成统计信息
  const stats = {
    total: articles.length,
    original: articles.filter(a => a.is_original).length,
    accounts: [...new Set(articles.map(a => a.account_name))],
    dateRange: {
      earliest: articles[articles.length - 1].published_at,
      latest: articles[0].published_at
    }
  };

  console.log('\n统计信息:');
  console.log(`- 总文章数: ${stats.total}`);
  console.log(`- 原创文章: ${stats.original}`);
  console.log(`- 公众号: ${stats.accounts.join(', ')}`);
  console.log(`- 时间范围: ${stats.dateRange.earliest.split('T')[0]} ~ ${stats.dateRange.latest.split('T')[0]}`);
}

// 执行构建
try {
  buildArticlesData();
  console.log('\n✅ 构建完成！');
} catch (error) {
  console.error('❌ 构建失败:', error.message);
  console.error(error.stack);
  process.exit(1);
}
