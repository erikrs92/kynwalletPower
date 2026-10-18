---

description: "Task list for 002-registro-usuarios"
---

# Tasks: Pantalla de Registro de Usuarios de KynWallet

**Input**: Design documents from `/specs/002-registro-usuarios/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/registration-gateway.md,
contracts/ui-register.md, contracts/navigation.md, quickstart.md

**Tests**: OBLIGATORIAS. La Constitución (Principio I, TDD) exige escribir las pruebas antes del
código y verlas fallar. Cada historia empieza por sus pruebas.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US6)
- Rutas relativas a la raíz del repositorio. Las pruebas viven junto al código (`*.test.ts(x)`).
- Trazabilidad (Constitución 9.2): cada `it(...)` DEBE empezar con el ID del escenario o
  requisito que verifica, p. ej. `it('US2-9: muestra "Este correo ya está registrado"…')`. Los IDs
  `US#-#` son los escenarios de aceptación numerados de `spec.md`; `Rn`/`Nn` son los contratos
  de `contracts/registration-gateway.md` y `contracts/navigation.md`.
- Orden de fases por prioridad de la spec: US1, US2, US3 (P1) → US4, US6 (P2) → US5 (P3).
- El MCP de Figma no está disponible: el diseño se verifica contra la captura del frame
  `04 · Registro` y los puntos de `research.md` R9.

---

## Phase 1: Setup

**Purpose**: Línea base verde antes de tocar código compartido con el login

- [ ] T001 Ejecutar `npm run verify` sobre `main` y confirmar que todos los controles pasan; si hay fallos previos, anotarlos (no corregir aquí) para no confundirlos con regresiones de esta feature
- [ ] T002 Crear la rama `002-registro-usuarios` desde `main` (Constitución 9.3); todos los cambios de las fases siguientes se hacen en esa rama

**Checkpoint**: línea base conocida y rama lista

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Dominio, almacén compartido, navegación, layout y componentes ampliados que usan todas las historias

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Pruebas primero (deben fallar)

- [ ] T003 [P] Escribir las pruebas de `validateRegistration` en `src/domain/registration.test.ts` según data-model.md (RegistrationData), con `it` por regla y su ID: `fullName` vacío tras recortar → "Ingresa tu nombre completo" (incluye solo espacios, US2-6); menos de 2 o más de 80 caracteres tras recortar → "El nombre debe tener entre 2 y 80 caracteres"; algo distinto de letras latinas (con tildes, diéresis y ñ) y espacios → "El nombre solo puede contener letras y espacios" (`'Diego123'`, `'Ana_@'`, `"O'Brien"`, `'Ana-María'`; US2-6a), y `'Diego Martínez'`, `'Íñigo Núñez'` válidos (US2-6b); `email` vacío tras recortar → "Ingresa tu correo electrónico"; formato inválido o > 254 caracteres → "Ingresa un correo electrónico válido"; `password` vacía → "Ingresa tu contraseña"; < 8 caracteres → "La contraseña debe tener al menos 8 caracteres"; > 128 → "La contraseña no puede superar 128 caracteres"; `confirmPassword` vacía → "Confirma tu contraseña"; distinta de `password`, comparada tal cual (sin recortar ni normalizar; diferencia solo de mayúsculas o espacios cuenta como distinta) → "Las contraseñas no coinciden"; `acceptedTerms === false` → "Debes aceptar los términos y condiciones" (US3-1); datos válidos → `{}`
- [ ] T004 [P] Ampliar `src/domain/validation.test.ts` con pruebas directas de `validateEmail` y `validatePassword` exportadas (mismos mensajes y límites que el login: 254, 8 y 128; la contraseña no se recorta)
- [ ] T005 [P] Pruebas de `InMemoryAccountStore` en `src/infrastructure/InMemoryAccountStore.test.ts` (contracts/registration-gateway.md, Almacén): `isAvailable()` es `false` con `null` y `true` con una lista; `findByEmail` compara el correo normalizado (`'  Demo@Example.COM '`) y devuelve `undefined` si no existe; `add` devuelve `'added'` y luego `findByEmail` lo encuentra; `add` con correo existente (distinta capitalización) devuelve `'duplicate'` y no modifica el almacén; copia defensiva: mutar la lista original no afecta al almacén
- [ ] T006 [P] Pruebas de navegación en `src/ui/navigation/navigation.test.tsx` (contracts/navigation.md): N1 `resolveRoute('/registro')` → `register` y `'/login'` → `login`; N2 `'/'`, `'/otra'` y `''` → `login`, y al cargar una ruta desconocida la URL se normaliza con `replaceState` sin añadir historial; N3 clic simple en `Link` navega sin recargar y añade una entrada al historial; N4 clic con Ctrl, Meta, Mayús o botón central no se intercepta; N5 `popstate` actualiza la ruta de `useRoute`; N8 la URL tras navegar no contiene más que la ruta. Cada prueba parte de `/login` (garantizado por el `afterEach` de T012); si necesita otra ruta, la establece con `window.history.pushState` en su `Given`
- [ ] T007 [P] Ampliar `src/ui/components/Alert/Alert.test.tsx`: con `tone="success"` usa `role="status"`; sin violaciones de `axe`
- [ ] T008 [P] Ampliar `src/ui/components/Checkbox/Checkbox.test.tsx`: acepta `label` como `ReactNode` (texto con un `button` dentro) y el nombre accesible de la casilla incluye todo el texto; con `error` el input tiene `aria-invalid="true"` y `aria-describedby` apunta al texto del error; activar el `button` dentro de la etiqueta no alterna la casilla; sin violaciones de `axe`
- [ ] T009 [P] Ampliar `src/ui/components/PasswordField/PasswordField.test.tsx`: con la prop `toggleSubject` el control se llama "Mostrar {toggleSubject}" / "Ocultar {toggleSubject}" (p. ej. "Mostrar confirmación de contraseña"); sin la prop conserva "Mostrar contraseña" / "Ocultar contraseña"; dos campos en una misma pantalla tienen controles de nombre distinto
- [ ] T010 [P] Pruebas de `BrandPanel` en `src/ui/layout/BrandPanel/BrandPanel.test.tsx`: muestra el `title` y la `description` recibidos por props, el logo "KynWallet" y la tarjeta ilustrativa con `aria-hidden="true"`
- [ ] T011 [P] Pruebas de `AuthScreen` en `src/ui/layout/AuthScreen/AuthScreen.test.tsx`: renderiza el `BrandPanel` con los textos recibidos y los `children` dentro de un `main`; sin violaciones de `axe`
- [ ] T012 [P] Añadir en `src/test/setup.ts` un polyfill mínimo de `HTMLDialogElement.prototype.showModal` y `close` (research R8) solo si jsdom no los implementa, con una prueba en `src/test/setup.test.ts` que verifica que `showModal()` marca el diálogo como abierto y `close()` lo cierra y dispara `close`. Añadir además en `src/test/setup.ts` un `afterEach` que restablezca la URL con `window.history.replaceState({}, '', '/login')` (y limpie el estado de historial), para que las pruebas de navegación y de `App` no dependan del orden de ejecución (Constitución 1.4); la prueba de `src/test/setup.test.ts` comprueba también que, tras navegar a `/registro` en una prueba, la siguiente empieza en `/login`

