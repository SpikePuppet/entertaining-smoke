export function validateSameOrigin(request: Request): {
  ok: true;
} | {
  ok: false;
  message: string;
} {
  const originHeader = request.headers.get("origin");

  if (!originHeader) {
    return { ok: false, message: "Missing Origin header." };
  }

  let requestOrigin: string;
  try {
    const url = new URL(request.url);
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const host = forwardedHost ?? request.headers.get("host") ?? url.host;
    const proto = forwardedProto ?? url.protocol.replace(":", "");

    requestOrigin = `${proto}://${host}`;
  } catch {
    return { ok: false, message: "Unable to verify request origin." };
  }

  let normalizedOrigin: string;
  try {
    normalizedOrigin = new URL(originHeader).origin;
  } catch {
    return { ok: false, message: "Invalid Origin header." };
  }

  if (normalizedOrigin !== requestOrigin) {
    return { ok: false, message: "Cross-site request blocked." };
  }

  return { ok: true };
}
