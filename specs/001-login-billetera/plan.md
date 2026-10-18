# Implementation Plan: Pantalla de Inicio de Sesión de KynWallet

**Branch**: `001-login-billetera` | **Date**: 2026-10-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-login-billetera/spec.md`

## Summary

Demo web solo-cliente de la pantalla de login de KynWallet, fiel al diseño de Figma
(`01 · Login`, nodo `2:2`). Permite ingresar correo y contraseña, valida los campos, simula la
autenticación contra cuentas ficticias en memoria y muestra una vista de bienvenida con
"Cerrar sesión" o un mensaje de error genérico. Se construye con React + TypeScript + Vite, con
una Clean Architecture ligera: dominio puro (reglas de validación y autenticación), un caso de
uso con el puerto `AuthGateway`, un adaptador en memoria y componentes de UI reutilizables
estilizados con tokens extraídos de Figma. Desarrollo guiado por pruebas con Vitest + Testing
Library.

## Technical Context

**Language/Version**: TypeScript 5.x (`strict`), Node.js ≥ 20 LTS para herramientas

**Primary Dependencies**: React 19, Vite 8, `@fontsource-variable/inter`

**Storage**: N/A (estado en memoria; sin persistencia)

**Testing**: Vitest 5, React Testing Library, `@testing-library/user-event`, jsdom,
`axe-core` (helper propio en `src/test/a11y.ts`), `@vitest/coverage-v8`

**Target Platform**: Navegadores modernos (las dos últimas versiones de Chrome, Firefox, Safari
y Edge), de 320px a escritorio

**Project Type**: Aplicación web de página única (SPA), solo frontend

**Performance Goals**: resultado del intento en ≤ 2 s (SC-002), con una espera simulada de 1 s

**Constraints**: sin backend, base de datos ni APIs externas; WCAG 2.1 AA; sin credenciales en
archivos versionados; sin scroll horizontal desde 320px

**Scale/Scope**: 1 pantalla con 2 vistas (login y bienvenida), ~10 componentes de UI

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio / Regla | Cumplimiento en el diseño | Estado |
|---|---|---|
| I. TDD | Cada historia empieza con pruebas que fallan (dominio → caso de uso → componentes); las pruebas se mapean a los escenarios Given/When/Then | ✅ |
| II. SOLID | Componentes con una responsabilidad; `AuthGateway` como abstracción inyectada (DIP); componentes de campo extensibles por props | ✅ |
| III. Clean Architecture | `domain/` sin dependencias de React ni Vite; `application/` depende solo de `domain/`; `infrastructure/` y `ui/` en el exterior; regla de dependencias verificada por ESLint (`no-restricted-imports`) | ✅ |
| IV. DRY/KISS/YAGNI | Tokens únicos; validaciones en un solo lugar; sin librerías de formularios, estado global ni E2E; sin router mientras exista una sola pantalla (la spec `002-registro-usuarios` incorpora un módulo de navegación propio para `/login` y `/registro`, ver su research R1) | ✅ |
| V. Seguridad | Validación en el límite; mensaje genérico; contraseña nunca registrada ni persistida; cuentas desde `.env.local` no versionado; `secretlint` | ✅ con desviación del pedido del usuario (ver R4) |
| VI. BRD/ARD | No existen para esta funcionalidad (supuesto de la spec) | ✅ N/A |
| 7. Dependencias | Todas MIT/ISC/Apache/OFL con mantenimiento activo; `npm audit` y verificación de licencias en `verify` | ✅ |
| 8.1 Pruebas | Unitarias (dominio, reducer, adaptador) e integración de componentes; cobertura ≥ 80 % | ✅ |
| 8.2 Convenciones | ESLint + Prettier + `tsc --noEmit` | ✅ |
| 8.3 Documentación | README con ejecución local (de quickstart.md); contratos documentados | ✅ |
| 8.4 Accesibilidad AA | Roles y etiquetas según el contrato de UI; `vitest-axe`; contraste ajustado | ⚠️ requiere desviar colores de Figma (ver Complexity Tracking) |
| 8.6 Sistema de diseño | Tokens de Figma replicados 1:1 más tokens accesibles derivados | ⚠️ desviación pendiente de aprobación |
| 9.2 Trazabilidad | Pruebas nombradas con el ID del escenario o requisito (p. ej., `US2-1`, `FR-010`); tareas que referencian FR/US | ✅ |
| 9.3/9.4 Revisión y controles | Script `verify` con todos los controles; **el directorio aún no es un repositorio git** | ⚠️ inicializar git antes de integrar |

**Resultado del gate**: APROBADO con dos desviaciones justificadas (contraste y origen de las
cuentas) y una acción previa (inicializar git). Ninguna violación queda sin justificar.

**Re-check post-diseño (Phase 1)**: data-model, contratos y quickstart mantienen las mismas
conclusiones; no se introdujeron dependencias ni capas adicionales.

## Project Structure

### Documentation (this feature)

```text
specs/001-login-billetera/
├── plan.md              # Este archivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── auth-gateway.md  # Puerto de autenticación y configuración
│   └── ui-login.md      # Contrato observable de la UI
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
index.html
package.json
vite.config.ts            # incluye la configuración de Vitest
tsconfig.json
eslint.config.js
.env.example              # formato de VITE_DEMO_USERS con valores de ejemplo
README.md