### Implementación

- [ ] T013 [P] Añadir en `src/ui/styles/tokens.css` los tokens `--success-700` (texto, contraste ≥ 4.5:1 sobre blanco y sobre el fondo) y `--success-50` (fondo tenue), con comentario de que son tokens accesibles pendientes de aprobación de diseño (research R9); anotar el valor y el contraste medidos en `specs/002-registro-usuarios/research.md` R9
- [ ] T014 [P] Añadir a `src/domain/messages.ts` (fuente única) los textos: `NAME_REQUIRED: 'Ingresa tu nombre completo'`, `NAME_LENGTH: 'El nombre debe tener entre 2 y 80 caracteres'`, `NAME_INVALID: 'El nombre solo puede contener letras y espacios'`, `CONFIRM_REQUIRED: 'Confirma tu contraseña'`, `PASSWORDS_MISMATCH: 'Las contraseñas no coinciden'`, `TERMS_REQUIRED: 'Debes aceptar los términos y condiciones'`, `EMAIL_TAKEN: 'Este correo ya está registrado'`, `REGISTER_UNAVAILABLE: 'Servicio de registro no disponible. Intenta más tarde.'`, `COMING_SOON: 'Próximamente'`, `REGISTER_SUCCESS: 'Cuenta creada correctamente. Ahora puedes iniciar sesión.'`
- [ ] T015 Exportar `validateEmail` y `validatePassword` desde `src/domain/validation.ts` (hoy privadas) hasta pasar T004, sin cambiar su comportamiento; las pruebas existentes del login siguen en verde
- [ ] T016 Implementar `src/domain/registration.ts` hasta pasar T003: tipos `RegistrationData` (`fullName`, `email`, `password`, `confirmPassword`, `acceptedTerms`) y `RegistrationErrors`, y `validateRegistration` reutilizando `validateEmail`/`validatePassword`; nombre con el patrón de research R5 sobre el texto recortado (`^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?: +[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$`); confirmación comparada con `===` sin recortar; sin imports de React ni de otras capas (Constitución 3.2)
- [ ] T017 Ampliar `src/domain/auth.ts` con `NewAccount = { email: string; password: string; displayName: string }` y `RegisterResult` (`success`, `invalid` con `errors: RegistrationErrors`, `email-taken`, `unavailable`) según contracts/registration-gateway.md; importa el tipo `RegistrationErrors` de T016, por lo que va después de T016
- [ ] T018 Crear el puerto `src/application/ports/RegistrationGateway.ts` con `register(account: NewAccount): Promise<RegisterResult>`; importa los tipos de T017, por lo que va después de T017
- [ ] T019 Implementar `src/infrastructure/InMemoryAccountStore.ts` hasta pasar T005: `constructor(accounts: DemoAccount[] | null)`, `isAvailable()`, `findByEmail(email)` y `add(account)` síncrono (comprobación y alta en una sola operación); copia defensiva; sin serializar ni registrar nada (FR-012)
- [ ] T020 Refactorizar `src/infrastructure/InMemoryAuthGateway.ts` para recibir `(store: InMemoryAccountStore, options?: { delayMs?: number })` y usar `store.isAvailable()` y `store.findByEmail(...)`; actualizar `src/infrastructure/InMemoryAuthGateway.test.ts` a la nueva firma conservando C1–C6 y los IDs de sus pruebas; actualizar `src/main.tsx` para crear un único `InMemoryAccountStore(loadDemoAccounts(import.meta.env.VITE_DEMO_USERS))` y pasarlo al gateway; el login debe seguir funcionando igual
- [ ] T021 [P] Implementar el tono `success` en `src/ui/components/Alert/Alert.tsx` y `Alert.module.css` hasta pasar T007 (`role="status"`, texto `var(--success-700)`, fondo `var(--success-50)`)
- [ ] T022 [P] Ampliar `src/ui/components/Checkbox/Checkbox.tsx` y `Checkbox.module.css` hasta pasar T008: `label: ReactNode`, `error?: string` con id vía `useId`, `aria-invalid`, `aria-describedby` y texto de error de 13px `var(--danger-600)` bajo la casilla
- [ ] T023 [P] Ampliar `src/ui/components/PasswordField/PasswordField.tsx` hasta pasar T009: prop opcional `toggleSubject` (por defecto `'contraseña'`) que compone el `aria-label` del botón de visibilidad
- [ ] T024 [P] Ampliar `src/ui/layout/BrandPanel/BrandPanel.tsx` hasta pasar T010: props `title: ReactNode` y `description: string`; actualizar el uso actual con los textos del login ("Tu dinero, / sin fronteras." y "Envía, recibe y paga en segundos. Una billetera pensada para tu día a día.") sin cambios visuales
- [ ] T025 Crear `src/ui/layout/AuthScreen/AuthScreen.tsx` y `AuthScreen.module.css` hasta pasar T011, moviendo el layout de `src/ui/features/login/LoginScreen.tsx` y `LoginScreen.module.css` (mismos puntos de corte; panel de marca recibe `brandTitle` y `brandDescription`; `children` en el panel derecho); eliminar `LoginScreen.tsx` y `LoginScreen.module.css` y actualizar `src/App.tsx`; las pruebas del login y `src/App.test.tsx` siguen en verde
- [ ] T026 Implementar `src/ui/navigation/routes.ts` (`RouteName`, `ROUTE_PATHS`, `resolveRoute`), `src/ui/navigation/navigation.ts` (`navigate`, `useRoute` con `useSyncExternalStore` sobre `popstate`, normalización con `replaceState`) y `src/ui/navigation/Link.tsx` (`<a href>` que intercepta solo el clic simple) hasta pasar T006; sin imports de dominio, aplicación ni infraestructura
- [ ] T027 [P] Crear `src/test/registerStub.ts` (caso de uso `Register` falso controlable, con `defer()`/`release()` como `authStub.ts`) y ampliar `src/test/fixtures.ts` con `NEW_ACCOUNT_DATA` (nombre "Diego Martínez", correo `nueva@example.test`, contraseña `fixture-pass-02`, confirmación igual y términos aceptados), todo ficticio y exclusivo de pruebas

