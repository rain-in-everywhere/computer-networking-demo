/**
 * 计网课程大作业 — 公共 JS 工具函数
 */

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  highlightActiveNav();
});

/**
 * 导航栏当前页面高亮
 */
function highlightActiveNav() {
  const navLinks = document.querySelectorAll(".nav-links a");
  const currentPath = window.location.pathname;

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === "/" && currentPath === "/") {
      link.classList.add("active");
    } else if (href !== "/" && currentPath.startsWith(href)) {
      link.classList.add("active");
    }
  });
}

/**
 * 通用 fetch JSON 封装
 * @param {string} url - API URL
 * @param {object} options - fetch options
 * @returns {Promise<{data: object|null, error: string|null, response: Response}>}
 */
async function fetchJSON(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (response.status === 304) {
      return { data: { cacheHit: true, status: 304 }, error: null, response };
    }

    const data = await response.json();
    return { data, error: null, response };
  } catch (err) {
    return { data: null, error: err.message, response: null };
  }
}

/**
 * 更新结果展示区域
 * @param {string} elementId - 结果容器 ID
 * @param {object} data - 要展示的数据
 * @param {number} status - HTTP 状态码
 */
function displayResult(elementId, data, status = 200) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const isOk = status >= 200 && status < 400;
  const badgeClass = isOk ? "ok" : "error";
  const badgeText = isOk ? `✓ ${status}` : `✗ ${status}`;

  el.innerHTML = `
    <div class="status-line">
      <span class="status-badge ${badgeClass}">${badgeText}</span>
      <span style="color: var(--color-text-muted); font-size: 0.85rem;">
        ${new Date().toLocaleTimeString()}
      </span>
    </div>
    ${escapeHTML(JSON.stringify(data, null, 2))}
  `;
}

/**
 * 将数据渲染为信息表格
 * @param {string} elementId - 容器 ID
 * @param {Array<{label: string, value: string, note?: string}>} rows
 */
function displayInfoTable(elementId, rows) {
  const el = document.getElementById(elementId);
  if (!el) return;

  let html = '<table class="info-table"><thead><tr><th>字段</th><th>值</th><th>说明</th></tr></thead><tbody>';
  rows.forEach((row) => {
    html += `
      <tr>
        <td>${escapeHTML(row.label)}</td>
        <td>${escapeHTML(String(row.value))}</td>
        <td style="color:var(--color-text-muted);font-family:inherit;font-size:0.85rem;">${escapeHTML(row.note || "")}</td>
      </tr>`;
  });
  html += "</tbody></table>";
  el.innerHTML = html;
}

/**
 * HTML 转义
 */
function escapeHTML(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/**
 * 格式化时间戳
 */
function formatTime(isoString) {
  return new Date(isoString).toLocaleString("zh-CN");
}
