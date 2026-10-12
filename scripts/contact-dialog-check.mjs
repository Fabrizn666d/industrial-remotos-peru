import { createHmac } from "node:crypto";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.IRP_CHECK_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const outputDirectory = path.join(process.cwd(), ".visual-audit", "contact-dialog");
const envText = await readFile(path.join(process.cwd(), ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter((line) => /^[A-Za-z_][A-Za-z0-9_]*=/.test(line)).map((line) => { const index = line.indexOf("="); return [line.slice(0,index),line.slice(index+1).replace(/^['"]|['"]$/g,"")]; }));
const now = Math.floor(Date.now()/1000);
const payload = Buffer.from(JSON.stringify({ sub: env.IRP_ADMIN_EMAIL.toLowerCase(), role: env.IRP_ADMIN_ROLE, iat: now, exp: now+3600 }),"utf8").toString("base64url");
const token = `${payload}.${createHmac("sha256",env.IRP_AUTH_SECRET).update(payload,"utf8").digest("base64url")}`;

await mkdir(outputDirectory,{recursive:true});
const browser = await chromium.launch({ executablePath:"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless:true });
const context = await browser.newContext({ viewport:{width:1440,height:960}, locale:"es-PE", reducedMotion:"reduce" });
await context.addCookies([{name:"irp_admin_session",value:token,url:baseUrl,httpOnly:true,sameSite:"Lax"}]);
await context.addInitScript(() => { sessionStorage.setItem("irp-intro-v4","seen"); localStorage.setItem("irp_cookie_consent_v1",JSON.stringify({necessary:true,analytics:false,optional:false})); });

const failures=[];
const details={};
let originalContact;

function check(condition,message){if(!condition)failures.push(message);}
async function getContact(){const response=await context.request.get(`${baseUrl}/api/admin/content/contact`);if(!response.ok())throw new Error(`GET contacto ${response.status()}`);return (await response.json()).document;}
async function saveContact(content){const current=await getContact();const response=await context.request.patch(`${baseUrl}/api/admin/content/contact`,{headers:{Origin:baseUrl,"Content-Type":"application/json"},data:{expectedVersion:current.version,content}});if(!response.ok())throw new Error(`PATCH contacto ${response.status()}: ${await response.text()}`);return (await response.json()).document;}
async function requestCount(){const response=await context.request.get(`${baseUrl}/api/requests?limit=1&offset=0`);if(!response.ok())throw new Error(`GET solicitudes ${response.status()}`);return (await response.json()).total;}

try{
  originalContact=structuredClone((await getContact()).content);
  const edited=structuredClone(originalContact);edited.title=`${originalContact.title} · QA`;
  await saveContact(edited);
  const cmsPage=await context.newPage();
  await cmsPage.goto(`${baseUrl}/nosotros?cms=${Date.now()}`,{waitUntil:"domcontentloaded",timeout:60000});
  await cmsPage.waitForTimeout(800);
  await cmsPage.locator('.site-header__links a[href="/contacto"]').click();
  const cmsDialog=cmsPage.getByRole("dialog");
  await cmsDialog.waitFor({state:"visible"});
  check((await cmsDialog.getByRole("heading",{level:1}).textContent())?.replace(/\s+/g," ").trim()===`${edited.title} ${edited.titleAccent}`,"La edición del admin no se reflejó en la ventana pública.");
  await cmsPage.getByRole("button",{name:"Cerrar ventana de contacto"}).click();
  await cmsPage.close();
  await saveContact(originalContact);

  const page=await context.newPage();
  const pageErrors=[];page.on("pageerror",(error)=>pageErrors.push(error.message));
  await page.goto(`${baseUrl}/nosotros`,{waitUntil:"domcontentloaded",timeout:60000});
  const iframeBefore=await page.getByRole("dialog").getByTitle("Mapa de ubicación de Industrial Remotos Perú").count();
  await page.evaluate(()=>scrollTo(0,Math.min(720,document.documentElement.scrollHeight-innerHeight)));
  const scrollBefore=await page.evaluate(()=>scrollY);
  const headerContact=page.locator('.site-header__links a[href="/contacto"]');
  await headerContact.click();
  const dialog=page.getByRole("dialog",{name:originalContact.title});
  await dialog.waitFor({state:"visible"});
  const focusedDialog=await page.evaluate(()=>document.activeElement?.getAttribute("role")==="dialog");
  const iframeAfter=await dialog.getByTitle("Mapa de ubicación de Industrial Remotos Perú").count();
  check(page.url().endsWith("/nosotros"),"El enlace de Header navegó fuera de la página actual.");
  check(focusedDialog,"El foco inicial no llegó al diálogo.");
  check(iframeBefore===0 && iframeAfter===1,"El mapa no se cargó exclusivamente al abrir la ventana.");
  await page.getByLabel("Nombre completo").fill("Prueba conservación");
  await page.getByLabel("Cuéntanos tu proyecto").fill("Datos conservados al cerrar y reabrir.");
  await page.keyboard.press("Shift+Tab");
  check(await page.evaluate(()=>Boolean(document.activeElement?.closest('[role="dialog"]'))),"El foco salió del diálogo al navegar con teclado.");
  await page.keyboard.press("Escape");
  await dialog.waitFor({state:"hidden"});
  const scrollAfter=await page.evaluate(()=>scrollY);
  check(Math.abs(scrollAfter-scrollBefore)<=2,"No se restauró exactamente la posición de scroll.");
  check(await headerContact.evaluate((node)=>document.activeElement===node),"El foco no regresó al enlace que abrió la ventana.");
  await page.locator('footer a[href="/contacto"]').first().click();
  await dialog.waitFor({state:"visible"});
  check(await page.getByLabel("Nombre completo").inputValue()==="Prueba conservación","Los datos se perdieron al cerrar y reabrir.");
  const whatsappHref=await dialog.getByRole("link",{name:originalContact.whatsappLabel}).first().getAttribute("href");
  const mapsHref=await dialog.getByRole("link",{name:/Cómo llegar/}).getAttribute("href");
  const privacyLink=dialog.getByRole("link",{name:"Política de privacidad"});
  check(Boolean(whatsappHref?.startsWith("https://wa.me/")&&whatsappHref.includes("text=")),"El enlace de WhatsApp no usa número y mensaje codificado.");
  check(Boolean(mapsHref?.startsWith("https://www.google.com/maps")),"El enlace Cómo llegar no usa Google Maps seguro.");
  check(await privacyLink.getAttribute("href")==="/politica-privacidad"&&await privacyLink.getAttribute("target")==="_blank","El enlace de privacidad no conserva el formulario en una pestaña separada.");
  check(await dialog.getByLabel("¿Qué solución buscas?").locator("option").count()===10,"El selector no contiene las nueve soluciones publicadas.");
  await page.screenshot({path:path.join(outputDirectory,"desktop.png"),fullPage:false});
  await page.getByRole("button",{name:"Cerrar ventana de contacto"}).click();

  await page.goto(`${baseUrl}/soluciones/puertas-a-medida`,{waitUntil:"domcontentloaded",timeout:60000});
  await page.locator('footer a[href="/contacto"]').first().click();
  check(await page.getByRole("dialog",{name:originalContact.title}).isVisible(),"El contacto del footer en Servicios no abrió la ventana.");
  await page.getByRole("button",{name:"Cerrar ventana de contacto"}).click();

  await page.goto(`${baseUrl}/contacto`,{waitUntil:"domcontentloaded",timeout:60000});
  await page.getByRole("dialog",{name:originalContact.title}).waitFor({state:"visible"});
  check(new URL(page.url()).pathname==="/contacto","La ruta /contacto no conservó su compatibilidad.");
  await page.getByRole("button",{name:"Cerrar ventana de contacto"}).click();
  await page.waitForURL(`${baseUrl}/`);

  const formPage=await context.newPage();
  await formPage.goto(`${baseUrl}/proyectos`,{waitUntil:"domcontentloaded",timeout:60000});
  await formPage.locator('.site-header__links a[href="/contacto"]').click();
  await formPage.getByRole("dialog",{name:originalContact.title}).waitFor({state:"visible"});
  await formPage.getByLabel("Nombre completo").fill("QA Modal Contacto");
  await formPage.getByLabel("Teléfono").fill("987654321");
  await formPage.getByLabel("Correo").fill("qa-modal@example.com");
  await formPage.getByLabel("¿Qué solución buscas?").selectOption("puertas-a-medida");
  await formPage.getByLabel("Cuéntanos tu proyecto").fill("Prueba funcional de registro, error y reintento del modal global.");
  await formPage.getByText("Acepto el tratamiento").click();
  let simulatedFailure=true;
  await formPage.route("**/api/requests",async(route)=>{if(simulatedFailure){simulatedFailure=false;await route.fulfill({status:503,contentType:"application/json",body:JSON.stringify({error:"Fallo temporal de prueba"})});}else await route.continue();});
  await formPage.getByRole("button",{name:originalContact.submitLabel}).click();
  await formPage.locator("#contact-dialog-error").waitFor({state:"visible"});
  check(await formPage.getByLabel("Nombre completo").inputValue()==="QA Modal Contacto","El formulario perdió datos después del error.");
  await formPage.unroute("**/api/requests");
  const beforeCount=await requestCount();
  await formPage.getByRole("button",{name:"Reintentar"}).evaluate((button)=>{button.click();button.click();});
  await formPage.getByRole("heading",{name:"¡Gracias por escribirnos!"}).waitFor({state:"visible",timeout:30000});
  const afterCount=await requestCount();
  const successText=await formPage.getByText(/Código de seguimiento:/).textContent();
  check(afterCount===beforeCount+1,"El doble reintento creó más de una solicitud.");
  const adminSearch=await context.request.get(`${baseUrl}/api/requests?query=${encodeURIComponent("qa-modal@example.com")}&limit=10&offset=0`);
  const adminResult=await adminSearch.json();
  check(adminSearch.ok()&&adminResult.total>=1,"La consulta registrada no apareció en el admin.");
  check(adminResult.items?.[0]?.items?.[0]?.configuration?.originPage==="/proyectos","No se guardó la página de origen de la consulta.");
  check(adminResult.items?.[0]?.items?.[0]?.configuration?.serviceSlug==="puertas-a-medida","No se guardó el servicio elegido en la consulta.");
  details.createdCode=successText?.split(":").at(-1)?.trim();
  details.requestDelta=afterCount-beforeCount;

  const mobile=await context.newPage();
  await mobile.setViewportSize({width:390,height:844});
  await mobile.goto(`${baseUrl}/nosotros`,{waitUntil:"domcontentloaded",timeout:60000});
  await mobile.waitForTimeout(1200);
  const menuButton=mobile.locator(".menu-toggle");
  for(let attempt=0;attempt<3&&await menuButton.getAttribute("aria-expanded")!=="true";attempt++){await menuButton.click();await mobile.waitForTimeout(500);}
  check(await menuButton.getAttribute("aria-expanded")==="true","El menú móvil no respondió al botón de apertura.");
  await mobile.locator('#mobile-menu a[href="/contacto"]').click();
  const mobileDialog=mobile.getByRole("dialog",{name:originalContact.title});
  await mobileDialog.waitFor({state:"visible"});
  check(await mobile.locator("#mobile-menu").getAttribute("aria-hidden")==="true","El menú móvil no se cerró antes de abrir Contacto.");
  await mobile.getByLabel("Cuéntanos tu proyecto").focus();
  await mobile.setViewportSize({width:390,height:520});
  const bounds=await mobileDialog.boundingBox();
  check(Boolean(bounds&&bounds.y>=-1&&bounds.y+bounds.height<=521),"El diálogo móvil no se adaptó a una altura equivalente al teclado abierto.");
  await mobile.setViewportSize({width:390,height:844});
  await mobile.waitForTimeout(500);
  await mobile.screenshot({path:path.join(outputDirectory,"mobile.png"),fullPage:false});
  await mobile.getByRole("button",{name:"Cerrar ventana de contacto"}).click();

  const visual=await context.newPage();
  const viewports=[{width:360,height:800},{width:390,height:844},{width:430,height:900},{width:768,height:1024},{width:1280,height:900},{width:1440,height:960}];
  for(const viewport of viewports){
    await visual.setViewportSize(viewport);
    await visual.goto(`${baseUrl}/nosotros?contact-visual=${viewport.width}`,{waitUntil:"domcontentloaded",timeout:60000});
    await visual.waitForTimeout(900);
    await visual.evaluate(()=>window.dispatchEvent(new CustomEvent("irp:open-contact",{detail:{origin:location.pathname}})));
    const visualDialog=visual.getByRole("dialog");
    await visualDialog.waitFor({state:"visible"});
    const metrics=await visualDialog.evaluate((node)=>({scrollWidth:node.scrollWidth,clientWidth:node.clientWidth,scrollHeight:node.scrollHeight,clientHeight:node.clientHeight}));
    check(metrics.scrollWidth<=metrics.clientWidth+1,`Hay scroll horizontal en ${viewport.width}px.`);
    check(await visual.getByRole("link",{name:originalContact.whatsappLabel}).first().isVisible(),`WhatsApp no está visible al inicio en ${viewport.width}px.`);
    await visual.screenshot({path:path.join(outputDirectory,`${viewport.width}.png`),fullPage:false});
    if(viewport.width<=430){
      await visualDialog.evaluate((node)=>{node.scrollTop=node.scrollHeight;});
      await visual.waitForTimeout(250);
      check(await visualDialog.getByRole("link",{name:/Cómo llegar/}).isVisible(),`Mapa y Cómo llegar no son accesibles en ${viewport.width}px.`);
      check(await visual.getByRole("button",{name:"Cerrar ventana de contacto"}).isVisible(),`El cierre dejó de ser accesible al final en ${viewport.width}px.`);
      await visual.screenshot({path:path.join(outputDirectory,`${viewport.width}-bottom.png`),fullPage:false});
    }
    await visual.getByRole("button",{name:"Cerrar ventana de contacto"}).click();
  }
  await visual.close();

  const adminPage=await context.newPage();
  await adminPage.goto(`${baseUrl}/admin/contenido/contacto`,{waitUntil:"domcontentloaded",timeout:60000});
  check(await adminPage.getByRole("heading",{name:"Fondos y encuadre"}).isVisible(),"El editor no muestra los fondos por dispositivo.");
  check(await adminPage.getByRole("heading",{name:"Fondo PC"}).isVisible()&&await adminPage.getByRole("heading",{name:"Fondo celular"}).isVisible(),"Faltan los editores independientes de PC y celular.");
  check(await adminPage.getByRole("button",{name:/Reemplazar/}).count()>=2,"La subida y reemplazo de los fondos no está disponible.");
  await adminPage.screenshot({path:path.join(outputDirectory,"admin-contacto.png"),fullPage:false});
  await adminPage.close();

  details.iframeBefore=iframeBefore;details.iframeAfter=iframeAfter;details.scrollBefore=scrollBefore;details.scrollAfter=scrollAfter;details.pageErrors=pageErrors;
  check(pageErrors.length===0,`Errores de navegador: ${pageErrors.join("; ")}`);
}finally{
  if(originalContact){const current=(await getContact()).content;if(JSON.stringify(current)!==JSON.stringify(originalContact))await saveContact(originalContact);}
  await browser.close();
}

console.log(JSON.stringify({passed:failures.length===0,outputDirectory,details,failures},null,2));
if(failures.length)process.exitCode=1;