**Checkpoint**: `npm run lint`, `npm run typecheck` y `npm test` en verde; el login funciona igual con el almacén compartido; la navegación, el layout y los componentes ampliados están probados

---

## Phase 3: User Story 1 - Crear una cuenta con datos válidos (Priority: P1) 🎯 MVP

**Goal**: con datos válidos, el usuario crea su cuenta, llega a `/login` con el aviso de éxito y su correo rellenado, y puede iniciar sesión con esa cuenta mientras la página siga abierta

**Independent Test**: en `/registro` completar nombre, correo, contraseña, confirmación y términos, presionar "Crear cuenta" y ver `/login` con el aviso, el correo prellenado y el foco en la contraseña; iniciar sesión con la cuenta nueva (quickstart escenarios 1–5)

### Tests for User Story 1 ⚠️

> Escribir primero; confirmar que FALLAN antes de implementar

- [ ] T028 [P] [US1] Pruebas del caso de uso en `src/application/register.test.ts`: delega en un `RegistrationGateway` falso un `NewAccount` con el correo normalizado, la contraseña sin modificar y el nombre recortado, sin `confirmPassword` ni `acceptedTerms`; devuelve su resultado; si `validateRegistration` da errores devuelve `{ kind: 'invalid', errors }` sin llamar al gateway; si el gateway lanza una excepción devuelve `unavailable` sin rechazar la promesa
- [ ] T029 [P] [US1] Pruebas de contrato de `InMemoryRegistrationGateway` en `src/infrastructure/InMemoryRegistrationGateway.test.ts`: R1 correo nuevo → `success` y, con el mismo almacén, `InMemoryAuthGateway.authenticate` con las mismas credenciales devuelve `success` con el `displayName` registrado (C7, US1-6); R4 almacén no disponible → `unavailable`; R5 una excepción interna → `unavailable` sin rechazar; R6 el resultado nunca contiene la contraseña; espera configurable: con `delayMs: 1000` y `vi.useFakeTimers()` no resuelve antes de 1000 ms; US1-7: un almacén nuevo (equivale a recargar) no conoce la cuenta y el login devuelve `invalid-credentials`
- [ ] T030 [P] [US1] Pruebas del reducer en `src/ui/features/register/registerReducer.test.ts` (data-model.md RegisterFormState): estado inicial `editing` con valores vacíos, `acceptedTerms: false` y `serverError: null`; `change` actualiza el campo; `acceptedTerms` alterna; `submit` con datos válidos → `submitting`; un segundo `submit` en `submitting` se ignora (FR-010)
- [ ] T031 [US1] Pruebas de integración en `src/ui/features/register/RegisterForm.test.tsx` con un `Register` falso inyectado y `user-event`: US1-1 datos válidos → se llama a `register` una vez y se notifica `onRegistered` con el correo normalizado; US1-2 durante la espera el botón tiene `aria-busy`, está deshabilitado y un segundo clic no vuelve a llamar a `register`; US1-3 correo con mayúsculas y espacios se envía normalizado; US1-4 Enter en cualquier campo de texto envía el formulario
- [ ] T032 [US1] Ampliar `src/ui/features/login/LoginForm.test.tsx`: US1-5 con la prop `registered={{ email }}` se muestra un `status` "Cuenta creada correctamente. Ahora puedes iniciar sesión." y escribir en cualquier campo lo oculta y llama a `onRegisteredDismiss`; US1-8 el campo de correo aparece rellenado con ese correo, el de contraseña vacío y con el foco; sin la prop el login se comporta como antes; G2 (FR-011a, "cerrar sesión" descarta el correo): con `registered={{ email }}`, iniciar sesión con credenciales válidas y presionar "Cerrar sesión" deja ambos campos vacíos y sin aviso, y a diferencia del montaje inicial el foco no se mueve a la contraseña
- [ ] T033 [US1] Ampliar `src/App.test.tsx` con el flujo de extremo a extremo usando gateways reales con `delayMs: 0` y un `InMemoryAccountStore` de prueba, y actualizar las 3 pruebas de accesibilidad que ya existen para pasar también la prop `register` (`createRegisterStub().register` de T027), porque `App` pasa a requerirla en T040 (G3): US1-1 desde `/registro` crear la cuenta lleva a `/login` con aviso y correo; US1-6 iniciar sesión con la cuenta creada muestra "¡Bienvenido, {nombre}!"; US1-7 y US1-9 montar `App` de nuevo con un almacén nuevo (equivale a recargar) deja el login vacío, sin aviso, y la cuenta creada falla con el mensaje genérico; la URL final es `/login` y no contiene datos (N8)

