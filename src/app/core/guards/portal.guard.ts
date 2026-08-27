import { CanActivateFn } from '@angular/router';

/**
 * Punto de enganche para la autenticacion del portal interno.
 *
 * Hoy deja pasar a todo el mundo a proposito: el portal es solo un esqueleto
 * y la autenticacion es una fase posterior. Cuando exista el servicio de
 * sesion, la comprobacion va aca y esta es la unica pieza que cambia.
 *
 * TODO(portal): validar sesion y redirigir al login cuando no haya.
 */
export const portalGuard: CanActivateFn = () => true;
