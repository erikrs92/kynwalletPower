export type RouteName = 'login' | 'register';

export const ROUTE_PATHS: Record<RouteName, string> = {
  login: '/login',
  register: '/registro',
};

/** Cualquier ruta desconocida, incluida "/", resuelve al inicio de sesión (FR-022). */
export function resolveRoute(pathname: string): RouteName {
  return pathname === ROUTE_PATHS.register ? 'register' : 'login';
}