### Implementation for User Story 1

- [ ] T034 [P] [US1] Implementar `src/application/register.ts` hasta pasar T028: `createRegister(gateway: RegistrationGateway): Register`, con la revalidación y las reglas de contracts/registration-gateway.md
- [ ] T035 [P] [US1] Implementar `src/infrastructure/InMemoryRegistrationGateway.ts` hasta pasar T029: `(store, options?: { delayMs?: number })`, espera 1000 ms por defecto (FR-010), `unavailable` si el almacén no está disponible, `store.add` para crear la cuenta, captura de excepciones, sin `console` ni registro de la contraseña (FR-012)
- [ ] T036 [US1] Implementar `src/ui/features/register/registerReducer.ts` hasta pasar T030, con el tipo de estado y las acciones de data-model.md (`status`, `values`, `acceptedTerms`, `touched`, `fieldErrors`, `serverError`, `notice`, `termsOpen`)
- [ ] T037 [US1] Implementar `src/ui/features/register/useRegisterForm.ts`: envuelve `useReducer`; `submit` valida con `validateRegistration`, despacha y llama al `Register` inyectado; ignora resultados si el componente se desmonta; expone el resultado `success` mediante un callback `onRegistered(email)`
- [ ] T038 [US1] Implementar `src/ui/features/register/RegisterForm.tsx` y `RegisterForm.module.css` hasta pasar T031 con el esqueleto del diseño: `h1` "Crea tu cuenta" y subtítulo "Completa tus datos para comenzar" (30px Bold `var(--neutral-900)` / 16px `var(--neutral-600)`, gap 8px); `<form noValidate>` con gap 22px; `TextField` "Nombre completo" (`autoComplete="name"`, placeholder "Ej: Diego Martínez"), `TextField` "Correo electrónico" (`type="email"`, `autoComplete="username"`, placeholder "tucorreo@ejemplo.com"), `PasswordField` "Contraseña" (`autoComplete="new-password"`, `toggleSubject` por defecto), `PasswordField` "Confirmar contraseña" (`autoComplete="new-password"`, `toggleSubject="confirmación de contraseña"`), `Checkbox` "Acepto los términos y condiciones" (texto plano por ahora) y `Button` primary `type="submit"` "Crear cuenta" con `loadingLabel` "Creando cuenta…"
- [ ] T039 [US1] Ampliar `src/ui/features/login/loginReducer.ts`, `useLoginForm.ts` y `LoginForm.tsx` hasta pasar T032: props opcionales `registered?: { email: string }` y `onRegisteredDismiss?: () => void`; con `registered` el estado inicial lleva el correo (solo en el montaje; `logout` restablece `initialLoginState` con ambos campos vacíos y NO repone el correo registrado, FR-011a), se muestra `Alert` `success` con `MESSAGES.REGISTER_SUCCESS` encima del botón, el foco inicial va a la contraseña y cualquier `change` llama a `onRegisteredDismiss`
- [ ] T040 [US1] Conectar la navegación y la composición: `src/App.tsx` recibe `authenticate` y `register` por props, usa `useRoute()` para elegir `AuthScreen` con el login o el registro (textos de marca del registro: titular "Comienza tu camino financiero." con salto tras "Comienza tu" y descripción "Crea tu cuenta en minutos y empieza a enviar, recibir y administrar tu dinero desde cualquier lugar."), guarda `flash: { kind: 'registered'; email: string } | null` en su estado, lo establece al recibir `onRegistered`, navega a `/login` y lo borra con `onRegisteredDismiss` o al salir de `/login`; `src/main.tsx` crea `createRegister(new InMemoryRegistrationGateway(store))` con el mismo almacén del login (Constitución 2.5) hasta pasar T033

