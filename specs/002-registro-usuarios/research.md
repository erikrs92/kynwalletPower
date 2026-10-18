# Research: Pantalla de Registro de Usuarios de KynWallet

**Feature**: `002-registro-usuarios` | **Date**: 2026-10-17

Resuelve las incógnitas del Technical Context y las decisiones que la spec dejó abiertas a
propósito. Las decisiones de stack, estilos, pruebas y controles de calidad se heredan sin
cambios de [`001-login-billetera/research.md`](../001-login-billetera/research.md) (R1, R2, R5,
R7, R8, R9) y no se repiten aquí.

## R1. Navegación entre `/login` y `/registro`

- **Decision**: un módulo de navegación propio y mínimo en `src/ui/navigation/` basado en la
  History API (`pushState`, evento `popstate`) y `useSyncExternalStore`. Expone: la tabla de
  rutas (`/login`, `/registro`), `resolveRoute(pathname)` (cualquier ruta desconocida, incluida
  `/`, resuelve a login), `navigate(path)`, el hook `useRoute()` y un componente `Link` que
  renderiza un `<a href>` real e intercepta el clic simple para navegar sin recargar.
- **Rationale**: FR-015, FR-011 y FR-022 exigen URLs reales y la spec 001 descartó el router
  por YAGNI porque había una sola pantalla. Con dos rutas estáticas y sin parámetros, anidación
  ni cargadores, una biblioteca aporta superficie de API, dependencia y mantenimiento que el
  requisito no necesita (Constitución 4.2, 4.3, 7.4). El módulo propio son unas 40 líneas,
  no depende del dominio y se prueba por completo con jsdom.
- **Alternatives considered**:
  - `react-router-dom` (MIT, mantenido): válido, pero añade una dependencia y un modelo de
    datos/rutas para dos pantallas; se reconsidera si aparecen más rutas, rutas protegidas o
    parámetros (es el punto en que el módulo propio deja de ser KISS).
  - Rutas con hash (`#/login`): no cumple la dirección `/login` pedida.
  - Cambiar de vista con estado en `App` sin tocar la URL: no cumple FR-015 ni FR-022 ni el
    botón Atrás.
- **Consecuencias**: el servidor de desarrollo y `vite preview` ya responden con `index.html`
  ante cualquier ruta; un despliegue estático debe configurar el mismo comportamiento
  (documentado en el quickstart). Los enlaces del login y del registro se vuelven enlaces
  semánticos (`link`), no botones.

## R2. Cuentas compartidas entre login y registro

- **Decision**: una clase `InMemoryAccountStore` en infraestructura que guarda las cuentas
  (cargadas de `VITE_DEMO_USERS` más las creadas en el registro) y es la única fuente de verdad.
  Se crea una sola vez en la raíz de composición (`main.tsx`) y se inyecta en dos adaptadores:
  `InMemoryAuthGateway` (login, existente, pasa a leer del almacén) y
  `InMemoryRegistrationGateway` (registro, nuevo). Cada adaptador implementa su propio puerto
  (`AuthGateway`, `RegistrationGateway`), de modo que la UI y los casos de uso no conocen el
  almacén.
- **Rationale**: FR-023 y FR-024 exigen que login y registro vean las mismas cuentas, incluida
  la comprobación de correo duplicado contra las cuentas de demostración. Un almacén único evita
  duplicar la lógica de búsqueda y normalización (Principio IV) y respeta Principio II (puertos
  pequeños por cliente) y III (la UI no importa infraestructura).
- **Alternatives considered**:
  - Un solo gateway con `authenticate` y `register`: viola ISP (2.4); cada consumidor dependería
    de una operación que no usa.
  - Compartir el arreglo mutable por referencia entre dos gateways: acoplamiento implícito y
    difícil de probar.
  - `localStorage`/IndexedDB/SQLite en el navegador: descartado; FR-012 y la decisión de la spec
    (cuentas solo en memoria, se pierden al recargar). La persistencia real exigiría un backend
    y una spec propia; el puerto `RegistrationGateway` permite cambiar el adaptador después sin
    tocar la UI.
