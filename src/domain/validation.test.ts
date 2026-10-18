import { MESSAGES } from './messages';
import { normalizeEmail, validateCredentials, validateEmail, validatePassword } from './validation';

describe('validateEmail y validatePassword (reutilizadas por el registro)', () => {
  it('FR-004: validateEmail devuelve los mismos mensajes y límites que el login', () => {
    expect(validateEmail('  ')).toBe(MESSAGES.EMAIL_REQUIRED);
    expect(validateEmail('usuario@')).toBe(MESSAGES.EMAIL_INVALID);
    expect(validateEmail(`${'a'.repeat(250)}@b.co`)).toBe(MESSAGES.EMAIL_INVALID);
    expect(validateEmail('  Demo@Example.COM ')).toBeUndefined();
  });

  it('FR-005: validatePassword valida 8 a 128 caracteres sin recortar', () => {
    expect(validatePassword('')).toBe(MESSAGES.PASSWORD_REQUIRED);
    expect(validatePassword('1234567')).toBe(MESSAGES.PASSWORD_TOO_SHORT);
    expect(validatePassword('x'.repeat(129))).toBe(MESSAGES.PASSWORD_TOO_LONG);
    expect(validatePassword(' '.repeat(8))).toBeUndefined();
  });
});

describe('normalizeEmail', () => {
  it('US1-3: recorta espacios periféricos y convierte a minúsculas', () => {
    expect(normalizeEmail('  Demo@Example.COM ')).toBe('demo@example.com');
  });

  it('no altera el contenido interior', () => {
    expect(normalizeEmail('a.b+c@d.com')).toBe('a.b+c@d.com');
  });
});

describe('validateCredentials (data-model.md)', () => {
  const valid = { email: 'ana@example.test', password: 'secreto-123' };

  it('credenciales válidas → {}', () => {
    expect(validateCredentials(valid)).toEqual({});
  });

  it.each(['', '   '])('correo vacío tras trim (%j) → EMAIL_REQUIRED', (email) => {
    expect(validateCredentials({ ...valid, email }).email).toBe(MESSAGES.EMAIL_REQUIRED);
  });

  it.each(['usuario@', 'usuario.com', 'a@b.c', 'a b@c.com'])(
    'US3-2: correo sin formato válido (%s) → EMAIL_INVALID',
    (email) => {
      expect(validateCredentials({ ...valid, email }).email).toBe(MESSAGES.EMAIL_INVALID);
    },
  );

  it('correo de > 254 caracteres → EMAIL_INVALID', () => {
    const email = `${'a'.repeat(245)}@example.test`;
    expect(email.length).toBeGreaterThan(254);
    expect(validateCredentials({ ...valid, email }).email).toBe(MESSAGES.EMAIL_INVALID);
  });

  it('acepta el correo con espacios periféricos', () => {
    expect(validateCredentials({ ...valid, email: '  Ana@Example.test ' })).toEqual({});
  });

  it('contraseña vacía → PASSWORD_REQUIRED', () => {
    expect(validateCredentials({ ...valid, password: '' }).password).toBe(
      MESSAGES.PASSWORD_REQUIRED,
    );
  });

  it('US3-3: contraseña de < 8 caracteres → PASSWORD_TOO_SHORT', () => {
    expect(validateCredentials({ ...valid, password: '1234567' }).password).toBe(
      MESSAGES.PASSWORD_TOO_SHORT,
    );
  });

  it('contraseña de > 128 caracteres → PASSWORD_TOO_LONG', () => {
    expect(validateCredentials({ ...valid, password: 'x'.repeat(129) }).password).toBe(
      MESSAGES.PASSWORD_TOO_LONG,
    );
  });

  it('la contraseña no se recorta: 7 caracteres + espacios cuenta los espacios', () => {
    expect(validateCredentials({ ...valid, password: ' 123456 ' })).toEqual({});
    expect(validateCredentials({ ...valid, password: '        ' })).toEqual({});
  });
});
