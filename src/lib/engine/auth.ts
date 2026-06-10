// Guard for the /api/engine/* ops routes. Fail closed: if no admin token is
// configured, every request is rejected. The token is sent as
// `Authorization: Bearer <ENGINE_ADMIN_TOKEN>`.

import { timingSafeEqual } from "crypto";
import { config } from "./config";

/** Constant-time string compare — avoids leaking the token via response timing. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function authorize(req: Request): { ok: true } | { ok: false; status: number; error: string } {
  const expected = config.adminToken;
  if (!expected) {
    return { ok: false, status: 503, error: "Engine admin token not configured (set ENGINE_ADMIN_TOKEN)." };
  }
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token || !safeEqual(token, expected)) {
    return { ok: false, status: 401, error: "Unauthorized." };
  }
  return { ok: true };
}
