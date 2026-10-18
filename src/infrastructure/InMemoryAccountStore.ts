import type { DemoAccount } from '@/domain/auth';
import { normalizeEmail } from '@/domain/validation';

/**
 * Cuentas de la sesión en memoria, compartidas por el login y el registro (research.md R2).
 * Nunca se serializa ni se persiste (FR-012): se pierde al recargar la página.
 */
export class InMemoryAccountStore {
  private readonly accounts: DemoAccount[] | null;

  constructor(accounts: readonly DemoAccount[] | null) {
    this.accounts = accounts ? accounts.map((account) => ({ ...account })) : null;
  }

  isAvailable(): boolean {
    return this.accounts !== null;
  }

  findByEmail(email: string): DemoAccount | undefined {
    const wanted = normalizeEmail(email);
    const found = this.accounts?.find((account) => normalizeEmail(account.email) === wanted);
    return found && { ...found };
  }

  /** Comprobación y alta en una sola operación síncrona (contrato R7). */
  add(account: DemoAccount): 'added' | 'duplicate' {
    if (!this.accounts) return 'duplicate';
    if (this.findByEmail(account.email)) return 'duplicate';
    this.accounts.push({ ...account, email: normalizeEmail(account.email) });
    return 'added';
  }
}
