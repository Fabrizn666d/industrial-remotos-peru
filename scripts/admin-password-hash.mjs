import { randomBytes, scryptSync } from "node:crypto";

const password = process.env.IRP_PASSWORD_TO_HASH;
if (!password || password.length < 12) {
  throw new Error("Define IRP_PASSWORD_TO_HASH con al menos 12 caracteres");
}
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64, { N: 16_384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
process.stdout.write(`scrypt$16384$8$1$${salt.toString("base64url")}$${hash.toString("base64url")}\n`);
