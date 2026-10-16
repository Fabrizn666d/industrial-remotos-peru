import type { CmsContentMap } from "@/lib/cms/content-contracts";
import { companyLegalData, siteConfig } from "@/data/site";
import { projects } from "@/data/projects";
import { solutionPages } from "@/data/solution-pages";
import { findSolutionEditorialProfile } from "@/data/solution-editorial";
import { defaultHomeBottomGallery, defaultHomeTopGallery } from "@/data/home-gallery";

export const defaultCmsContent: CmsContentMap = {
  home: {
    hero: {
      mode: "composition",
      composition: {
        eyebrow: "Diseño, fabricación e instalación a medida",
        desktopLines: ["Soluciones de acceso", "que combinan seguridad,", "diseño y automatización."],
        mobileLines: ["Accesos que", "combinan", "seguridad, diseño", "y automatización."],
        desktopDescription: "Puertas automáticas, techos, ventanas, mamparas y estructuras metálicas a medida para tu hogar o negocio.",
        mobileDescription: "Puertas automáticas, techos, ventanas y estructuras metálicas a medida para tu hogar o negocio.",
        primary: { label: "Diseña y cotiza tu proyecto", href: "/cotizar" },
        secondary: { label: "Ver proyectos reales", href: "/proyectos" },
        proofLeftTitle: "Diseño a medida", proofLeftBody: "según tu espacio y forma de uso",
        proofRightTitle: "Asesoría técnica", proofRightBody: "antes de fabricar e instalar",
        advisorImage: { src: "/NUEVO/ChatGPT Image 22 sept 2026%2C 14_56_50.png", alt: "Asesor de Industrial Remotos Perú", position: "center" },
        advisorHref: "/asistente",
        desktopVideo: { src: "/NUEVO/NUEVO%20LOADER/intro-home-pc-20261015.mp4", alt: "Presentación de Industrial Remotos Perú", position: "center" },
        mobileVideo: { src: "/NUEVO/NUEVO%20LOADER/intro-home-mobile-20261015.mp4", alt: "Presentación de Industrial Remotos Perú", position: "center" },
        desktopPoster: { src: "/NUEVO/NUEVO%20LOADER/pc-poster.webp", alt: "Presentación de Industrial Remotos Perú", position: "center" },
        mobilePoster: { src: "/NUEVO/NUEVO%20LOADER/celular-poster.webp", alt: "Presentación de Industrial Remotos Perú", position: "center" },
        fallbackImage: { src: "/NUEVO/ChatGPT%20Image%2021%20sept%202026%2C%2011_01_15.png", alt: "Casa moderna con acceso automatizado", position: "center" }
      },
      imageOnly: {
        desktop: { src: "/NUEVO/ChatGPT Image 21 sept 2026%2C 11_01_15.png", alt: "Casa moderna con acceso automatizado", position: "center" },
        mobile: { src: "/NUEVO/mobile-intro-last-frame.webp", alt: "Casa moderna con acceso automatizado", position: "center" }
      },
      videoOnly: {
        desktop: { src: "/NUEVO/NUEVO%20LOADER/intro-home-pc-20261015.mp4", alt: "Presentación de Industrial Remotos Perú", position: "center" },
        mobile: { src: "/NUEVO/NUEVO%20LOADER/intro-home-mobile-20261015.mp4", alt: "Presentación de Industrial Remotos Perú", position: "center" },
        desktopPoster: { src: "/NUEVO/NUEVO%20LOADER/pc-poster.webp", alt: "Presentación de Industrial Remotos Perú", position: "center" },
        mobilePoster: { src: "/NUEVO/NUEVO%20LOADER/celular-poster.webp", alt: "Presentación de Industrial Remotos Perú", position: "center" }
      }
    },
    needs: {
      eyebrow: "Soluciones a medida", title: "¿Qué necesitas", titleAccent: "construir?",
      desktopDescription: "Elige la solución que mejor se adapte a tu proyecto. Convertimos tu idea en espacios más seguros, funcionales y con diseño de alto nivel.",
      mobileDescription: "Elige la solución que mejor se adapte a tu proyecto.", cta: { label: "Conoce más sobre nuestras soluciones", href: "/soluciones" },
      process: [
        { id: "orientacion", title: "Orientación técnica", body: "Decisiones claras desde el inicio", icon: "advisor" },
        { id: "medida", title: "Proyecto a medida", body: "Adaptado al espacio y forma de uso", icon: "design" },
        { id: "integrada", title: "Solución integrada", body: "Diseño, fabricación y montaje coordinados", icon: "settings" },
        { id: "acompanamiento", title: "Acompañamiento", body: "Un equipo durante todo el proyecto", icon: "tools" }
      ],
      services: [
        ["garage","Puertas de garaje a medida","Fabricadas según el vano, el uso y el sistema de apertura.","/images/reales/portada-puerta-seccional.jpg","/soluciones/puertas-automatizacion","garage"],
        ["principales-medida","Puertas principales a medida","Diseñadas y fabricadas para tu ingreso, fachada y estilo.","/NUEVO/IRP-imagenes-por-servicio/01_Puertas_principales_a_medida/Propuestas/portada-principal-grafito.png","/soluciones/puertas-a-medida","entry"],
        ["medida","Puertas principales importadas","Elige un modelo, una medida disponible y el color.","/images/configurator/catalog/02_Puertas_importadas/Colores_propuestos/nogal.webp","/soluciones/puertas-principales","customDoor"],
        ["contraplacadas","Puertas contraplacadas","Modelos batientes y pivotantes para cada ambiente.","/NUEVO/IRP-imagenes-por-servicio/11_Puertas_contraplacadas/Propuestas/Batientes/singapur.png","/soluciones/puertas-contraplacadas","contraplacada"],
        ["baranda","Acero inoxidable y barandas","Seguridad y elegancia en cada detalle.","/NUEVO/A/ChatGPT Image 21 sept 2026%2C 20_19_52 (2).png","/soluciones/acero-barandas","rail"],
        ["mamparas","Mamparas y ventanas","Diseño, iluminación y funcionalidad.","/NUEVO/A/ChatGPT Image 21 sept 2026%2C 20_19_53 (3).png","/soluciones/ventanas-mamparas","window"],
        ["techos","Techos y coberturas","Protección y confort para terrazas, patios y cocheras.","/NUEVO/A/ChatGPT Image 21 sept 2026%2C 20_19_53 (4).png","/soluciones/techos-coberturas","pergola"]
      ].map(([id,title,body,src,href,icon]) => ({ id, title, body, image: { src, alt: title, position: "center" as const }, href, icon }))
    },
    projects: {
      eyebrow: "Nuestros proyectos", title: "Proyectos reales que", titleAccent: "inspiran confianza",
      description: "Conoce algunas de nuestras instalaciones y soluciones realizadas en hogares, empresas e industrias. Cada proyecto refleja nuestro compromiso con la calidad, la seguridad y la excelencia en cada detalle.",
      cta: { label: "Ver más proyectos", href: "/proyectos" },
      topGallery: defaultHomeTopGallery,
      bottomGallery: defaultHomeBottomGallery
    },
    integrated: {
      eyebrow: "Soluciones para cada espacio", title: "Soluciones que se integran a tu", titleAccent: "espacio",
      description: "Integramos soluciones de acceso, protección y acondicionamiento adaptadas a la arquitectura y necesidades de cada proyecto.", cta: { label: "Explorar soluciones", href: "/soluciones" },
      desktopScene: { src: "/NUEVO/D/ChatGPT Image 22 sept 2026%2C 10_00_28.png", alt: "Soluciones integradas", position: "center" },
      mobileScene: { src: "/NUEVO/D/ChatGPT Image 22 sept 2026%2C 10_00_21.png", alt: "Soluciones integradas", position: "center" },
      services: [
        ["garage","Garaje","Puertas de garaje a medida","Fabricadas según las dimensiones, el uso y el sistema de apertura de cada acceso.","/soluciones/puertas-automatizacion"],
        ["principales-medida","A medida","Puertas principales a medida","Diseñadas y fabricadas para integrarse al ingreso, la fachada y el estilo del proyecto.","/soluciones/puertas-a-medida"],
        ["puertas-medida","Importadas","Puertas principales importadas","Modelos de catálogo disponibles por medida, acabado y color.","/soluciones/puertas-principales"],
        ["baranda","Barandas","Acero inoxidable y barandas","Barandas y pasamanos integrados al diseño y las necesidades del proyecto.","/soluciones/acero-barandas"],
        ["mamparas","Mamparas","Mamparas y ventanas","Mamparas y ventanas que conectan ambientes y aprovechan la luz natural.","/soluciones/ventanas-mamparas"],
        ["solisombra","Techos","Techos y coberturas","Coberturas diseñadas para acondicionar terrazas, patios y cocheras.","/soluciones/techos-coberturas"],
        ["drywall","Drywall","Drywall y cielorrasos","Acondicionamiento de interiores para distribuir y transformar espacios.","/soluciones/drywall-cielorrasos"]
      ].map(([id,shortTitle,title,body,href]) => ({ id, shortTitle, title, body, href, visible: true }))
    },
    impact: {
      titleLine1: "EXPERIENCIA QUE", titleLine2: "RESPALDA CADA", titleAccent: "PROYECTO", description: "Trayectoria, ejecución y compromiso respaldan cada proyecto que asumimos.",
      metrics: [{ id: "years", value: 12, prefix: "+", suffix: "", label: "Años de experiencia", progress: 100 }, { id: "projects", value: 958, prefix: "+", suffix: "", label: "Proyectos finalizados", progress: 100 }, { id: "custom", value: 100, prefix: "", suffix: "%", label: "Soluciones a medida", progress: 100 }],
      gallery: ["10-1","13-2","16-3","19-4","24-5","29-6"].map((name, index) => ({ src: `/NUEVO/G/Imagen%20de%20ChatGPT%2027%20sept%202026%2C%2020_40_${name}.png`, alt: `Proyecto destacado ${index + 1}`, position: "center" as const }))
    },
    process: {
      eyebrow: "De la idea a la instalación", title: "Así convertimos tu proyecto en una", titleAccent: "solución instalada", description: "Un proceso claro, coordinado y enfocado en la calidad, para que tú solo te preocupes por disfrutar el resultado.",
      steps: [
        ["advice","01","Asesoría","Entendemos el espacio y el objetivo del proyecto.","/NUEVO/A/ChatGPT Image 21 sept 2026%2C 20_19_53 (6).png","advisor"],
        ["design","02","Diseño","Definimos sistema, materiales y solución a medida.","/NUEVO/A/ChatGPT Image 21 sept 2026%2C 20_19_52 (2).png","design"],
        ["build","03","Fabricación","Desarrollamos cada componente con precisión.","/NUEVO/A/ChatGPT Image 21 sept 2026%2C 20_19_53 (4).png","settings"],
        ["install","04","Instalación","Montaje, pruebas y entrega final con respaldo.","/NUEVO/A/ChatGPT Image 21 sept 2026%2C 20_19_52 (1).png","tools"]
      ].map(([id,number,title,body,src,icon]) => ({ id, number, title, body, image: { src, alt: title, position: "center" as const }, href: "", icon })),
      benefits: [{ id: "quality", firstLine: "Calidad", secondLine: "en cada etapa", icon: "shield" }, { id: "coordination", firstLine: "Coordinación", secondLine: "total del proceso", icon: "settings" }, { id: "results", firstLine: "Resultados", secondLine: "que generan confianza", icon: "badge" }],
      cta: { label: "Hablemos de tu proyecto", href: "/cotizar" }
    },
    projectPath: {
      eyebrow: "Empieza tu proyecto", title: "¿Cómo quieres", titleAccent: "avanzar?", description: "Elige si prefieres conversar con nuestro asistente o configurar tu proyecto para obtener una referencia inicial.",
      desktopBackground: { src: "/NUEVO/E/ChatGPT Image 22 sept 2026%2C 10_38_39 (1).png", alt: "Fondo arquitectónico de la sección", position: "center" }, mobileBackground: { src: "/NUEVO/E/ChatGPT Image 22 sept 2026%2C 10_38_40 (2).png", alt: "Fondo arquitectónico de la sección en móvil", position: "center" },
      assistant: { title: "IRP Asistente", subtitle: "Te guiamos paso a paso", description: "Cuéntanos qué tienes en mente y te ayudaremos a encontrar la solución que mejor se adapte a tu proyecto.", button: { label: "Hablar con IRP Asistente", href: "/asistente" } },
      quote: { title: "Cotizador inteligente", subtitle: "Diseña y cotiza tu proyecto", description: "Configura una referencia inicial con las características principales de tu proyecto y continúa con una solicitud de cotización.", preview: { src: "/images/reales/portada-puerta-seccional.jpg", alt: "Vista de referencia de una puerta seccional", position: "center" }, button: { label: "Abrir cotizador inteligente", href: "/cotizar" } }
    },
    coverage: {
      eyebrow: "Cobertura y ubicación", title: "Revisamos la ubicación de cada proyecto", description: "Indica el distrito o provincia en tu solicitud para confirmar disponibilidad de visita, fabricación e instalación.",
      points: [{ id: "location", text: "Ubicación evaluada por solicitud", icon: "map" }, { id: "transport", text: "Traslado e instalación por confirmar", icon: "truck" }, { id: "support", text: "Coordinación directa con un asesor", icon: "support" }],
      mapHref: "https://www.google.com/maps?q=Lima%20Peru", mapEmbedUrl: "https://www.google.com/maps?q=Lima%20Peru&z=10&output=embed",
      ctaEyebrow: "¿Tienes un proyecto?", ctaTitle: "Conversemos sobre el espacio que quieres transformar.", ctaDescription: "Cuéntanos qué necesitas y comparte los primeros datos de tu proyecto por el canal que prefieras.",
      primary: { label: "Contarnos tu proyecto", href: "/contacto" }, whatsappLabel: "Hablar por WhatsApp", phoneLabel: "Atención directa"
    }
  },
  about: {
    hero: {
      visible: true,
      eyebrow: "Nosotros",
      titleLine1: "Detrás de cada detalle,",
      titleLine2: "está nuestro equipo.",
      description: "Diseño, fabricación e instalación a medida.",
      indicator: "Conoce nuestra esencia ↓",
      animationEnabled: true,
      stickyEnabled: true,
      image: { src: "/NUEVO/NOSOTROS/hero nsosotros/nosotros-hero-pc.webp", alt: "Técnicos de Industrial Remotos Perú instalando un portón en una vivienda luminosa", position: "center" },
      mobileImage: { src: "/NUEVO/NOSOTROS/hero nsosotros/nosotros-hero-celular.webp", alt: "Técnicos de Industrial Remotos Perú instalando un portón", position: "right" }
    },
    workVideos: {
      visible: true,
      eyebrow: "Nuestro trabajo, en acción",
      title: "Así damos forma",
      titleAccent: "a tus proyectos",
      description: "Del taller a la instalación. Mira cómo trabajamos.",
      moreLabel: "Más trabajos en TikTok",
      moreHref: "",
      items: [
        { id: "taller", title: "En el taller", videoSrc: "", poster: { src: "", alt: "", position: "center" }, tiktokUrl: "", published: false },
        { id: "instalacion", title: "Durante la instalación", videoSrc: "", poster: { src: "", alt: "", position: "center" }, tiktokUrl: "", published: false },
        { id: "resultado", title: "El resultado", videoSrc: "", poster: { src: "", alt: "", position: "center" }, tiktokUrl: "", published: false }
      ]
    },
    presentation: {
      visible: true,
      eyebrow: "Industrial Remotos Perú",
      title: "Quiénes somos",
      titleAccent: "Precisos en el trabajo.",
      body: "Diseñamos, fabricamos e instalamos puertas, cerramientos y estructuras a medida para hogares y negocios.",
      bodySecondary: "Acompañamos tu proyecto desde la primera idea hasta la instalación, con atención cercana y cuidado en cada detalle.",
      statement: "Cercanos en el trato. Precisos en el trabajo.",
      videoSrc: "",
      videoPoster: { src: "", alt: "Portada del video Quiénes somos", position: "center" },
      highlights: [
        { id: "diseno", title: "Diseño a medida" },
        { id: "atencion", title: "Atención cercana" },
        { id: "detalle", title: "Cuidado en los detalles" }
      ],
      image: { src: "/NUEVO/NOSOTROS/Residencia contemporánea con ventanales al jardín-2.png", alt: "Ambiente contemporáneo con mamparas hacia el jardín", position: "center" }
    },
    purpose: {
      visible: true,
      image: { src: "/NUEVO/NOSOTROS/Terraza contemporánea con pérgola y jardín-3.png", alt: "Terraza contemporánea con pérgola y jardín", position: "center" },
      mobileImage: { src: "/NUEVO/NOSOTROS/Terraza contemporánea con pérgola y jardín-3.png", alt: "Terraza contemporánea con pérgola y jardín", position: "center" },
      missionTitle: "Nuestra misión",
      missionBody: "Crear soluciones funcionales y duraderas, con fabricación cuidadosa y atención personalizada para cada espacio.",
      visionTitle: "Nuestra visión",
      visionBody: "Crecer como una empresa de confianza, reconocida por la calidad de su trabajo y la mejora continua."
    },
    values: {
      visible: true,
      title: "El compromiso se nota",
      titleAccent: "en los detalles.",
      items: [
        { id: "responsabilidad", title: "Responsabilidad", body: "Coordinamos cada etapa y cuidamos nuestros compromisos." },
        { id: "calidad", title: "Calidad", body: "Cuidamos los materiales y los acabados." },
        { id: "honestidad", title: "Honestidad", body: "Propuestas claras y comunicación transparente." },
        { id: "compromiso", title: "Compromiso", body: "Nos involucramos en cada detalle para que tu proyecto sea justo como lo imaginaste." }
      ],
      image: { src: "/NUEVO/NOSOTROS/Técnico ajustando herrajes de fachada de vidrio-4.png", alt: "Técnico de Industrial Remotos Perú ajustando herrajes", position: "center" }
    },
    cta: {
      visible: true,
      title: "Llámanos y hacemos realidad tu sueño",
      label: "Escríbenos por WhatsApp",
      href: "/contacto",
      image: { src: "/NUEVO/NOSOTROS/Técnico instalador sonriente con móvil-5.png", alt: "Técnico de Industrial Remotos Perú con un teléfono móvil", position: "center" }
    }
  },
  services: {
    items: solutionPages.map((solution) => {
      const profile = findSolutionEditorialProfile(solution.slug)!;
      return {
        slug: solution.slug,
        title: solution.title,
        heroHeading: profile.heroHeading,
        heroAccent: profile.heroAccent || "",
        heroDescription: profile.heroDescription,
        heroImage: { src: profile.visuals.hero.src, alt: `Imagen ilustrativa de ${solution.title}`, position: "center" as const },
        faqs: solution.faqs.map((faq, index) => ({ id: `${solution.slug}-faq-${index + 1}`, ...faq }))
      };
    })
  },
  projects: {
    title: "Nuestros proyectos",
    items: projects.slice(0, 14).map((project, index) => ({
      id: project.id,
      image: {
        src: project.image,
        alt: `Referencia visual de solución arquitectónica ${index + 1}`,
        position: "center" as const
      },
      published: true
    }))
  },
  contact: {
    eyebrow: "Contacto",
    title: "Hagamos realidad",
    titleAccent: "tu proyecto.",
    description: "Cuéntanos tu idea. Estamos para ayudarte.",
    formTitle: "Cuéntanos sobre tu proyecto",
    formDescription: "Completa los datos y un asesor revisará tu solicitud.",
    desktopBackground: {
      src: "/NUEVO/CONTACTO/contacto-fondo-escritorio.webp",
      alt: "Entrada contemporánea con puerta de madera y vegetación",
      position: "center" as const
    },
    mobileBackground: {
      src: "/NUEVO/CONTACTO/contacto-fondo-movil.webp",
      alt: "Entrada contemporánea vertical con puerta de madera y vegetación",
      position: "center" as const
    },
    submitLabel: "Enviar consulta",
    whatsappLabel: "Hablar por WhatsApp",
    whatsappTitle: "¿Lo conversamos?",
    whatsappDescription: "Escríbenos y cuéntanos tu idea.",
    whatsappMessage: "Hola, Industrial Remotos Perú. Quisiera conversar sobre un proyecto.",
    showWhatsapp: true,
    successMessage: "Tu consulta fue registrada correctamente. Nuestro equipo se comunicará contigo.",
    showMap: true,
    mapEmbedUrl: ""
  },
  company: {
    commercialName: siteConfig.name,
    legalName: companyLegalData.legalName,
    ruc: companyLegalData.ruc,
    address: companyLegalData.address,
    location: siteConfig.location,
    phoneDisplay: siteConfig.phoneDisplay,
    whatsappNumber: siteConfig.whatsappNumber,
    email: "",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Lima%20Villa%20El%20Salvador",
    hours: siteConfig.hours,
    coverage: siteConfig.coverage,
    facebook: siteConfig.social.facebook,
    instagram: siteConfig.social.instagram,
    tiktok: siteConfig.social.tiktok,
    routeTransition: {
      enabled: true,
      background: { src: "/NUEVO/transicion-titanio-azul.webp", alt: "Textura de titanio azul marino", position: "center" },
      logo: { src: "/NUEVO/LOGO.png", alt: "Logo de Industrial Remotos Perú", position: "center" }
    }
  },
  footer: {
    description: "Diseñamos, fabricamos e instalamos soluciones de acceso, estructuras y acabados a medida.",
    navigation: [
      { id: "about", label: "Nosotros", href: "/nosotros", visible: true },
      { id: "services", label: "Servicios", href: "/soluciones", visible: true },
      { id: "projects", label: "Proyectos", href: "/proyectos", visible: true },
      { id: "contact", label: "Contacto", href: "/contacto", visible: true }
    ],
    legal: [
      { id: "privacy", label: "Política de privacidad", href: "/politica-privacidad", visible: true },
      { id: "complaints", label: "Libro de Reclamaciones", href: "/libro-reclamaciones", visible: true },
      { id: "terms", label: "Términos", href: "/terminos", visible: true }
    ]
  }
};
