import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CtaMagnetica } from '../../../shared/components/cta-magnetica/cta-magnetica';
import { RevealSection } from '../../../shared/directives/reveal-section';

/** Acto 05 — El plano final. Una sola accion posible. */
@Component({
  selector: 'app-acto-05-cierre',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CtaMagnetica, RevealSection],
  templateUrl: './acto-05-cierre.html',
  styleUrl: './acto-05-cierre.css',
})
export class Acto05Cierre {}
