# Industrial Remotos Peru - Frontend

Landing corporativa one-page desarrollada con Next.js, TypeScript, Tailwind CSS,
Framer Motion y GSAP. No incluye backend, base de datos ni panel administrativo.

## Desarrollo

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

Para validar una entrega:

```bash
npm run typecheck
npm run visual-check
npm run build
```

## Contenido editable

- Telefono, horario, ubicacion y redes: `data/site.ts`.
- Productos y acabados: `data/products.ts`.
- Proyectos y distritos: `data/projects.ts`.
- Servicios: `data/services.ts`.
- Fotografias reales: `public/images/reales/`.
- Ilustraciones premium de puertas: `components/DoorIllustration.tsx`.

Las fotografias cuadradas se muestran dentro de tarjetas pequenas para respetar
su resolucion original. La portada de mayor tamano se usa en el hero con un
tratamiento visual que evita ampliar detalles de baja resolucion.

Define `NEXT_PUBLIC_SITE_URL` en el entorno del VPS con el dominio real antes de
compilar. El archivo `.env.example` muestra el formato esperado.

## Cotizador

El formulario valida en el navegador, ordena los datos y abre WhatsApp con el
mensaje listo para enviar al numero configurado en `data/site.ts`. No guarda
informacion.

## VPS / Docker

`next.config.mjs` usa `output: "standalone"`. Construye y ejecuta:

```bash
docker build -t industrial-remotos-peru .
docker run --rm -p 3000:3000 industrial-remotos-peru
```

Nginx puede hacer proxy al puerto 3000.
