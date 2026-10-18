# Contract: RegistrationGateway y almacén de cuentas

Interfaz entre la capa de aplicación y la infraestructura (Constitución 2.4, 2.5, 3.4). La UI
recibe el caso de uso `Register` por inyección desde la raíz de composición (`src/main.tsx`) y no
conoce el gateway ni el almacén.

```ts
// src/application/ports/RegistrationGateway.ts
export interface RegistrationGateway {
  register(account: NewAccount): Promise<RegisterResult>;
}

// src/domain/auth.ts (ampliación)
export type NewAccount = { email: string; password: string; displayName: string };
export type RegisterResult =
  | { kind: 'success' }
  | { kind: 'invalid'; errors: RegistrationErrors }
  | { kind: 'email-taken' }
  | { kind: 'unavailable' };

// src/application/register.ts
export type Register = (data: RegistrationData) => Promise<RegisterResult>;
export function createRegister(gateway: RegistrationGateway): Register;
```

## Caso de uso `createRegister`

1. **Valida de nuevo** con `validateRegistration(data)` (defensa en profundidad, Constitución 5.1:
   la entrada se valida en cada límite). Si hay errores, devuelve `{ kind: 'invalid', errors }`
   sin llamar al gateway. La UI ya valida antes de enviar (FR-009); este resultado cubre
   cualquier llamada que la omita.
2. Construye `NewAccount` con el correo normalizado, la contraseña tal cual y el nombre recortado.
   Descarta `confirmPassword` y `acceptedTerms`.
3. Delega en el gateway y captura cualquier excepción: devuelve `unavailable`; la promesa NO
   DEBE rechazarse (igual que `createAuthenticate`). El gateway nunca devuelve `invalid`.

## Comportamiento obligatorio de toda implementación

| # | Dado | Resultado |
|---|---|---|
| R1 | Correo nuevo y datos válidos | `success`; la cuenta queda disponible para `AuthGateway.authenticate` (FR-023) |
| R2 | Correo igual (sin distinguir mayúsculas ni espacios periféricos) a una cuenta de demostración | `email-taken`; no se crea cuenta |
| R3 | Correo igual a una cuenta creada antes en la sesión | `email-taken`; no se crea cuenta |
| R4 | Configuración de cuentas de demostración ausente o inválida | `success`: el registro no depende de esa configuración. El almacén arranca vacío, el login (C4) responde `unavailable` hasta que exista una cuenta y después reconoce las registradas |
| R5 | Cualquier excepción interna | `unavailable`; la promesa NO DEBE rechazarse |
| R6 | Cualquier caso | NO DEBE registrar la contraseña ni incluirla en el resultado |
| R7 | Dos llamadas concurrentes con el mismo correo | Exactamente una obtiene `success`; la otra `email-taken` |

## Almacén: `InMemoryAccountStore`

```ts
// src/infrastructure/InMemoryAccountStore.ts
new InMemoryAccountStore(accounts: DemoAccount[] | null)
  isAvailable(): boolean
  findByEmail(email: string): DemoAccount | undefined   // compara el correo normalizado
  add(account: DemoAccount): 'added' | 'duplicate'      // comprobación y alta en una operación
```

- `accounts === null` representa configuración inválida: el almacén arranca vacío e `isAvailable()`
  es `false` hasta que se registre una cuenta.
- Copia defensiva de la lista recibida; `findByEmail` no expone el arreglo interno.
- No serializa ni persiste nada (FR-012).

## Implementación de la demostración: `InMemoryRegistrationGateway`

```ts
new InMemoryRegistrationGateway(store: InMemoryAccountStore, options?: { delayMs?: number })
```

- `delayMs` vale 1000 por defecto (FR-010); las pruebas usan 0 o temporizadores falsos.
- Espera y llama a `store.add`; `duplicate` → `email-taken`. No consulta `isAvailable()` (R4).
- R7 se cumple porque `add` es síncrono: la comprobación de duplicado y el alta no se separan.

## Cambio en `InMemoryAuthGateway` (login)

El constructor pasa de `(accounts, options)` a `(store, options)` y usa
`store.isAvailable()` y `store.findByEmail(...)`. Los contratos C1–C6 de
[`auth-gateway.md`](../../001-login-billetera/contracts/auth-gateway.md) no cambian y se añade:

| # | Dado | Resultado |
|---|---|---|
| C7 | Cuenta creada con `RegistrationGateway.register` y mismas credenciales | `success` con el `displayName` registrado |

## Configuración

Sin variables nuevas. `VITE_DEMO_USERS` sigue siendo el origen de las cuentas de demostración
(`loadDemoAccounts`, sin cambios).
