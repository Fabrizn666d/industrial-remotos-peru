import { randomBytes, scryptSync } from "node:crypto";
import { stdin, stdout } from "node:process";

if (!stdin.isTTY || !stdout.isTTY) {
  console.error("Este comando requiere una terminal interactiva.");
  process.exitCode = 1;
} else {
  stdout.write("Contraseña administrativa (no se mostrará): ");
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");
  let password = "";

  stdin.on("data", (character) => {
    if (character === "\u0003") process.exit(130);
    if (character === "\r" || character === "\n") {
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write("\n");
      if (password.length < 12 || password.length > 128) {
        console.error("La contraseña debe tener entre 12 y 128 caracteres.");
        process.exitCode = 1;
        return;
      }
      const cost = 16_384;
      const blockSize = 8;
      const parallelization = 1;
      const salt = randomBytes(24);
      const hash = scryptSync(password, salt, 64, {
        N: cost,
        r: blockSize,
        p: parallelization,
        maxmem: 64 * 1024 * 1024
      });
      stdout.write(`scrypt$${cost}$${blockSize}$${parallelization}$${salt.toString("base64url")}$${hash.toString("base64url")}\n`);
      password = "";
      return;
    }
    if (character === "\u007f" || character === "\b") {
      password = password.slice(0, -1);
      return;
    }
    if (character >= " ") password += character;
  });
}
