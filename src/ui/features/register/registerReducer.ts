import type { RegisterResult } from '@/domain/auth';
import {
  validateRegistration,
  type RegistrationData,
  type RegistrationErrors,
  type RegistrationField,
} from '@/domain/registration';

export type RegisterTextField = 'fullName' | 'email' | 'password' | 'confirmPassword';

export type RegisterState = {
  status: 'editing' | 'submitting' | 'serverError';
  values: Record<RegisterTextField, string>;
  acceptedTerms: boolean;
  touched: Record<RegistrationField, boolean>;
  fieldErrors: RegistrationErrors;
  serverError: 'email-taken' | 'unavailable' | null;
  notice: string | null;
  termsOpen: boolean;
};

export type RegisterAction =
  | { type: 'change'; field: RegisterTextField; value: string }
  | { type: 'toggleTerms'; checked: boolean }
  | { type: 'blur'; field: RegistrationField }
  | { type: 'openTerms' }
  | { type: 'closeTerms' }
  | { type: 'showNotice'; message: string }
  | { type: 'submit' }
  | { type: 'result'; result: RegisterResult };

export const initialRegisterState: RegisterState = {
  status: 'editing',
  values: { fullName: '', email: '', password: '', confirmPassword: '' },
  acceptedTerms: false,
  touched: {
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
    acceptedTerms: false,
  },
  fieldErrors: {},
  serverError: null,
  notice: null,
  termsOpen: false,
};

export function toRegistrationData(state: RegisterState): RegistrationData {
  return { ...state.values, acceptedTerms: state.acceptedTerms };
}

/** Errores visibles: solo los de campos ya tocados (FR-008). */
function visibleErrors(state: RegisterState, touched: RegisterState['touched']) {
  const all = validateRegistration(toRegistrationData(state));
  const visible: RegistrationErrors = {};
  for (const field of Object.keys(all) as RegistrationField[]) {
    if (touched[field]) visible[field] = all[field];
  }
  return visible;
}

const ALL_TOUCHED: RegisterState['touched'] = {
  fullName: true,
  email: true,
  password: true,
  confirmPassword: true,
  acceptedTerms: true,
};

/** Máquina de estados del formulario de registro (data-model.md, RegisterFormState). */
export function registerReducer(state: RegisterState, action: RegisterAction): RegisterState {
  switch (action.type) {
    case 'change': {
      const next = { ...state, values: { ...state.values, [action.field]: action.value } };
      // Editar el correo limpia "correo ya registrado"; editar cualquier campo limpia "no disponible".
      const clearsServerError =
        state.serverError === 'unavailable' ||
        (state.serverError === 'email-taken' && action.field === 'email');
      return {
        ...next,
        status: clearsServerError ? 'editing' : state.status,
        serverError: clearsServerError ? null : state.serverError,
        fieldErrors: visibleErrors(next, state.touched),
      };
    }

    case 'toggleTerms': {
      const next = { ...state, acceptedTerms: action.checked };
      return { ...next, fieldErrors: visibleErrors(next, state.touched) };
    }

    case 'blur': {
      const touched = { ...state.touched, [action.field]: true };
      return { ...state, touched, fieldErrors: visibleErrors(state, touched) };
    }

    case 'openTerms':
      // FR-021: abrir el diálogo no altera la casilla ni los datos.
      return { ...state, termsOpen: true };

    case 'closeTerms':
      return { ...state, termsOpen: false };

    case 'showNotice':
      return { ...state, notice: action.message };

    case 'submit': {
      if (state.status === 'submitting') return state;
      const fieldErrors = visibleErrors(state, ALL_TOUCHED);
      // FR-009: no se registra mientras existan errores de validación.
      const status = Object.keys(fieldErrors).length > 0 ? 'editing' : 'submitting';
      return {
        ...state,
        status,
        touched: ALL_TOUCHED,
        fieldErrors,
        serverError: null,
        notice: null,
      };
    }

    case 'result': {
      const { result } = action;
      if (result.kind === 'invalid') {
        return {
          ...state,
          status: 'editing',
          touched: ALL_TOUCHED,
          fieldErrors: result.errors,
          serverError: null,
        };
      }
      if (result.kind === 'email-taken' || result.kind === 'unavailable') {
        return { ...state, status: 'serverError', serverError: result.kind };
      }
      return { ...state, status: 'editing', serverError: null };
    }
  }
}
