import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createAuthenticate } from '@/application/authenticate';
import { createRegister } from '@/application/register';
import { InMemoryAccountStore } from '@/infrastructure/InMemoryAccountStore';
import { InMemoryAuthGateway } from '@/infrastructure/InMemoryAuthGateway';
import { InMemoryRegistrationGateway } from '@/infrastructure/InMemoryRegistrationGateway';
import { expectNoA11yViolations } from '@/test/a11y';
import { createAuthStub } from '@/test/authStub';
import { NEW_ACCOUNT_DATA, TEST_ACCOUNT } from '@/test/fixtures';
import { createRegisterStub } from '@/test/registerStub';
import { App } from './App';

const renderWithStubs = () =>
  render(
    <App authenticate={createAuthStub().authenticate} register={createRegisterStub().register} />,
  );

describe('App · accesibilidad de la pantalla completa (FR-015, SC-005)', () => {
  it('vista de login sin violaciones', async () => {
    const { container } = renderWithStubs();
    await expectNoA11yViolations(container);
  });

  it('vista de login con errores visibles sin violaciones', async () => {
    const { container } = renderWithStubs();
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await userEvent.click(screen.getByRole('button', { name: 'Google' }));
    await expectNoA11yViolations(container);
  });

  it('vista de bienvenida sin violaciones', async () => {
    const { container } = renderWithStubs();
    await userEvent.type(screen.getByLabelText('Correo electrónico'), TEST_ACCOUNT.email);
    await userEvent.type(screen.getByLabelText('Contraseña'), TEST_ACCOUNT.password);
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await screen.findByRole('heading', { name: /Bienvenido,/ });
    await expectNoA11yViolations(container);
  });
});

