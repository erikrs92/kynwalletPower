import type { AuthResult } from '@/domain/auth';
import { validateCredentials, type CredentialErrors } from '@/domain/validation';

export type Field = 'email' | 'password';
export type FieldErrors = CredentialErrors;

export type LoginState = {
  status: 'editing' | 'submitting' | 'authError' | 'welcome';
  values: Record<Field, string>;
  touched: Record<Field, boolean>;
  fieldErrors: FieldErrors;
  authError: 'invalid-credentials' | 'unavailable' | null;
  welcomeName: string | null;
  rememberMe: boolean;
  notice: string | null;
  /** Aviso de registro exitoso (spec 002, FR-011): se muestra hasta que el usuario edita un campo. */
  registeredNotice: boolean;
};

export type LoginAction =
  | { type: 'change'; field: Field; value: string }
  | { type: 'blur'; field: Field }
  | { type: 'toggleRemember'; checked: boolean }
  | { type: 'showNotice'; message: string }
  | { type: 'submit' }
  | { type: 'result'; result: AuthResult }
  | { type: 'logout' };

export const initialLoginState: LoginState = {
  status: 'editing',
  values: { email: '', password: '' },
  touched: { email: false, password: false },
  fieldErrors: {},
  authError: null,
  welcomeName: null,
  rememberMe: false,
  notice: null,
  registeredNotice: false,
};

/** Estado inicial tras un registro exitoso: correo rellenado y aviso visible (FR-011, FR-011a). */
export function createInitialLoginState(registeredEmail?: string): LoginState {
  if (registeredEmail === undefined) return initialLoginState;
  return {
    ...initialLoginState,
    values: { email: registeredEmail, password: '' },
    registeredNotice: true,
  };
}

/** Errores visibles: solo los de campos ya tocados (FR-005). */
function visibleErrors(values: LoginState['values'], touched: LoginState['touched']): FieldErrors {
  const errors = validateCredentials(values);
  const visible: FieldErrors = {};
  if (touched.email && errors.email) visible.email = errors.email;
  if (touched.password && errors.password) visible.password = errors.password;
  return visible;
}

/** Máquina de estados del formulario (data-model.md, LoginFormState). */
export function loginReducer(state: LoginState, action: LoginAction): LoginState {
  switch (action.type) {
    case 'change': {
      const values = { ...state.values, [action.field]: action.value };
      return {
        ...state,
        status: state.status === 'authError' ? 'editing' : state.status,
        authError: null,
        registeredNotice: false,
        values,
        fieldErrors: visibleErrors(values, state.touched),
      };
    }

    case 'blur': {
      const touched = { ...state.touched, [action.field]: true };
      return { ...state, touched, fieldErrors: visibleErrors(state.values, touched) };
    }

    case 'toggleRemember':
      // FR-017: solo visual, no se persiste.
      return { ...state, rememberMe: action.checked };

    case 'showNotice':
      return { ...state, notice: action.message };

    case 'submit': {
      if (state.status === 'submitting') return state;
      const touched = { email: true, password: true };
      const fieldErrors = visibleErrors(state.values, touched);
      // FR-006: no se autentica mientras existan errores de validación.
      const status = Object.keys(fieldErrors).length > 0 ? 'editing' : 'submitting';
      return { ...state, status, touched, fieldErrors, authError: null, notice: null };
    }

    case 'result':
      if (action.result.kind === 'success') {
        return { ...state, status: 'welcome', welcomeName: action.result.displayName };
      }
      return {
        ...state,
        status: 'authError',
        authError: action.result.kind,
        values: { ...state.values, password: '' },
      };

    case 'logout':
      return initialLoginState;
  }
}
