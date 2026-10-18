import type { AuthGateway } from '@/application/ports/AuthGateway';
import type { AuthResult, LoginCredentials } from '@/domain/auth';
import type { InMemoryAccountStore } from './InMemoryAccountStore';

const DEFAULT_DELAY_MS = 1000;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Autenticación simulada sobre el almacén de cuentas compartido (contracts/auth-gateway.md). */
export class InMemoryAuthGateway implements AuthGateway {
  private readonly store: InMemoryAccountStore;
  private readonly delayMs: number;

  constructor(store: InMemoryAccountStore, options: { delayMs?: number } = {}) {
    this.store = store;
    this.delayMs = options.delayMs ?? DEFAULT_DELAY_MS;
  }

  async authenticate(credentials: LoginCredentials): Promise<AuthResult> {
    await wait(this.delayMs);
    try {
      if (!this.store.isAvailable()) return { kind: 'unavailable' };
      const account = this.store.findByEmail(credentials.email);
      // Correo inexistente y contraseña incorrecta producen el mismo resultado (FR-010).
      if (!account || account.password !== credentials.password) {
        return { kind: 'invalid-credentials' };
      }
      return { kind: 'success', displayName: account.displayName };
    } catch {
      return { kind: 'unavailable' };
    }
  }
}
