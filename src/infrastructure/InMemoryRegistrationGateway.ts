import type { RegistrationGateway } from '@/application/ports/RegistrationGateway';
import type { NewAccount, RegisterResult } from '@/domain/auth';
import type { InMemoryAccountStore } from './InMemoryAccountStore';

const DEFAULT_DELAY_MS = 1000;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Registro simulado sobre el almacén compartido (contracts/registration-gateway.md). */
export class InMemoryRegistrationGateway implements RegistrationGateway {
  private readonly store: InMemoryAccountStore;
  private readonly delayMs: number;

  constructor(store: InMemoryAccountStore, options: { delayMs?: number } = {}) {
    this.store = store;
    this.delayMs = options.delayMs ?? DEFAULT_DELAY_MS;
  }

  async register(account: NewAccount): Promise<RegisterResult> {
    await wait(this.delayMs);
    try {
      if (!this.store.isAvailable()) return { kind: 'unavailable' };
      // La comprobación de duplicado y el alta son una sola operación síncrona (R7).
      return this.store.add(account) === 'added' ? { kind: 'success' } : { kind: 'email-taken' };
    } catch {
      return { kind: 'unavailable' };
    }
  }
}
