/**
 * HTTP 缓存策略演示 — 交互逻辑
 */

let cacheRequestCount = 0;
const cacheHistory = [];

/**
 * 策略说明映射（中文）
 */
const strategyLabels = {
  "no-store": "no-store（禁止缓存）",
  "no-cache": "no-cache（缓存但需验证）",
  "max-age-10": "max-age=10（缓存 10 秒）",
  "max-age-60": "max-age=60（缓存 60 秒）",
  etag: "ETag（条件请求）",
  immutable: "immutable（永久缓存）",
};

async function sendCacheRequest() {
  const strategy = document.getElementById("cache-strategy").value;
  const resultBox = document.getElementById("cache-result-raw");
  cacheRequestCount++;

  resultBox.innerHTML = '<span style="color: var(--color-text-muted);">⏳ 请求中…</span>';

  const startTime = performance.now();
  const { data, error, response } = await fetchJSON(
    `/api/cache-demo?strategy=${strategy}&count=${cacheRequestCount}`
  );
  const elapsed = Math.round(performance.now() - startTime);

  if (error) {
    resultBox.innerHTML = `<div class="status-line"><span class="status-badge error">✗ Error</span></div>${escapeHTML(error)}`;
    return;
  }

  // 判断缓存状态
  let cacheStatus = "Miss";
  let statusBadgeClass = "info";
  if (response.status === 304) {
    cacheStatus = "304 Not Modified (缓存命中)";
    statusBadgeClass = "ok";
  } else if (data.cacheHit) {
    cacheStatus = "Cache Hit";
    statusBadgeClass = "ok";
  }

  // 构建展示
  const strategyName = strategyLabels[strategy] || strategy;
  const statusCode = response.status;
  const cacheControl =
    response.headers.get("Cache-Control") ||
    data.appliedHeaders?.["Cache-Control"] ||
    "—";
  const etag = response.headers.get("ETag") || data.appliedHeaders?.ETag || "—";

  resultBox.innerHTML = `
    <div class="status-line">
      <span class="status-badge ${statusBadgeClass}">${statusCode}</span>
      <span style="color: var(--color-text-muted); font-size: 0.85rem;">
        策略: <strong style="color: var(--color-primary);">${escapeHTML(strategyName)}</strong>
        &nbsp;|&nbsp; 耗时: ${elapsed}ms
        &nbsp;|&nbsp; 第 ${cacheRequestCount} 次请求
      </span>
    </div>
    <div style="margin-bottom: 0.5rem; color: var(--color-text-muted); font-size: 0.85rem;">
      Cache-Control: <code>${escapeHTML(cacheControl)}</code><br>
      ETag: <code>${escapeHTML(etag)}</code><br>
      缓存状态: <strong>${escapeHTML(cacheStatus)}</strong>
    </div>
    <div style="font-size: 0.85rem; color: var(--color-success);">
      💡 ${escapeHTML(data.description || data.tip || "")}
    </div>
    <hr style="border-color: var(--color-border); margin: 0.75rem 0;">
${escapeHTML(JSON.stringify(data, null, 2))}
  `;

  // 添加到历史记录
  cacheHistory.unshift({
    no: cacheRequestCount,
    strategy: strategyLabels[strategy],
    status: statusCode,
    cacheStatus,
    elapsed,
    cacheControl,
    etag,
    time: new Date().toLocaleTimeString(),
  });
  renderCacheHistory();
}

function renderCacheHistory() {
  const el = document.getElementById("cache-history");
  if (cacheHistory.length === 0) {
    el.innerHTML = '<p style="color: var(--color-text-muted);">暂无请求记录</p>';
    return;
  }
  let html =
    '<table class="info-table"><thead><tr><th>#</th><th>时间</th><th>策略</th><th>状态码</th><th>缓存状态</th><th>耗时</th><th>Cache-Control</th></tr></thead><tbody>';
  cacheHistory.forEach((h) => {
    const sc = h.status === 304 ? "ok" : "info";
    html += `
      <tr>
        <td>${h.no}</td>
        <td>${h.time}</td>
        <td style="font-family: inherit; font-size: 0.85rem;">${escapeHTML(h.strategy)}</td>
        <td><span class="status-badge ${sc}">${h.status}</span></td>
        <td style="font-family: inherit; font-size: 0.85rem;">${escapeHTML(h.cacheStatus)}</td>
        <td>${h.elapsed}ms</td>
        <td style="font-family: inherit; font-size: 0.8rem; max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${escapeHTML(h.cacheControl)}</td>
      </tr>`;
  });
  html += "</tbody></table>";
  el.innerHTML = html;
}

function clearCacheLog() {
  cacheHistory.length = 0;
  cacheRequestCount = 0;
  document.getElementById("cache-result-raw").innerHTML =
    '<span style="color: var(--color-text-muted);">记录已清除，选择策略后点击"发送请求"…</span>';
  document.getElementById("cache-history").innerHTML =
    '<p style="color: var(--color-text-muted);">暂无请求记录</p>';
}