**Checkpoint**: US1 funciona de punta a punta con `npm run dev` y sus pruebas pasan

---

## Phase 4: User Story 2 - Validar los campos antes de enviar (Priority: P1)

**Goal**: el formulario indica qué falta o está mal antes de crear la cuenta, incluido el correo ya registrado

**Independent Test**: enviar vacío, con "usuario@", con una contraseña de 7 caracteres, con confirmación distinta y con un correo de demostración; ver los mensajes por campo y que `register` no se invoca salvo en el último caso (quickstart escenarios 6–11)

### Tests for User Story 2 ⚠️

- [ ] T041 [P] [US2] Ampliar `src/infrastructure/InMemoryRegistrationGateway.test.ts` con R2 (correo igual, con distinta capitalización y espacios, a una cuenta de demostración → `email-taken`, sin crear cuenta), R3 (correo igual a una cuenta creada antes en la sesión → `email-taken`) y R7 (dos llamadas concurrentes con el mismo correo: exactamente una `success` y la otra `email-taken`)
- [ ] T042 [P] [US2] Ampliar `src/ui/features/register/registerReducer.test.ts`: `blur` marca el campo como tocado y calcula su error; `submit` con errores marca todos los campos como tocados, queda en `editing` y no pasa a `submitting` (FR-009); `change` en un campo con error recalcula y lo oculta si ya es válido (FR-008, US2-7); cambiar `password` revalida `confirmPassword` solo si ya fue tocada (US2-5); resultado `email-taken` → `serverError: 'email-taken'` con todos los valores conservados; resultado `unavailable` → `serverError: 'unavailable'`; editar el correo en `serverError` vuelve a `editing` y limpia el error
- [ ] T043 [US2] Ampliar `src/ui/features/register/RegisterForm.test.tsx`: US2-1 envío vacío → los cinco mensajes ("Ingresa tu nombre completo", "Ingresa tu correo electrónico", "Ingresa tu contraseña", "Confirma tu contraseña", "Debes aceptar los términos y condiciones"), `register` no invocado y foco en el nombre; US2-2 "usuario@" + blur → "Ingresa un correo electrónico válido"; US2-3 contraseña de 7 caracteres → mensaje de longitud y `register` no invocado; US2-4 confirmación distinta + blur → "Las contraseñas no coinciden"; US2-5 cambiar la contraseña tras validar la confirmación muestra el error sin enviar; US2-6 nombre de solo espacios → "Ingresa tu nombre completo"; US2-6a "Diego123" → "El nombre solo puede contener letras y espacios"; US2-6b "Íñigo Núñez" se acepta; US2-7 corregir un valor oculta su mensaje; US2-8 el nombre accesible o la descripción de cada campo incluye su error; orden del foco al enviar: nombre, correo, contraseña, confirmación, casilla; caso límite: el texto pegado se valida igual que el escrito
- [ ] T044 [US2] Ampliar `src/ui/features/register/RegisterForm.test.tsx` con US2-9 (`Register` falso que devuelve `email-taken`): se muestra "Este correo ya está registrado" bajo el correo, el foco va al correo, todos los demás valores se conservan y no se notifica `onRegistered`; editar el correo oculta el error; con `unavailable` aparece un `alert` "Servicio de registro no disponible. Intenta más tarde." y se conservan los valores

### Implementation for User Story 2

- [ ] T045 [P] [US2] Ajustar `src/infrastructure/InMemoryRegistrationGateway.ts` si hace falta para pasar T041 (la comprobación de duplicado y el alta deben ser una sola llamada síncrona a `store.add`)
- [ ] T046 [US2] Ampliar `src/ui/features/register/registerReducer.ts` hasta pasar T042, usando `validateRegistration` y mostrando solo errores de campos tocados (FR-008)
- [ ] T047 [US2] Ampliar `src/ui/features/register/RegisterForm.tsx` hasta pasar T043: `onBlur` en los campos, `error` en cada `TextField`, `PasswordField` y `Checkbox`, y foco en el primer elemento con error al enviar según el orden de contracts/ui-register.md (Teclado)
- [ ] T048 [US2] Ampliar `src/ui/features/register/RegisterForm.tsx` y `useRegisterForm.ts` hasta pasar T044: resultado `email-taken` → error de campo `MESSAGES.EMAIL_TAKEN` y foco en el correo; `unavailable` → `Alert` de error con `MESSAGES.REGISTER_UNAVAILABLE`; el resultado `invalid` se muestra como errores de campo

**Checkpoint**: US1 y US2 funcionan y se prueban de forma independiente

---

## Phase 5: User Story 3 - Aceptar los términos y condiciones (Priority: P1)

**Goal**: la casilla es obligatoria y el enlace "términos y condiciones" abre un diálogo accesible con un texto de ejemplo

**Independent Test**: enviar con datos válidos sin marcar la casilla y ver el bloqueo; marcarla y registrar; abrir y cerrar el diálogo con "Cerrar" y con Escape (quickstart escenarios 12–13)

### Tests for User Story 3 ⚠️

