import { createHmac } from "node:crypto";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl=(process.env.IRP_CHECK_BASE_URL||"http://127.0.0.1:3000").replace(/\/$/,"");
const outputDirectory=path.join(process.cwd(),".visual-audit","about-videos");
const fixture=path.join(process.cwd(),".visual-audit","about-videos-fixtures","qa-video.mp4");
const envText=await readFile(path.join(process.cwd(),".env.local"),"utf8");
const env=Object.fromEntries(envText.split(/\r?\n/).filter((line)=>/^[A-Za-z_][A-Za-z0-9_]*=/.test(line)).map((line)=>{const index=line.indexOf("=");return[line.slice(0,index),line.slice(index+1).replace(/^['"]|['"]$/g,"")];}));
const now=Math.floor(Date.now()/1000);
const payload=Buffer.from(JSON.stringify({sub:env.IRP_ADMIN_EMAIL.toLowerCase(),role:env.IRP_ADMIN_ROLE,iat:now,exp:now+3600}),"utf8").toString("base64url");
const token=`${payload}.${createHmac("sha256",env.IRP_AUTH_SECRET).update(payload,"utf8").digest("base64url")}`;
const failures=[];const checks=[];let originalAbout;let beforeMedia=[];
const check=(condition,message)=>{checks.push({message,passed:Boolean(condition)});if(!condition)failures.push(message);};
const getAbout=async(context)=>{const response=await context.request.get(`${baseUrl}/api/admin/content/about`);if(!response.ok())throw new Error(`GET about ${response.status()}`);return(await response.json()).document;};
const saveAbout=async(context,content)=>{const current=await getAbout(context);const response=await context.request.patch(`${baseUrl}/api/admin/content/about`,{headers:{Origin:baseUrl,"Content-Type":"application/json"},data:{expectedVersion:current.version,content}});if(!response.ok())throw new Error(`PATCH about ${response.status()}: ${await response.text()}`);return(await response.json()).document;};
const listMedia=async(context)=>{const response=await context.request.get(`${baseUrl}/api/admin/media`);if(!response.ok())throw new Error(`GET media ${response.status()}`);return(await response.json()).items;};

await mkdir(outputDirectory,{recursive:true});
const browser=await chromium.launch({executablePath:"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",headless:true});
const adminContext=await browser.newContext({viewport:{width:1440,height:1000},locale:"es-PE"});
await adminContext.addCookies([{name:"irp_admin_session",value:token,url:baseUrl,httpOnly:true,sameSite:"Lax"}]);

try{
  originalAbout=structuredClone((await getAbout(adminContext)).content);
  beforeMedia=await listMedia(adminContext);
  const initiallyPublished=originalAbout.workVideos.items.filter((item)=>item.published&&item.videoSrc&&item.poster.src);
  const cleanPage=await browser.newPage({viewport:{width:1440,height:900}});
  await cleanPage.goto(`${baseUrl}/nosotros?empty=${Date.now()}`,{waitUntil:"domcontentloaded",timeout:60000});
  if(!initiallyPublished.length)check(await cleanPage.locator("[data-about-videos]").count()===0,"Sin videos publicados la sección pública no ocupa espacio.");
  await cleanPage.close();

  const admin=await adminContext.newPage();
  await admin.goto(`${baseUrl}/admin/contenido/nosotros`,{waitUntil:"domcontentloaded",timeout:60000});
  const section=admin.locator("section").filter({has:admin.getByRole("heading",{name:"Videos de nuestro trabajo",exact:true})});
  await section.getByRole("heading",{name:"Videos de nuestro trabajo",exact:true}).waitFor();
  if(!originalAbout.workVideos.items.some((item)=>item.videoSrc||item.poster.src)){
    check(await section.locator("article").count()===3,"El admin muestra los tres espacios sugeridos.");
    for(const suggestion of ["En el taller","Durante la instalación","El resultado"])check(await section.locator("input").evaluateAll((nodes,value)=>nodes.filter((node)=>node.value===value).length,suggestion)===1,`Existe la sugerencia editable ${suggestion}.`);
  }else{
    check(await section.locator("article").count()===originalAbout.workVideos.items.length,"El admin conserva todos los videos existentes.");
  }
  check((await section.textContent()).includes("MP4/WebM hasta 120 MB")&&(await section.textContent()).includes("12 MB"),"El admin informa formatos y límites.");
  await section.scrollIntoViewIfNeeded();
  await admin.screenshot({path:path.join(outputDirectory,"admin-empty-slots.png"),fullPage:false});
  const firstCard=section.locator("article").first();
  await firstCard.locator('input[type="file"][accept*="video/mp4"]').setInputFiles(fixture);
  await firstCard.getByText("Archivo subido. Guarda la página para publicar.").waitFor({timeout:30000});
  if(originalAbout.workVideos.items[0]?.poster.src)await firstCard.getByRole("button",{name:"Obtener portada del video"}).click();
  await firstCard.getByText("Portada obtenida. Guarda la página para publicarla.").waitFor({timeout:30000});
  await firstCard.getByLabel("Título breve (opcional)").fill("En el taller");
  await firstCard.getByLabel("URL de TikTok (opcional)").fill("https://www.tiktok.com/@industrialremotosperu");
  await section.getByLabel("URL de Más trabajos en TikTok").fill("https://www.tiktok.com/@industrialremotosperu");
  const publishButton=firstCard.getByRole("button",{name:"Sin publicar"});
  if(await publishButton.count())await publishButton.click();
  const saveResponse=admin.waitForResponse((response)=>response.url().endsWith("/api/admin/content/about")&&response.request().method()==="PATCH");
  await admin.getByRole("button",{name:"Guardar"}).click();
  check((await saveResponse).ok(),"La subida y publicación se guardan desde el editor.");
  const saved=(await getAbout(adminContext)).content;
  const uploaded=saved.workVideos.items[0];
  check(Boolean(uploaded.videoSrc&&uploaded.poster.src&&uploaded.published),"Video, portada automática y publicación persisten.");
  const oneVideo=structuredClone(saved);
  oneVideo.workVideos.items=[uploaded];
  await saveAbout(adminContext,oneVideo);

  const publicPage=await browser.newPage({viewport:{width:1440,height:960}});
  await publicPage.goto(`${baseUrl}/nosotros?one=${Date.now()}`,{waitUntil:"domcontentloaded",timeout:60000});
  const publicSection=publicPage.locator("[data-about-videos]");
  await publicSection.waitFor();
  const placement=await publicPage.evaluate(()=>{const hero=document.querySelector("[data-about-hero]");const videos=document.querySelector("[data-about-videos]");const presentation=document.querySelector("[data-about-presentation]");return Boolean(hero&&videos&&presentation&&(hero.compareDocumentPosition(presentation)&Node.DOCUMENT_POSITION_FOLLOWING)&&(presentation.compareDocumentPosition(videos)&Node.DOCUMENT_POSITION_FOLLOWING));});
  check(placement,"La sección de videos está después de Quiénes somos.");
  check(await publicSection.locator("[data-video-card]").count()===1,"El estado con un video no duplica tarjetas.");
  check(await publicSection.locator("video").count()===0,"Las tarjetas no descargan ni reproducen videos al cargar.");
  await publicSection.scrollIntoViewIfNeeded();await publicPage.waitForTimeout(700);
  await publicPage.screenshot({path:path.join(outputDirectory,"desktop-one-video.png"),fullPage:false});
  const play=publicSection.getByRole("button",{name:/Reproducir/}).first();await play.click();
  const dialog=publicPage.locator("[data-work-video-dialog]");await dialog.waitFor();
  const modalVideo=dialog.locator("video");
  const playback=await modalVideo.evaluate((video)=>{window.__irpVideoPaused=false;video.addEventListener("pause",()=>{window.__irpVideoPaused=true},{once:true});return{controls:video.controls,playsInline:video.playsInline,preload:video.preload,muted:video.muted};});
  check(playback.controls&&playback.playsInline&&playback.preload==="metadata"&&!playback.muted,"El visor usa controles, sonido, playsInline y preload metadata.");
  check(await publicPage.evaluate(()=>document.body.style.overflow)==="hidden","El visor bloquea el fondo mientras está abierto.");
  await publicPage.screenshot({path:path.join(outputDirectory,"desktop-viewer.png"),fullPage:false});
  await publicPage.keyboard.press("Escape");await dialog.waitFor({state:"detached"});
  check(await publicPage.evaluate(()=>window.__irpVideoPaused===true&&document.body.style.overflow!=="hidden"),"Escape cierra, pausa el video y restaura el scroll.");
  check((await publicPage.evaluate(()=>document.activeElement?.getAttribute("aria-label")||"")).startsWith("Reproducir"),"El foco vuelve al botón que abrió el visor.");
  await publicPage.close();

  const variants=[1,2,3,4];
  for(const count of variants){
    const next=structuredClone(saved);
    next.workVideos.items=Array.from({length:count},(_,index)=>({...uploaded,id:`qa-video-${count}-${index}`,title:["En el taller","Durante la instalación","El resultado","Entrega final"][index],published:true}));
    await saveAbout(adminContext,next);
    const page=await browser.newPage({viewport:{width:1440,height:960}});await page.goto(`${baseUrl}/nosotros?count=${count}&t=${Date.now()}`,{waitUntil:"domcontentloaded",timeout:60000});const videos=page.locator("[data-about-videos]");await videos.waitFor();
    check(await videos.locator("[data-video-card]").count()===count,`La composición admite ${count} video(s) sin duplicarlos.`);
    if(count===3){await videos.scrollIntoViewIfNeeded();await page.waitForTimeout(650);await page.screenshot({path:path.join(outputDirectory,"desktop-three-videos.png"),fullPage:false});}
    if(count===4){check(await videos.getByRole("button",{name:"Video siguiente"}).isVisible(),"Con más de tres videos aparecen controles de escritorio.");const track=videos.locator("[data-video-track]");const before=await track.evaluate((node)=>node.scrollLeft);await videos.getByRole("button",{name:"Video siguiente"}).click();await page.waitForTimeout(500);check(await track.evaluate((node)=>node.scrollLeft)>before,"El control de escritorio recorre el carrusel.");}
    await page.close();
  }

  const four=structuredClone(saved);four.workVideos.items=Array.from({length:4},(_,index)=>({...uploaded,id:`qa-mobile-${index}`,title:["En el taller","Durante la instalación","El resultado","Entrega final"][index],published:true}));await saveAbout(adminContext,four);
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await mobile.goto(`${baseUrl}/nosotros?mobile=${Date.now()}`,{waitUntil:"domcontentloaded",timeout:60000});const mobileSection=mobile.locator("[data-about-videos]");await mobileSection.waitFor();await mobileSection.scrollIntoViewIfNeeded();await mobile.waitForTimeout(700);
  const mobileState=await mobile.evaluate(()=>{const track=document.querySelector("[data-video-track]");const first=document.querySelector("[data-video-card]");return{pageOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2,carouselOverflow:(track?.scrollWidth||0)>(track?.clientWidth||0),cardWidth:first?.getBoundingClientRect().width||0,trackWidth:track?.getBoundingClientRect().width||0,videosInCards:document.querySelectorAll("[data-about-videos] [data-video-card] video").length};});
  check(!mobileState.pageOverflow&&mobileState.carouselOverflow&&mobileState.cardWidth<mobileState.trackWidth&&mobileState.videosInCards===0,"El carrusel móvil muestra la siguiente tarjeta sin desbordar la página ni precargar videos.");
  const secondDot=mobileSection.getByRole("button",{name:"Ir al video 2"});await secondDot.click();await mobile.waitForTimeout(600);check(await secondDot.getAttribute("aria-current")==="true","Los indicadores reflejan la posición real del carrusel.");
  await mobile.screenshot({path:path.join(outputDirectory,"mobile-four-videos.png"),fullPage:false});await mobile.close();

  const reducedContext=await browser.newContext({viewport:{width:390,height:844},reducedMotion:"reduce"});const reducedPage=await reducedContext.newPage();await reducedPage.goto(`${baseUrl}/nosotros?reduced=${Date.now()}`,{waitUntil:"domcontentloaded",timeout:60000});const reducedCards=reducedPage.locator("[data-about-videos] [data-video-card]");await reducedCards.first().waitFor();const reducedState=await reducedCards.evaluateAll((cards)=>cards.every((card)=>getComputedStyle(card).opacity==="1"&&getComputedStyle(card).transform==="none"));check(reducedState,"Con prefers-reduced-motion las tarjetas quedan visibles sin transición.");await reducedContext.close();

  const previewContent=structuredClone(saved);previewContent.workVideos.items=[{...uploaded,id:"qa-preview",title:"Solo en preview",published:false}];await saveAbout(adminContext,previewContent);
  const publicPreview=await browser.newPage({viewport:{width:1280,height:900}});await publicPreview.goto(`${baseUrl}/nosotros?preview=videos&t=${Date.now()}`,{waitUntil:"domcontentloaded",timeout:60000});check(await publicPreview.locator("[data-about-videos]").count()===0,"El preview no expone borradores a visitantes sin sesión.");await publicPreview.close();
  const privatePreview=await adminContext.newPage();await privatePreview.goto(`${baseUrl}/nosotros?preview=videos&t=${Date.now()}`,{waitUntil:"domcontentloaded",timeout:60000});check(await privatePreview.getByText("Solo en preview",{exact:true}).isVisible(),"El entorno de preview muestra videos sin publicar al administrador.");await privatePreview.close();
  await admin.close();
}finally{
  try{if(originalAbout)await saveAbout(adminContext,originalAbout);}catch(error){failures.push(`No se pudo restaurar Nosotros: ${error instanceof Error?error.message:String(error)}`);}
  try{const currentMedia=await listMedia(adminContext);const beforeIds=new Set(beforeMedia.map((item)=>item.id));for(const item of currentMedia.filter((entry)=>!beforeIds.has(entry.id))){const response=await adminContext.request.delete(`${baseUrl}/api/admin/media/${item.id}`,{headers:{Origin:baseUrl}});if(!response.ok())failures.push(`No se pudo borrar el medio QA ${item.id}: ${response.status()}`);}}catch(error){failures.push(`No se pudieron limpiar medios QA: ${error instanceof Error?error.message:String(error)}`);}
  await adminContext.close();await browser.close();
}

console.log(JSON.stringify({passed:failures.length===0,checks:checks.length,failures,outputDirectory},null,2));if(failures.length)process.exitCode=1;
