import type { RegisterResult } from '@/domain/auth';
import { validateRegistration, type RegistrationData } from '@/domain/registration';
import { normalizeEmail } from '@/domain/validation';
import type { RegistrationGateway } from './ports/RegistrationGateway';

export type Register = (data: RegistrationData) => Promise<RegisterResult>;

/** Caso de uso: valida de nuevo y registra una cuenta delegando en el puerto (Constitución 5.1). */
export function createRegister(gateway: RegistrationGateway): Register {
  return async (data) => {
    const errors = validateRegistration(data);
    if (Object.keys(errors).length > 0) return { kind: 'invalid', errors };
    try {
      return await gateway.register({
        email: normalizeEmail(data.email),
        password: data.password,
        displayName: data.fullName.trim(),
      });
    } catch {
      return { kind: 'unavailable' };
    }
  };
}
