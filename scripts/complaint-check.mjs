import { createHmac, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const baseUrl = (process.env.IRP_CHECK_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const envText = await readFile(path.join(process.cwd(), ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter((line) => /^[A-Za-z_][A-Za-z0-9_]*=/.test(line)).map((line) => { const index = line.indexOf("="); return [line.slice(0, index), line.slice(index + 1).replace(/^['"]|['"]$/g, "")]; }));
if (!env.IRP_ADMIN_EMAIL || !env.IRP_ADMIN_ROLE || !env.IRP_AUTH_SECRET) throw new Error("Falta la configuración administrativa local");
const now = Math.floor(Date.now() / 1000);
const sessionPayload = Buffer.from(JSON.stringify({ sub: env.IRP_ADMIN_EMAIL.toLowerCase(), role: env.IRP_ADMIN_ROLE, iat: now, exp: now + 3600 }), "utf8").toString("base64url");
const cookie = `irp_admin_session=${sessionPayload}.${createHmac("sha256", env.IRP_AUTH_SECRET).update(sessionPayload, "utf8").digest("base64url")}`;
const submission = {
  clientSubmissionId: randomUUID(),
  consumer: { name: "Prueba legal automatizada", documentType: "DNI", documentNumber: "12345678", phone: "987654321", email: "qa-reclamos@example.com", address: "Dirección de prueba" },
  contractedGood: "Servicio de prueba del Libro de Reclamaciones", amount: "S/ 100", incidentDate: new Date().toISOString().slice(0, 10), type: "RECLAMO",
  detail: "Registro de control automatizado; no corresponde a un reclamo comercial real.", requestedResolution: "Validar persistencia, seguimiento y constancia.", consent: true, website: ""
};
const createdResponse = await fetch(`${baseUrl}/api/complaints`, { method: "POST", headers: { "content-type": "application/json", origin: baseUrl, "x-real-ip": `qa-complaint-${Date.now()}` }, body: JSON.stringify(submission) });
const created = await createdResponse.json();
if (createdResponse.status !== 201 || !created.complaint?.pdfUrl) throw new Error(`No se registró el reclamo: ${JSON.stringify(created)}`);
const pdfResponse = await fetch(`${baseUrl}${created.complaint.pdfUrl}`);
const pdf = Buffer.from(await pdfResponse.arrayBuffer());
if (!pdfResponse.ok || !pdfResponse.headers.get("content-type")?.includes("application/pdf") || pdf.length < 2000 || pdf.subarray(0, 4).toString("ascii") !== "%PDF") throw new Error(`Constancia PDF inválida: ${pdfResponse.status}/${pdf.length}`);
const denied = await fetch(`${baseUrl}/api/complaints/${created.complaint.code}/pdf?token=${"x".repeat(43)}`);
if (denied.status !== 404) throw new Error("La constancia quedó accesible con un token incorrecto");
const updateResponse = await fetch(`${baseUrl}/api/admin/complaints/${created.complaint.id}`, { method: "PATCH", headers: { cookie, origin: baseUrl, "content-type": "application/json" }, body: JSON.stringify({ status: "ANSWERED", providerResponse: "Respuesta de verificación registrada correctamente." }) });
const updated = await updateResponse.json();
if (!updateResponse.ok || updated.complaint?.status !== "ANSWERED" || !updated.complaint?.responseAt) throw new Error(`No se guardó la respuesta: ${JSON.stringify(updated)}`);
const adminDetail = await fetch(`${baseUrl}/admin/reclamos/${created.complaint.id}`, { headers: { cookie } });
if (!adminDetail.ok || !(await adminDetail.text()).includes("Respuesta de verificación registrada correctamente.")) throw new Error("La respuesta no aparece en el detalle administrativo");
const directory = path.join(process.cwd(), ".visual-audit", "complaints");
await mkdir(directory, { recursive: true });
const output = path.join(directory, `${created.complaint.code}.pdf`);
await writeFile(output, pdf);
console.log(JSON.stringify({ passed: true, code: created.complaint.code, status: updated.complaint.status, pdfBytes: pdf.length, privateAccessDenied: true, output }, null, 2));
