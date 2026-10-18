import {
  initialRegisterState,
  registerReducer,
  type RegisterState,
  type RegisterTextField,
} from './registerReducer';

const fill = () =>
  [
    { type: 'change', field: 'fullName', value: 'Diego Martínez' },
    { type: 'change', field: 'email', value: 'nueva@example.test' },
    { type: 'change', field: 'password', value: 'fixture-pass-02' },
    { type: 'change', field: 'confirmPassword', value: 'fixture-pass-02' },
    { type: 'toggleTerms', checked: true },
  ] as const;

const filled = () => fill().reduce(registerReducer, initialRegisterState);

describe('registerReducer (data-model.md RegisterFormState)', () => {
  it('estado inicial: editing con valores vacíos, términos sin aceptar y sin errores', () => {
    expect(initialRegisterState).toMatchObject({
      status: 'editing',
      values: { fullName: '', email: '', password: '', confirmPassword: '' },
      acceptedTerms: false,
      fieldErrors: {},
      serverError: null,
      notice: null,
      termsOpen: false,
    });
  });

  it('change actualiza el campo indicado', () => {
    const state = registerReducer(initialRegisterState, {
      type: 'change',
      field: 'email',
      value: 'a@b.co',
    });
    expect(state.values.email).toBe('a@b.co');
  });

  it('toggleTerms alterna la casilla', () => {
    const state = registerReducer(initialRegisterState, { type: 'toggleTerms', checked: true });
    expect(state.acceptedTerms).toBe(true);
  });

  it('US1-1: submit con datos válidos → submitting', () => {
    expect(registerReducer(filled(), { type: 'submit' }).status).toBe('submitting');
  });

  it('FR-010: un segundo submit en submitting se ignora', () => {
    const submitting = registerReducer(filled(), { type: 'submit' });
    expect(registerReducer(submitting, { type: 'submit' })).toBe(submitting);
  });

  it('US1-1: result success devuelve el formulario a editing sin errores', () => {
    const submitting = registerReducer(filled(), { type: 'submit' });
    const state = registerReducer(submitting, { type: 'result', result: { kind: 'success' } });
    expect(state.status).toBe('editing');
    expect(state.serverError).toBeNull();
  });
});

