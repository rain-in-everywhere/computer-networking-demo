/**
 * Pages Functions 全局中间件
 * 为所有 /api/* 请求添加 CORS 头、响应计时和日志
 */
export async function onRequest(context) {
  const start = Date.now();
  const { request } = context;

  const url = new URL(request.url);

  // 仅对 /api/* 路径生效
  if (!url.pathname.startsWith("/api/")) {
    return context.next();
  }

  // 处理 OPTIONS 预检请求
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, If-None-Match",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const response = await context.next();

  // 注入诊断响应头
  const newResponse = new Response(response.body, response);
  newResponse.headers.set("X-Response-Time-ms", Date.now() - start);
  newResponse.headers.set("X-Powered-By", "Cloudflare Pages Functions");
  newResponse.headers.set("X-Edge-Location", request.cf?.colo || "local-dev");

  // 确保 CORS 头存在
  if (!newResponse.headers.has("Access-Control-Allow-Origin")) {
    newResponse.headers.set("Access-Control-Allow-Origin", "*");
  }

  return newResponse;
}
