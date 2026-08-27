import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

const ORIGEN = 'https://gbconsultores.ar';

export interface MetaPagina {
  titulo: string;
  descripcion: string;
  ruta: string;
  /** Las paginas privadas no se indexan. */
  noIndexar?: boolean;
}

/**
 * Aplica titulo, descripcion, canonical y Open Graph por ruta.
 * Corre igual en el servidor, asi que el prerender ya sale con los meta tags
 * correctos y los rastreadores no dependen de JavaScript.
 */
@Injectable({ providedIn: 'root' })
export class Seo {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  aplicar(p: MetaPagina): void {
    const url = `${ORIGEN}${p.ruta}`;

    this.title.setTitle(p.titulo);
    this.meta.updateTag({ name: 'description', content: p.descripcion });
    this.meta.updateTag({ property: 'og:title', content: p.titulo });
    this.meta.updateTag({ property: 'og:description', content: p.descripcion });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ name: 'twitter:title', content: p.titulo });
    this.meta.updateTag({ name: 'twitter:description', content: p.descripcion });

    if (p.noIndexar) {
      this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      this.meta.removeTag("name='robots'");
    }

    this.fijarCanonical(url);
  }

  private fijarCanonical(url: string): void {
    let link = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
