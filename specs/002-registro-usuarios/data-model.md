# Data Model: Pantalla de Registro de Usuarios de KynWallet

**Feature**: `002-registro-usuarios` | **Date**: 2026-10-17

No hay persistencia: todas las entidades viven en memoria durante la sesión de la página y se
pierden al recargar (spec, FR-023). Reutiliza `DemoAccount`, `normalizeEmail` y las reglas de
correo y contraseña definidas en
[`001-login-billetera/data-model.md`](../001-login-billetera/data-model.md).

## Account (dominio, entidad compartida)

La cuenta de demostración de 001 pasa a ser la cuenta de la sesión. Se conserva el tipo
`DemoAccount` (sin renombrar, para no ampliar el cambio) y las cuentas creadas en el registro
tienen los mismos campos.

| Campo | Tipo | Reglas |
|---|---|---|
| `email` | string | Normalizado (recortado, minúsculas); único en el almacén |
| `password` | string | 8–128 caracteres; NO DEBE registrarse, mostrarse ni serializarse (FR-012) |
| `displayName` | string | Nombre completo recortado, 2–80 caracteres para cuentas creadas en el registro (las de demostración conservan 1–80 de 001) |

**Invariante**: no existen dos cuentas con el mismo correo normalizado (FR-024).

## RegistrationData (dominio, valor)

Datos ingresados en el formulario. `confirmPassword` y `acceptedTerms` solo se usan para
validar; no forman parte de la cuenta creada.

| Campo | Tipo | Regla de validación | Mensaje |
|---|---|---|---|
| `fullName` | string | Vacío tras recortar (FR-003) | "Ingresa tu nombre completo" |
| | | Menos de 2 o más de 80 caracteres tras recortar | "El nombre debe tener entre 2 y 80 caracteres" |
| | | Contiene algo distinto de letras latinas (con tildes, diéresis y ñ) y espacios | "El nombre solo puede contener letras y espacios" |
| `email` | string | Vacío tras recortar (FR-004) | "Ingresa tu correo electrónico" |
| | | Formato inválido o > 254 caracteres | "Ingresa un correo electrónico válido" |
| `password` | string | Vacía (FR-005) | "Ingresa tu contraseña" |
| | | < 8 caracteres | "La contraseña debe tener al menos 8 caracteres" |
| | | > 128 caracteres | "La contraseña no puede superar 128 caracteres" |
| `confirmPassword` | string | Vacía (FR-006) | "Confirma tu contraseña" |
| | | Distinta de `password`, comparada tal cual (sin recortar ni normalizar) | "Las contraseñas no coinciden" |
| `acceptedTerms` | boolean | `false` (FR-007) | "Debes aceptar los términos y condiciones" |

`validateRegistration(data) → RegistrationErrors` es una función pura; `{}` significa válido.
Orden de campos para el foco: `fullName`, `email`, `password`, `confirmPassword`,
`acceptedTerms`. Los errores de correo y contraseña salen de las mismas funciones que el login
(`validateEmail`, `validatePassword`), sin duplicar reglas ni textos.

## RegisterResult (dominio, unión discriminada)

| Variante | Datos | Origen |
|---|---|---|
| `success` | — | Cuenta creada |
| `invalid` | `errors: RegistrationErrors` | El caso de uso revalida y los datos incumplen las reglas (defensa en profundidad, 5.1) |
| `email-taken` | — | Ya existe una cuenta con ese correo normalizado (FR-024) |
| `unavailable` | — | Almacén sin configuración o error inesperado (FR-020) |

`success` no devuelve la cuenta ni la contraseña (contrato C6). La UI valida antes de enviar, de
modo que `invalid` solo llega si se omitió esa validación; si ocurre, se muestran sus errores
como errores de campo.

## RegisterFormState (UI, máquina de estados)

```text
                 submit (con errores)
             ┌───────────────────────────┐
             ▼                           │
      ┌──────────────┐  submit (válido) ┌┴─────────────┐
      │   editing    │─────────────────▶│  submitting  │
      └──────────────┘                  └──────┬───────┘
        ▲  ▲                      success     │  email-taken / unavailable
        │  │          (navega a /login)       ▼
        │  │                           ┌──────────────┐
        │  └── edición de un campo ────┤ serverError  │
        └────────────────────────────  │ (correo o    │
                                       │  global)     │
                                       └──────────────┘
```

| Campo | Tipo | Descripción |
|---|---|---|
| `status` | `'editing' \| 'submitting' \| 'serverError'` | Estado actual |
| `values` | `{ fullName, email, password, confirmPassword }` | Valores de los campos |
| `acceptedTerms` | boolean | Casilla de términos |
| `touched` | `Record<RegisterField, boolean>` | Campo visitado (validación al salir, FR-008) |
| `fieldErrors` | `RegistrationErrors` | Errores de validación visibles |
| `serverError` | `'email-taken' \| 'unavailable' \| null` | Resultado negativo del registro |
| `notice` | `string \| null` | Aviso "Próximamente" de Google/Apple (FR-014) |
| `termsOpen` | boolean | Diálogo de términos abierto (FR-021); no altera `acceptedTerms` |

`RegisterField = 'fullName' | 'email' | 'password' | 'confirmPassword' | 'acceptedTerms'`. El
estado de visibilidad de cada contraseña (FR-013) es local de `PasswordField`.

**Transiciones clave**:

- `change` / `blur`: igual que el login. Cambiar `password` revalida `confirmPassword` si ya fue
  tocada (US2-5). Marcar la casilla borra su error (US3-2).
- `submit` con errores → sigue en `editing`, marca todos los campos como tocados y el foco va al
  primer elemento con error (FR-009). No llama al gateway.
- `submit` válido → `submitting`; envíos adicionales se ignoran (FR-010).
- `email-taken` → `serverError`; el error aparece bajo el correo, el foco va al correo y se
  conservan todos los valores (US2-9). Editar el correo limpia el error.
- `unavailable` → `serverError` con `Alert` de error global; se conservan los valores.
- `success` → el formulario no cambia de vista: la UI notifica a `App`, que navega a `/login`.
  Al desmontarse, el estado (incluidas las contraseñas) se descarta (US4-2).
- Aviso (`notice`): mostrar uno nuevo reemplaza al anterior; enviar el formulario lo limpia.

## Aviso de registro exitoso (App, valor transitorio)

| Campo | Tipo | Descripción |
|---|---|---|
| `flash` | `{ kind: 'registered'; email: string } \| null` | Vive en el estado de `App`; no se persiste (FR-011, FR-011a, research R4). Nunca contiene la contraseña |

- Se establece al recibir `success` del registro (con el correo normalizado) y se consume en
  `/login`, donde rellena el correo y mueve el foco a la contraseña.
- Se borra al editar un campo del login, al abandonar `/login` o al recargar.

## InMemoryAccountStore (infraestructura)

| Operación | Resultado |
|---|---|
| `isAvailable()` | `false` si `VITE_DEMO_USERS` faltó o era inválida (research R2) |
| `findByEmail(email)` | Cuenta cuyo correo normalizado coincide, o `undefined` |
| `add(account)` | `'added'` o `'duplicate'` (comprobación y alta atómicas, síncronas) |

El almacén es la única fuente de verdad que leen `InMemoryAuthGateway` y
`InMemoryRegistrationGateway`. Se construye una sola vez en la raíz de composición.
