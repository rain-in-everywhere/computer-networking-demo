/**
 * GET /api/geo — 返回请求的边缘节点/网络信息
 * 演示：CDN 边缘计算、TLS、HTTP 协议版本、ASN
 */
export async function onRequest(context) {
  const { request } = context;
  const cf = request.cf || {};

  const geoData = {
    // 边缘节点（CDN 核心信息）
    colo: cf.colo || "未知（本地开发环境）",
    coloNote:
      "colo 是 Cloudflare 边缘数据中心的 IATA 代码（如 LAX=洛杉矶, NRT=东京, FRA=法兰克福）",

    // 地理位置
    country: cf.country || "未知",
    city: cf.city || "未知",
    region: cf.region || "未知",
    timezone: cf.timezone || "未知",

    // 网络连接信息
    asn: cf.asn || "未知",
    asnNote:
      "ASN 是自治系统编号，标识请求来源的 ISP/网络。" +
      (cf.asn ? ` AS${cf.asn}` : ""),
    httpProtocol: cf.httpProtocol || "未知",
    protocolNote:
      "HTTP 协议版本：HTTP/1.1（文本）、HTTP/2（多路复用）、HTTP/3（QUIC/UDP）",
    tlsVersion: cf.tlsVersion || "未知",
    tlsCipher: cf.tlsCipher || "未知",
    tlsNote: "TLS 加密保证客户端到 Cloudflare 边缘节点的传输安全。",

    // 客户端信息
    clientIP: request.headers.get("CF-Connecting-IP") || "未知",
    userAgent: request.headers.get("User-Agent") || "未知",

    // 服务端
    edgeTime: new Date().toISOString(),
    workerRuntime: "Cloudflare Workers (Pages Functions)",

    // 本地开发提示
    _devNote: cf.colo
      ? null
      : "⚠ 本地开发环境（wrangler pages dev）不注入 request.cf 数据。部署到 Cloudflare 后即可看到真实边缘节点信息。",
  };

  return new Response(JSON.stringify(geoData, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
