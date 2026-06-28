/**
 * GET /api/cache-demo?strategy=...&count=N
 * 演示：HTTP 缓存策略
 * 支持 6 种策略：no-store, no-cache, max-age-10, max-age-60, etag, immutable
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const strategy = url.searchParams.get("strategy") || "no-cache";
  const requestCount = parseInt(url.searchParams.get("count") || "0");

  // 缓存策略定义
  const strategies = {
    "no-store": {
      headers: { "Cache-Control": "no-store" },
      description:
        "浏览器每次都向服务器发起请求，绝不缓存。适合敏感数据（如银行余额）。",
    },
    "no-cache": {
      headers: { "Cache-Control": "no-cache" },
      description:
        "浏览器可以缓存，但每次使用前必须向服务器验证（发送条件请求）。",
    },
    "max-age-10": {
      headers: { "Cache-Control": "public, max-age=10" },
      description: "浏览器缓存 10 秒。10 秒内同一资源不再发送请求。",
    },
    "max-age-60": {
      headers: { "Cache-Control": "public, max-age=60" },
      description: "浏览器缓存 60 秒。适合不常变化的内容（如文章、图片）。",
    },
    etag: {
      headers: {
        "Cache-Control": "public, max-age=5",
        ETag: `"demo-etag-${requestCount % 3}"`,
      },
      description:
        "使用 ETag 标识资源版本。浏览器发送 If-None-Match 询问资源是否变化，不变则返回 304。",
    },
    immutable: {
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
      description:
        "资源永久不变，缓存一年。适合带 hash 的静态资源（如 app.abc123.js）。",
    },
  };

  const config = strategies[strategy] || strategies["no-cache"];
  const responseData = {
    strategy: strategy,
    appliedHeaders: config.headers,
    description: config.description,
    serverTime: new Date().toISOString(),
    requestNumber: requestCount + 1,
    cacheHit: false,
    tip: "打开 DevTools Network 面板，观察本次请求的 Status 和 Size 列。",
  };

  const responseHeaders = new Headers();
  responseHeaders.set("Content-Type", "application/json; charset=utf-8");
  responseHeaders.set("Access-Control-Allow-Origin", "*");
  responseHeaders.set("X-Strategy", strategy);

  // 应用缓存头
  Object.entries(config.headers).forEach(([key, value]) => {
    responseHeaders.set(key, value);
  });

  // ETag 条件请求处理
  if (strategy === "etag") {
    const ifNoneMatch = context.request.headers.get("If-None-Match");
    const currentEtag = config.headers["ETag"];
    if (ifNoneMatch && ifNoneMatch === currentEtag) {
      responseData.cacheHit = true;
      responseData.message = "304 Not Modified — 资源未变化，浏览器使用缓存副本。";
      return new Response(null, { status: 304, headers: responseHeaders });
    }
  }

  return new Response(JSON.stringify(responseData, null, 2), {
    headers: responseHeaders,
  });
}
