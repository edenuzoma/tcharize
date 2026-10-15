import type { NextRequest } from "next/server";

const ignoredRequestHeaders = new Set(["host", "content-length", "connection"]);
const ignoredResponseHeaders = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
]);
const sessionResponsePaths = new Set([
  "auth/login",
  "auth/signup/verify",
  "auth/reset-password",
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
  const routePath = path.join("/");
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
    if (response.ok && sessionResponsePaths.has(routePath)) {
      const payload = await response.json() as Record<string, unknown>;
      const token = payload.token;
      if (typeof token !== "string" || !token) {
        return Response.json(
          { message: "Tcharize could not start your session. Please sign in again." },
          { status: 502 },
        );
      }
      delete payload.token;
      responseHeaders.set("set-cookie", createSessionCookie(token));
      return Response.json(payload, { status: response.status, headers: responseHeaders });
    }

    if (response.ok && routePath === "auth/logout") {
      responseHeaders.set("set-cookie", clearSessionCookie());
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

function createSessionCookie(token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `tcharize_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`;
}

function clearSessionCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `tcharize_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export const dynamic = "force-dynamic";
export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const HEAD = proxyRequest;
export const OPTIONS = proxyRequest;
