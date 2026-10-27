import { cp, mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import net from "node:net";

const root = process.cwd();
const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "irp-lamborghini-"));
const pricingPath = path.join(temporaryRoot, "pricing.json");
const cmsPath = path.join(temporaryRoot, "cms.json");
const requestsPath = path.join(temporaryRoot, "requests.json");
const port = await new Promise((resolve, reject) => {
  const probe = net.createServer();
  probe.once("error", reject);
  probe.listen(0, "127.0.0.1", () => {
    const address = probe.address();
    const freePort = typeof address === "object" && address ? address.port : 0;
    probe.close((error) => error ? reject(error) : resolve(freePort));
  });
});
const baseUrl = `http://127.0.0.1:${port}`;
await Promise.all([
  cp(path.join(root, ".data", "irp-pricing.json"), pricingPath),
  cp(path.join(root, ".data", "irp-cms.json"), cmsPath),
]);

const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--webpack", "--hostname", "127.0.0.1", "--port", String(port)], {
  cwd: root,
  windowsHide: true,
  stdio: ["ignore", "pipe", "pipe"],
  env: {
    ...process.env,
    PORT: String(port),
    HOSTNAME: "127.0.0.1",
    IRP_REPOSITORY_DRIVER: "json",
    IRP_ALLOW_JSON_IN_PRODUCTION: "true",
    IRP_JSON_DATA_PATH: requestsPath,
    IRP_PRICING_JSON_DATA_PATH: pricingPath,
    IRP_CMS_JSON_DATA_PATH: cmsPath,
  },
});

let stderr = "";
server.stderr.on("data", (chunk) => {
  stderr = `${stderr}${String(chunk)}`.slice(-4000);
});
server.stdout.on("data", () => {});

async function waitUntilReady() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/catalog/pricing`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`El servidor aislado no inició. ${stderr}`);
}

try {
  await waitUntilReady();
  const submission = {
    clientSubmissionId: crypto.randomUUID(),
    contact: { name: "Prueba aislada Lamborghini", email: "", phone: "987654321", documentType: "DNI", documentNumber: "12345678" },
    details: { projectType: "Vivienda unifamiliar", location: "Villa El Salvador, Lima", region: "Lima", province: "Lima", district: "Villa El Salvador", address: "Prueba local aislada", stage: "En evaluación", notes: "No contactar. Validación automatizada aislada." },
    items: [{ clientItemId: crypto.randomUUID(), productId: "puertas-contraplacadas", name: "Puertas contraplacadas", quantity: 1, configuration: { measurementsUnknown: true, model: "contraplacada-lamborghini", custom_selectedImage: "/images/configurator/catalog/11_Puertas_contraplacadas/Propuestas/Lamborghini/lamborghini-grafito.webp", custom_modelLabel: "Lamborghini", custom_designOrigin: "PROPOSAL" } }],
    attachmentNames: [],
    source: "CONFIGURATOR",
  };
  const createResponse = await fetch(`${baseUrl}/api/requests`, { method: "POST", headers: { "Content-Type": "application/json", Origin: baseUrl }, body: JSON.stringify(submission) });
  const created = await createResponse.json();
  if (!createResponse.ok) throw new Error(`La solicitud falló (${createResponse.status}): ${JSON.stringify(created)}. Servidor: ${stderr}`);
  const stored = await readFile(requestsPath, "utf8");
  const proposalResponse = await fetch(`${baseUrl}/api/proposals/${encodeURIComponent(created.code)}?token=${encodeURIComponent(created.accessToken)}`);
  const pdfResponse = await fetch(`${baseUrl}/api/proposals/${encodeURIComponent(created.code)}/pdf?token=${encodeURIComponent(created.accessToken)}`);
  const pdf = await pdfResponse.arrayBuffer();
  const result = {
    passed: createResponse.ok && proposalResponse.ok && pdfResponse.ok && stored.includes("contraplacada-lamborghini") && stored.includes("lamborghini-grafito.webp") && stored.includes('"email": ""'),
    createStatus: createResponse.status,
    code: created.code,
    pricingStatus: created.pricing?.status,
    storedModel: stored.includes("contraplacada-lamborghini"),
    storedImage: stored.includes("lamborghini-grafito.webp"),
    emptyEmailStored: stored.includes('"email": ""'),
    proposalStatus: proposalResponse.status,
    pdfStatus: pdfResponse.status,
    pdfBytes: pdf.byteLength,
    isolatedPath: temporaryRoot,
  };
  console.log(JSON.stringify(result, null, 2));
  if (!result.passed) process.exitCode = 1;
} finally {
  server.kill("SIGTERM");
}
