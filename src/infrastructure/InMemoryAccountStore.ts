import type { DemoAccount } from '@/domain/auth';
import { normalizeEmail } from '@/domain/validation';

/**
 * Cuentas de la sesión en memoria, compartidas por el login y el registro (research.md R2).
 * Nunca se serializa ni se persiste (FR-012): se pierde al recargar la página.
 */
export class InMemoryAccountStore {
  private readonly accounts: DemoAccount[];
  private readonly demoConfigured: boolean;

  /** `null` indica que la configuración de cuentas de demostración falta o es inválida. */
  constructor(accounts: readonly DemoAccount[] | null) {
    this.accounts = accounts ? accounts.map((account) => ({ ...account })) : [];
    this.demoConfigured = accounts !== null;
  }

  /** El login solo está disponible con cuentas de demostración válidas o cuentas ya registradas. */
  isAvailable(): boolean {
    return this.demoConfigured || this.accounts.length > 0;
  }

  findByEmail(email: string): DemoAccount | undefined {
    const wanted = normalizeEmail(email);
    const found = this.accounts.find((account) => normalizeEmail(account.email) === wanted);
    return found && { ...found };
  }

  /** Comprobación y alta en una sola operación síncrona (contrato R7). */
  add(account: DemoAccount): 'added' | 'duplicate' {
    if (this.findByEmail(account.email)) return 'duplicate';
    this.accounts.push({ ...account, email: normalizeEmail(account.email) });
    return 'added';
  }
}
