import { createHmac } from "node:crypto";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl=(process.env.IRP_CHECK_BASE_URL||"http://127.0.0.1:3000").replace(/\/$/,"");
const output=path.join(process.cwd(),".visual-audit","about-presentation");
const envText=await readFile(path.join(process.cwd(),".env.local"),"utf8");
const env=Object.fromEntries(envText.split(/\r?\n/).filter((line)=>/^[A-Za-z_][A-Za-z0-9_]*=/.test(line)).map((line)=>{const index=line.indexOf("=");return[line.slice(0,index),line.slice(index+1).replace(/^['"]|['"]$/g,"")];}));
const now=Math.floor(Date.now()/1000);
const payload=Buffer.from(JSON.stringify({sub:env.IRP_ADMIN_EMAIL.toLowerCase(),role:env.IRP_ADMIN_ROLE,iat:now,exp:now+3600}),"utf8").toString("base64url");
const token=`${payload}.${createHmac("sha256",env.IRP_AUTH_SECRET).update(payload,"utf8").digest("base64url")}`;
const failures=[];const checks=[];
const check=(condition,message)=>{checks.push({message,passed:Boolean(condition)});if(!condition)failures.push(message);};

await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",headless:true});
const adminContext=await browser.newContext({viewport:{width:1440,height:1000},locale:"es-PE",reducedMotion:"reduce"});
await adminContext.addCookies([{name:"irp_admin_session",value:token,url:baseUrl,httpOnly:true,sameSite:"Lax"}]);
await adminContext.addInitScript(()=>{sessionStorage.setItem("irp-intro-v4","seen");localStorage.setItem("irp_cookie_consent_v1",JSON.stringify({necessary:true,analytics:false,optional:false}));});
const getDocument=async(key)=>{const response=await adminContext.request.get(`${baseUrl}/api/admin/content/${key}`);if(!response.ok())throw new Error(`GET ${key}: ${response.status()}`);return(await response.json()).document;};
const saveDocument=async(key,content)=>{const current=await getDocument(key);const response=await adminContext.request.patch(`${baseUrl}/api/admin/content/${key}`,{headers:{Origin:baseUrl,"Content-Type":"application/json"},data:{expectedVersion:current.version,content}});if(!response.ok())throw new Error(`PATCH ${key}: ${response.status()} ${await response.text()}`);return(await response.json()).document;};
let originalAbout;let originalHome;

try{
  originalAbout=structuredClone((await getDocument("about")).content);
  originalHome=structuredClone((await getDocument("home")).content);

  const admin=await adminContext.newPage();
  await admin.goto(`${baseUrl}/admin/contenido/nosotros?presentation=${Date.now()}`,{waitUntil:"domcontentloaded",timeout:60000});
  const adminSection=admin.locator("section").filter({has:admin.getByRole("heading",{name:"Quiénes somos",exact:true})});
  await adminSection.getByRole("heading",{name:"Quiénes somos",exact:true}).waitFor();
  check(await adminSection.getByLabel("Etiqueta").isVisible()&&await adminSection.getByLabel("Primer párrafo").isVisible()&&await adminSection.getByLabel("Segundo párrafo").isVisible()&&await adminSection.getByLabel("Frase destacada").isVisible(),"El editor ofrece todos los campos de presentación.");
  check(await adminSection.locator('input[type="file"][accept*="video/mp4"]').count()===1,"El editor ofrece subida directa de video horizontal.");
  check(await adminSection.locator('input[type="file"][accept*="image/webp"]').count()>=2,"El editor ofrece subida directa de portada y fotografía alternativa.");
  check(await adminSection.getByRole("link",{name:"Editar contadores en Inicio"}).getAttribute("href")==="/admin/contenido/inicio","El editor identifica y enlaza las métricas compartidas del Home.");
  await admin.close();

  for(const viewport of [{name:"desktop",width:1440,height:960},{name:"mobile",width:390,height:844}]){
    const context=await browser.newContext({viewport,locale:"es-PE",reducedMotion:"reduce"});
    await context.addInitScript(()=>{sessionStorage.setItem("irp-intro-v4","seen");localStorage.setItem("irp_cookie_consent_v1",JSON.stringify({necessary:true,analytics:false,optional:false}));});
    const page=await context.newPage();
    const errors=[];page.on("pageerror",(error)=>errors.push(error.message));
    await page.goto(`${baseUrl}/nosotros?presentation=${viewport.name}-${Date.now()}`,{waitUntil:"domcontentloaded",timeout:60000});
    const presentation=page.locator("[data-about-presentation]");await presentation.waitFor();
    const media=presentation.locator("[data-about-presentation-media]");
    await media.locator("img").evaluate((image)=>image.complete&&image.naturalWidth>0?true:new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error("La fotografía alternativa no cargó")),20000);image.addEventListener("load",()=>{clearTimeout(timer);resolve(true)},{once:true});image.addEventListener("error",()=>{clearTimeout(timer);reject(new Error("La fotografía alternativa falló"))},{once:true});}));
    const order=await page.evaluate(()=>{const selectors=["[data-about-hero]","[data-about-presentation]","[data-about-videos]","[data-about-purpose]","[data-about-values]","[data-about-contact]"];const nodes=selectors.map((selector)=>document.querySelector(selector));return nodes.every(Boolean)&&nodes.every((node,index)=>index===0||Boolean(nodes[index-1].compareDocumentPosition(node)&Node.DOCUMENT_POSITION_FOLLOWING));});
    check(order,`El orden de secciones es correcto en ${viewport.name}.`);
    check(await media.getAttribute("data-has-video")==="false"&&await media.locator("video").count()===0&&await media.getByRole("button",{name:/Reproducir video/}).count()===0,`El estado sin video usa solo la fotografía, sin Play falso, en ${viewport.name}.`);
    const cards=presentation.locator("[data-impact-card]");
    check(await cards.count()===originalHome.impact.metrics.length,`Nosotros reutiliza los ${originalHome.impact.metrics.length} contadores del Home en ${viewport.name}.`);
    for(const metric of originalHome.impact.metrics){check(await cards.getByText(metric.label,{exact:true}).count()===1,`La métrica compartida “${metric.label}” aparece en ${viewport.name}.`);}
    await media.scrollIntoViewIfNeeded();await page.waitForTimeout(400);
    await page.screenshot({path:path.join(output,`${viewport.name}-presentation.png`),fullPage:false});
    await cards.first().scrollIntoViewIfNeeded();await page.waitForTimeout(2100);
    const visibleCards=await cards.evaluateAll((nodes)=>nodes.every((node)=>{const style=getComputedStyle(node);const rect=node.getBoundingClientRect();return Number(style.opacity)>.98&&rect.width>0&&rect.height>0;}));
    check(visibleCards,`Los contadores quedan visibles y animados en ${viewport.name}.`);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    check(overflow<=2&&errors.length===0,`No hay desbordamiento ni errores en ${viewport.name}.`);
    await page.screenshot({path:path.join(output,`${viewport.name}-metrics.png`),fullPage:false});
    await context.close();
  }

  const statementTest=structuredClone(originalAbout);statementTest.presentation.statement=`${originalAbout.presentation.statement} · QA`;
  await saveDocument("about",statementTest);
  const statementPage=await browser.newPage({viewport:{width:1280,height:900}});await statementPage.goto(`${baseUrl}/nosotros?save=${Date.now()}`,{waitUntil:"domcontentloaded",timeout:60000});
  check(await statementPage.getByText(statementTest.presentation.statement,{exact:true}).count()===1,"Guardar en Nosotros actualiza la página pública.");await statementPage.close();
  await saveDocument("about",originalAbout);

  const metricTest=structuredClone(originalHome);metricTest.impact.metrics[0].label=`${originalHome.impact.metrics[0].label} · QA compartido`;
  await saveDocument("home",metricTest);
  const sharedAbout=await browser.newPage({viewport:{width:1280,height:900}});await sharedAbout.goto(`${baseUrl}/nosotros?shared=${Date.now()}`,{waitUntil:"domcontentloaded",timeout:60000});
  const sharedHome=await browser.newPage({viewport:{width:1280,height:900}});await sharedHome.goto(`${baseUrl}/?shared=${Date.now()}`,{waitUntil:"domcontentloaded",timeout:60000});
  check(await sharedAbout.getByText(metricTest.impact.metrics[0].label,{exact:true}).count()===1&&await sharedHome.getByText(metricTest.impact.metrics[0].label,{exact:true}).count()===1,"Una edición de métricas en Home se refleja en Home y Nosotros.");
  await sharedAbout.close();await sharedHome.close();await saveDocument("home",originalHome);

  const sourceVideo=originalAbout.workVideos.items.find((item)=>item.videoSrc&&item.poster.src);
  check(Boolean(sourceVideo),"Existe un video real para comprobar el estado con video.");
  if(sourceVideo){
    const videoTest=structuredClone(originalAbout);videoTest.presentation.videoSrc=sourceVideo.videoSrc;videoTest.presentation.videoPoster=sourceVideo.poster;
    await saveDocument("about",videoTest);
    const videoPage=await browser.newPage({viewport:{width:1280,height:900}});await videoPage.goto(`${baseUrl}/nosotros?video=${Date.now()}`,{waitUntil:"domcontentloaded",timeout:60000});
    const media=videoPage.locator("[data-about-presentation-media]");await media.waitFor();
    check(await media.locator("video").count()===0&&await media.getByRole("button",{name:"Reproducir video Quiénes somos"}).isVisible(),"El video no se crea ni descarga antes de pulsar Play.");
    await media.getByRole("button",{name:"Reproducir video Quiénes somos"}).click();
    const video=media.locator("video");await video.waitFor();
    const state=await video.evaluate((node)=>({controls:node.controls,playsInline:node.playsInline,preload:node.preload}));
    check(state.controls&&state.playsInline&&state.preload==="metadata","Tras pulsar Play, el video ofrece controles, pantalla completa nativa y carga metadata.");
    await videoPage.close();await saveDocument("about",originalAbout);
  }
}finally{
  if(originalAbout){const current=await getDocument("about");if(JSON.stringify(current.content)!==JSON.stringify(originalAbout))await saveDocument("about",originalAbout);}
  if(originalHome){const current=await getDocument("home");if(JSON.stringify(current.content)!==JSON.stringify(originalHome))await saveDocument("home",originalHome);}
  await adminContext.close();await browser.close();
}

console.log(JSON.stringify({passed:failures.length===0,checks,failures},null,2));
if(failures.length)process.exitCode=1;