- [ ] T049 [P] [US3] Pruebas de `TermsDialog` en `src/ui/features/register/TermsDialog.test.tsx`: abierto, tiene `role="dialog"` con nombre accesible "Términos y condiciones" (`aria-labelledby`) y un texto identificado como de ejemplo ficticio; el botón "Cerrar" cierra y llama a `onClose`; Escape (evento `cancel`/`close`) lo cierra; sin violaciones de `axe`
- [ ] T050 [US3] Ampliar `src/ui/features/register/RegisterForm.test.tsx`: US3-1 datos válidos sin marcar la casilla → "Debes aceptar los términos y condiciones" junto a la casilla y `register` no invocado; US3-2 marcar la casilla oculta el mensaje; US3-3 la casilla se alcanza con Tab y se alterna con Espacio, y su nombre accesible es "Acepto los términos y condiciones"; US3-4 activar el botón "términos y condiciones" abre el diálogo "Términos y condiciones", la casilla no cambia y los datos del formulario se conservan; US3-5 "Cerrar" y Escape cierran el diálogo y el foco vuelve al botón "términos y condiciones"

### Implementation for User Story 3

- [ ] T051 [US3] Implementar `src/ui/features/register/TermsDialog.tsx` y `TermsDialog.module.css` hasta pasar T049 con el elemento `<dialog>` y `showModal()` (research R8): `aria-labelledby` al título "Términos y condiciones", texto de ejemplo ficticio marcado como tal (p. ej. "Texto de ejemplo para la demostración, sin validez legal"), botón "Cerrar", cierre con Escape, contención de foco y bloqueo del fondo del navegador; sin estado de negocio ni dependencias nuevas
- [ ] T052 [US3] Integrar en `src/ui/features/register/RegisterForm.tsx` hasta pasar T050: etiqueta de la casilla con el texto "Acepto los " y un `Button` variante `link` "términos y condiciones" que abre `TermsDialog` (estado `termsOpen` del reducer); al cerrar, devolver el foco al botón que lo abrió (US3-5); US3-6 (Tab no sale del diálogo y el título se anuncia al abrir) queda cubierto por el comportamiento nativo de `<dialog>` y se verifica en el recorrido manual del quickstart (escenario 13)

**Checkpoint**: US1, US2 y US3 funcionan de forma independiente

---

## Phase 6: User Story 4 - Volver al inicio de sesión (Priority: P2)

**Goal**: el usuario navega entre registro y login con enlaces reales, sin perder el contexto de lectores de pantalla

**Independent Test**: desde `/registro` activar "Inicia sesión" y llegar a `/login`; desde `/login` activar "Regístrate" y llegar a `/registro` con el formulario vacío (quickstart escenarios 15–18)

### Tests for User Story 4 ⚠️

- [ ] T053 [US4] Ampliar `src/ui/features/register/RegisterForm.test.tsx`: el pie muestra "¿Ya tienes cuenta?" y un `link` "Inicia sesión" con `href="/login"`
- [ ] T054 [US4] Actualizar `src/ui/features/login/LoginForm.test.tsx`: "Regístrate" sale de la lista de elementos que muestran el aviso de función no disponible (US5-1 de 001) y pasa a ser un `link` con `href="/registro"`; el orden de tabulación sigue el contrato de `ui-login.md` con el enlace en su posición; los demás elementos fuera de alcance conservan su prueba
- [ ] T055 [US4] Ampliar `src/App.test.tsx`: US4-1 activar "Inicia sesión" muestra el login en `/login` sin aviso de éxito; US4-3 activar "Regístrate" muestra el registro vacío en `/registro`; US4-2 volver al registro tras escribir datos y navegar de ida y vuelta no conserva ningún valor; N1 y N2 con rutas cargadas directamente (`/registro`, `/otra`); N5 el botón Atrás vuelve a la pantalla anterior; N6 al navegar internamente el foco pasa al `h1` de la nueva pantalla y `document.title` es "KynWallet · Crear cuenta" o "KynWallet · Iniciar sesión"; N7 en la carga inicial el foco no se mueve. Cada prueba parte de `/login` (garantizado por el `afterEach` de T012); si necesita otra ruta, la establece con `window.history.pushState` en su `Given`

### Implementation for User Story 4

- [ ] T056 [P] [US4] En `src/ui/features/register/RegisterForm.tsx` añadir el pie centrado (14px `var(--neutral-600)`, gap 5px) con "¿Ya tienes cuenta?" y `<Link to="login">` "Inicia sesión" (14px SemiBold `var(--brand-700)`, mismo estilo de enlace que "Regístrate" del login), hasta pasar T053
- [ ] T057 [P] [US4] En `src/ui/features/login/LoginForm.tsx` sustituir el botón "Regístrate" por `<Link to="register">` con el mismo estilo, y retirar su aviso de función no disponible, hasta pasar T054
- [ ] T058 [US4] Implementar el foco y el título al navegar en `src/App.tsx` (o un hook `useRouteAnnouncement` en `src/ui/navigation/`) hasta pasar T055: en cambios de ruta internos mover el foco al `h1` (`tabIndex={-1}`) y actualizar `document.title`; en la carga inicial no mover el foco (research R10); añadir `tabIndex={-1}` y `ref` al `h1` de `LoginForm` y `RegisterForm` si hace falta

**Checkpoint**: US1–US4 funcionan; la navegación es accesible

---

## Phase 7: User Story 6 - Usar el registro en distintos tamaños de pantalla (Priority: P2)

