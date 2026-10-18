# Contract: Navegación entre `/login` y `/registro`

Módulo `src/ui/navigation/`. No depende del dominio ni de la infraestructura (Constitución 3.2).
Justificación en [research.md R1](../research.md#r1-navegación-entre-login-y-registro).

## Rutas

| Ruta | Pantalla | `document.title` |
|---|---|---|
| `/login` | Inicio de sesión | `KynWallet · Iniciar sesión` |
| `/registro` | Registro | `KynWallet · Crear cuenta` |
| Cualquier otra (incluye `/`) | Inicio de sesión | Igual que `/login` |

```ts
export type RouteName = 'login' | 'register';
export const ROUTE_PATHS: Record<RouteName, string>; // { login: '/login', register: '/registro' }

export function resolveRoute(pathname: string): RouteName;
export function navigate(route: RouteName): void;   // pushState + notifica a los suscriptores
export function useRoute(): RouteName;               // useSyncExternalStore sobre la URL
export function Link(props: { to: RouteName; children: ReactNode }): JSX.Element; // <a href>
```

## Comportamiento obligatorio

| # | Dado | Resultado |
|---|---|---|
| N1 | Se carga la página en `/registro` | Se muestra el registro; `/login` muestra el login |
| N2 | Se carga una ruta desconocida o `/` | Se muestra el login y la URL se normaliza a `/login` (`replaceState`, sin añadir historial) |
| N3 | Clic simple en `Link` | Navega sin recargar la página y añade una entrada al historial |
| N4 | Clic con Ctrl/Cmd/Mayús/botón central o `target` distinto | No se intercepta; el navegador abre el `href` normal |
| N5 | Botón Atrás/Adelante | La pantalla sigue a la URL (`popstate`) |
| N6 | Navegación interna | El foco pasa al `h1` de la nueva pantalla y `document.title` se actualiza |
| N7 | Carga inicial | No se mueve el foco (comportamiento normal del navegador) |
| N8 | Cualquier navegación | La URL NO DEBE contener datos del formulario, contraseñas ni mensajes (FR-012) |

## Estado que no viaja con la navegación

Los formularios se desmontan al cambiar de ruta, por lo que no conservan valores (US4-2). El
aviso de éxito se entrega por estado de `App`, no por la URL ni `history.state`
([data-model.md](../data-model.md#aviso-de-registro-exitoso-app-valor-transitorio)).
