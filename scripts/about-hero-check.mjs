import { createHmac } from "node:crypto";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl=(process.env.IRP_CHECK_BASE_URL||"http://127.0.0.1:3000").replace(/\/$/,"");
const outputDirectory=path.join(process.cwd(),".visual-audit","about-hero");
const envText=await readFile(path.join(process.cwd(),".env.local"),"utf8");
const env=Object.fromEntries(envText.split(/\r?\n/).filter((line)=>/^[A-Za-z_][A-Za-z0-9_]*=/.test(line)).map((line)=>{const index=line.indexOf("=");return[line.slice(0,index),line.slice(index+1).replace(/^['"]|['"]$/g,"")];}));
const now=Math.floor(Date.now()/1000);
const payload=Buffer.from(JSON.stringify({sub:env.IRP_ADMIN_EMAIL.toLowerCase(),role:env.IRP_ADMIN_ROLE,iat:now,exp:now+3600}),"utf8").toString("base64url");
const token=`${payload}.${createHmac("sha256",env.IRP_AUTH_SECRET).update(payload,"utf8").digest("base64url")}`;

await mkdir(outputDirectory,{recursive:true});
const browser=await chromium.launch({executablePath:"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",headless:true});
const failures=[];const details=[];let originalAbout;
const check=(condition,message)=>{if(!condition)failures.push(message);};
const getAbout=async(context)=>{const response=await context.request.get(`${baseUrl}/api/admin/content/about`);if(!response.ok())throw new Error(`GET about ${response.status()}`);return(await response.json()).document;};
const saveAbout=async(context,content)=>{const current=await getAbout(context);const response=await context.request.patch(`${baseUrl}/api/admin/content/about`,{headers:{Origin:baseUrl,"Content-Type":"application/json"},data:{expectedVersion:current.version,content}});if(!response.ok())throw new Error(`PATCH about ${response.status()}: ${await response.text()}`);return(await response.json()).document;};

try{
  const adminContext=await browser.newContext({viewport:{width:1440,height:960},locale:"es-PE",reducedMotion:"reduce"});
  await adminContext.addCookies([{name:"irp_admin_session",value:token,url:baseUrl,httpOnly:true,sameSite:"Lax"}]);
  originalAbout=structuredClone((await getAbout(adminContext)).content);
  const admin=await adminContext.newPage();
  await admin.goto(`${baseUrl}/admin/contenido/nosotros`,{waitUntil:"domcontentloaded",timeout:60000});
  for(const label of ["Indicador","Activar animación de entrada","Activar efecto sticky"])check(await admin.getByLabel(label).isVisible(),`El admin no muestra ${label}.`);
  check(await admin.getByRole("heading",{name:"Imagen PC"}).isVisible()&&await admin.getByRole("heading",{name:"Imagen celular"}).isVisible(),"El admin no separa las imágenes PC y celular.");
  check(await admin.getByRole("button",{name:/Reemplazar/}).count()>=2,"El hero no permite reemplazar ambas imágenes directamente.");
  await admin.getByRole("heading",{name:"Imagen PC"}).scrollIntoViewIfNeeded();
  await admin.screenshot({path:path.join(outputDirectory,"admin.png"),fullPage:false});
  const edited=structuredClone(originalAbout);edited.hero.indicator=`${originalAbout.hero.indicator} QA`;edited.hero.animationEnabled=false;edited.hero.stickyEnabled=false;
  await admin.getByLabel("Indicador").fill(edited.hero.indicator);
  await admin.getByLabel("Activar animación de entrada").uncheck();
  await admin.getByLabel("Activar efecto sticky").uncheck();
  const saveResponse=admin.waitForResponse((response)=>response.url().endsWith("/api/admin/content/about")&&response.request().method()==="PATCH");
  await admin.getByRole("button",{name:"Guardar"}).click();
  check((await saveResponse).ok(),"El guardado del hero desde admin falló.");
  const savedFromAdmin=(await getAbout(adminContext)).content;
  check(savedFromAdmin.hero.indicator===edited.hero.indicator&&!savedFromAdmin.hero.animationEnabled&&!savedFromAdmin.hero.stickyEnabled,"El admin no persistió los campos editados del hero.");
  await admin.close();
  const preview=await adminContext.newPage();
  await preview.goto(`${baseUrl}/nosotros?cms=${Date.now()}`,{waitUntil:"domcontentloaded",timeout:60000});
  check(await preview.getByText(edited.hero.indicator,{exact:true}).isVisible(),"El indicador editado no se publicó.");
  check(await preview.locator("[data-about-hero]").getAttribute("data-sticky")==="false","El interruptor sticky no se publicó.");
  check(await preview.locator("[data-about-hero]").getAttribute("data-animation")==="false","El interruptor de animación no se publicó.");
  await preview.close();
  await saveAbout(adminContext,originalAbout);
  await adminContext.close();

  const viewports=[{width:360,height:800},{width:390,height:844},{width:430,height:900},{width:768,height:1024},{width:1280,height:900},{width:1440,height:960}];
  for(const viewport of viewports){
    const context=await browser.newContext({viewport,locale:"es-PE",reducedMotion:"no-preference"});
    await context.addInitScript(()=>{sessionStorage.setItem("irp-intro-v4","seen");localStorage.setItem("irp_cookie_consent_v1",JSON.stringify({necessary:true,analytics:false,optional:false}));});
    const page=await context.newPage();const errors=[];page.on("pageerror",(error)=>errors.push(error.message));
    await page.goto(`${baseUrl}/nosotros?hero=${viewport.width}`,{waitUntil:"domcontentloaded",timeout:60000});
    const hero=page.locator("[data-about-hero]");const stage=page.locator("[data-about-stage]");
    await hero.waitFor({state:"visible"});
    if(viewport.width===1440){await page.waitForTimeout(260);await page.locator("nextjs-portal").evaluateAll((nodes)=>nodes.forEach((node)=>node.remove()));await page.screenshot({path:path.join(outputDirectory,"1440-sweep.png"),fullPage:false});}
    await page.waitForTimeout(1050);
    const initial=await page.evaluate(()=>{
      const hero=document.querySelector("[data-about-hero]");const stage=document.querySelector("[data-about-stage]");const copy=document.querySelector("[data-about-copy]");const visibleImage=[...document.querySelectorAll("[data-about-media] img")].find((image)=>getComputedStyle(image).display!=="none");
      return{overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2,heroHeight:hero?.getBoundingClientRect().height||0,stageHeight:stage?.getBoundingClientRect().height||0,stageTop:stage?.getBoundingClientRect().top||0,copyOpacity:Number(copy?getComputedStyle(copy).opacity:0),imageSrc:decodeURIComponent(visibleImage?.currentSrc||""),imageWidth:visibleImage?.naturalWidth||0,imageHeight:visibleImage?.naturalHeight||0,title:document.querySelector("#about-title")?.textContent||""};
    });
    check(!initial.overflow,`Hay scroll horizontal en ${viewport.width}px.`);check(initial.imageWidth>0&&initial.imageHeight>0,`La imagen no cargó en ${viewport.width}px.`);check(initial.title.includes("Detrás de cada detalle")&&initial.title.includes("está nuestro equipo"),`El título no coincide en ${viewport.width}px.`);check(initial.copyOpacity>.98,`El contenido no terminó visible en ${viewport.width}px.`);check(initial.imageSrc.includes(viewport.width<=900?"nosotros-hero-celular":"nosotros-hero-pc"),`No se seleccionó la imagen correcta en ${viewport.width}px.`);
    if(viewport.width===1440)check(initial.stageHeight>=440&&initial.stageHeight<=460,`El hero mide ${initial.stageHeight}px en 1440px.`);
    await page.locator("nextjs-portal").evaluateAll((nodes)=>nodes.forEach((node)=>node.remove()));await page.screenshot({path:path.join(outputDirectory,`${viewport.width}-settled.png`),fullPage:false});
    const distance=viewport.width<=640?70:viewport.width<=900?105:150;await page.evaluate((y)=>scrollTo(0,y),distance);await page.waitForTimeout(350);
    const scrollState=await page.evaluate(()=>{const stage=document.querySelector("[data-about-stage]");const copy=document.querySelector("[data-about-copy]");const presentation=document.querySelector("section[class*='presentation']");return{stageTop:stage?.getBoundingClientRect().top||0,copyOpacity:Number(copy?getComputedStyle(copy).opacity:1),presentationTop:presentation?.getBoundingClientRect().top||0};});
    check(Math.abs(scrollState.stageTop)<=2,`El hero no permaneció sticky en ${viewport.width}px.`);check(scrollState.copyOpacity<.9,`El panel no desaparece con scroll en ${viewport.width}px.`);check(scrollState.presentationTop<initial.stageHeight,`El contenido siguiente no sube sobre el hero en ${viewport.width}px.`);check(errors.length===0,`Errores en ${viewport.width}px: ${errors.join("; ")}`);
    details.push({width:viewport.width,...initial,scrollState});await page.close();await context.close();
  }

  const reducedContext=await browser.newContext({viewport:{width:390,height:844},locale:"es-PE",reducedMotion:"reduce"});
  const reduced=await reducedContext.newPage();await reduced.goto(`${baseUrl}/nosotros?reduced=1`,{waitUntil:"domcontentloaded",timeout:60000});await reduced.waitForTimeout(900);
  const reducedState=await reduced.evaluate(()=>{const hero=document.querySelector("[data-about-hero]");const stage=document.querySelector("[data-about-stage]");const copy=document.querySelector("[data-about-copy]");return{sticky:hero?.getAttribute("data-sticky"),stagePosition:stage?getComputedStyle(stage).position:"",sameHeight:Math.abs((hero?.getBoundingClientRect().height||0)-(stage?.getBoundingClientRect().height||0))<2,opacity:Number(copy?getComputedStyle(copy).opacity:0)};});
  details.push({reducedMotion:reducedState});
  check(reducedState.stagePosition!=="sticky"&&reducedState.sameHeight&&reducedState.opacity===1,"Reduced motion no eliminó la fijación prolongada o dejó contenido oculto.");await reducedContext.close();
}finally{
  if(originalAbout){const cleanupContext=await browser.newContext();try{await cleanupContext.addCookies([{name:"irp_admin_session",value:token,url:baseUrl,httpOnly:true,sameSite:"Lax"}]);const current=await getAbout(cleanupContext);if(JSON.stringify(current.content)!==JSON.stringify(originalAbout))await saveAbout(cleanupContext,originalAbout);}finally{await cleanupContext.close();}}
  await browser.close();
}

console.log(JSON.stringify({passed:failures.length===0,outputDirectory,checked:details.length,details,failures},null,2));if(failures.length)process.exitCode=1;
