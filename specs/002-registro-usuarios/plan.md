# Implementation Plan: Pantalla de Registro de Usuarios de KynWallet

**Branch**: `002-registro-usuarios` | **Date**: 2026-10-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-registro-usuarios/spec.md`

## Summary

Pantalla de registro para la demo solo-cliente de KynWallet, fiel al frame `04 · Registro` de
Figma (nodo `31:2`). Permite crear una cuenta con nombre completo, correo, contraseña y
confirmación, con aceptación de términos, validaciones en línea y registro simulado en memoria. Al
éxito navega a `/login` y muestra un aviso una sola vez; la cuenta creada puede iniciar sesión
mientras la página siga abierta. Se reutiliza la arquitectura por capas, los componentes y los
tokens del login. Novedades: un módulo mínimo de navegación (`/login`, `/registro`), un almacén de
cuentas compartido entre login y registro, un puerto `RegistrationGateway` y un layout de dos
paneles compartido. Sin dependencias nuevas. El MCP de Figma no está disponible: el diseño se
toma de una captura y se verifica visualmente al implementar (ver research R9).

## Technical Context

**Language/Version**: TypeScript 5.9 (`strict`), Node.js ≥ 20 LTS para herramientas

**Primary Dependencies**: React 19, Vite 8, `@fontsource-variable/inter` (sin dependencias nuevas)

**Storage**: N/A (cuentas y avisos solo en memoria; sin persistencia ni almacenamiento del
navegador)

**Testing**: Vitest 5, React Testing Library, `@testing-library/user-event`, jsdom, `axe-core`
(helper `src/test/a11y.ts`), `@vitest/coverage-v8`; cobertura ≥ 80 %

**Target Platform**: navegadores modernos (las dos últimas versiones de Chrome, Firefox, Safari y
Edge), de 320 px a escritorio

**Project Type**: aplicación web de página única (SPA), solo frontend

**Performance Goals**: resultado del intento en ≤ 2 s (SC-002) con una espera simulada de 1 s

**Constraints**: sin backend, base de datos ni APIs externas; WCAG 2.1 AA; sin contraseñas en la
URL, el almacenamiento ni los registros (FR-012); sin scroll horizontal desde 320 px; rutas reales
`/login` y `/registro` con reescritura a `index.html` en despliegues estáticos

**Scale/Scope**: 1 pantalla nueva (registro), 1 diálogo y 2 rutas; cambios menores en el login; ~3 componentes
modificados y ~8 archivos nuevos de lógica

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio / Regla | Cumplimiento en el diseño | Estado |
|---|---|---|
| I. TDD | Cada historia empieza con pruebas que fallan (dominio → caso de uso → adaptadores → reducer → componentes); nombres de prueba con el ID del escenario (`US2-9`, `FR-024`) | ✅ |
| II. SOLID | Puertos pequeños por cliente (`AuthGateway`, `RegistrationGateway`, 2.4); el almacén se inyecta, no se instancia dentro de los gateways (2.5); `Checkbox` y `BrandPanel` se extienden por props (2.2) | ✅ |
| III. Clean Architecture | La validación de registro vive en `domain/`; el caso de uso en `application/`; el almacén y los gateways en `infrastructure/`; la navegación en `ui/`. La regla de dependencias se mantiene con las reglas ESLint existentes | ✅ |
| IV. DRY/KISS/YAGNI | Reglas de correo y contraseña compartidas con el login (se exportan, no se copian); textos en `messages.ts`; layout compartido; navegación propia mínima en lugar de biblioteca; sin librería de formularios (research R1, R5, R7) | ✅ con una complejidad justificada (router) |
| V. Seguridad | Validación en el límite y revalidación en el caso de uso (5.1); contraseñas solo en memoria, sin serializar ni registrar (5.3, FR-012); nada sensible en la URL ni en `history.state` (R4); `no-console: error` ya activo | ⚠️ con dos desviaciones aceptadas (ver abajo) |
| VI. BRD/ARD | No existen para esta funcionalidad (supuesto de la spec) | ✅ N/A |
| 7. Dependencias | Ninguna dependencia nueva (R12) | ✅ |
| 8.1 Pruebas | Unitarias (dominio, reducer, almacén, navegación), de contrato (`RegistrationGateway`, C7) e integración de componentes; cobertura ≥ 80 % | ✅ |
| 8.2 Convenciones | ESLint + Prettier + `tsc --noEmit` ya configurados | ✅ |
| 8.3 Documentación | README actualizado con las rutas y el registro; contratos y quickstart de esta feature; artefactos de 001 afectados se actualizan en el mismo cambio (R13) | ✅ |
| 8.4 Accesibilidad AA | Errores asociados a cada campo, avisos con `role=status/alert`, foco y título al navegar (R10), pruebas con `axe` | ⚠️ requiere los tokens accesibles de 001 más `--success-700` |
| 8.5 Reutilización | `TextField`, `PasswordField`, `Checkbox`, `Button`, `SocialButton`, `Divider`, `Alert`, `BrandPanel` y tokens existentes; solo se amplían `Checkbox`, `Alert` y `BrandPanel` | ✅ |
| 8.6 Sistema de diseño | Tokens de Figma reutilizados; desviaciones de color como en 001 más el nuevo token de éxito | ⚠️ pendiente de aprobación del responsable de diseño |
| 8.7 Observabilidad | Una demo solo-cliente no emite logs ni métricas; `no-console` impide registrar datos sensibles. No hay eventos de seguridad que registrar sin backend | ✅ N/A justificada |
| 9.2 Trazabilidad | Contratos y pruebas referencian `FR-###` / `US#-#`; tareas referenciarán la historia | ✅ |
| 9.3/9.4 Revisión y controles | El repositorio git ya existe; `npm run verify` cubre los controles; la integración requiere solicitud de cambio revisada | ✅ |
| 9.5 | Esta tabla es la verificación explícita | ✅ |

