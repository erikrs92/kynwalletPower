import { MESSAGES } from './messages';
import { validateRegistration, type RegistrationData } from './registration';

const VALID: RegistrationData = {
  fullName: 'Diego Martínez',
  email: 'diego@example.test',
  password: 'clave-segura-1',
  confirmPassword: 'clave-segura-1',
  acceptedTerms: true,
};

const validate = (overrides: Partial<RegistrationData>) =>
  validateRegistration({ ...VALID, ...overrides });

describe('validateRegistration · nombre completo (FR-003)', () => {
  it('US2-1: vacío tras recortar → "Ingresa tu nombre completo"', () => {
    expect(validate({ fullName: '' }).fullName).toBe('Ingresa tu nombre completo');
  });

  it('US2-6: solo espacios se trata como vacío', () => {
    expect(validate({ fullName: '    ' }).fullName).toBe(MESSAGES.NAME_REQUIRED);
  });

  it.each([['A'], ['x'.repeat(81)]])(
    'FR-003: "%s" fuera de 2 a 80 caracteres → mensaje de longitud',
    (fullName) => {
      expect(validate({ fullName }).fullName).toBe('El nombre debe tener entre 2 y 80 caracteres');
    },
  );

  it('FR-003: 2 y 80 caracteres son válidos (tras recortar)', () => {
    expect(validate({ fullName: 'Al' }).fullName).toBeUndefined();
    expect(validate({ fullName: `  ${'a'.repeat(80)}  ` }).fullName).toBeUndefined();
  });

  it.each([['Diego123'], ['Ana_@'], ["O'Brien"], ['Ana-María'], ['Dr. Pérez']])(
    'US2-6a: "%s" → "El nombre solo puede contener letras y espacios"',
    (fullName) => {
      expect(validate({ fullName }).fullName).toBe(
        'El nombre solo puede contener letras y espacios',
      );
    },
  );

  it.each([['Diego Martínez'], ['Íñigo Núñez'], ['Ana  María'], ['Güemes Ürrea']])(
    'US2-6b: "%s" es válido',
    (fullName) => {
      expect(validate({ fullName }).fullName).toBeUndefined();
    },
  );
});

describe('validateRegistration · correo (FR-004)', () => {
  it('vacío tras recortar → "Ingresa tu correo electrónico"', () => {
    expect(validate({ email: '   ' }).email).toBe('Ingresa tu correo electrónico');
  });

  it.each([['usuario@'], ['usuario.com'], ['a@b.c'], [`${'a'.repeat(250)}@b.co`]])(
    'US2-2: "%s" → "Ingresa un correo electrónico válido"',
    (email) => {
      expect(validate({ email }).email).toBe('Ingresa un correo electrónico válido');
    },
  );
});

describe('validateRegistration · contraseña (FR-005)', () => {
  it('vacía → "Ingresa tu contraseña"', () => {
    expect(validate({ password: '', confirmPassword: '' }).password).toBe('Ingresa tu contraseña');
  });

  it('US2-3: menos de 8 caracteres', () => {
    expect(validate({ password: '1234567', confirmPassword: '1234567' }).password).toBe(
      'La contraseña debe tener al menos 8 caracteres',
    );
  });

  it('más de 128 caracteres', () => {
    const long = 'x'.repeat(129);
    expect(validate({ password: long, confirmPassword: long }).password).toBe(
      'La contraseña no puede superar 128 caracteres',
    );
  });

  it('no se recorta: 8 espacios son una contraseña válida', () => {
    const spaces = ' '.repeat(8);
    expect(validate({ password: spaces, confirmPassword: spaces }).password).toBeUndefined();
  });
});

describe('validateRegistration · confirmación (FR-006)', () => {
  it('vacía → "Confirma tu contraseña"', () => {
    expect(validate({ confirmPassword: '' }).confirmPassword).toBe('Confirma tu contraseña');
  });

  it('US2-4: distinta → "Las contraseñas no coinciden"', () => {
    expect(validate({ confirmPassword: 'otra-clave-99' }).confirmPassword).toBe(
      'Las contraseñas no coinciden',
    );
  });

  it.each([['CLAVE-SEGURA-1'], [' clave-segura-1'], ['clave-segura-1 ']])(
    'diferencia solo de mayúsculas o espacios ("%s") cuenta como distinta',
    (confirmPassword) => {
      expect(validate({ confirmPassword }).confirmPassword).toBe('Las contraseñas no coinciden');
    },
  );
});

describe('validateRegistration · términos (FR-007)', () => {
  it('US3-1: sin aceptar → "Debes aceptar los términos y condiciones"', () => {
    expect(validate({ acceptedTerms: false }).acceptedTerms).toBe(
      'Debes aceptar los términos y condiciones',
    );
  });
});

describe('validateRegistration · conjunto', () => {
  it('datos válidos → {}', () => {
    expect(validateRegistration(VALID)).toEqual({});
  });

  it('US2-1: todo vacío → los cinco errores', () => {
    const errors = validateRegistration({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptedTerms: false,
    });
    expect(Object.keys(errors)).toEqual([
      'fullName',
      'email',
      'password',
      'confirmPassword',
      'acceptedTerms',
    ]);
  });
});
