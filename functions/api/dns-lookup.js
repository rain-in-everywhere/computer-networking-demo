/**
 * GET /api/dns-lookup?domain=...&type=...
 * 演示：DNS 解析、DNS-over-HTTPS (DoH)、记录类型
 * 调用 Cloudflare 1.1.1.1 的 DoH 端点进行加密 DNS 查询
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const domain = url.searchParams.get("domain") || "example.com";
  const recordType = url.searchParams.get("type") || "A";

  // 验证 record type
  const validTypes = ["A", "AAAA", "CNAME", "MX", "TXT", "NS"];
  const type = validTypes.includes(recordType.toUpperCase())
    ? recordType.toUpperCase()
    : "A";

  try {
    const dohUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(type)}`;
    const dohResponse = await fetch(dohUrl, {
      headers: { Accept: "application/dns-json" },
    });

    if (!dohResponse.ok) {
      return new Response(
        JSON.stringify(
          {
            error: "DNS 查询失败",
            domain: domain,
            recordType: type,
            dohStatus: dohResponse.status,
            hint: "请检查域名拼写是否正确",
          },
          null,
          2
        ),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const dnsData = await dohResponse.json();

    return new Response(
      JSON.stringify(
        {
          domain: domain,
          recordType: type,
          results: dnsData.Answer || [],
          authority: dnsData.Authority || [],
          question: dnsData.Question || [],
          status: dnsData.Status === 0 ? "NOERROR" : `错误码 ${dnsData.Status}`,
          resolver: "Cloudflare 1.1.1.1 (DNS-over-HTTPS)",
          queryTime: new Date().toISOString(),
          dnsProtocol: "DoH (DNS over HTTPS) — 加密的 DNS 查询",
          note:
            type === "A"
              ? "A 记录将域名映射到 IPv4 地址，是 DNS 最基本的记录类型。"
              : `${type} 记录用于 ${recordDescription(type)}`,
        },
        null,
        2
      ),
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify(
        {
          error: "DNS-over-HTTPS 请求异常",
          message: err.message,
          hint: "可能是网络问题或 DoH 服务暂时不可用",
        },
        null,
        2
      ),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}

function recordDescription(type) {
  const map = {
    A: "域名→IPv4 地址",
    AAAA: "域名→IPv6 地址",
    CNAME: "域名别名（Canonical Name），如 www 指向主域名",
    MX: "邮件交换服务器（Mail Exchanger），指定接收邮件的服务器",
    TXT: "文本记录，常用于 SPF/DKIM 邮件验证、域名所有权验证",
    NS: "权威名称服务器，指定由哪些 DNS 服务器解析该域名",
  };
  return map[type] || "DNS 记录";
}
