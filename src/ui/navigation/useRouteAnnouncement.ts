import { useEffect, useRef } from 'react';
import type { RouteName } from './routes';

const TITLES: Record<RouteName, string> = {
  login: 'KynWallet · Iniciar sesión',
  register: 'KynWallet · Crear cuenta',
};

/**
 * Anuncia el cambio de pantalla (WCAG 2.4.2 y 2.4.3, research.md R10): actualiza el título y,
 * en navegaciones internas, mueve el foco al h1 salvo que ya esté dentro del contenido.
 */
export function useRouteAnnouncement(route: RouteName): void {
  const previous = useRef<RouteName | null>(null);

  useEffect(() => {
    document.title = TITLES[route];
    const navigated = previous.current !== null && previous.current !== route;
    previous.current = route;
    if (!navigated) return;

    const main = document.querySelector('main');
    const active = document.activeElement;
    const focusInContent = active !== null && active !== document.body && main?.contains(active);
    if (!focusInContent) main?.querySelector<HTMLElement>('h1')?.focus();
  }, [route]);
}
