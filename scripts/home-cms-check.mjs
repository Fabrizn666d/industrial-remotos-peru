import { createHmac } from "node:crypto";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.IRP_CHECK_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const outputDirectory = path.join(process.cwd(), ".visual-audit", "home-cms");
const envText = await readFile(path.join(process.cwd(), ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter((line) => /^[A-Za-z_][A-Za-z0-9_]*=/.test(line)).map((line) => { const index = line.indexOf("="); return [line.slice(0,index),line.slice(index+1).replace(/^['"]|['"]$/g,"")]; }));
const now = Math.floor(Date.now()/1000);
const payload = Buffer.from(JSON.stringify({ sub: env.IRP_ADMIN_EMAIL.toLowerCase(), role: env.IRP_ADMIN_ROLE, iat: now, exp: now+3600 }),"utf8").toString("base64url");
const token = `${payload}.${createHmac("sha256",env.IRP_AUTH_SECRET).update(payload,"utf8").digest("base64url")}`;
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z9SAAAAAASUVORK5CYII=","base64");
await mkdir(outputDirectory,{recursive:true});
const browser = await chromium.launch({ executablePath:"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",headless:true });
const context = await browser.newContext({viewport:{width:1440,height:900},locale:"es-PE",reducedMotion:"reduce"});
await context.addCookies([{name:"irp_admin_session",value:token,url:baseUrl,httpOnly:true,sameSite:"Lax"}]);
await context.addInitScript(() => { sessionStorage.setItem("irp-intro-v4","seen"); localStorage.setItem("irp_cookie_consent_v1",JSON.stringify({necessary:true,analytics:false,optional:false})); });
const errors=[]; const uploadedIds=new Set(); let original; let current;
const headers={Origin:baseUrl,"Content-Type":"application/json"};
const getDocument=async()=>{const response=await context.request.get(`${baseUrl}/api/admin/content/home`);if(!response.ok())throw new Error(`GET Home ${response.status()}`);return (await response.json()).document;};
const publish=async(content)=>{const latest=await getDocument();const response=await context.request.patch(`${baseUrl}/api/admin/content/home`,{headers,data:{expectedVersion:latest.version,content}});if(!response.ok())throw new Error(`PATCH Home ${response.status()}: ${await response.text()}`);return (await response.json()).document;};
try {
  original=structuredClone((await getDocument()).content); current=structuredClone(original);
  const admin=await context.newPage(); admin.on("pageerror",e=>errors.push(e.message));
  await admin.goto(`${baseUrl}/admin/contenido/inicio`,{waitUntil:"networkidle",timeout:60000});
  await admin.getByRole("heading",{name:"Inicio",exact:true}).waitFor();
  await admin.screenshot({path:path.join(outputDirectory,"admin-home-1440x900.png"),fullPage:true});

  current.hero.mode="composition"; current.hero.composition.eyebrow=`${original.hero.composition.eyebrow} QA HOME`;
  await publish(current);
  const composition=await context.newPage(); await composition.goto(baseUrl,{waitUntil:"networkidle"});
  const persisted=await composition.getByText(current.hero.composition.eyebrow,{exact:true}).isVisible(); await composition.close();

  current=structuredClone(original); current.hero.mode="image"; await publish(current);
  const imagePage=await context.newPage(); await imagePage.goto(baseUrl,{waitUntil:"networkidle"});
  const imageMode=await imagePage.locator('[data-hero-mode="image"]').isVisible() && await imagePage.locator(".irp-hero__content").count()===0;
  await imagePage.screenshot({path:path.join(outputDirectory,"hero-image-desktop.png")}); await imagePage.close();

  current=structuredClone(original); current.hero.mode="video"; await publish(current);
  const desktopVideoContext=await browser.newContext({viewport:{width:1440,height:900},locale:"es-PE",reducedMotion:"no-preference"});
  await desktopVideoContext.addInitScript(() => sessionStorage.setItem("irp-intro-v4","seen"));
  const videoPage=await desktopVideoContext.newPage(); await videoPage.goto(baseUrl,{waitUntil:"networkidle"});
  const desktopVideo=await videoPage.locator('[data-hero-mode="video"] video').getAttribute("src");
  await videoPage.screenshot({path:path.join(outputDirectory,"hero-video-desktop.png")}); await desktopVideoContext.close();
  const mobileContext=await browser.newContext({viewport:{width:390,height:844},locale:"es-PE",reducedMotion:"no-preference"});
  await mobileContext.addInitScript(() => sessionStorage.setItem("irp-intro-v4","seen"));
  const mobile=await mobileContext.newPage(); await mobile.goto(baseUrl,{waitUntil:"networkidle"});
  const mobileVideo=await mobile.locator('[data-hero-mode="video"] video').getAttribute("src");
  await mobile.screenshot({path:path.join(outputDirectory,"hero-video-mobile.png")}); await mobileContext.close();

  await publish(original);
  await admin.goto(`${baseUrl}/admin/contenido/inicio`,{waitUntil:"networkidle"});
  await admin.getByText("Solo imagen",{exact:true}).click();
  const directInput=admin.locator('input[type="file"][accept*="image/jpeg"]').first();
  await directInput.setInputFiles({name:`qa-home-${Date.now()}.png`,mimeType:"image/png",buffer:png});
  await admin.getByText("Archivo subido. Guarda la página para publicar.").first().waitFor();
  const uploadedSrc=await admin.locator('img[src*="/api/media/"]').first().getAttribute("src");
  if(uploadedSrc) uploadedIds.add(uploadedSrc.split("/").pop());
  await Promise.all([admin.waitForResponse((response)=>response.url().includes("/api/admin/content/home")&&response.request().method()==="PATCH"),admin.getByRole("button",{name:"Guardar",exact:true}).click()]);
  const uploadedPublic=await context.newPage();await uploadedPublic.goto(baseUrl,{waitUntil:"networkidle"});
  const directPublished=await uploadedPublic.locator(`[data-hero-mode="image"] img[src*="/api/media/"]`).count()>0;await uploadedPublic.close();
  await publish(original);

  await admin.goto(`${baseUrl}/admin/contenido/inicio`,{waitUntil:"networkidle"});
  const multi=admin.locator('input[type="file"][multiple]').first();
  await multi.setInputFiles([{name:`qa-gallery-a-${Date.now()}.png`,mimeType:"image/png",buffer:png},{name:`qa-gallery-b-${Date.now()}.png`,mimeType:"image/png",buffer:png}]);
  await admin.getByText("Archivos subidos. Ordénalos y guarda para publicar.").first().waitFor();
  for(const src of await admin.locator('img[src*="/api/media/"]').evaluateAll((images)=>images.map((image)=>image.getAttribute("src")))) if(src) uploadedIds.add(src.split("/").pop());
  await Promise.all([admin.waitForResponse((response)=>response.url().includes("/api/admin/content/home")&&response.request().method()==="PATCH"),admin.getByRole("button",{name:"Guardar",exact:true}).click()]);
  const galleryPublic=await context.newPage();await galleryPublic.goto(baseUrl,{waitUntil:"networkidle"});const multiPublished=await galleryPublic.locator('#proyectos img[src*="%2Fapi%2Fmedia"], #proyectos img[src*="/api/media/"]').count()>=2;await galleryPublic.close();
  await publish(original);
  await admin.screenshot({path:path.join(outputDirectory,"admin-home-mobile-ready.png"),fullPage:false});
  const restored=(await getDocument()).content.hero.mode===original.hero.mode;
  const passed=persisted&&imageMode&&desktopVideo===original.hero.videoOnly.desktop.src&&mobileVideo===original.hero.videoOnly.mobile.src&&directPublished&&multiPublished&&restored&&!errors.length;
  console.log(JSON.stringify({passed,outputDirectory,persisted,imageMode,desktopVideo,mobileVideo,directPublished,multiPublished,restored,errors},null,2));
  if(!passed)process.exitCode=1;
} finally {
  if(original) await publish(original).catch(()=>undefined);
  for(const id of uploadedIds) if(id) await context.request.delete(`${baseUrl}/api/admin/media/${id}`,{headers:{Origin:baseUrl}}).catch(()=>undefined);
  await context.close(); await browser.close();
}
