import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import { mkdtemp, readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const root = process.cwd();
const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "irp-catalog-checkout-"));
const password = "TestingAdmin123!";
const email = "owner@example.com";
const salt = Buffer.alloc(16, 7);
const hash = scryptSync(password, salt, 64);
const passwordHash = `scrypt$16384$8$1$${salt.toString("base64url")}$${hash.toString("base64url")}`;
const freePort = await new Promise((resolve, reject) => {
  const probe = net.createServer();
  probe.once("error", reject);
  probe.listen(0, "127.0.0.1", () => {
    const address = probe.address();
    const port = typeof address === "object" && address ? address.port : 0;
    probe.close((error) => error ? reject(error) : resolve(port));
  });
});
const baseUrl = `http://127.0.0.1:${freePort}`;
const dataPaths = {
  requests: path.join(temporaryRoot, "requests.json"),
  pricing: path.join(temporaryRoot, "pricing.json"),
  cms: path.join(temporaryRoot, "cms.json"),
  admin: path.join(temporaryRoot, "admin.json"),
  attachments: path.join(temporaryRoot, "request-attachments.json"),
  uploads: path.join(temporaryRoot, "uploads"),
};
const server = spawn(process.execPath, [path.join(".next", "standalone", "server.js")], {
  cwd: root,
  windowsHide: true,
  stdio: ["ignore", "pipe", "pipe"],
  env: {
    ...process.env,
    NODE_ENV: "production",
    PORT: String(freePort),
    HOSTNAME: "127.0.0.1",
    IRP_REPOSITORY_DRIVER: "json",
    IRP_ALLOW_JSON_IN_PRODUCTION: "true",
    IRP_ALLOW_DEMO_PRICING: "true",
    IRP_JSON_DATA_PATH: dataPaths.requests,
    IRP_PRICING_JSON_DATA_PATH: dataPaths.pricing,
    IRP_CMS_JSON_DATA_PATH: dataPaths.cms,
    IRP_ADMIN_DATA_PATH: dataPaths.admin,
    IRP_REQUEST_ATTACHMENTS_JSON_DATA_PATH: dataPaths.attachments,
    IRP_UPLOADS_DIR: dataPaths.uploads,
    IRP_ADMIN_EMAIL: email,
    IRP_ADMIN_PASSWORD_HASH: passwordHash,
    IRP_ADMIN_ROLE: "SUPER_ADMIN",
    IRP_AUTH_SECRET: "test-only-secret-at-least-thirty-two-characters",
  },
});
let serverOutput = "";
for (const stream of [server.stdout, server.stderr]) stream.on("data", (chunk) => { serverOutput = `${serverOutput}${String(chunk)}`.slice(-8000); });
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const json = async (response) => ({ response, body: await response.json().catch(() => null) });

