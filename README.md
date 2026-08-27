# GB Consultores — Landing

Landing cinematográfica de GB Consultores (Grupo Boggio), consultora argentina de
Seguridad, Salud Ocupacional, Medio Ambiente y Calidad, más el esqueleto del
portal interno.

## Stack

- **Angular 22** zoneless, SSR con hidratación incremental
- **Tailwind CSS v4** (CSS-first, sin `tailwind.config.js`)
- **GSAP 3 + ScrollTrigger**, cargado de forma diferida
- Sin Three.js, sin librerías de UI, sin Zone.js

## Comandos

```bash
npm start                          # servidor de desarrollo, http://localhost:4200
npm run build                      # build de producción + prerender
node dist/website/server/server.mjs # servidor SSR de producción, puerto 4000
```

## Estructura narrativa

La landing es un arco de seis actos. Cada `<section>` lleva el id `acto-0X`, que
usan tres cosas a la vez: los anclas de navegación, el índice lateral y el rango
de scrubbing del casco.

| Id | Acto | Objetivo |
|---|---|---|
| `acto-00` | Hero | Gancho y única acción posible |
| `acto-01` | Trayectoria | Autoridad antes de pedir nada |
| `acto-02` | El conflicto | Nombrar el problema |
| `acto-03` | La solución | Las cuatro disciplinas |
| `acto-04` | Por qué nos eligen | Diferenciador y prueba social |
| `acto-05` | Cierre | Contacto |

## Decisiones que conviene no deshacer

**El H1 del Hero se pinta desde el primer fotograma.** Es el elemento LCP. El
telón de apertura pasa *por encima*; el titular nunca se oculta con `opacity` ni
con `clip-path`. Animar el H1 mueve el LCP y tira la métrica abajo.

**Toda la apertura del Hero es CSS, no GSAP.** Arranca en el primer pintado en
vez de esperar a que baje el chunk de animación, no suma trabajo al hilo
principal y, si el JavaScript fallara, el hero no puede quedarse tapado por el
telón. El dibujado del isotipo usa `pathLength="1"` para animarse sin medir con
`getTotalLength()`.

**Los actos 01–05 usan `@defer (on viewport; hydrate on viewport)`.** El servidor
entrega el HTML completo —el copy está en el prerender, no lo inyecta
JavaScript— y sólo se difiere la hidratación. Cambiarlo a un `@defer` normal
sacaría todo el contenido del HTML inicial y rompería el SEO.

**`compression()` en `src/server.ts` no es opcional.** Sin él, el HTML y los
bundles viajan en crudo: son 341 KB de más y el Performance en móvil cae de 99
a 84.

**La tipografía es auto-hospedada** (`public/fonts/montserrat-var.woff2`, 38 KB,
pesos 200–800). No volver al `<link>` de Google Fonts: es render-blocking.

**El acceso al portal es discreto, no invisible.** Usa `--color-bone-mute`. Con
un gris más oscuro el contraste caía a 1.32:1 y fallaba WCAG AA. Lo reservado lo
dan el tamaño, la caja alta, el tracking y la posición.

## Estado medido

Lighthouse contra el build de producción SSR (`node dist/website/server/server.mjs`):

| | Perf | A11y | Best Practices | SEO |
|---|---|---|---|---|
| Landing, móvil | 99 | 100 | 100 | 100 |
| Landing, desktop | 100 | 100 | 100 | 100 |
| `/detalle/soluciones`, móvil | 99 | 100 | 100 | 100 |

LCP 1.8 s · TBT 20 ms · CLS 0 · transferencia inicial 86,7 KB.

## Pendiente de contenido del cliente

- **Testimonios y logotipos** (`acto-04-prueba.ts`): el array `testimonios` está
  vacío a propósito y la sección muestra un bloque de espacio reservado. Cargar
  citas reales con nombre, cargo y empresa. No publicar testimonios inventados.
- **Cifras del Acto 01**: sólo se usan datos ya aprobados en las
  especificaciones. Cualquier métrica adicional necesita validación.
- **Dominio de email**: las especificaciones indican `contacto@grupoboggio.ar`
  mientras la marca en pantalla es "GB Consultores". Confirmar.
- **Dominio del sitio**: `https://gbconsultores.ar` está fijado en
  `src/app/core/services/seo.ts`, `public/sitemap.xml` y `public/robots.txt`.

## Antes de publicar

1. `angular.json` → `security.allowedHosts` incluye `localhost` y `127.0.0.1`
   para poder auditar en local. Agregar el dominio real.
2. Cambiar el origen en `seo.ts`, `sitemap.xml` y `robots.txt` si el dominio
   final es otro.
3. El video del casco pesa 1,5 MB. Evaluar un re-encode H.264 y una variante
   WebM/AV1: se carga después del evento `load`, así que no afecta el LCP, pero
   sí el consumo de datos en móvil.

## Portal interno

`/portal` existe como esqueleto con la misma dirección de arte. El formulario
está deshabilitado y no envía nada. `src/app/core/guards/portal.guard.ts`
devuelve `true` con un `TODO`: es el único punto que hay que tocar cuando exista
el servicio de sesión. La ruta se renderiza en el servidor (no se prerenderiza),
lleva `noindex, nofollow` y está en `Disallow` del `robots.txt`.
