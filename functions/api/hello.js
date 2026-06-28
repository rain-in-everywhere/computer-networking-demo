/**
 * GET/POST /api/hello — 简单 Hello World API
 * 演示：Serverless 请求/响应模型、HTTP 方法、边缘执行
 */
export async function onRequest(context) {
  const { request } = context;
  const method = request.method;

  const responseData = {
    message: "Hello from Cloudflare Pages Functions!",
    method: method,
    timestamp: new Date().toISOString(),
    runtime: "Cloudflare Workers (Pages Functions)",
    note: "此响应由边缘节点生成，运行在离你最近的 Cloudflare 数据中心。",
  };

  return new Response(JSON.stringify(responseData, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
