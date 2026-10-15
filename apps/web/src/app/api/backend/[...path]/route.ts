import type { NextRequest } from "next/server";

const ignoredRequestHeaders = new Set(["host", "content-length", "connection"]);
const ignoredResponseHeaders = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
]);

function getUpstreamApiUrl() {
  const configured =
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000";
  const base = configured.replace(/\/$/, "");
  return base.endsWith("/api/v1") ? base : `${base}/api/v1`;
}

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const upstream = new URL(`${getUpstreamApiUrl()}/${path.map(encodeURIComponent).join("/")}`);
  upstream.search = request.nextUrl.search;

  const headers = new Headers();
  request.headers.forEach((value, name) => {
    if (!ignoredRequestHeaders.has(name.toLowerCase())) headers.set(name, value);
  });

  try {
    const response = await fetch(upstream, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.arrayBuffer(),
      cache: "no-store",
      redirect: "manual",
    });

    const responseHeaders = new Headers();
    response.headers.forEach((value, name) => {
      if (!ignoredResponseHeaders.has(name.toLowerCase()) && name.toLowerCase() !== "set-cookie") {
        responseHeaders.append(name, value);
      }
    });
    for (const cookie of response.headers.getSetCookie()) {
      responseHeaders.append("set-cookie", cookie);
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      { message: "Tcharize could not reach the service. Please try again." },
      { status: 502 },
    );
  }
}

export const dynamic = "force-dynamic";
export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const HEAD = proxyRequest;
export const OPTIONS = proxyRequest;
