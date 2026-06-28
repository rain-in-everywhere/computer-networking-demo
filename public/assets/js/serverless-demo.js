/**
 * Serverless 计算演示 — 交互逻辑
 */

/**
 * 实验 1：不同 HTTP 方法测试
 */
async function testMethod(method) {
  const resultBox = document.getElementById("method-result");
  resultBox.innerHTML = `<span style="color: var(--color-text-muted);">⏳ 发送 ${method} 请求…</span>`;

  const startTime = performance.now();
  let response, data, error;

  try {
    const opts = method === "POST" ? { method: "POST", body: JSON.stringify({ test: true }) } : {};
    const result = await fetchJSON("/api/hello", opts);
    data = result.data;
    error = result.error;
    response = result.response;
  } catch (err) {
    error = err.message;
  }

  const elapsed = Math.round(performance.now() - startTime);

  if (error) {
    resultBox.innerHTML = `<div class="status-line"><span class="status-badge error">✗ Error</span></div>${escapeHTML(error)}`;
    return;
  }

  resultBox.innerHTML = `
    <div class="status-line">
      <span class="status-badge ok">✓ ${response.status}</span>
      <span style="color: var(--color-text-muted); font-size: 0.85rem;">
        ${method} /api/hello &nbsp;|&nbsp; 耗时: <strong>${elapsed}ms</strong>
      </span>
    </div>
    <div style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 0.75rem;">
      响应信息: ${escapeHTML(data?.message || "—")}<br>
      处理此请求的 HTTP 方法: <strong>${escapeHTML(String(data?.method || "—"))}</strong><br>
      运行时: ${escapeHTML(data?.runtime || "—")}<br>
      时间戳: ${escapeHTML(data?.timestamp || "—")}
    </div>
    <hr style="border-color: var(--color-border); margin: 0.75rem 0;">
${escapeHTML(JSON.stringify(data, null, 2))}
  `;
}

/**
 * 实验 2：性能测试（5 个连续请求）
 */
async function runPerfTest() {
  const resultBox = document.getElementById("perf-result");
  const btn = document.getElementById("perf-test-btn");

  btn.disabled = true;
  btn.textContent = "⏳ 测试中…";
  resultBox.innerHTML = '<span style="color: var(--color-text-muted);">⏳ 连续发送 5 个请求到 /api/hello…</span>';

  const results = [];
  for (let i = 1; i <= 5; i++) {
    const startTime = performance.now();
    try {
      const res = await fetch("/api/hello", {
        headers: { Accept: "application/json" },
      });
      const data = await res.json();
      results.push({
        no: i,
        status: res.status,
        elapsed: Math.round(performance.now() - startTime),
        message: data.message,
        timestamp: data.timestamp,
      });
    } catch (err) {
      results.push({
        no: i,
        status: "Error",
        elapsed: Math.round(performance.now() - startTime),
        message: err.message,
        timestamp: null,
      });
    }
  }

  btn.disabled = false;
  btn.textContent = "🚀 发送 5 个请求";

  const times = results.filter((r) => r.status === 200).map((r) => r.elapsed);
  const avg = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const min = times.length > 0 ? Math.min(...times) : 0;
  const max = times.length > 0 ? Math.max(...times) : 0;
  const coldStartSuspected = times.length >= 2 && times[0] > times[1] * 1.5;

  let html = `
    <div class="status-line">
      <span class="status-badge ok">✓ 完成</span>
      <span style="color: var(--color-text-muted); font-size: 0.85rem;">
        平均: <strong>${avg}ms</strong> &nbsp;|&nbsp;
        最快: ${min}ms &nbsp;|&nbsp;
        最慢: ${max}ms
      </span>
    </div>
    ${coldStartSuspected ? `<div style="color: var(--color-warning); font-size: 0.85rem; margin-bottom: 0.75rem;">⚠ 第 1 个请求明显慢于后续请求 → 可能发生了冷启动（Isolate 初始化）</div>` : ""}
    <table class="info-table">
      <thead><tr><th>#</th><th>状态</th><th>耗时</th><th>响应消息</th><th>时间戳</th></tr></thead>
      <tbody>
  `;
  results.forEach((r) => {
    const badgeClass = r.status === 200 ? "ok" : "error";
    html += `
      <tr>
        <td>${r.no}</td>
        <td><span class="status-badge ${badgeClass}">${r.status}</span></td>
        <td><strong>${r.elapsed}ms</strong></td>
        <td style="font-family: inherit; font-size: 0.85rem;">${escapeHTML(r.message)}</td>
        <td style="font-size: 0.8rem;">${escapeHTML(r.timestamp || "—")}</td>
      </tr>`;
  });
  html += `
      </tbody>
    </table>
    <p style="margin-top: 0.75rem; color: var(--color-text-muted); font-size: 0.85rem;">
      💡 Cloudflare Workers 使用 V8 Isolate（而非容器），冷启动通常 &lt;5ms。<br>
      在 wrangler dev 本地环境中，所有请求共享同一个进程，冷启动效果不明显。<br>
      部署到 Cloudflare 全球网络后，可以更真实地观察边缘计算的响应特征。
    </p>
  `;

  resultBox.innerHTML = html;
}
