import { createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = (process.env.IRP_CHECK_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const envText = await readFile(new URL("../.env.local", import.meta.url), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter((line) => /^[A-Za-z_][A-Za-z0-9_]*=/.test(line)).map((line) => { const index = line.indexOf("="); return [line.slice(0,index),line.slice(index + 1).replace(/^['"]|['"]$/g,"")]; }));
const now = Math.floor(Date.now() / 1000);
const payload = Buffer.from(JSON.stringify({sub: env.IRP_ADMIN_EMAIL.toLowerCase(), role: env.IRP_ADMIN_ROLE, iat: now, exp: now + 3600}),"utf8").toString("base64url");
const token = `${payload}.${createHmac("sha256",env.IRP_AUTH_SECRET).update(payload,"utf8").digest("base64url")}`;
const browser = await chromium.launch({executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true});
const context = await browser.newContext({viewport: {width: 1440, height: 900}, locale: "es-PE", reducedMotion: "reduce"});
await context.addCookies([{name: "irp_admin_session", value: token, url: baseUrl, httpOnly: true, sameSite: "Lax"}]);
await context.addInitScript(() => { sessionStorage.setItem("irp-intro-v4","seen"); localStorage.setItem("irp_cookie_consent_v1",JSON.stringify({necessary:true,analytics:false,optional:false})); });

const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const getDocument = async (key) => { const response = await context.request.get(`${baseUrl}/api/admin/content/${key}`); if (!response.ok()) throw new Error(`GET ${key}: ${response.status()}`); return (await response.json()).document; };
const saveDocument = async (key, content) => { const current = await getDocument(key); const response = await context.request.patch(`${baseUrl}/api/admin/content/${key}`, {headers: {Origin: baseUrl, "Content-Type": "application/json"}, data: {expectedVersion: current.version, content}}); if (!response.ok()) throw new Error(`PATCH ${key}: ${response.status()} ${await response.text()}`); return (await response.json()).document; };

let originalAbout;
let originalProjects;
let uploadedId = "";
try {
  originalAbout = structuredClone((await getDocument("about")).content);
  originalProjects = structuredClone((await getDocument("projects")).content);

  const aboutPage = await context.newPage();
  await aboutPage.goto(`${baseUrl}/admin/contenido/nosotros`, {waitUntil: "domcontentloaded", timeout: 60000});
  check(await aboutPage.getByRole("heading", {name: "Hero", exact: true}).isVisible(), "El editor no muestra la sección Hero.");
  for (const heading of ["Quiénes somos","Misión y visión","Valores","Ubicación y contacto"]) check(await aboutPage.getByRole("heading", {name: heading, exact: true}).isVisible(), `El editor no muestra ${heading}.`);
  check(await aboutPage.locator('input[type="file"]:not([multiple])').count() >= 7, "Nosotros no ofrece subida directa para todas sus imágenes.");
  await aboutPage.close();

  const projectsPage = await context.newPage();
  await projectsPage.goto(`${baseUrl}/admin/contenido/proyectos`, {waitUntil: "domcontentloaded", timeout: 60000});
  check(await projectsPage.locator('input[type="file"][multiple]').count() === 1, "Proyectos no ofrece subida múltiple directa.");
  check(await projectsPage.getByLabel("Título público").isVisible(), "Proyectos no permite editar su título.");
  await projectsPage.close();

  const editedAbout = structuredClone(originalAbout);
  editedAbout.presentation.statement = `${originalAbout.presentation.statement} QA`;
  await saveDocument("about", editedAbout);
  const publicAbout = await context.newPage();
  await publicAbout.goto(`${baseUrl}/nosotros?qa=${Date.now()}`, {waitUntil: "domcontentloaded"});
  check(await publicAbout.getByText(editedAbout.presentation.statement, {exact: true}).isVisible(), "La edición de Nosotros no se reflejó en la página pública.");
  await publicAbout.close();
  await saveDocument("about", originalAbout);

  const editedProjects = structuredClone(originalProjects);
  editedProjects.title = `${originalProjects.title} QA`;
  await saveDocument("projects", editedProjects);
  const publicProjects = await context.newPage();
  await publicProjects.goto(`${baseUrl}/proyectos?qa=${Date.now()}`, {waitUntil: "domcontentloaded"});
  check(await publicProjects.getByRole("heading", {name: editedProjects.title, exact: true}).isVisible(), "La edición de Proyectos no se reflejó en la página pública.");
  await publicProjects.close();
  await saveDocument("projects", originalProjects);

  const upload = await context.request.post(`${baseUrl}/api/admin/media`, {headers: {Origin: baseUrl}, multipart: {files: {name: `qa-three-designs-${Date.now()}.png`, mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z9SAAAAAASUVORK5CYII=","base64")}, alt: "QA temporal de subida directa"}});
  const uploaded = await upload.json();
  uploadedId = uploaded.items?.[0]?.id || "";
  check(upload.ok() && Boolean(uploadedId), "La subida directa persistente falló.");
  if (uploadedId) {
    const media = await context.request.get(`${baseUrl}/api/admin/media`);
    const listed = await media.json();
    check(listed.items?.some((item) => item.id === uploadedId), "El archivo subido no apareció en la biblioteca persistente.");
  }
} finally {
  if (originalAbout) { const current = await getDocument("about"); if (JSON.stringify(current.content) !== JSON.stringify(originalAbout)) await saveDocument("about",originalAbout); }
  if (originalProjects) { const current = await getDocument("projects"); if (JSON.stringify(current.content) !== JSON.stringify(originalProjects)) await saveDocument("projects",originalProjects); }
  if (uploadedId) await context.request.delete(`${baseUrl}/api/admin/media/${uploadedId}`, {headers: {Origin: baseUrl}});
  await browser.close();
}

console.log(JSON.stringify({passed: failures.length === 0, failures}, null, 2));
if (failures.length) process.exitCode = 1;