**Goal**: dos paneles en escritorio; en móvil solo el logo y el formulario, sin scroll horizontal desde 320 px

**Independent Test**: abrir `/registro` a 320, 480, 960, 1280 y 1440 px y operar todo el formulario (quickstart escenarios 1, 19 y 20)

> jsdom no calcula estilos de `@media`; la verificación de esta historia es visual y se registra en los entregables de T060.

- [ ] T059 [US6] Completar `src/ui/features/register/RegisterForm.module.css` y revisar `src/ui/layout/AuthScreen/AuthScreen.module.css` y `src/ui/layout/BrandPanel/BrandPanel.module.css` para el registro: formulario de máx. 400px y gap 22px; `.social` en dos columnas iguales; panel de marca de 620px desde 1280px y 43 % entre 960 y 1280px; por debajo de 960px solo se muestra el logo; padding lateral de 16px por debajo de 480px; el diálogo de términos usable a 320px (ancho máx. `calc(100vw - 32px)` y desplazamiento vertical interno); sin scroll horizontal desde 320px (FR-017)
- [ ] T060 [US6] Verificar con `npm run dev` a 320, 480, 960, 1280 y 1440 px: sin scroll horizontal, logo siempre visible, distribución de dos columnas desde 960px y todos los controles alcanzables (US6-1, US6-2, US6-3); comparar a 1440×1024 con la captura del frame `04 · Registro` y revisar los puntos 1–6 de `specs/002-registro-usuarios/research.md` R9; corregir los CSS de T059 si hace falta y anotar el resultado en el PR; registrar también en el PR la verificación manual de US3-6 (Tab dentro del diálogo y anuncio del título; quickstart escenario 13), como evidencia del SC-003

**Checkpoint**: la pantalla es utilizable en todos los anchos

---

## Phase 8: User Story 5 - Acceso con Google y Apple, aún no disponible (Priority: P3)

**Goal**: fidelidad al diseño; los botones de Google y Apple avisan "Próximamente" sin perder los datos

**Independent Test**: activar Google y Apple y ver el aviso; los datos escritos se conservan (quickstart escenario 14)

### Tests for User Story 5 ⚠️

- [ ] T061 [US5] Ampliar `src/ui/features/register/RegisterForm.test.tsx`: la pantalla muestra el texto "o regístrate con" y los `button` "Google" y "Apple"; US5-1 activar cada uno muestra un `status` "Próximamente" y conserva los valores ingresados; US5-2 el aviso es un `role="status"` anunciado sin mover el foco; enviar el formulario o mostrar un aviso nuevo reemplaza al anterior (contracts/ui-register.md)

### Implementation for User Story 5

- [ ] T062 [US5] Ampliar `src/ui/features/register/registerReducer.ts` (acción `showNotice`, el envío limpia `notice`) y `src/ui/features/register/RegisterForm.tsx` hasta pasar T061: entre "Crear cuenta" y el pie, `Divider` "o regístrate con", fila con `SocialButton` Google y Apple (`onClick` → `showNotice(MESSAGES.COMING_SOON)`, gap 12px, mitades iguales) y `Alert` `info` con el aviso

**Checkpoint**: las seis historias funcionan de forma independiente; la pantalla coincide con el diseño

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: accesibilidad global, seguridad, documentación y controles de cumplimiento