- **Configuración ausente** (revisado tras la implementación): si `VITE_DEMO_USERS` falta o es
  inválida, el almacén arranca vacío. El registro **funciona igualmente** (crear una cuenta no
  depende de las cuentas de demostración) y el login sigue respondiendo `unavailable` (contrato
  C4) mientras no exista ninguna cuenta; tras registrar una, el login la reconoce y responde
  `invalid-credentials` para cualquier otro correo. `unavailable` en el registro queda solo para
  errores inesperados (R5).

## R3. Tratamiento de la contraseña en memoria

- **Decision**: el almacén conserva la contraseña en texto plano solo en memoria de la página,
  igual que ya ocurre con las cuentas de `VITE_DEMO_USERS`. Nunca se serializa, se registra ni se
  incluye en resultados, URL ni almacenamiento (FR-012, contrato C6). El campo de confirmación
  no llega a la capa de aplicación: se valida en el dominio y se descarta.
- **Rationale**: la comparación exacta del login (contrato C2) necesita el valor; un hash
  añadiría una API asíncrona y una dependencia de criptografía sin mejorar la seguridad real de
  una demo cliente, donde todo el código y los datos están en manos del usuario (YAGNI).
- **Riesgo aceptado**: un volcado de memoria o una extensión del navegador podría leerlas. No
  hay datos reales. Un backend con hash y sal sustituye este adaptador en una feature futura.
- **Alternatives considered**: hash con Web Crypto (SHA-256 sin sal no es un almacenamiento de
  contraseñas adecuado y un KDF adecuado, como PBKDF2, es excesivo para la demo).

## R4. Origen y entrega del mensaje de éxito

- **Decision**: estado en memoria elevado a `App`
  (`flash: { kind: 'registered'; email: string } | null`). Al registrarse con éxito, `App` guarda
  el aviso con el correo normalizado y navega a `/login`. El login lo recibe por props, muestra
  el aviso una sola vez con `role="status"`, rellena el campo de correo y mueve el foco a la
  contraseña (FR-011a). `App` lo borra cuando el usuario edita un campo del login o abandona la
  ruta. No viaja en la URL ni en `history.state`. La contraseña nunca forma parte del aviso.
- **Rationale**: FR-011 exige que no reaparezca al recargar y FR-012 prohíbe datos en la URL.
  `history.state` sobrevive a la recarga, por lo que incumpliría US1-5; el estado en memoria se
  pierde al recargar, que es el comportamiento pedido.
- **Alternatives considered**: parámetro de consulta (`/login?registered=1`): aparece en el
  historial, se puede compartir o recargar y reproduce el mensaje; `sessionStorage`: es
  almacenamiento del navegador (FR-012) y persiste en recargas.

## R5. Estado del formulario y validación

- **Decision**: mismo patrón que el login: `registerReducer` puro (máquina de estados) +
  `useRegisterForm` (efectos y envío) + funciones de validación puras en `src/domain/`.
  La validación de registro vive en `src/domain/registration.ts` y reutiliza las reglas de
  correo y contraseña del login, que se exportan desde `validation.ts` (`validateEmail`,
  `validatePassword`) en lugar de copiarse.
- **Reglas añadidas**: nombre completo obligatorio, 2 a 80 caracteres tras recortar y solo
  letras latinas (con tildes, diéresis y ñ) y espacios (FR-003); confirmación obligatoria e
  idéntica a la contraseña, comparada sin recortar ni normalizar (FR-006); términos aceptados
  (FR-007). Patrón del nombre: `^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?: +[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$` sobre el
  texto recortado (nombres separados por espacios, sin números ni símbolos).
- **Visibilidad de errores**: igual que en el login (FR-008): solo en campos tocados o tras un
  envío. Cambiar la contraseña revalida la confirmación si ya fue tocada.
- **Rationale**: Principio IV (DRY): una sola fuente de las reglas de correo/contraseña y de los
  textos en `messages.ts`; el reducer puro se prueba sin React.
- **Alternatives considered**: React Hook Form + Zod (dependencias innecesarias para cinco
  campos, ya descartado en 001).