src/
├── main.tsx              # raíz de composición: carga cuentas, crea gateway e inyecta el caso de uso
├── App.tsx
├── domain/
│   ├── auth.ts           # LoginCredentials, AuthResult, DemoAccount
│   ├── validation.ts     # validateCredentials, normalizeEmail
│   └── messages.ts       # textos de error y aviso (fuente única)
├── application/
│   ├── ports/AuthGateway.ts
│   └── authenticate.ts   # caso de uso: valida y delega en el gateway
├── infrastructure/
│   ├── InMemoryAuthGateway.ts
│   └── loadDemoAccounts.ts
├── ui/
│   ├── styles/
│   │   ├── tokens.css    # variables de Figma + tokens accesibles
│   │   └── global.css
│   ├── components/       # reutilizables y sin lógica de negocio
│   │   ├── TextField/
│   │   ├── PasswordField/
│   │   ├── Button/
│   │   ├── Checkbox/
│   │   ├── SocialButton/
│   │   ├── Divider/
│   │   └── Alert/
│   ├── layout/
│   │   └── BrandPanel/   # logo, titular, tarjeta
│   ├── features/login/
│   │   ├── LoginScreen.tsx
│   │   ├── LoginForm.tsx
│   │   ├── WelcomeView.tsx
│   │   ├── loginReducer.ts
│   │   └── useLoginForm.ts
│   └── assets/           # SVG descargados de Figma
└── test/
    ├── setup.ts          # jest-dom matchers
    ├── a11y.ts           # expectNoA11yViolations (axe-core)
    ├── fixtures.ts       # cuenta ficticia de pruebas
    └── authStub.ts       # caso de uso falso
```

**Structure Decision**: proyecto único de frontend en la raíz del repositorio. Las capas se
separan por carpeta (`domain`, `application`, `infrastructure`, `ui`) siguiendo el Principio III,
sin paquetes separados (KISS). Las pruebas se ubican junto al código (`*.test.ts(x)`) para
facilitar la trazabilidad; por eso no se crea `tests/`.

## Complexity Tracking

| Violación / desviación | Por qué es necesaria | Alternativa más simple rechazada porque |
|---|---|---|
| Colores de texto, botón y bordes distintos a los de Figma (`--brand-700`, `--neutral-600`, `--neutral-border`) | Los tokens originales no alcanzan WCAG AA (2.26–3.56:1, ver research R3); la Constitución 8.4 es OBLIGATORIA. **Requiere aprobación del responsable de diseño (8.6).** | Reproducir los colores exactos incumple 8.4 y SC-005 |
| Cuentas de demostración en `.env.local` en vez de "predefinidas en el código", como pidió el usuario | La Constitución 5.3 y FR-011 prohíben credenciales en archivos versionados | Un arreglo en el código solo es viable con una excepción aprobada y temporal (9.1). Si se aprueba, se cambia solo `loadDemoAccounts.ts`. |

## Implementation Notes (2026-10-14)

- Vite 8 y Vitest 5 sustituyen a Vite 7 y Vitest 3: `@vitejs/plugin-react` vigente exige Vite 8.
- `vitest-axe` se reemplazó por `axe-core` con un helper propio, porque el paquete no tiene
  mantenimiento activo (Constitución 7.1.b).
- El estado de visibilidad de la contraseña es local de `PasswordField` (ver data-model.md).
- Se añadió la variante `link` a `Button` para los enlaces del diseño que actúan como botones.

## Deferred from Clarification

- La pregunta sobre bloqueo por intentos fallidos quedó sin responder porque `/speckit-clarify`
  se interrumpió. Se mantiene el supuesto de la spec (fuera de alcance, sin bloqueo). Si se
  decide incluirlo, afecta `loginReducer` y agrega escenarios de prueba.
