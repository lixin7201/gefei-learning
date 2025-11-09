// ===== 全局状态 =====
let allArticles = []; // 所有文章数据
let filteredArticles = []; // 筛选后的文章
let currentPage = 1; // 当前页码
let perPage = 20; // 每页显示数量

// 筛选条件
let keyword = '';

// 排序状态
let sortBy = 'date'; // 'date' 或 'title'
let sortOrder = 'desc'; // 'asc' 或 'desc'

// ===== 工具函数 =====

/**
 * 格式化日期为 YYYY-MM-DD
 */
function formatDateOnly(isoString) {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 高亮关键词
 */
function highlightKeyword(text, keyword) {
  if (!keyword) return text;

  const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ===== 数据加载 =====

/**
 * 加载文章数据
 */
async function loadArticles() {
  try {
    showLoading();

    const response = await fetch('articles.json');
    if (!response.ok) {
      throw new Error('加载数据失败');
    }

    allArticles = await response.json();
    filteredArticles = [...allArticles];

    // 更新页脚统计
    updateFooter();

    // 初始渲染
    applyFilters();
    hideLoading();
  } catch (error) {
    console.error('加载文章失败:', error);
    hideLoading();
    showEmptyState();
  }
}

// ===== 筛选逻辑 =====

/**
 * 应用筛选条件
 */
function applyFilters() {
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    filteredArticles = allArticles.filter(article => {
      const lowerTitle = article.title.toLowerCase();
      return lowerTitle.includes(lowerKeyword);
    });
  } else {
    filteredArticles = [...allArticles];
  }

  // 应用排序
  applySorting();

  // 重置到第一页
  currentPage = 1;

  // 更新UI
  updateFilterStatus();
  updateSortIndicators();
  renderTable();
  renderPagination();
}

/**
 * 应用排序
 */
function applySorting() {
  filteredArticles.sort((a, b) => {
    let comparison = 0;

    if (sortBy === 'title') {
      // 按标题排序（中文+英文）
      comparison = a.title.localeCompare(b.title, 'zh-CN');
    } else {
      // 按日期排序
      comparison = new Date(a.published_at) - new Date(b.published_at);
    }

    // 应用升序或降序
    return sortOrder === 'asc' ? comparison : -comparison;
  });
}

/**
 * 切换排序
 */
function toggleSort(column) {
  if (sortBy === column) {
    // 如果点击同一列，切换升序/降序
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    // 如果点击不同列，设置新列并默认降序
    sortBy = column;
    sortOrder = 'desc';
  }

  // 重新应用筛选（包含排序）
  applyFilters();
}

/**
 * 更新排序指示器
 */
function updateSortIndicators() {
  // 移除所有排序类
  document.querySelectorAll('.sortable').forEach(th => {
    th.classList.remove('sort-asc', 'sort-desc');
  });

  // 添加当前排序类
  const activeColumn = sortBy === 'title' ? 'title' : 'date';
  const thElement = document.querySelector(`.sortable[data-sort="${activeColumn}"]`);
  if (thElement) {
    thElement.classList.add(sortOrder === 'asc' ? 'sort-asc' : 'sort-desc');
  }
}

/**
 * 清除搜索
 */
function clearSearch() {
  keyword = '';
  document.getElementById('searchInput').value = '';
  applyFilters();
}

// ===== 渲染函数 =====

/**
 * 渲染表格
 */
function renderTable() {
  const tableContainer = document.getElementById('tableContainer');
  const tableBody = document.getElementById('articlesTableBody');
  const emptyState = document.getElementById('emptyState');
  const paginationSection = document.getElementById('paginationSection');

  // 如果没有结果，显示空状态
  if (filteredArticles.length === 0) {
    tableContainer.style.display = 'none';
    paginationSection.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  // 显示表格
  tableContainer.style.display = 'block';
  paginationSection.style.display = 'block';
  emptyState.style.display = 'none';

  // 计算当前页的文章
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const pageArticles = filteredArticles.slice(start, end);

  // 渲染表格行
  tableBody.innerHTML = pageArticles.map((article, index) => {
    const globalIndex = start + index + 1;
    const highlightedTitle = highlightKeyword(article.title, keyword);
    const formattedDate = formatDateOnly(article.published_at);
    const originalBadge = article.is_original ? '<span class="article-badge badge-original">原创</span>' : '';

    return `
      <tr>
        <td class="col-id">${globalIndex}</td>
        <td class="article-title-cell">
          <a
            href="${article.url}"
            class="article-title-link"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            ${highlightedTitle}
          </a>
          ${originalBadge ? `<div class="article-badges">${originalBadge}</div>` : ''}
        </td>
        <td class="article-date-cell">${formattedDate}</td>
      </tr>
    `;
  }).join('');

  // 更新分页信息
  updatePaginationInfo();
}

/**
 * 更新分页信息
 */
function updatePaginationInfo() {
  const paginationInfo = document.getElementById('paginationInfo');
  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, filteredArticles.length);
  const total = filteredArticles.length;

  paginationInfo.textContent = `显示第 ${start}-${end} 条，共 ${total} 条结果`;
}

/**
 * 渲染分页器
 */
function renderPagination() {
  const container = document.getElementById('pagination');
  const totalPages = Math.ceil(filteredArticles.length / perPage);

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';

  // 上一页按钮
  html += `
    <button
      class="page-btn"
      ${currentPage === 1 ? 'disabled' : ''}
      onclick="goToPage(${currentPage - 1})"
      aria-label="上一页"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
  `;

  // 页码按钮
  const maxVisible = 5; // 最多显示5个页码
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  // 调整起始页
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  // 首页
  if (startPage > 1) {
    html += `<button class="page-btn" onclick="goToPage(1)">1</button>`;
    if (startPage > 2) {
      html += `<span class="page-ellipsis">...</span>`;
    }
  }

  // 中间页码
  for (let i = startPage; i <= endPage; i++) {
    html += `
      <button
        class="page-btn ${i === currentPage ? 'active' : ''}"
        onclick="goToPage(${i})"
      >
        ${i}
      </button>
    `;
  }

  // 末页
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      html += `<span class="page-ellipsis">...</span>`;
    }
    html += `<button class="page-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
  }

  // 下一页按钮
  html += `
    <button
      class="page-btn"
      ${currentPage === totalPages ? 'disabled' : ''}
      onclick="goToPage(${currentPage + 1})"
      aria-label="下一页"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
  `;

  container.innerHTML = html;
}

/**
 * 更新筛选状态
 */
function updateFilterStatus() {
  const filterStatus = document.getElementById('filterStatus');
  const filterKeyword = document.getElementById('filterKeyword');

  if (keyword) {
    filterStatus.style.display = 'flex';
    filterKeyword.textContent = keyword;
  } else {
    filterStatus.style.display = 'none';
  }
}

/**
 * 更新页脚统计
 */
function updateFooter() {
  const totalArticles = document.getElementById('totalArticles');
  const lastUpdate = document.getElementById('lastUpdate');

  totalArticles.textContent = allArticles.length;

  if (allArticles.length > 0) {
    const latest = allArticles[0];
    lastUpdate.textContent = formatDateOnly(latest.published_at);
  }
}

/**
 * 显示加载状态
 */
function showLoading() {
  document.getElementById('loadingState').style.display = 'flex';
  document.getElementById('tableContainer').style.display = 'none';
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('paginationSection').style.display = 'none';
}

/**
 * 隐藏加载状态
 */
function hideLoading() {
  document.getElementById('loadingState').style.display = 'none';
}

/**
 * 显示空状态
 */
function showEmptyState() {
  const emptyState = document.getElementById('emptyState');
  emptyState.style.display = 'block';
  document.getElementById('tableContainer').style.display = 'none';
  document.getElementById('paginationSection').style.display = 'none';
}

// ===== 交互事件 =====

/**
 * 跳转到指定页
 */
function goToPage(page) {
  const totalPages = Math.ceil(filteredArticles.length / perPage);

  if (page < 1 || page > totalPages) {
    return;
  }

  currentPage = page;
  renderTable();
  renderPagination();

  // 滚动到表格顶部
  document.querySelector('.main-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * 处理搜索
 */
function handleSearch() {
  const searchInput = document.getElementById('searchInput');
  keyword = searchInput.value.trim();
  applyFilters();
}

/**
 * 改变每页显示数量
 */
function changePerPage() {
  const select = document.getElementById('perPageSelect');
  perPage = parseInt(select.value);
  currentPage = 1;

  renderTable();
  renderPagination();
}

// ===== 初始化 =====

/**
 * 页面初始化
 */
document.addEventListener('DOMContentLoaded', () => {
  // 加载数据
  loadArticles();

  // 搜索框事件
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });

  searchBtn.addEventListener('click', handleSearch);

  // 清除筛选按钮
  const clearFilterBtn = document.getElementById('clearFilterBtn');
  clearFilterBtn.addEventListener('click', clearSearch);

  // 每页显示数量
  const perPageSelect = document.getElementById('perPageSelect');
  perPageSelect.addEventListener('change', changePerPage);
});
