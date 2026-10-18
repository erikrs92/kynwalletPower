import { MESSAGES } from './messages';
import { validateEmail, validatePassword } from './validation';

export const FULL_NAME_MIN_LENGTH = 2;
export const FULL_NAME_MAX_LENGTH = 80;
const LETTERS = 'A-Za-zÁÉÍÓÚÜÑáéíóúüñ';
// Nombres de letras latinas separados por espacios; sin números, símbolos, apóstrofos ni guiones.
const FULL_NAME_PATTERN = new RegExp(`^[${LETTERS}]+(?: +[${LETTERS}]+)*$`);

export type RegistrationData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};

export type RegistrationField = keyof RegistrationData;
export type RegistrationErrors = Partial<Record<RegistrationField, string>>;

function validateFullName(fullName: string): string | undefined {
  const name = fullName.trim();
  if (name === '') return MESSAGES.NAME_REQUIRED;
  if (name.length < FULL_NAME_MIN_LENGTH || name.length > FULL_NAME_MAX_LENGTH) {
    return MESSAGES.NAME_LENGTH;
  }
  if (!FULL_NAME_PATTERN.test(name)) return MESSAGES.NAME_INVALID;
  return undefined;
}

function validateConfirmation(password: string, confirmPassword: string): string | undefined {
  if (confirmPassword === '') return MESSAGES.CONFIRM_REQUIRED;
  // Se compara tal cual, sin recortar ni normalizar (FR-006).
  if (confirmPassword !== password) return MESSAGES.PASSWORDS_MISMATCH;
  return undefined;
}

/** Reglas de FR-003 a FR-007. Devuelve {} si los datos son válidos. */
export function validateRegistration(data: RegistrationData): RegistrationErrors {
  const errors: RegistrationErrors = {};
  const fullName = validateFullName(data.fullName);
  const email = validateEmail(data.email);
  const password = validatePassword(data.password);
  const confirmPassword = validateConfirmation(data.password, data.confirmPassword);
  if (fullName) errors.fullName = fullName;
  if (email) errors.email = email;
  if (password) errors.password = password;
  if (confirmPassword) errors.confirmPassword = confirmPassword;
  if (!data.acceptedTerms) errors.acceptedTerms = MESSAGES.TERMS_REQUIRED;
  return errors;
}
