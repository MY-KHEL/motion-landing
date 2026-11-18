import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "md_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

export function authConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.AUTH_SECRET);
}

export function passwordsMatch(input: string, expected: string) {
  const left = createHash("sha256").update(input).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

function sign(payload: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export async function isAdmin() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;

  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;

  const splitAt = value.lastIndexOf(".");
  if (splitAt <= 0) return false;

  const payload = value.slice(0, splitAt);
  const signature = value.slice(splitAt + 1);
  const expected = sign(payload);
  if (!expected || expected.length !== signature.length) return false;
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return false;

  const [role, expiry] = payload.split(".");
  if (role !== "admin") return false;
  const expiresAt = Number(expiry);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export async function createSession() {
  const payload = `admin.${Date.now() + MAX_AGE_SECONDS * 1000}`;
  const signature = sign(payload);
  if (!signature) {
    throw new Error("AUTH_SECRET is not set");
  }

  const jar = await cookies();
  jar.set(COOKIE, `${payload}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
