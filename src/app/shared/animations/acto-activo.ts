/**
 * Detecta que acto esta "activo": el que cruza una banda fina al 45% de la
 * altura del viewport. Es mas robusto que observar por proporcion visible: un
 * acto mas alto que la pantalla nunca llega a un ratio alto, asi que con
 * umbrales de ratio el indice se puede quedar trabado. Con la banda, cada
 * acto entra y sale exactamente una vez.
 *
 * Independiente de `rail-scroll` (que usa la misma tecnica para resaltar el
 * indice lateral): esta version notifica el indice numerico, que es lo que
 * necesita el casco para elegir su encuadre.
 */
export function observarActoActivo(
  ids: string[],
  onCambiar: (indice: number, id: string) => void,
): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entrada of entries) {
        if (!entrada.isIntersecting) continue;
        const indice = ids.indexOf(entrada.target.id);
        if (indice !== -1) onCambiar(indice, entrada.target.id);
      }
    },
    { rootMargin: '-45% 0px -54% 0px', threshold: 0 },
  );

  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  }

  return () => observer.disconnect();
}
