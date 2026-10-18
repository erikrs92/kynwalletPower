import { NEW_ACCOUNT_DATA, TEST_ACCOUNT } from '@/test/fixtures';
import { InMemoryAccountStore } from './InMemoryAccountStore';
import { InMemoryAuthGateway } from './InMemoryAuthGateway';
import { InMemoryRegistrationGateway } from './InMemoryRegistrationGateway';

const NEW_ACCOUNT = {
  email: NEW_ACCOUNT_DATA.email,
  password: NEW_ACCOUNT_DATA.password,
  displayName: NEW_ACCOUNT_DATA.fullName,
};

const setup = (accounts: (typeof TEST_ACCOUNT)[] | null = [TEST_ACCOUNT]) => {
  const store = new InMemoryAccountStore(accounts);
  return {
    store,
    registration: new InMemoryRegistrationGateway(store, { delayMs: 0 }),
    auth: new InMemoryAuthGateway(store, { delayMs: 0 }),
  };
};

describe('InMemoryRegistrationGateway (contracts/registration-gateway.md)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('R1: correo nuevo → success', async () => {
    await expect(setup().registration.register(NEW_ACCOUNT)).resolves.toEqual({
      kind: 'success',
    });
  });

  it('C7 y US1-6: la cuenta creada inicia sesión con el displayName registrado', async () => {
    const { registration, auth } = setup();
    await registration.register(NEW_ACCOUNT);
    await expect(
      auth.authenticate({ email: NEW_ACCOUNT.email, password: NEW_ACCOUNT.password }),
    ).resolves.toEqual({ kind: 'success', displayName: 'Diego Martínez' });
  });

  it('US1-7: un almacén nuevo (equivale a recargar) no conoce la cuenta creada', async () => {
    const first = setup();
    await first.registration.register(NEW_ACCOUNT);
    const afterReload = setup();
    await expect(
      afterReload.auth.authenticate({
        email: NEW_ACCOUNT.email,
        password: NEW_ACCOUNT.password,
      }),
    ).resolves.toEqual({ kind: 'invalid-credentials' });
  });

  it('R4: almacén no disponible → unavailable', async () => {
    await expect(setup(null).registration.register(NEW_ACCOUNT)).resolves.toEqual({
      kind: 'unavailable',
    });
  });

  it('R5: una excepción interna → unavailable sin rechazar la promesa', async () => {
    const { store, registration } = setup();
    vi.spyOn(store, 'add').mockImplementation(() => {
      throw new Error('boom');
    });
    await expect(registration.register(NEW_ACCOUNT)).resolves.toEqual({ kind: 'unavailable' });
  });

  it('R6: el resultado nunca contiene la contraseña', async () => {
    const result = await setup().registration.register(NEW_ACCOUNT);
    expect(JSON.stringify(result)).not.toContain(NEW_ACCOUNT.password);
  });

  it('FR-010: espera delayMs antes de responder (1000 ms por defecto)', async () => {
    vi.useFakeTimers();
    const onResolve = vi.fn();
    new InMemoryRegistrationGateway(new InMemoryAccountStore([TEST_ACCOUNT]))
      .register(NEW_ACCOUNT)
      .then(onResolve);
    await vi.advanceTimersByTimeAsync(999);
    expect(onResolve).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(onResolve).toHaveBeenCalledOnce();
  });

  it.each([
    ['misma capitalización', TEST_ACCOUNT.email],
    ['otra capitalización y espacios', `  ${TEST_ACCOUNT.email.toUpperCase()} `],
  ])(
    'R2: correo de una cuenta de demostración (%s) → email-taken sin crear cuenta',
    async (_l, email) => {
      const { registration, auth } = setup();
      await expect(
        registration.register({ ...NEW_ACCOUNT, email, displayName: 'Impostor' }),
      ).resolves.toEqual({ kind: 'email-taken' });
      await expect(
        auth.authenticate({ email: TEST_ACCOUNT.email, password: NEW_ACCOUNT.password }),
      ).resolves.toEqual({ kind: 'invalid-credentials' });
    },
  );

  it('R3: correo de una cuenta creada antes en la sesión → email-taken', async () => {
    const { registration } = setup();
    await registration.register(NEW_ACCOUNT);
    await expect(
      registration.register({ ...NEW_ACCOUNT, email: ` ${NEW_ACCOUNT.email.toUpperCase()}` }),
    ).resolves.toEqual({ kind: 'email-taken' });
  });

  it('R7: dos llamadas concurrentes con el mismo correo → una success y otra email-taken', async () => {
    const { registration } = setup();
    const results = await Promise.all([
      registration.register(NEW_ACCOUNT),
      registration.register(NEW_ACCOUNT),
    ]);
    expect(results.map((result) => result.kind).sort()).toEqual(['email-taken', 'success']);
  });
});
