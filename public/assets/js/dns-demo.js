/**
 * DNS 解析演示 — 交互逻辑
 */

const dnsRecordTypeLabels = {
  A: "IPv4 地址",
  AAAA: "IPv6 地址",
  CNAME: "域名别名",
  MX: "邮件服务器",
  TXT: "文本记录",
  NS: "名称服务器",
};

async function doDnsLookup() {
  const domainInput = document.getElementById("dns-domain");
  const typeSelect = document.getElementById("dns-type");
  const domain = domainInput.value.trim();
  const recordType = typeSelect.value;
  const resultBox = document.getElementById("dns-result-raw");
  const tableBox = document.getElementById("dns-result-table");

  if (!domain) {
    resultBox.innerHTML =
      '<span style="color: var(--color-danger);">请输入域名</span>';
    return;
  }

  resultBox.innerHTML = `<span style="color: var(--color-text-muted);">⏳ 正在通过 DoH 加密查询 ${escapeHTML(domain)} 的 ${recordType} 记录…</span>`;
  tableBox.innerHTML = "";

  const { data, error, response } = await fetchJSON(
    `/api/dns-lookup?domain=${encodeURIComponent(domain)}&type=${encodeURIComponent(recordType)}`
  );

  if (error) {
    resultBox.innerHTML = `<div class="status-line"><span class="status-badge error">✗ Error</span></div>${escapeHTML(error)}`;
    return;
  }

  displayResult("dns-result-raw", data, response.status);

  // 如果查询失败（状态码非 200）
  if (data.error) {
    tableBox.innerHTML = `<div class="card" style="border-color: var(--color-danger);">
      <p style="color: var(--color-danger);">❌ ${escapeHTML(data.error)}${data.hint ? " — " + escapeHTML(data.hint) : ""}</p>
    </div>`;
    return;
  }

  // 构建结果表格
  const results = data.results || [];
  if (results.length === 0) {
    tableBox.innerHTML = `<div class="card">
      <p style="color: var(--color-text-muted);">未找到 ${escapeHTML(recordType)} 记录（状态: ${escapeHTML(data.status || "未知")}）</p>
      <p style="color: var(--color-text-muted); font-size: 0.85rem; margin-top: 0.5rem;">
        解析器: ${escapeHTML(data.resolver || "—")}<br>
        协议: ${escapeHTML(data.dnsProtocol || "—")}<br>
        ${data.note ? "💡 " + escapeHTML(data.note) : ""}
      </p>
    </div>`;
    return;
  }

  let html = '<table class="info-table"><thead><tr><th>名称</th><th>类型</th><th>TTL (秒)</th><th>数据</th></tr></thead><tbody>';
  results.forEach((record) => {
    html += `
      <tr>
        <td>${escapeHTML(record.name || "—")}</td>
        <td><span class="status-badge info">${escapeHTML(String(record.type))}</span> ${escapeHTML(dnsRecordTypeLabels[record.type] || "")}</td>
        <td>${record.TTL ?? "—"}</td>
        <td>${escapeHTML(String(record.data || "—"))}</td>
      </tr>`;
  });
  html += "</tbody></table>";
  html += `<p style="margin-top: 0.75rem; color: var(--color-text-muted); font-size: 0.85rem;">
    解析器: ${escapeHTML(data.resolver || "—")} &nbsp;|&nbsp;
    协议: ${escapeHTML(data.dnsProtocol || "—")} &nbsp;|&nbsp;
    状态: ${escapeHTML(data.status || "—")}
  </p>`;
  if (data.note) {
    html += `<p style="color: var(--color-success); font-size: 0.85rem;">💡 ${escapeHTML(data.note)}</p>`;
  }
  tableBox.innerHTML = html;
}

/**
 * 快捷查询
 */
function quickLookup(domain) {
  document.getElementById("dns-domain").value = domain;
  doDnsLookup();
}

/**
 * 按 Enter 键触发查询
 */
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("dns-domain");
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") doDnsLookup();
    });
  }
});