## R6. Correo ya registrado (decisión de seguridad aceptada)

- **Decision**: `RegistrationGateway.register` devuelve `email-taken` y la UI muestra
  "Este correo ya está registrado" bajo el campo de correo, con el foco en él y sin vaciar los
  demás campos (FR-024, US2-9). Se compara con el correo normalizado (recortado, minúsculas)
  contra todas las cuentas del almacén.
- **Rationale**: decisión explícita de la clarificación del 2026-10-17. Revelar la existencia de
  cuentas contradice el criterio genérico del login (spec 001, FR-010) y la Constitución 5.4
  (minimización de información al usuario).
- **Mitigación**: aplica solo al registro, no al login; las cuentas son ficticias; se documenta
  en Complexity Tracking y en el README para reemplazarlo por una respuesta genérica cuando
  exista un backend real.

## R7. Generalizar el layout y el panel de marca

- **Decision**: extraer `LoginScreen` a un layout compartido `AuthScreen`
  (`src/ui/layout/AuthScreen/`) que recibe el contenido del panel derecho y los textos del panel
  de marca. `BrandPanel` pasa a recibir `title` y `description` por props (hoy están fijos). El
  logo, la tarjeta y los puntos de corte no cambian.
- **Rationale**: el diseño del registro (frame `04 · Registro`) es el mismo patrón de dos paneles
  con otro titular y otro texto; copiar el layout violaría DRY (4.1) y 8.5. En móvil (< 960 px)
  solo se muestra el logo y el formulario, como pide FR-017.
- **Alternatives considered**: duplicar `LoginScreen`; dejar los textos fijos y pasar un flag de
  variante (conocimiento de pantallas dentro de un componente de layout, viola OCP).

## R8. Componentes reutilizados y cambios mínimos

| Componente | Uso en registro | Cambio |
|---|---|---|
| `TextField` | Nombre completo, correo | Ninguno (ya admite `error`, `ref`, `placeholder`) |
| `PasswordField` | Contraseña, confirmación | Prop opcional `toggleSubject` (por defecto `'contraseña'`) para que cada control de visibilidad tenga un nombre accesible distinto ("Mostrar confirmación de contraseña") |
| `Checkbox` | Términos y condiciones | `label` pasa de `string` a `ReactNode`, se añade `error?: string` con `aria-invalid` y `aria-describedby`, y la prop `ref` para el foco al validar |
| `Button` | "Crear cuenta", enlaces | Prop `ref` tipada (variante `link` ya existía) para devolver el foco al enlace "términos y condiciones" |
| `SocialButton`, `Divider` | Google/Apple y "o regístrate con" | Ninguno |
| `Alert` | Éxito, "Próximamente", no disponible | Nuevo tono `success` (`role="status"`) |
| `TermsDialog` (nuevo, en `features/register`) | Texto de términos de ejemplo (FR-021) | Componente nuevo basado en el elemento nativo `<dialog>` |

El enlace "términos y condiciones" dentro de la etiqueta de la casilla es un `Button` variante
`link` que abre el `TermsDialog`; los elementos interactivos dentro de un `label` no activan la
casilla, así que activarlo no la alterna. Se comprueba con una prueba (US3).

**Diálogo de términos (FR-021)**: se usa `<dialog>` con `showModal()` porque el navegador ya
provee la modalidad, la contención del foco (Tab no sale del diálogo), el cierre con Escape y el
bloqueo del fondo; sin dependencias ni trampa de foco propia (KISS, 4.2). Lleva
`aria-labelledby` al título "Términos y condiciones", un texto de ejemplo marcado como ficticio y
el botón "Cerrar"; al cerrarse devuelve el foco al enlace que lo abrió. Es presentación pura: no
guarda estado de negocio ni cambia la casilla. **Riesgo**: jsdom no implementa `showModal` por
completo; las pruebas añaden un polyfill mínimo en `src/test/setup.ts` para verificar apertura,
cierre, Escape, título y retorno del foco. La contención del foco la garantiza el navegador y se
verifica en el recorrido manual (quickstart).

## R9. Fidelidad al diseño sin MCP de Figma

