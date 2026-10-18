import type { DemoAccount } from '@/domain/auth';
import type { RegistrationData } from '@/domain/registration';

/** Cuenta ficticia exclusiva de pruebas; no corresponde a ningún sistema real (research.md R4). */
export const TEST_ACCOUNT: DemoAccount = {
  email: 'steven.luna@example.test',
  password: 'fixture-pass-01',
  displayName: 'Steven Luna',
};

/** Datos de registro ficticios y válidos, exclusivos de pruebas. */
export const NEW_ACCOUNT_DATA: RegistrationData = {
  fullName: 'Diego Martínez',
  email: 'nueva@example.test',
  password: 'fixture-pass-02',
  confirmPassword: 'fixture-pass-02',
  acceptedTerms: true,
};