async function waitUntilReady() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try { if ((await fetch(`${baseUrl}/api/catalog/pricing`)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`El servidor aislado no inició. ${serverOutput}`);
}

try {
  await waitUntilReady();
  const initialCatalog = (await json(await fetch(`${baseUrl}/api/catalog/pricing`))).body;
  const definitions = new Map(initialCatalog.definitions.map((definition) => [definition.productId, definition]));
  const garage = definitions.get("seccionales");
  const contraplacada = definitions.get("puertas-contraplacadas");
  const imported = definitions.get("puertas-principales");
  assert(JSON.stringify(garage.catalogTypes.map((item) => item.value)) === JSON.stringify(["Seccional", "Corrediza", "Batiente"]), "Garaje no expone exactamente Seccional, Corrediza y Batiente");
  assert(!garage.catalogTypes.some((item) => item.value === "Levadiza"), "Levadiza sigue publicada");
  const singapur = contraplacada.importedModels.find((item) => item.id === "contraplacada-pivotante-singapur");
  const lamborghini = contraplacada.importedModels.find((item) => item.id === "contraplacada-lamborghini");
  assert(singapur?.openingSystem === "Pivotante", "Singapur no conserva apertura Pivotante");
  assert(lamborghini && !lamborghini.openingSystem && lamborghini.openingStatus === "PENDING", "Lamborghini inventa una apertura o no está pendiente");
  assert(imported.importedModels.length === 1, "Importadas expone más de un modelo comercial");
  assert(JSON.stringify(imported.importedModels[0].allowedFinishes) === JSON.stringify(["Blanco", "Grafito", "Miel", "Negro", "Nogal"]), "Importadas no conserva sus cinco colores");
  assert(imported.importedModels[0].variants.length === 2, "Importadas no conserva sus dos medidas");

  const login = await fetch(`${baseUrl}/api/admin/session`, { method: "POST", headers: { "Content-Type": "application/json", Origin: baseUrl }, body: JSON.stringify({ email, password }) });
  const loginBody = await login.json().catch(() => null);
  const cookie = login.headers.get("set-cookie")?.split(";")[0] ?? "";
  assert(login.ok && cookie, "No se pudo iniciar la sesión administrativa aislada");
  if (!login.ok || !cookie) throw new Error(`Login aislado inválido (${login.status}): ${JSON.stringify(loginBody)}`);
  const adminHeaders = { Cookie: cookie, Origin: baseUrl };
  const adminCatalogResult = await json(await fetch(`${baseUrl}/api/admin/pricing-catalog`, { headers: adminHeaders }));
  if (!adminCatalogResult.response.ok) throw new Error(`Catálogo admin inaccesible (${adminCatalogResult.response.status}): ${JSON.stringify(adminCatalogResult.body)}`);
  const adminCatalog = adminCatalogResult.body;
  const garageDraft = adminCatalog.draft.definitions.find((definition) => definition.productId === "seccionales");
  const batienteIndex = garageDraft.catalogTypes.findIndex((item) => item.id === "seccionales-batiente");
  garageDraft.catalogTypes[batienteIndex] = { ...garageDraft.catalogTypes[batienteIndex], published: false };
  const save = await fetch(`${baseUrl}/api/admin/pricing-catalog`, { method: "PUT", headers: { ...adminHeaders, "Content-Type": "application/json" }, body: JSON.stringify(adminCatalog.draft) });
  assert(save.ok, `No se guardó la despublicación (${save.status})`);
  const publish = await fetch(`${baseUrl}/api/admin/pricing-catalog`, { method: "POST", headers: adminHeaders });
  assert(publish.ok, `No se publicó el catálogo de prueba (${publish.status})`);
  const catalogAfterPublish = (await json(await fetch(`${baseUrl}/api/catalog/pricing`))).body;
  const publishedGarage = catalogAfterPublish.definitions.find((definition) => definition.productId === "seccionales");
  assert(!publishedGarage.catalogTypes.some((item) => item.id === "seccionales-batiente"), "Batiente reapareció tras despublicar y recargar");

  const draftId = randomUUID();
  const form = new FormData();
  form.set("draftId", draftId);
  form.set("file", new File([Buffer.from("89504e470d0a1a0a0000000d49484452", "hex")], "referencia.png", { type: "image/png" }));
  const upload = await json(await fetch(`${baseUrl}/api/request-attachments`, { method: "POST", headers: { Origin: baseUrl }, body: form }));
  assert(upload.response.status === 201, `La subida privada falló (${upload.response.status})`);
  const attachment = upload.body?.item;
  const clientSubmissionId = randomUUID();
  const submission = {
    clientSubmissionId,
    contact: { name: "Auditoría aislada", email: "", phone: "987654321", documentType: "DNI", documentNumber: "12345678" },
    details: { projectType: "Casa", location: "Villa El Salvador, Lima", region: "Lima", district: "Villa El Salvador", notes: "Solicitud automatizada aislada. No contactar." },
    items: [{ clientItemId: randomUUID(), productId: "puertas-contraplacadas", name: "Puertas contraplacadas", quantity: 1, configuration: { model: "contraplacada-lamborghini", measurementsUnknown: true, unit: "mm", custom_selectedImage: lamborghini.image, custom_modelLabel: "Lamborghini" } }],
    attachmentNames: [attachment.name],
    referenceAttachments: [attachment],
    source: "CONFIGURATOR",
  };
  const first = await json(await fetch(`${baseUrl}/api/requests`, { method: "POST", headers: { "Content-Type": "application/json", Origin: baseUrl }, body: JSON.stringify(submission) }));
  if (first.response.status !== 201) throw new Error(`La solicitud inicial falló (${first.response.status}): ${JSON.stringify(first.body)}. Servidor: ${serverOutput}`);
  const second = await json(await fetch(`${baseUrl}/api/requests`, { method: "POST", headers: { "Content-Type": "application/json", Origin: baseUrl }, body: JSON.stringify(submission) }));
  assert(first.response.status === 201, `La solicitud inicial falló (${first.response.status})`);
  assert(second.response.status === 200 && second.body?.replayed === true && second.body?.code === first.body?.code, "El reintento no fue idempotente");
  const privateFile = await fetch(`${baseUrl}${attachment.url}`);
  assert(privateFile.ok, "El adjunto privado no puede recuperarse con su token");
  const activeAccessToken = second.body.accessToken;
  const proposal = await fetch(`${baseUrl}/api/proposals/${encodeURIComponent(first.body.code)}?token=${encodeURIComponent(activeAccessToken)}`);
  const pdf = await fetch(`${baseUrl}/api/proposals/${encodeURIComponent(first.body.code)}/pdf?token=${encodeURIComponent(activeAccessToken)}`);
  assert(proposal.ok, "La solicitud pública guardada no puede consultarse");
  assert(pdf.ok && (await pdf.arrayBuffer()).byteLength > 10_000, "El PDF real no se generó");
  const stored = await readFile(dataPaths.requests, "utf8");
  assert(stored.includes("contraplacada-lamborghini") && stored.includes('"unit": "mm"') && stored.includes("referencia.png"), "Persistencia, unidad o referencia no coincide con el envío");

  console.log(JSON.stringify({ passed: failures.length === 0, temporaryRoot, checks: { catalog: true, adminUnpublish: true, privateUpload: true, idempotency: true, proposal: proposal.status, pdf: pdf.status }, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  server.kill("SIGTERM");
}