El MCP de Figma no está disponible. Fuentes: la captura del frame `04 · Registro` aportada por
el solicitante y los tokens de `tokens.css`.

**Observado en la captura y coherente con el login (sin trabajo de diseño nuevo)**: panel de
marca de ancho aproximado 43 % (≈ 620 px sobre 1440), formulario centrado de ≈ 400 px, título
30 px, etiquetas de 14 px, campos de 52 px con radio 12 px, botón principal de ancho completo,
separador, dos botones sociales en dos columnas y pie centrado.

**Para verificar visualmente al implementar (no medibles con una captura)**:

1. Espaciados verticales entre campos y bloques (se parte del `gap` de 22 px del login).
2. Ubicación y tamaño del icono de visibilidad en ambas contraseñas.
3. Alineación de la casilla con su texto y color del enlace "términos y condiciones".
4. Texto y posición del separador "o regístrate con" y del pie "¿Ya tienes cuenta?".
5. Titular "Comienza tu camino financiero." (salto de línea tras "Comienza tu") y su texto de apoyo.
6. Versión móvil: no hay frame; se deriva del login (logo + formulario).

**Contraste (Constitución 8.4, 8.6)**: el botón "Crear cuenta" del diseño usa el tono
`--brand-500` (blanco sobre él da 2.83:1). Se reutilizan los tokens accesibles ya definidos en el
login (`--brand-700`, `--neutral-600`, `--neutral-border`), con la misma desviación pendiente de
aprobación del responsable de diseño (ver Complexity Tracking del plan 001).

**Nuevo token**: el aviso de éxito necesita color propio. Se añade `--success-700` (verde
oscuro con contraste ≥ 4.5:1 sobre blanco y sobre su fondo tenue), con la misma desviación
declarada. Valor y contraste exactos se miden en la implementación.

## R10. Foco y título al navegar (WCAG 2.1 AA)

- **Decision**: al cambiar de ruta por navegación interna (no en la carga inicial) el foco se
  mueve al `h1` de la nueva pantalla (`tabIndex={-1}`) y se actualiza `document.title`
  (`KynWallet · Iniciar sesión` / `KynWallet · Crear cuenta`).
- **Rationale**: en una SPA la navegación no recarga la página; sin esto los usuarios de lectores
  de pantalla no perciben el cambio (criterios 2.4.2 y 2.4.3). Es coherente con el foco en el
  mensaje de bienvenida del login (FR-009).

## R11. Pruebas y trazabilidad

- **Decision**: igual que 001 (Vitest + RTL + `user-event` + `axe-core`), pruebas junto al
  código y cada `it(...)` empieza con el ID del escenario o requisito (`US2-4`, `FR-024`).
  Gateways con `delayMs: 0` o temporizadores falsos. Cobertura ≥ 80 %.
- **Contratos probados**: `RegistrationGateway` (R1–R6 de su contrato), almacén compartido
  (el login ve las cuentas creadas), módulo de navegación y `registerReducer`.
- **Regresión**: se actualizan las pruebas del login afectadas (enlace "Regístrate", constructor
  de `InMemoryAuthGateway`, layout compartido) y deben seguir en verde.

## R12. Dependencias

- **Decision**: ninguna dependencia nueva. Reutiliza React 19, Vite 8, Vitest 5, Testing Library
  y `axe-core` ya aprobados en 001 (7.1, 7.4).

## R13. Impacto en la spec y artefactos de 001

El registro modifica el comportamiento de la pantalla de login. Esto debe reflejarse en el mismo
cambio (Constitución 8.3, 9.2), como tareas explícitas de `/speckit-tasks`:

- `001/spec.md`: FR-016 y el escenario US5-1 pasan a excluir "Regístrate" (ahora navega).
- `001/contracts/ui-login.md`: "Regístrate" pasa de `button` a `link` hacia `/registro`; el
  orden de tabulación se mantiene.
- `001/plan.md`: el supuesto "sin router" queda sustituido por R1 de este documento.
- `001/contracts/auth-gateway.md`: el constructor de `InMemoryAuthGateway` recibe el almacén.
