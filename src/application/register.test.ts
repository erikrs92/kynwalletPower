import type { RegisterResult } from '@/domain/auth';
import { NEW_ACCOUNT_DATA } from '@/test/fixtures';
import { createRegister } from './register';

const gatewayReturning = (result: RegisterResult) => ({
  register: vi.fn().mockResolvedValue(result),
});

describe('createRegister (contracts/registration-gateway.md)', () => {
  it('US1-1: delega una cuenta con correo normalizado, contraseña intacta y nombre recortado', async () => {
    const gateway = gatewayReturning({ kind: 'success' });
    const result = await createRegister(gateway)({
      ...NEW_ACCOUNT_DATA,
      fullName: '  Diego Martínez ',
      email: '  Nueva@Example.TEST ',
      password: ' fixture-pass-02 ',
      confirmPassword: ' fixture-pass-02 ',
    });
    expect(result).toEqual({ kind: 'success' });
    expect(gateway.register).toHaveBeenCalledWith({
      email: 'nueva@example.test',
      password: ' fixture-pass-02 ',
      displayName: 'Diego Martínez',
    });
  });

  it('descarta confirmPassword y acceptedTerms antes de delegar', async () => {
    const gateway = gatewayReturning({ kind: 'success' });
    await createRegister(gateway)(NEW_ACCOUNT_DATA);
    const [account] = gateway.register.mock.calls[0] as [Record<string, unknown>];
    expect(Object.keys(account).sort()).toEqual(['displayName', 'email', 'password']);
  });

  it('5.1: datos inválidos → invalid con los errores, sin llamar al gateway', async () => {
    const gateway = gatewayReturning({ kind: 'success' });
    const result = await createRegister(gateway)({
      ...NEW_ACCOUNT_DATA,
      confirmPassword: 'otra-clave-99',
      acceptedTerms: false,
    });
    expect(result).toEqual({
      kind: 'invalid',
      errors: {
        confirmPassword: 'Las contraseñas no coinciden',
        acceptedTerms: 'Debes aceptar los términos y condiciones',
      },
    });
    expect(gateway.register).not.toHaveBeenCalled();
  });

  it.each<RegisterResult>([{ kind: 'email-taken' }, { kind: 'unavailable' }])(
    'devuelve el resultado %o del gateway',
    async (expected) => {
      const result = await createRegister(gatewayReturning(expected))(NEW_ACCOUNT_DATA);
      expect(result).toEqual(expected);
    },
  );

  it('FR-020: si el gateway lanza una excepción devuelve unavailable sin rechazar', async () => {
    const gateway = { register: vi.fn().mockRejectedValue(new Error('boom')) };
    await expect(createRegister(gateway)(NEW_ACCOUNT_DATA)).resolves.toEqual({
      kind: 'unavailable',
    });
  });
});
