/**
 * CDN 与边缘计算演示 — 交互逻辑
 */

async function fetchGeo() {
  const resultBox = document.getElementById("geo-result-raw");
  resultBox.innerHTML = '<span style="color: var(--color-text-muted);">⏳ 正在查询边缘节点信息…</span>';

  const { data, error, response } = await fetchJSON("/api/geo");

  if (error) {
    resultBox.innerHTML = `<div class="status-line"><span class="status-badge error">✗ Error</span></div>${escapeHTML(error)}`;
    document.getElementById("geo-info-table").innerHTML = "";
    return;
  }

  displayResult("geo-result-raw", data, response.status);

  // 构建结构化信息表格
  const rows = [
    { label: "边缘节点 (colo)", value: data.colo, note: data.coloNote || "" },
    {
      label: "国家 / 城市",
      value: `${data.country} / ${data.city || "—"}`,
      note: `时区: ${data.timezone || "—"}`,
    },
    {
      label: "HTTP 协议版本",
      value: data.httpProtocol || "—",
      note: data.protocolNote || "",
    },
    {
      label: "TLS 版本",
      value: data.tlsVersion || "—",
      note: `加密套件: ${data.tlsCipher || "—"}`,
    },
    {
      label: "ASN",
      value: data.asn || "—",
      note: data.asnNote || "",
    },
    {
      label: "客户端 IP",
      value: data.clientIP || "—",
      note: "由 CF-Connecting-IP 头提供",
    },
    {
      label: "User-Agent",
      value: data.userAgent || "—",
      note: "",
    },
    {
      label: "边缘响应时间",
      value: data.edgeTime || "—",
      note: "Worker 生成此响应的时刻",
    },
  ];

  displayInfoTable("geo-info-table", rows);

  // 本地开发提示
  if (data._devNote) {
    const tableEl = document.getElementById("geo-info-table");
    tableEl.insertAdjacentHTML(
      "afterend",
      `<div class="card" style="margin-top: 1rem; border-color: var(--color-warning);">
        <p style="color: var(--color-warning); font-size: 0.9rem;">⚠ ${escapeHTML(data._devNote)}</p>
      </div>`
    );
  }
}