describe('registerReducer · validación y errores del servidor (US2)', () => {
  const change = (state: RegisterState, field: RegisterTextField, value: string) =>
    registerReducer(state, { type: 'change', field, value });

  it('FR-008: blur marca el campo como tocado y muestra su error', () => {
    const state = registerReducer(initialRegisterState, { type: 'blur', field: 'email' });
    expect(state.touched.email).toBe(true);
    expect(state.fieldErrors).toEqual({ email: 'Ingresa tu correo electrónico' });
  });

  it('FR-008: un campo sin tocar no muestra error aunque sea inválido', () => {
    const state = change(initialRegisterState, 'email', 'usuario@');
    expect(state.fieldErrors).toEqual({});
  });

  it('FR-009: submit con errores marca todo como tocado, queda en editing y no envía', () => {
    const state = registerReducer(initialRegisterState, { type: 'submit' });
    expect(state.status).toBe('editing');
    expect(Object.values(state.touched).every(Boolean)).toBe(true);
    expect(Object.keys(state.fieldErrors)).toEqual([
      'fullName',
      'email',
      'password',
      'confirmPassword',
      'acceptedTerms',
    ]);
  });

  it('US2-7: change en un campo con error lo oculta si ya es válido', () => {
    let state = registerReducer(initialRegisterState, { type: 'blur', field: 'email' });
    state = change(state, 'email', 'diego@example.test');
    expect(state.fieldErrors.email).toBeUndefined();
  });

  it('US2-5: cambiar la contraseña revalida la confirmación solo si ya fue tocada', () => {
    let state = change(initialRegisterState, 'password', 'fixture-pass-02');
    state = change(state, 'confirmPassword', 'fixture-pass-02');
    state = change(state, 'password', 'fixture-pass-02-x');
    expect(state.fieldErrors.confirmPassword).toBeUndefined();

    state = registerReducer(state, { type: 'blur', field: 'confirmPassword' });
    expect(state.fieldErrors.confirmPassword).toBe('Las contraseñas no coinciden');
    state = change(state, 'password', 'fixture-pass-02');
    expect(state.fieldErrors.confirmPassword).toBeUndefined();
  });

  it('US3-2: marcar la casilla borra su error', () => {
    let state = registerReducer(initialRegisterState, { type: 'submit' });
    expect(state.fieldErrors.acceptedTerms).toBeDefined();
    state = registerReducer(state, { type: 'toggleTerms', checked: true });
    expect(state.fieldErrors.acceptedTerms).toBeUndefined();
  });

  it('US2-9: email-taken → serverError y todos los valores conservados', () => {
    const submitting = registerReducer(filled(), { type: 'submit' });
    const state = registerReducer(submitting, { type: 'result', result: { kind: 'email-taken' } });
    expect(state.status).toBe('serverError');
    expect(state.serverError).toBe('email-taken');
    expect(state.values).toEqual(filled().values);
    expect(state.acceptedTerms).toBe(true);
  });

  it('FR-020: unavailable → serverError global con los valores conservados', () => {
    const submitting = registerReducer(filled(), { type: 'submit' });
    const state = registerReducer(submitting, { type: 'result', result: { kind: 'unavailable' } });
    expect(state.serverError).toBe('unavailable');
    expect(state.values).toEqual(filled().values);
  });

  it('US2-9: editar el correo en serverError vuelve a editing y limpia el error', () => {
    const submitting = registerReducer(filled(), { type: 'submit' });
    const taken = registerReducer(submitting, { type: 'result', result: { kind: 'email-taken' } });
    const edited = change(taken, 'email', 'otra@example.test');
    expect(edited.status).toBe('editing');
    expect(edited.serverError).toBeNull();
  });

  it('editar otro campo conserva el error de correo duplicado', () => {
    const submitting = registerReducer(filled(), { type: 'submit' });
    const taken = registerReducer(submitting, { type: 'result', result: { kind: 'email-taken' } });
    expect(change(taken, 'fullName', 'Ana María').serverError).toBe('email-taken');
  });

  it('FR-020: editar cualquier campo limpia el error global unavailable', () => {
    const submitting = registerReducer(filled(), { type: 'submit' });
    const down = registerReducer(submitting, { type: 'result', result: { kind: 'unavailable' } });
    expect(change(down, 'password', 'fixture-pass-03').serverError).toBeNull();
  });

  it('5.1: result invalid muestra sus errores como errores de campo', () => {
    const submitting = registerReducer(filled(), { type: 'submit' });
    const state = registerReducer(submitting, {
      type: 'result',
      result: { kind: 'invalid', errors: { email: 'Ingresa un correo electrónico válido' } },
    });
    expect(state.status).toBe('editing');
    expect(state.fieldErrors).toEqual({ email: 'Ingresa un correo electrónico válido' });
  });

  it('un nuevo submit tras serverError vuelve a enviar y limpia el error', () => {
    const submitting = registerReducer(filled(), { type: 'submit' });
    const taken = registerReducer(submitting, { type: 'result', result: { kind: 'email-taken' } });
    const again = registerReducer(taken, { type: 'submit' });
    expect(again.status).toBe('submitting');
    expect(again.serverError).toBeNull();
  });

  it('FR-021: openTerms y closeTerms alternan el diálogo sin tocar la casilla ni los datos', () => {
    const open = registerReducer(filled(), { type: 'openTerms' });
    expect(open.termsOpen).toBe(true);
    expect(open.acceptedTerms).toBe(true);
    expect(open.values).toEqual(filled().values);
    expect(registerReducer(open, { type: 'closeTerms' }).termsOpen).toBe(false);
  });

  it('FR-014: showNotice guarda el aviso, uno nuevo lo reemplaza y submit lo limpia', () => {
    const first = registerReducer(filled(), { type: 'showNotice', message: 'Próximamente' });
    expect(first.notice).toBe('Próximamente');
    const second = registerReducer(first, { type: 'showNotice', message: 'Otro' });
    expect(second.notice).toBe('Otro');
    expect(registerReducer(second, { type: 'submit' }).notice).toBeNull();
  });
});
