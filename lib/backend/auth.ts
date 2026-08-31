import { createHash, createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE_SECONDS } from "@/lib/backend/auth-constants";
import { AdminRoleSchema, AdminSessionSchema, type AdminRole, type AdminSession } from "@/lib/backend/contracts";

const PasswordHashSchema = z.string().regex(/^scrypt\$\d+\$\d+\$\d+\$[A-Za-z0-9_-]+\$[A-Za-z0-9_-]+$/);
const SessionPayloadSchema = z.object({
  sub: z.string().email(),
  role: AdminRoleSchema,
  iat: z.number().int().positive(),
  exp: z.number().int().positive()
}).strict();

type AuthConfig = {
  email: string;
  passwordHash: string;
  secret: string;
  role: AdminRole;
};

export class AuthConfigurationError extends Error {
  constructor() {
    super("La autenticación administrativa no está configurada");
    this.name = "AuthConfigurationError";
  }
}

function readAuthConfig(): AuthConfig {
  const email = process.env.IRP_ADMIN_EMAIL?.trim().toLowerCase();
  const passwordHash = process.env.IRP_ADMIN_PASSWORD_HASH?.trim();
  const secret = process.env.IRP_AUTH_SECRET?.trim();
  const parsedRole = AdminRoleSchema.safeParse(process.env.IRP_ADMIN_ROLE?.trim());

  if (!email || !z.string().email().safeParse(email).success) throw new AuthConfigurationError();
  if (!passwordHash || !PasswordHashSchema.safeParse(passwordHash).success) throw new AuthConfigurationError();
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) throw new AuthConfigurationError();
  if (!parsedRole.success) throw new AuthConfigurationError();

  return { email, passwordHash, secret, role: parsedRole.data };
}

function safeEqual(left: Buffer, right: Buffer) {
  return left.length === right.length && timingSafeEqual(left, right);
}

function safeEqualText(left: string, right: string) {
  return safeEqual(
    createHash("sha256").update(left, "utf8").digest(),
    createHash("sha256").update(right, "utf8").digest()
  );
}

function decodePasswordHash(encoded: string) {
  const [, rawCost, rawBlockSize, rawParallelization, rawSalt, rawHash] = encoded.split("$");
  const cost = Number(rawCost);
  const blockSize = Number(rawBlockSize);
  const parallelization = Number(rawParallelization);
  const salt = Buffer.from(rawSalt, "base64url");
  const expectedHash = Buffer.from(rawHash, "base64url");
  const validCost = Number.isInteger(cost) && cost >= 16_384 && cost <= 65_536 && (cost & (cost - 1)) === 0;

  if (!validCost || blockSize !== 8 || parallelization < 1 || parallelization > 4) throw new AuthConfigurationError();
  if (salt.length < 16 || expectedHash.length !== 64) throw new AuthConfigurationError();
  return { cost, blockSize, parallelization, salt, expectedHash };
}

export function verifyAdminCredentials(email: string, password: string) {
  const config = readAuthConfig();
  const decoded = decodePasswordHash(config.passwordHash);
  const actualHash = scryptSync(password, decoded.salt, decoded.expectedHash.length, {
    N: decoded.cost,
    r: decoded.blockSize,
    p: decoded.parallelization,
    maxmem: Math.max(64 * 1024 * 1024, 256 * decoded.cost * decoded.blockSize)
  });
  const emailMatches = safeEqualText(email.trim().toLowerCase(), config.email);
  const passwordMatches = safeEqual(actualHash, decoded.expectedHash);
  return emailMatches && passwordMatches ? { email: config.email, role: config.role } : null;
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload, "utf8").digest("base64url");
}

export function createAdminSessionToken(identity: { email: string; role: AdminRole }) {
  const config = readAuthConfig();
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    sub: identity.email,
    role: identity.role,
    iat: issuedAt,
    exp: issuedAt + ADMIN_SESSION_MAX_AGE_SECONDS
  }), "utf8").toString("base64url");
  return `${payload}.${sign(payload, config.secret)}`;
}

export function verifyAdminSessionToken(token: string): AdminSession | null {
  try {
    const config = readAuthConfig();
    const [encodedPayload, encodedSignature, extra] = token.split(".");
    if (!encodedPayload || !encodedSignature || extra) return null;
    const expectedSignature = sign(encodedPayload, config.secret);
    if (!safeEqual(Buffer.from(encodedSignature), Buffer.from(expectedSignature))) return null;
    const payload = SessionPayloadSchema.parse(JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now || payload.iat > now + 60) return null;
    if (!safeEqualText(payload.sub, config.email) || payload.role !== config.role) return null;
    return AdminSessionSchema.parse({
      email: payload.sub,
      role: payload.role,
      issuedAt: payload.iat,
      expiresAt: payload.exp
    });
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  return token ? verifyAdminSessionToken(token) : null;
}

export function adminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS
  };
}
