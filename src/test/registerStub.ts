import type { Register } from '@/application/register';
import type { RegisterResult } from '@/domain/auth';
import type { RegistrationData } from '@/domain/registration';

/** Caso de uso de registro falso controlable desde las pruebas. */
export function createRegisterStub(result: RegisterResult = { kind: 'success' }) {
  let resolvePending: (() => void) | null = null;
  let deferred = false;
  const fn = vi.fn<(data: RegistrationData) => Promise<RegisterResult>>(
    () =>
      new Promise<RegisterResult>((resolve) => {
        if (deferred) {
          resolvePending = () => resolve(result);
        } else {
          resolve(result);
        }
      }),
  );
  return {
    register: fn as Register,
    mock: fn,
    /** Las siguientes llamadas quedan pendientes hasta llamar a release(). */
    defer() {
      deferred = true;
    },
    release() {
      resolvePending?.();
    },
  };
}