- [ ] T063 [P] Pruebas de accesibilidad de la pantalla completa en `src/App.test.tsx` (FR-019, SC-005): sin violaciones de `axe` en `/registro` vacío, con todos los errores visibles, con "Este correo ya está registrado", con el aviso "Próximamente", con el diálogo de términos abierto, y en `/login` con el aviso de éxito
- [ ] T064 [P] Prueba de seguridad en `src/ui/features/register/RegisterForm.test.tsx` y `src/App.test.tsx` (FR-012, N8, R6): tras un registro exitoso y uno fallido, ni la contraseña ni la confirmación aparecen en `document.body.textContent`, `window.location.href`, `history.state`, llamadas a `console.*`, `Storage.prototype.setItem` ni en el resultado de `Register`; la URL tras la redirección es exactamente `/login`
- [ ] T065 [P] Actualizar `README.md`: rutas `/login` y `/registro`, registro con cuentas en memoria (se pierden al recargar), regla de reescritura a `index.html` para despliegues estáticos, advertencia de que "Este correo ya está registrado" revela cuentas y debe reemplazarse con un backend real (research R6), enlace a `specs/002-registro-usuarios/` y mención del token `--success-700` pendiente de aprobación (Constitución 8.3)
- [ ] T066 Actualizar los artefactos de 001 afectados en el mismo cambio (research R13, Constitución 8.3, 9.2): `specs/001-login-billetera/spec.md` (FR-016 y US5-1 excluyen "Regístrate", que navega), `specs/001-login-billetera/contracts/ui-login.md` ("Regístrate" pasa de `button` a `link` hacia `/registro`), `specs/001-login-billetera/contracts/auth-gateway.md` (constructor con `InMemoryAccountStore` y contrato C7) y la nota de "sin router" en `specs/001-login-billetera/plan.md`; añadir en `specs/002-registro-usuarios/research.md` R8 y en `contracts/ui-register.md` que `PasswordField` gana la prop `toggleSubject`
- [ ] T067 Ejecutar `npm run verify` y corregir hasta que todos los controles pasen (lint, format, typecheck, cobertura ≥ 80 %, build, audit:deps, audit:licenses, scan:secrets) (Constitución 9.4, SC-003, SC-007); confirmar que no se añadieron dependencias (research R12)
- [ ] T068 Recorrer los escenarios de `specs/002-registro-usuarios/quickstart.md` (1–21, incluido el 8a) y anotar el resultado; cualquier fallo vuelve a la tarea de la historia correspondiente
- [ ] T069 Abrir la solicitud de cambio (pull request) de `002-registro-usuarios` hacia `main` con el resumen, las desviaciones aceptadas (router propio, mensaje de correo duplicado, contraseñas en memoria, tokens accesibles) y la lista de puntos visuales de research R9 pendientes de revisión por el responsable de diseño; la integración requiere un revisor distinto del autor (Constitución 9.3)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias. T001 → T002.
- **Foundational (Phase 2)**: depende de Setup y bloquea todas las historias. Pruebas T003–T012 en paralelo primero (T012 es requisito de T006 y de las pruebas de `App` de T033 y T055, porque restablece la URL entre pruebas); después T013–T014 en paralelo; T015 → T016 (T016 también necesita T003 y T014) → T017 → T018 (cadena de tipos: T017 importa `RegistrationErrors` de T016 y T018 importa los tipos de T017); T019 antes de T020; T021–T024 en paralelo (cada una con su prueba); T025 depende de T024 (y de T010 y T011); T026 depende de T006; T027 en paralelo.
- **US1 (Phase 3)**: depende de Foundational completo.
- **US2 (Phase 4)**: depende de US1 (amplía el gateway, el reducer y `RegisterForm`).
- **US3 (Phase 5)**: depende de US1; toca `RegisterForm.tsx` y `RegisterForm.test.tsx`, por lo que conviene hacerla después de US2.
- **US4 (Phase 6)**: depende de US1 (navegación) y de Foundational (T026); T057 toca `LoginForm.tsx` igual que T039.
- **US6 (Phase 7)**: depende de que existan `RegisterForm` y `AuthScreen` (US1); su verificación final se hace con US2–US5 ya integradas.
- **US5 (Phase 8)**: depende de US1; usa `Alert` (T021).
- **Polish (Phase 9)**: depende de todas las historias. T066 puede empezar apenas se cierre US4.

### Within Each User Story

- Pruebas primero, y deben FALLAR (Principio I)
- Dominio → infraestructura/aplicación → reducer/hook → componentes → integración
- Cada historia se cierra con sus pruebas en verde y `npm run lint` limpio

### Parallel Opportunities

- Foundational: T003–T012 (pruebas), T013, T014, T021–T024, T027
- US1: T028–T030 en paralelo; T034 y T035 en paralelo
- US2: T041 y T042 en paralelo; T045 con T046
- US3: T049 con T050 (archivos distintos)
- US4: T056 y T057 en paralelo
- Polish: T063, T064, T065

---

## Parallel Example: Foundational (pruebas)

```bash
# Pruebas independientes (archivos distintos):
Task: "T003 validateRegistration en src/domain/registration.test.ts"
Task: "T005 InMemoryAccountStore en src/infrastructure/InMemoryAccountStore.test.ts"
Task: "T006 navegación en src/ui/navigation/navigation.test.tsx"
Task: "T008 Checkbox en src/ui/components/Checkbox/Checkbox.test.tsx"
Task: "T009 PasswordField en src/ui/components/PasswordField/PasswordField.test.tsx"
Task: "T010 BrandPanel en src/ui/layout/BrandPanel/BrandPanel.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1 (Setup) y Phase 2 (Foundational)
2. Completar Phase 3 (US1)
3. **DETENERSE Y VALIDAR**: quickstart escenarios 1–5
4. Demostrar el MVP (crear cuenta, redirigir al login e iniciar sesión con ella)

### Incremental Delivery

1. Setup + Foundational → base lista (almacén compartido, navegación, layout)
2. US1 → registro exitoso (MVP)
3. US2 → validaciones y correo duplicado
4. US3 → términos y diálogo
5. US4 → navegación entre pantallas
6. US6 → responsive verificado
7. US5 → Google/Apple
8. Polish → `npm run verify` en verde y revisión de código antes de integrar (Constitución 9.3)

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes
- La etiqueta [USn] y los IDs en los nombres de las pruebas dan la trazabilidad requisito → prueba (9.2)
- Hacer commit al cerrar cada tarea o grupo lógico, referenciando el ID de la tarea
- Esta feature modifica comportamiento del login (enlace "Regístrate", constructor de `InMemoryAuthGateway`, `LoginScreen` → `AuthScreen`): las pruebas de 001 afectadas se actualizan de forma controlada (T020, T025, T054) y deben terminar en verde
- Decisiones pendientes que pueden cambiar tareas: (a) si diseño rechaza los tokens accesibles, cambian T013 y la verificación de contraste (y queda el incumplimiento WCAG de 001); (b) si se sustituye "Este correo ya está registrado" por una respuesta genérica, cambian T014, T041, T043–T044 y T048; (c) si el nombre debe aceptar apóstrofos y guiones, cambian T003, T016 y T043; (d) si aparece un tercer ruteo o rutas con parámetros, reconsiderar `react-router` (research R1)
- Sin Node en la sesión de planificación: la ejecución de pruebas, `typecheck` y `verify` queda para la implementación
