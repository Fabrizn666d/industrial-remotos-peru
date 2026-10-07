import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseUrl = (process.env.IRP_CHECK_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const artifactDirectory = path.join(process.cwd(), ".visual-audit", "preliminary-proposal");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function json(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

const customConfiguration = {
  width: "3.2",
  height: "2.4",
  subtype: "Puerta seccional",
  openingSystem: "Seccional",
  design: "Líneas horizontales",
  material: "Acero galvanizado",
  finish: "Nogal oscuro",
  automation: "Motor opcional",
  accessories: [],
  installation: "Incluir instalación"
};

function submission(source, overrides = {}) {
  return {
    clientSubmissionId: randomUUID(),
    contact: {
      name: "Prueba automatizada IRP",
      email: "qa@example.com",
      phone: "+51 999 111 222",
      documentType: "DNI",
      documentNumber: "12345678"
    },
    details: {
      projectType: "Puerta a medida",
      location: "Villa El Salvador, Lima",
      region: "Lima",
      province: "Lima",
      district: "Villa El Salvador",
      address: "Dirección de prueba"
    },
    items: [{
      clientItemId: randomUUID(),
      productId: "seccionales",
      name: "Puerta seccional a medida",
      quantity: 1,
      configuration: customConfiguration
    }],
    attachmentNames: [],
    source,
    ...overrides
  };
}

async function create(payload) {
  return json("/api/requests", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
}

const report = { baseUrl, checks: [] };

const catalog = await json("/api/catalog/pricing");
assert(catalog.response.ok, `El catálogo público respondió ${catalog.response.status}`);
assert(catalog.body.homeCard?.title === "Puertas a medida", "La tarjeta publicada no es Puertas a medida");
report.checks.push("catálogo público y tarjeta Home");

const firstPayload = submission("CONFIGURATOR");
const first = await create(firstPayload);
assert(first.response.status === 201, `Creación esperada 201, recibida ${first.response.status}: ${JSON.stringify(first.body)}`);
assert(first.body.pricing.status === "ESTIMATED", "La propuesta a medida no quedó estimada");
assert(first.body.pricing.estimatedTotalMinor === 527440, `Total demo inesperado: ${first.body.pricing.estimatedTotalMinor}`);
assert(first.body.accessToken?.length >= 32, "No se emitió token privado");
report.checks.push("cálculo servidor puerta a medida");

const replay = await create(firstPayload);
assert(replay.response.status === 200 && replay.body.replayed === true, "La repetición no fue idempotente");
assert(replay.body.code === first.body.code, "La repetición creó otro código");
report.checks.push("idempotencia");

const assistant = await create(submission("ASSISTANT"));
assert(assistant.response.status === 201, "El recorrido del asistente no creó la propuesta");
assert(assistant.body.pricing.estimatedTotalMinor === first.body.pricing.estimatedTotalMinor, "Asistente y cotizador calcularon importes distintos");
report.checks.push("paridad asistente/cotizador");

const importedPayload = submission("CONFIGURATOR", {
  details: { ...firstPayload.details, projectType: "Puerta importada", location: "Cercado de Lima, Lima", district: "Cercado de Lima" },
  items: [{
    clientItemId: randomUUID(),
    productId: "puertas-principales",
    name: "Puerta principal importada",
    quantity: 1,
    configuration: {
      model: "irp-principal-linea-urbana",
      variant: "urbana-090-210",
      finish: "Blanco texturado",
      automation: "included",
      accessories: [],
      installation: "Incluir instalación"
    }
  }]
});
const imported = await create(importedPayload);
assert(imported.response.status === 201, `La variante importada válida falló: ${JSON.stringify(imported.body)}`);
assert(imported.body.pricing.estimatedTotalMinor === 187000, `Total importado inesperado: ${imported.body.pricing.estimatedTotalMinor}`);
report.checks.push("variante importada cerrada");

const invalidImported = await create(submission("CONFIGURATOR", {
  items: [{
    clientItemId: randomUUID(),
    productId: "puertas-principales",
    name: "Puerta importada inválida",
    quantity: 1,
    configuration: { width: "1.15", height: "2.37", finish: "Dorado", accessories: [] }
  }]
}));
assert(invalidImported.response.status === 400, "Una puerta importada aceptó medidas libres");
report.checks.push("rechazo de medidas libres importadas");

const minimumArea = await create(submission("CONFIGURATOR", {
  details: { ...firstPayload.details, location: "Cercado de Lima, Lima", district: "Cercado de Lima" },
  items: [{
    clientItemId: randomUUID(), productId: "seccionales", name: "Mínimo facturable", quantity: 1,
    configuration: { ...customConfiguration, width: "2", height: "2", finish: "Blanco texturado", automation: "Sistema manual", accessories: [], installation: "Solo fabricación" }
  }]
}));
assert(minimumArea.response.status === 201 && minimumArea.body.pricing.estimatedTotalMinor === 270000, "No se aplicó el mínimo de 6 m²");
report.checks.push("mínimo facturable");

const quantityTwo = await create(submission("CONFIGURATOR", {
  items: Array.from({ length: 12 }, (_, index) => ({ clientItemId: randomUUID(), productId: "seccionales", name: `Dos puertas · partida ${index + 1}`, quantity: 2, configuration: customConfiguration }))
}));
assert(quantityTwo.response.status === 201 && quantityTwo.body.pricing.estimatedTotalMinor === 12428560, "Cantidad o cargo único por propuesta incorrecto");
report.checks.push("cantidad y transporte único");

const outOfRange = await create(submission("CONFIGURATOR", {
  items: [{ clientItemId: randomUUID(), productId: "seccionales", name: "Fuera de rango", quantity: 1, configuration: { ...customConfiguration, width: "7" } }]
}));
assert(outOfRange.response.status === 400, "Se aceptó una medida fuera del rango publicado");
report.checks.push("límites de medidas");

const manipulated = submission("CONFIGURATOR");
manipulated.clientTotalMinor = 1;
const manipulatedResult = await create(manipulated);
assert(manipulatedResult.response.status === 400, "El servidor aceptó un total enviado por el cliente");
report.checks.push("rechazo de precio manipulado");

const invalidRucPayload = submission("CONFIGURATOR");
invalidRucPayload.contact = { ...invalidRucPayload.contact, documentType: "RUC", documentNumber: "123", businessName: "" };
const invalidRuc = await create(invalidRucPayload);
assert(invalidRuc.response.status === 400, "Se aceptó un RUC inválido");
report.checks.push("validación DNI/RUC");

const privateProposal = await json(`/api/proposals/${first.body.code}?token=${encodeURIComponent(first.body.accessToken)}`);
assert(privateProposal.response.ok, "No se pudo recuperar la propuesta privada");
assert(privateProposal.body.proposal.pricingSnapshot.estimatedTotalMinor === 527440, "El snapshot privado cambió");
const denied = await json(`/api/proposals/${first.body.code}?token=${"x".repeat(40)}`);
assert(denied.response.status === 404, "El código quedó expuesto sin el token correcto");
report.checks.push("acceso privado y snapshot");

const pdf = await fetch(`${baseUrl}/api/proposals/${first.body.code}/pdf?token=${encodeURIComponent(first.body.accessToken)}`);
const pdfBytes = await pdf.arrayBuffer();
assert(pdf.ok && pdf.headers.get("content-type")?.includes("application/pdf"), `PDF inválido: ${pdf.status}`);
assert(pdfBytes.byteLength > 5000, `PDF demasiado pequeño: ${pdfBytes.byteLength} bytes`);
await mkdir(artifactDirectory, { recursive: true });
await writeFile(path.join(artifactDirectory, `${first.body.code}-simple.pdf`), Buffer.from(pdfBytes));
report.checks.push(`PDF ${pdfBytes.byteLength} bytes`);

const multipagePdf = await fetch(`${baseUrl}/api/proposals/${quantityTwo.body.code}/pdf?token=${encodeURIComponent(quantityTwo.body.accessToken)}`);
const multipageBytes = Buffer.from(await multipagePdf.arrayBuffer());
const pageMarkers = (multipageBytes.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
assert(multipagePdf.ok && pageMarkers >= 2, `El PDF extenso no paginó correctamente (${pageMarkers} páginas detectadas)`);
await writeFile(path.join(artifactDirectory, `${quantityTwo.body.code}-multipage.pdf`), multipageBytes);
report.checks.push(`PDF multipágina ${pageMarkers} páginas`);

const admin = await json("/api/admin/pricing-catalog");
assert([401, 403].includes(admin.response.status), "La administración del catálogo quedó pública");
report.checks.push("administración protegida");

if (process.env.IRP_CHECK_ADMIN_EMAIL && process.env.IRP_CHECK_ADMIN_PASSWORD) {
  const login = await json("/api/admin/session", {
    method: "POST",
    headers: { "content-type": "application/json", origin: baseUrl },
    body: JSON.stringify({ email: process.env.IRP_CHECK_ADMIN_EMAIL, password: process.env.IRP_CHECK_ADMIN_PASSWORD })
  });
  assert(login.response.ok, `No se pudo iniciar la sesión de prueba: ${JSON.stringify(login.body)}`);
  const cookie = login.response.headers.get("set-cookie")?.split(";", 1)[0];
  assert(cookie, "La sesión administrativa no emitió cookie");
  const adminHeaders = { cookie, origin: baseUrl };

  const catalogAdmin = await json("/api/admin/pricing-catalog", { headers: adminHeaders });
  assert(catalogAdmin.response.ok, "No se pudo cargar el borrador administrativo");
  const draft = structuredClone(catalogAdmin.body.draft);
  const custom = draft.definitions.find((entry) => entry.productId === "seccionales")?.custom;
  assert(custom, "No existe la regla editable de puerta seccional");
  custom.areaRates[0].unitPriceMinor += 100;
  const saved = await json("/api/admin/pricing-catalog", {
    method: "PUT",
    headers: { ...adminHeaders, "content-type": "application/json" },
    body: JSON.stringify(draft)
  });
  assert(saved.response.ok, `No se guardó el borrador: ${JSON.stringify(saved.body)}`);
  const published = await json("/api/admin/pricing-catalog", { method: "POST", headers: adminHeaders });
  assert(published.response.ok && published.body.version > catalogAdmin.body.published.version, "No se publicó una nueva versión");
  const catalogAfterPublish = await json("/api/catalog/pricing");
  assert(catalogAfterPublish.body.version === published.body.version, "El público no recibió la versión publicada");
  const snapshotAfterPublish = await json(`/api/proposals/${first.body.code}?token=${encodeURIComponent(first.body.accessToken)}`);
  assert(snapshotAfterPublish.body.proposal.pricingSnapshot.estimatedTotalMinor === 527440, "Publicar catálogo alteró una propuesta emitida");
  report.checks.push("borrador, publicación y snapshot histórico");

  const operation = await json(`/api/admin/requests/${first.body.id}`, {
    method: "PATCH",
    headers: { ...adminHeaders, "content-type": "application/json" },
    body: JSON.stringify({ status: "IN_REVIEW", assignedTo: "asesor@example.com", internalNote: "Validación operativa automatizada" })
  });
  assert(operation.response.ok, `No se actualizó el seguimiento: ${JSON.stringify(operation.body)}`);
  assert(operation.body.request.status === "IN_REVIEW" && operation.body.request.assignedTo === "asesor@example.com", "Estado o responsable no persistieron");
  const adminDetail = await fetch(`${baseUrl}/admin/solicitudes/${first.body.id}`, { headers: { cookie } });
  const adminDetailHtml = await adminDetail.text();
  assert(adminDetail.ok && adminDetailHtml.includes("Validación operativa automatizada"), "La nota interna no aparece en el historial");
  const adminPdf = await fetch(`${baseUrl}/api/admin/requests/${first.body.id}/pdf`, { headers: { cookie } });
  assert(adminPdf.ok && adminPdf.headers.get("content-type")?.includes("application/pdf"), "El PDF administrativo falló");
  report.checks.push("estado, responsable, nota, historial y PDF administrativo");
}

process.stdout.write(`${JSON.stringify({ ok: true, ...report }, null, 2)}\n`);
