import { useEffect, useSyncExternalStore } from 'react';
import { resolveRoute, ROUTE_PATHS, type RouteName } from './routes';

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('popstate', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('popstate', listener);
  };
}

const getSnapshot = (): RouteName => resolveRoute(window.location.pathname);
const getServerSnapshot = (): RouteName => 'login';

/** Navega sin recargar la página; la URL solo contiene la ruta (FR-012, N8). */
export function navigate(route: RouteName): void {
  window.history.pushState({}, '', ROUTE_PATHS[route]);
  listeners.forEach((listener) => listener());
}

/** Ruta actual según la URL. Una URL desconocida se normaliza sin añadir historial (N2). */
export function useRoute(): RouteName {
  const route = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => {
    if (window.location.pathname !== ROUTE_PATHS[route]) {
      window.history.replaceState({}, '', ROUTE_PATHS[route]);
    }
  }, [route]);
  return route;
}
