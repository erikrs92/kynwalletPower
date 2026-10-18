# Contract: AuthGateway (puerto de autenticación)

Interfaz entre la capa de aplicación y la infraestructura (Constitución 2.5, 3.4). La UI nunca
depende de la implementación concreta; recibe el caso de uso por inyección desde la raíz de
composición (`src/main.tsx`).

```ts
// src/application/ports/AuthGateway.ts
export interface AuthGateway {
  authenticate(credentials: LoginCredentials): Promise<AuthResult>;
}

// src/domain/auth.ts
export type LoginCredentials = { email: string; password: string };
export type AuthResult =
  | { kind: 'success'; displayName: string }
  | { kind: 'invalid-credentials' }
  | { kind: 'unavailable' };
```

## Comportamiento obligatorio de toda implementación

| # | Dado | Resultado |
|---|---|---|
| C1 | Correo existente (sin distinguir mayúsculas ni espacios periféricos) y contraseña exacta | `success` con el `displayName` de la cuenta |
| C2 | Correo existente y contraseña distinta (incluye diferencias de mayúsculas o espacios) | `invalid-credentials` |
| C3 | Correo inexistente | `invalid-credentials` (idéntico a C2) |
| C4 | Configuración de cuentas ausente o inválida | `unavailable` |
| C5 | Cualquier excepción interna | `unavailable`; la promesa NO DEBE rechazarse |
| C6 | Cualquier caso | NO DEBE registrar la contraseña ni incluirla en el resultado |

## Implementación de la demostración: `InMemoryAuthGateway`

```ts
new InMemoryAuthGateway(store: InMemoryAccountStore, options?: { delayMs?: number })
```

- `delayMs` vale 1000 por defecto (FR-008); las pruebas usan 0 o temporizadores falsos.
- Desde la spec `002-registro-usuarios` el gateway lee las cuentas de un `InMemoryAccountStore`
  compartido con el registro (ver
  [`registration-gateway.md`](../../002-registro-usuarios/contracts/registration-gateway.md)).
  `store.isAvailable() === false` representa configuración inválida y produce C4.

Contrato adicional (spec 002):

| # | Dado | Resultado |
|---|---|---|
| C7 | Cuenta creada con `RegistrationGateway.register` y las mismas credenciales | `success` con el `displayName` registrado |

## Configuración: `VITE_DEMO_USERS`

Variable definida en `.env.local` (no versionado). Formato JSON:

```json
[{ "email": "<correo>", "password": "<contraseña 8-128>", "displayName": "<nombre>" }]
```

`loadDemoAccounts(raw: string | undefined): DemoAccount[] | null` devuelve `null` si la
variable falta, el JSON es inválido, alguna cuenta incumple las reglas de
[data-model.md](../data-model.md#demoaccount-dominio) o hay correos duplicados.
