import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRegisterStub } from '@/test/registerStub';
import { NEW_ACCOUNT_DATA } from '@/test/fixtures';
import { RegisterForm } from './RegisterForm';

function setup(stub = createRegisterStub()) {
  const onRegistered = vi.fn();
  const user = userEvent.setup();
  render(<RegisterForm register={stub.register} onRegistered={onRegistered} />);
  const field = (name: string) => screen.getByLabelText(name);

  async function fillValid(overrides: Partial<typeof NEW_ACCOUNT_DATA> = {}) {
    const data = { ...NEW_ACCOUNT_DATA, ...overrides };
    await user.type(field('Nombre completo'), data.fullName);
    await user.type(field('Correo electrónico'), data.email);
    await user.type(field('Contraseña'), data.password);
    await user.type(field('Confirmar contraseña'), data.confirmPassword);
    if (data.acceptedTerms) await user.click(screen.getByRole('checkbox'));
  }
  const submitButton = () => screen.getByRole('button', { name: /Crear cuenta|Creando cuenta/ });

  return { stub, onRegistered, user, field, fillValid, submitButton };
}

describe('RegisterForm · US1 crear una cuenta con datos válidos', () => {
  it('US1-1: datos válidos → se llama a register una vez y se notifica el correo', async () => {
    const { stub, onRegistered, user, fillValid, submitButton } = setup();
    await fillValid();
    await user.click(submitButton());

    expect(stub.mock).toHaveBeenCalledOnce();
    expect(stub.mock).toHaveBeenCalledWith(NEW_ACCOUNT_DATA);
    await vi.waitFor(() => expect(onRegistered).toHaveBeenCalledWith('nueva@example.test'));
  });

  it('US1-2: durante la espera el botón carga, queda deshabilitado y no admite más envíos', async () => {
    const stub = createRegisterStub();
    stub.defer();
    const { user, fillValid, submitButton } = setup(stub);
    await fillValid();
    await user.click(submitButton());

    const button = screen.getByRole('button', { name: 'Creando cuenta…' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
    await user.click(button);
    expect(stub.mock).toHaveBeenCalledOnce();
  });

  it('US1-3: correo con mayúsculas y espacios se notifica normalizado', async () => {
    const { stub, onRegistered, user, fillValid, submitButton } = setup();
    await fillValid({ email: '  Nueva@Example.TEST ' });
    await user.click(submitButton());

    expect(stub.mock).toHaveBeenCalledOnce();
    await vi.waitFor(() => expect(onRegistered).toHaveBeenCalledWith('nueva@example.test'));
  });

  it.each(['Nombre completo', 'Correo electrónico', 'Contraseña', 'Confirmar contraseña'])(
    'US1-4: Enter en "%s" envía el formulario',
    async (label) => {
      const { stub, user, fillValid, field } = setup();
      await fillValid();
      await user.type(field(label), '{Enter}');
      expect(stub.mock).toHaveBeenCalledOnce();
    },
  );
});

describe('RegisterForm · US2 validación antes de enviar', () => {
  it('US2-1: envío vacío → los cinco mensajes, register no invocado y foco en el nombre', async () => {
    const { stub, user, field, submitButton } = setup();
    await user.click(submitButton());

    expect(screen.getByText('Ingresa tu nombre completo')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu correo electrónico')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu contraseña')).toBeInTheDocument();
    expect(screen.getByText('Confirma tu contraseña')).toBeInTheDocument();
    expect(screen.getByText('Debes aceptar los términos y condiciones')).toBeInTheDocument();
    expect(stub.mock).not.toHaveBeenCalled();
    expect(field('Nombre completo')).toHaveFocus();
  });

  it.each([
    ['correo', { email: 'usuario@' }, 'Correo electrónico'],
    ['contraseña', { password: '1234567', confirmPassword: '1234567' }, 'Contraseña'],
    ['confirmación', { confirmPassword: 'otra-clave-99' }, 'Confirmar contraseña'],
  ])('FR-009: con error en %s el foco va a ese campo', async (_name, overrides, label) => {
    const { stub, user, field, fillValid, submitButton } = setup();
    await fillValid(overrides);
    await user.click(submitButton());
    expect(field(label)).toHaveFocus();
    expect(stub.mock).not.toHaveBeenCalled();
  });

  it('FR-009: con solo los términos sin aceptar el foco va a la casilla', async () => {
    const { stub, user, fillValid, submitButton } = setup();
    await fillValid({ acceptedTerms: false });
    await user.click(submitButton());
    expect(screen.getByRole('checkbox')).toHaveFocus();
    expect(stub.mock).not.toHaveBeenCalled();
  });

  it('US2-2: "usuario@" y salir del campo → "Ingresa un correo electrónico válido"', async () => {
    const { user, field } = setup();
    await user.type(field('Correo electrónico'), 'usuario@');
    await user.tab();
    expect(field('Correo electrónico')).toHaveAccessibleDescription(
      'Ingresa un correo electrónico válido',
    );
  });

  it('US2-3: contraseña de 7 caracteres → mensaje de longitud y register no invocado', async () => {
    const { stub, user, field, fillValid, submitButton } = setup();
    await fillValid({ password: '1234567', confirmPassword: '1234567' });
    await user.click(submitButton());
    expect(field('Contraseña')).toHaveAccessibleDescription(
      'La contraseña debe tener al menos 8 caracteres',
    );
    expect(stub.mock).not.toHaveBeenCalled();
  });

  it('US2-4: confirmación distinta y salir del campo → "Las contraseñas no coinciden"', async () => {
    const { user, field } = setup();
    await user.type(field('Contraseña'), 'fixture-pass-02');
    await user.type(field('Confirmar contraseña'), 'otra-clave-99');
    await user.tab();
    expect(field('Confirmar contraseña')).toHaveAccessibleDescription(
      'Las contraseñas no coinciden',
    );
  });

  it('US2-5: cambiar la contraseña tras validar la confirmación muestra el error sin enviar', async () => {
    const { stub, user, field } = setup();
    await user.type(field('Contraseña'), 'fixture-pass-02');
    await user.type(field('Confirmar contraseña'), 'fixture-pass-02');
    await user.tab();
    expect(field('Confirmar contraseña')).not.toHaveAccessibleDescription();

    await user.type(field('Contraseña'), 'x');
    expect(field('Confirmar contraseña')).toHaveAccessibleDescription(
      'Las contraseñas no coinciden',
    );
    expect(stub.mock).not.toHaveBeenCalled();
  });

  it('US2-6: un nombre de solo espacios se trata como vacío', async () => {
    const { user, field, fillValid, submitButton } = setup();
    await fillValid({ fullName: '    ' });
    await user.click(submitButton());
    expect(field('Nombre completo')).toHaveAccessibleDescription('Ingresa tu nombre completo');
  });

  it('US2-6a: un nombre con números o símbolos → "El nombre solo puede contener letras y espacios"', async () => {
    const { user, field } = setup();
    await user.type(field('Nombre completo'), 'Diego123');
    await user.tab();
    expect(field('Nombre completo')).toHaveAccessibleDescription(
      'El nombre solo puede contener letras y espacios',
    );
  });

  it('US2-6b: un nombre con tildes, diéresis o ñ se acepta', async () => {
    const { stub, user, fillValid, submitButton } = setup();
    await fillValid({ fullName: 'Íñigo Núñez' });
    await user.click(submitButton());
    expect(stub.mock).toHaveBeenCalledOnce();
  });

  it('US2-7: corregir el valor oculta el mensaje de ese campo', async () => {
    const { user, field } = setup();
    await user.type(field('Correo electrónico'), 'usuario@');
    await user.tab();
    expect(field('Correo electrónico')).toHaveAccessibleDescription(/válido/);

    await user.clear(field('Correo electrónico'));
    await user.type(field('Correo electrónico'), 'diego@example.test');
    expect(field('Correo electrónico')).not.toHaveAccessibleDescription();
    expect(field('Correo electrónico')).not.toHaveAttribute('aria-invalid');
  });

  it('US2-8: un campo con error está marcado como inválido y descrito por su mensaje', async () => {
    const { user, field, submitButton } = setup();
    await user.click(submitButton());
    for (const label of ['Nombre completo', 'Correo electrónico', 'Contraseña']) {
      expect(field(label)).toHaveAttribute('aria-invalid', 'true');
      expect(field(label)).toHaveAccessibleDescription();
    }
  });

  it('Caso límite: el texto pegado se valida igual que el escrito', async () => {
    const { user, field } = setup();
    await user.click(field('Correo electrónico'));
    await user.paste('usuario.com');
    await user.tab();
    expect(field('Correo electrónico')).toHaveAccessibleDescription(
      'Ingresa un correo electrónico válido',
    );
  });
});

describe('RegisterForm · US3 términos y condiciones', () => {
  it('US3-1: datos válidos sin marcar la casilla → mensaje junto a la casilla y sin envío', async () => {
    const { stub, user, fillValid, submitButton } = setup();
    await fillValid({ acceptedTerms: false });
    await user.click(submitButton());
    expect(screen.getByRole('checkbox')).toHaveAccessibleDescription(
      'Debes aceptar los términos y condiciones',
    );
    expect(stub.mock).not.toHaveBeenCalled();
  });

  it('US3-1: marcar la casilla y enviar procede con el registro', async () => {
    const { stub, user, fillValid, submitButton } = setup();
    await fillValid({ acceptedTerms: false });
    await user.click(submitButton());
    await user.click(screen.getByRole('checkbox'));
    await user.click(submitButton());
    expect(stub.mock).toHaveBeenCalledOnce();
  });

  it('US3-2: marcar la casilla oculta el mensaje', async () => {
    const { user, submitButton } = setup();
    await user.click(submitButton());
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAccessibleDescription();
    await user.click(checkbox);
    expect(checkbox).not.toHaveAccessibleDescription();
    expect(checkbox).not.toHaveAttribute('aria-invalid');
  });

  it('US3-3: la casilla se alcanza con Tab, se alterna con Espacio y tiene su nombre accesible', async () => {
    const { user, field } = setup();
    await user.click(field('Confirmar contraseña'));
    await user.tab(); // control de visibilidad de la confirmación
    await user.tab();
    const checkbox = screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' });
    expect(checkbox).toHaveFocus();
    await user.keyboard(' ');
    expect(checkbox).toBeChecked();
  });

  it('US3-4: activar "términos y condiciones" abre el diálogo sin alterar la casilla ni los datos', async () => {
    const { user, field, fillValid } = setup();
    await fillValid({ acceptedTerms: false });
    await user.click(screen.getByRole('button', { name: 'términos y condiciones' }));

    expect(screen.getByRole('dialog', { name: 'Términos y condiciones' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    expect(field('Nombre completo')).toHaveValue(NEW_ACCOUNT_DATA.fullName);
    expect(field('Correo electrónico')).toHaveValue(NEW_ACCOUNT_DATA.email);
  });

  it('US3-5: "Cerrar" cierra el diálogo y el foco vuelve al enlace "términos y condiciones"', async () => {
    const { user } = setup();
    const link = screen.getByRole('button', { name: 'términos y condiciones' });
    await user.click(link);
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(link).toHaveFocus();
  });

  it('US3-5: Escape (cancel y close del navegador) cierra el diálogo y devuelve el foco', async () => {
    const { user } = setup();
    const link = screen.getByRole('button', { name: 'términos y condiciones' });
    await user.click(link);
    const dialog = screen.getByRole('dialog');
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    dialog.removeAttribute('open');
    fireEvent(dialog, new Event('close'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(link).toHaveFocus();
  });
});

describe('RegisterForm · US2-9 correo ya registrado y errores del servicio', () => {
  it('US2-9: email-taken → mensaje bajo el correo, foco en el correo y datos conservados', async () => {
    const stub = createRegisterStub({ kind: 'email-taken' });
    const { onRegistered, user, field, fillValid, submitButton } = setup(stub);
    await fillValid();
    await user.click(submitButton());

    const email = field('Correo electrónico');
    await vi.waitFor(() =>
      expect(email).toHaveAccessibleDescription('Este correo ya está registrado'),
    );
    expect(email).toHaveFocus();
    expect(field('Nombre completo')).toHaveValue(NEW_ACCOUNT_DATA.fullName);
    expect(field('Contraseña')).toHaveValue(NEW_ACCOUNT_DATA.password);
    expect(field('Confirmar contraseña')).toHaveValue(NEW_ACCOUNT_DATA.confirmPassword);
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(onRegistered).not.toHaveBeenCalled();
  });

  it('US2-9: editar el correo oculta el error de correo duplicado', async () => {
    const stub = createRegisterStub({ kind: 'email-taken' });
    const { user, field, fillValid, submitButton } = setup(stub);
    await fillValid();
    await user.click(submitButton());
    await vi.waitFor(() =>
      expect(field('Correo electrónico')).toHaveAccessibleDescription(
        'Este correo ya está registrado',
      ),
    );
    await user.type(field('Correo electrónico'), 'x');
    expect(field('Correo electrónico')).not.toHaveAccessibleDescription();
  });

  it('FR-020: unavailable → alert "Servicio de registro no disponible…" y datos conservados', async () => {
    const stub = createRegisterStub({ kind: 'unavailable' });
    const { onRegistered, user, field, fillValid, submitButton } = setup(stub);
    await fillValid();
    await user.click(submitButton());

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Servicio de registro no disponible. Intenta más tarde.',
    );
    expect(field('Nombre completo')).toHaveValue(NEW_ACCOUNT_DATA.fullName);
    expect(onRegistered).not.toHaveBeenCalled();
  });

  it('5.1: un resultado invalid se muestra como errores de campo', async () => {
    const stub = createRegisterStub({
      kind: 'invalid',
      errors: { email: 'Ingresa un correo electrónico válido' },
    });
    const { user, field, fillValid, submitButton } = setup(stub);
    await fillValid();
    await user.click(submitButton());
    await vi.waitFor(() =>
      expect(field('Correo electrónico')).toHaveAccessibleDescription(
        'Ingresa un correo electrónico válido',
      ),
    );
  });
});

describe('RegisterForm · US4 volver al inicio de sesión', () => {
  it('US4-1: el pie muestra "¿Ya tienes cuenta?" y un enlace "Inicia sesión" hacia /login', () => {
    setup();
    expect(screen.getByText('¿Ya tienes cuenta?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Inicia sesión' })).toHaveAttribute('href', '/login');
  });
});

describe('RegisterForm · US5 Google y Apple, aún no disponibles', () => {
  it('FR-001: muestra el separador "o regístrate con" y los botones Google y Apple', () => {
    setup();
    expect(screen.getByText('o regístrate con')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Google' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apple' })).toBeInTheDocument();
  });

  it.each(['Google', 'Apple'])(
    'US5-1: "%s" muestra "Próximamente" y conserva los datos ingresados',
    async (name) => {
      const { stub, user, field, fillValid } = setup();
      await fillValid();
      await user.click(screen.getByRole('button', { name }));

      expect(screen.getByRole('status')).toHaveTextContent('Próximamente');
      expect(field('Nombre completo')).toHaveValue(NEW_ACCOUNT_DATA.fullName);
      expect(field('Correo electrónico')).toHaveValue(NEW_ACCOUNT_DATA.email);
      expect(field('Contraseña')).toHaveValue(NEW_ACCOUNT_DATA.password);
      expect(screen.getByRole('checkbox')).toBeChecked();
      expect(stub.mock).not.toHaveBeenCalled();
    },
  );

  it('US5-2: el aviso es un role="status" y no mueve el foco', async () => {
    const { user } = setup();
    const google = screen.getByRole('button', { name: 'Google' });
    await user.click(google);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(google).toHaveFocus();
  });

  it('un aviso nuevo reemplaza al anterior y enviar el formulario lo limpia', async () => {
    const { user, submitButton } = setup();
    await user.click(screen.getByRole('button', { name: 'Google' }));
    await user.click(screen.getByRole('button', { name: 'Apple' }));
    expect(screen.getAllByRole('status')).toHaveLength(1);

    await user.click(submitButton());
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
