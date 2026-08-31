# Configurador

## Objetivo

El configurador produce una especificación visual y técnica suficiente para solicitar evaluación. No promete compatibilidad, precio ni fabricación sin revisión de un asesor.

## Esquema declarativo

Cada producto debe definir sus propios pasos:

```ts
type ConfiguratorSchema = {
  productId: string;
  version: number;
  steps: Array<{
    id: string;
    kind: "choice" | "multi-choice" | "dimensions" | "text" | "diagram";
    required: boolean;
    options?: Array<{ id: string; label: string; media?: string }>;
    visibleWhen?: Condition[];
  }>;
};
```

Puertas, techos, mamparas, barandas y estructuras no comparten ciegamente las mismas opciones. Las condiciones ocultan pasos incompatibles y se revalidan al rehidratar un borrador antiguo.

## Borrador local

El almacenamiento usa un envelope, no un array suelto:

```json
{
  "version": 3,
  "updatedAt": "ISO-8601",
  "items": []
}
```

Al cargar:

1. Parsear dentro de `try/catch`.
2. Validar con Zod.
3. Migrar versiones conocidas.
4. Descartar únicamente campos inválidos, no todo el proyecto si puede recuperarse.
5. Avisar al usuario cuando una configuración de catálogo ya no es válida.

Cada ítem conserva `productId`, versión del schema, respuestas completas, medidas canónicas, acabado, observaciones, cantidad y referencia opcional al diagrama. Editar reemplaza el ítem; duplicar genera un ID nuevo.

## Unidades

- Dimensiones persistidas en milímetros enteros.
- La interfaz puede presentar centímetros o metros.
- Conversiones en funciones puras y probadas.
- Límites de rango pertenecen al schema del producto y requieren validación comercial.

## Vista visual

- Fotografías y capas 2D son referencias, nunca un “3D” ficticio.
- Los acabados cambian únicamente cuando existe una textura/activo válido.
- El motor SVG usa proporciones derivadas de medidas confirmadas o pesos relativos del preset.
- Etiquetas del croquis no confirmadas solo aparecen en Control.

## Asistente

El asistente produce una recomendación explicable:

```text
respuestas → reglas versionadas → candidatos → razones → siguiente acción
```

No debe convertir cualquier texto en una solución por coincidencia superficial ni mostrar importes sin una regla de precio publicada.

## Responsive

- Escritorio: escena protagonista + controles laterales + resumen.
- Móvil: escena visible, pasos compactos y controles en accordion/bottom sheet.
- El CTA siguiente/anterior permanece accesible con teclado y safe area.
- Nunca se depende de hover para seleccionar.