describe('App · navegación entre pantallas (spec 002, US4)', () => {
  it('N1: cargar /registro muestra el registro', () => {
    window.history.pushState({}, '', '/registro');
    renderWithStubs();
    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument();
    expect(screen.getByText('Comienza tu', { exact: false })).toBeInTheDocument();
  });

  it('N1: cargar /login muestra el inicio de sesión', () => {
    window.history.pushState({}, '', '/login');
    renderWithStubs();
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
  });

  it('N2 y FR-022: una ruta desconocida muestra el login y la URL pasa a /login', () => {
    window.history.pushState({}, '', '/otra');
    renderWithStubs();
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
  });

  it('US4-1: activar "Inicia sesión" muestra el login en /login sin aviso de éxito', async () => {
    window.history.pushState({}, '', '/registro');
    const user = userEvent.setup();
    renderWithStubs();
    await user.click(screen.getByRole('link', { name: 'Inicia sesión' }));

    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('US4-3: activar "Regístrate" muestra el registro vacío en /registro', async () => {
    const user = userEvent.setup();
    renderWithStubs();
    await user.click(screen.getByRole('link', { name: 'Regístrate' }));

    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/registro');
    for (const label of ['Nombre completo', 'Correo electrónico', 'Contraseña']) {
      expect(screen.getByLabelText(label)).toHaveValue('');
    }
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('US4-2: ir a /login y volver al registro no conserva ningún dato', async () => {
    window.history.pushState({}, '', '/registro');
    const user = userEvent.setup();
    renderWithStubs();
    await user.type(screen.getByLabelText('Nombre completo'), 'Diego Martínez');
    await user.type(screen.getByLabelText('Contraseña'), 'fixture-pass-02');
    await user.click(screen.getByRole('link', { name: 'Inicia sesión' }));
    await user.click(screen.getByRole('link', { name: 'Regístrate' }));

    expect(screen.getByLabelText('Nombre completo')).toHaveValue('');
    expect(screen.getByLabelText('Contraseña')).toHaveValue('');
  });

  it('N5: el botón Atrás vuelve a la pantalla anterior', async () => {
    const user = userEvent.setup();
    renderWithStubs();
    await user.click(screen.getByRole('link', { name: 'Regístrate' }));
    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument();

    window.history.back();
    expect(await screen.findByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
  });

  it('N6: al navegar internamente el foco pasa al h1 y el título se actualiza', async () => {
    const user = userEvent.setup();
    renderWithStubs();
    await user.click(screen.getByRole('link', { name: 'Regístrate' }));

    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toHaveFocus();
    expect(document.title).toBe('KynWallet · Crear cuenta');

    await user.click(screen.getByRole('link', { name: 'Inicia sesión' }));
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toHaveFocus();
    expect(document.title).toBe('KynWallet · Iniciar sesión');
  });

  it('N7: en la carga inicial el foco no se mueve, pero el título corresponde a la ruta', () => {
    window.history.pushState({}, '', '/registro');
    renderWithStubs();
    expect(document.body).toHaveFocus();
    expect(document.title).toBe('KynWallet · Crear cuenta');
  });
});

function renderIntegrated() {
  const store = new InMemoryAccountStore([TEST_ACCOUNT]);
  const authenticate = createAuthenticate(new InMemoryAuthGateway(store, { delayMs: 0 }));
  const register = createRegister(new InMemoryRegistrationGateway(store, { delayMs: 0 }));
  return render(<App authenticate={authenticate} register={register} />);
}

async function registerNewAccount(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nombre completo'), NEW_ACCOUNT_DATA.fullName);
  await user.type(screen.getByLabelText('Correo electrónico'), NEW_ACCOUNT_DATA.email);
  await user.type(screen.getByLabelText('Contraseña'), NEW_ACCOUNT_DATA.password);
  await user.type(screen.getByLabelText('Confirmar contraseña'), NEW_ACCOUNT_DATA.confirmPassword);
  await user.click(screen.getByRole('checkbox'));
  await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
}

describe('App · registro de extremo a extremo (spec 002, US1)', () => {
  it('US1-1: crear la cuenta lleva a /login con aviso y correo prellenado', async () => {
    window.history.pushState({}, '', '/registro');
    const user = userEvent.setup();
    renderIntegrated();
    await registerNewAccount(user);

    expect(await screen.findByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Cuenta creada correctamente. Ahora puedes iniciar sesión.',
    );
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue(NEW_ACCOUNT_DATA.email);
    expect(screen.getByLabelText('Contraseña')).toHaveFocus();
    expect(window.location.pathname).toBe('/login');
  });

  it('N8: la URL final es exactamente /login y no contiene datos', async () => {
    window.history.pushState({}, '', '/registro');
    const user = userEvent.setup();
    renderIntegrated();
    await registerNewAccount(user);
    await screen.findByRole('heading', { name: 'Bienvenido de nuevo' });

    expect(window.location.href).toBe(`${window.location.origin}/login`);
    expect(JSON.stringify(window.history.state)).not.toContain(NEW_ACCOUNT_DATA.password);
  });

  it('US1-6: la cuenta creada inicia sesión y ve el nombre registrado', async () => {
    window.history.pushState({}, '', '/registro');
    const user = userEvent.setup();
    renderIntegrated();
    await registerNewAccount(user);
    await screen.findByRole('heading', { name: 'Bienvenido de nuevo' });

    await user.type(screen.getByLabelText('Contraseña'), NEW_ACCOUNT_DATA.password);
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(
      await screen.findByRole('heading', { name: '¡Bienvenido, Diego Martínez!' }),
    ).toBeInTheDocument();
  });

  it('US1-7 y US1-9: montar App de nuevo (recarga) deja el login vacío y la cuenta no existe', async () => {
    window.history.pushState({}, '', '/registro');
    const user = userEvent.setup();
    const first = renderIntegrated();
    await registerNewAccount(user);
    await screen.findByRole('heading', { name: 'Bienvenido de nuevo' });
    first.unmount();

    renderIntegrated();
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('');
    expect(screen.getByLabelText('Contraseña')).toHaveValue('');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Correo electrónico'), NEW_ACCOUNT_DATA.email);
    await user.type(screen.getByLabelText('Contraseña'), NEW_ACCOUNT_DATA.password);
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos');
  });
});

describe('App · accesibilidad del registro (FR-019, SC-005)', () => {
  const openRegister = () => window.history.pushState({}, '', '/registro');

  it('vista de registro vacía sin violaciones', async () => {
    openRegister();
    const { container } = renderWithStubs();
    await expectNoA11yViolations(container);
  });

  it('registro con todos los errores visibles sin violaciones', async () => {
    openRegister();
    const { container } = renderWithStubs();
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    await expectNoA11yViolations(container);
  });

  it('registro con "Este correo ya está registrado" sin violaciones', async () => {
    openRegister();
    const user = userEvent.setup();
    const { container } = renderIntegrated();
    await user.type(screen.getByLabelText('Nombre completo'), NEW_ACCOUNT_DATA.fullName);
    await user.type(screen.getByLabelText('Correo electrónico'), TEST_ACCOUNT.email);
    await user.type(screen.getByLabelText('Contraseña'), NEW_ACCOUNT_DATA.password);
    await user.type(
      screen.getByLabelText('Confirmar contraseña'),
      NEW_ACCOUNT_DATA.confirmPassword,
    );
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    await vi.waitFor(() =>
      expect(screen.getByLabelText('Correo electrónico')).toHaveAccessibleDescription(
        'Este correo ya está registrado',
      ),
    );
    await expectNoA11yViolations(container);
  });

  it('registro con el aviso "Próximamente" sin violaciones', async () => {
    openRegister();
    const { container } = renderWithStubs();
    await userEvent.click(screen.getByRole('button', { name: 'Google' }));
    await expectNoA11yViolations(container);
  });

  it('registro con el diálogo de términos abierto sin violaciones', async () => {
    openRegister();
    const { container } = renderWithStubs();
    await userEvent.click(screen.getByRole('button', { name: 'términos y condiciones' }));
    expect(screen.getByRole('dialog', { name: 'Términos y condiciones' })).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it('login con el aviso de registro exitoso sin violaciones', async () => {
    openRegister();
    const user = userEvent.setup();
    const { container } = renderIntegrated();
    await registerNewAccount(user);
    await screen.findByRole('status');
    await expectNoA11yViolations(container);
  });
});

describe('App · seguridad del registro (FR-012, N8, R6)', () => {
  async function runFlow(email: string) {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const consoleSpies = (['log', 'info', 'warn', 'error', 'debug'] as const).map((method) =>
      vi.spyOn(console, method),
    );
    window.history.pushState({}, '', '/registro');
    const user = userEvent.setup();
    renderIntegrated();
    await user.type(screen.getByLabelText('Nombre completo'), NEW_ACCOUNT_DATA.fullName);
    await user.type(screen.getByLabelText('Correo electrónico'), email);
    await user.type(screen.getByLabelText('Contraseña'), NEW_ACCOUNT_DATA.password);
    await user.type(
      screen.getByLabelText('Confirmar contraseña'),
      NEW_ACCOUNT_DATA.confirmPassword,
    );
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    await vi.waitFor(() => {
      const failed = screen.queryByLabelText('Correo electrónico')?.hasAttribute('aria-invalid');
      const onLogin = window.location.pathname === '/login';
      expect(failed || onLogin).toBe(true);
    });

    const serialized = [
      document.body.textContent ?? '',
      window.location.href,
      JSON.stringify(window.history.state),
      ...setItem.mock.calls.flat(),
      ...consoleSpies.flatMap((spy) => spy.mock.calls.flat().map(String)),
    ].join('\n');
    const stored = setItem.mock.calls.length;
    setItem.mockRestore();
    consoleSpies.forEach((spy) => spy.mockRestore());
    return { serialized, stored };
  }

  it('FR-012: tras un registro exitoso la contraseña no aparece en el DOM, la URL, el historial, la consola ni el almacenamiento', async () => {
    const { serialized, stored } = await runFlow(NEW_ACCOUNT_DATA.email);
    expect(serialized).not.toContain(NEW_ACCOUNT_DATA.password);
    expect(stored).toBe(0);
    expect(window.location.pathname).toBe('/login');
  });

  it('FR-012: tras un registro fallido (correo duplicado) la contraseña tampoco aparece', async () => {
    const { serialized, stored } = await runFlow(TEST_ACCOUNT.email);
    expect(serialized).not.toContain(NEW_ACCOUNT_DATA.password);
    expect(stored).toBe(0);
    expect(window.location.pathname).toBe('/registro');
  });
});