**Resultado del gate**: APROBADO con desviaciones justificadas (Complexity Tracking). Sin
violaciones sin justificar.

**Re-check post-diseño (Fase 1)**: `data-model`, contratos y quickstart mantienen las conclusiones.
No se añadieron dependencias ni capas; las únicas incorporaciones son el puerto
`RegistrationGateway`, el almacén y el módulo de navegación, todos justificados en research.

## Project Structure

### Documentation (this feature)

```text
specs/002-registro-usuarios/
├── plan.md                        # Este archivo
├── research.md                    # Fase 0
├── data-model.md                  # Fase 1
├── quickstart.md                  # Fase 1
├── contracts/
│   ├── registration-gateway.md    # Puerto, caso de uso y almacén en memoria
│   ├── ui-register.md             # Contrato observable de la pantalla (y cambios en el login)
│   └── navigation.md              # Rutas y comportamiento de la navegación
├── checklists/
│   └── requirements.md
└── tasks.md                       # Fase 2 (/speckit-tasks), no se crea aquí
```

### Source Code (repository root)

`+` archivo nuevo, `~` archivo existente que se modifica.

```text
src/
├── main.tsx                           # ~ crea el almacén, los dos gateways y los dos casos de uso
├── App.tsx                            # ~ elige la pantalla según la ruta y guarda el aviso de éxito
├── domain/
│   ├── auth.ts                        # ~ NewAccount, RegisterResult
│   ├── validation.ts                  # ~ exporta validateEmail y validatePassword
│   ├── registration.ts                # + RegistrationData, validateRegistration
│   └── messages.ts                    # ~ textos del registro, "Próximamente" y éxito
├── application/
│   ├── ports/RegistrationGateway.ts   # + puerto de registro
│   └── register.ts                    # + caso de uso createRegister
├── infrastructure/
│   ├── InMemoryAccountStore.ts        # + almacén compartido de cuentas
│   ├── InMemoryRegistrationGateway.ts # + adaptador de registro
│   └── InMemoryAuthGateway.ts         # ~ lee del almacén en lugar de un arreglo
├── ui/
│   ├── navigation/                    # + routes.ts, navigate/useRoute, Link
│   ├── components/
│   │   ├── Checkbox/                  # ~ label ReactNode + error
│   │   ├── PasswordField/             # ~ prop toggleSubject (nombre accesible del control)
│   │   └── Alert/                     # ~ tono success
│   ├── layout/
│   │   ├── BrandPanel/                # ~ title y description por props
│   │   └── AuthScreen/                # + layout compartido (sustituye a LoginScreen)
│   ├── features/
│   │   ├── login/                     # ~ LoginForm: enlace a /registro y aviso de éxito;
│   │   │                              #   LoginScreen se elimina en favor de AuthScreen
│   │   └── register/
│   │       ├── RegisterForm.tsx       # +
│   │       ├── RegisterForm.module.css# +
│   │       ├── TermsDialog.tsx        # + diálogo modal (<dialog>) con términos de ejemplo
│   │       ├── TermsDialog.module.css # +
│   │       ├── registerReducer.ts     # +
│   │       └── useRegisterForm.ts     # +
│   └── styles/tokens.css              # ~ --success-700 y su fondo
└── test/                              # ~ stubs para el registro; fixtures

README.md                              # ~ rutas, registro y despliegue
```

