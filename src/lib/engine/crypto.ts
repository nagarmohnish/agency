// AES-256-GCM for per-company integration secrets (D27). The key is a single
// 32-byte server secret in ENGINE_CRED_ENC_KEY (base64 or hex), read via config.
// Encrypted blobs are stored in engine_account_credentials.secret and only the
// service-role db() client ever reads them. Plaintext never leaves the server.

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { config } from "./config";

export interface Encrypted {
  v: number; // key/format version, for rotation
  iv: string;
  tag: string;
  ct: string; // all base64
}

function key(): Buffer {
  const raw = config.creds.encKey;
  if (!raw) {
    throw new Error("ENGINE_CRED_ENC_KEY not set — needed to encrypt/decrypt integration credentials.");
  }
  // accept hex (64 chars) or base64; must decode to exactly 32 bytes
  const buf = /^[0-9a-fA-F]{64}$/.test(raw) ? Buffer.from(raw, "hex") : Buffer.from(raw, "base64");
  if (buf.length !== 32) {
    throw new Error("ENGINE_CRED_ENC_KEY must decode to 32 bytes (use `openssl rand -base64 32`).");
  }
  return buf;
}

export function encryptJson(value: unknown): Encrypted {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return {
    v: 1,
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    ct: ct.toString("base64"),
  };
}

export function decryptJson<T = unknown>(enc: Encrypted): T {
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(enc.iv, "base64"));
  decipher.setAuthTag(Buffer.from(enc.tag, "base64"));
  const pt = Buffer.concat([decipher.update(Buffer.from(enc.ct, "base64")), decipher.final()]);
  return JSON.parse(pt.toString("utf8")) as T;
}