Las pruebas (`*.test.ts(x)`) viven junto al código, como en 001.

**Structure Decision**: se mantiene el proyecto único de frontend con capas por carpeta (Principio
III). El layout de dos paneles se comparte (`AuthScreen`) y el módulo de navegación vive en `ui/`
porque solo la presentación conoce URLs; el dominio y la aplicación no.

## Complexity Tracking

| Violación / desviación | Por qué es necesaria | Alternativa más simple rechazada porque |
|---|---|---|
| Módulo de navegación propio (`ui/navigation`), que revierte el supuesto "sin router" de 001 | FR-011, FR-015 y FR-022 exigen rutas reales `/login` y `/registro`, botón Atrás y ruta desconocida → login (4.2) | Cambiar de vista por estado no cumple las URLs; una biblioteca de rutas añade dependencia y API para dos rutas estáticas (research R1) |
| Mensaje "Este correo ya está registrado" que revela la existencia de cuentas (contradice 5.4 y el criterio genérico del login) | Decisión explícita del solicitante (clarificación 2026-10-17). Se limita al registro, a cuentas ficticias y se documenta (research R6) | Respuesta genérica: descartada por el solicitante; se reemplazará cuando exista un backend real |
| Contraseñas en texto plano en la memoria de la página (almacén) | La comparación exacta del login las requiere; igual que las cuentas de `VITE_DEMO_USERS`; nunca se serializan (research R3) | Hash en el cliente: añade API asíncrona y falsa sensación de seguridad en una demo cliente |
| Nuevo token `--success-700` y los tokens accesibles de 001 distintos a Figma | WCAG AA es OBLIGATORIO (8.4): el botón del diseño en `--brand-500` da 2.83:1. **Requiere aprobación del responsable de diseño (8.6)** | Reproducir los colores exactos incumple 8.4 y SC-005 |
| Alcance ampliado sobre 001: "Regístrate" pasa de botón a enlace y `InMemoryAuthGateway` cambia de constructor | El registro y el login deben compartir cuentas (FR-023) y la navegación (FR-016) | Duplicar el gateway o dejar el aviso en "Regístrate" rompe FR-016/FR-023 |
| Verificación manual de US3-6 y US6 (excepción a SC-003) | jsdom no calcula `@media` ni implementa la contención de foco nativa del `<dialog>` | Playwright u otra herramienta E2E sumaría una dependencia que el alcance no exige (YAGNI, 4.2) |

## Implementation Notes

- **Pendiente de verificar visualmente** (sin MCP de Figma): puntos 1–6 de research R9, contra la
  captura del frame `04 · Registro` en desktop y el login en móvil.
- **Actualizar en el mismo cambio** los artefactos de 001 listados en research R13 (Constitución
  8.3, 9.2): `spec.md` (FR-016, US5-1), `contracts/ui-login.md`, `contracts/auth-gateway.md` y
  `plan.md` (supuesto "sin router").
- **Regresión**: `LoginForm.test.tsx`, `App.test.tsx` e `InMemoryAuthGateway.test.ts` cambian de
  forma controlada y deben terminar en verde.
- **Entorno**: no pude ejecutar Node en la sesión de planificación (no estaba en el PATH del
  agente); la verificación con `npm run verify` queda para la implementación.
