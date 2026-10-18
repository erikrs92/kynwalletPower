import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { Register } from '@/application/register';
import {
  validateRegistration,
  type RegistrationErrors,
  type RegistrationField,
} from '@/domain/registration';
import { normalizeEmail } from '@/domain/validation';
import {
  initialRegisterState,
  registerReducer,
  toRegistrationData,
  type RegisterTextField,
} from './registerReducer';

export function useRegisterForm(register: Register, onRegistered: (email: string) => void) {
  const [state, dispatch] = useReducer(registerReducer, initialRegisterState);
  const inFlight = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const change = useCallback((field: RegisterTextField, value: string) => {
    dispatch({ type: 'change', field, value });
  }, []);

  const blur = useCallback((field: RegistrationField) => dispatch({ type: 'blur', field }), []);

  const toggleTerms = useCallback((checked: boolean) => {
    dispatch({ type: 'toggleTerms', checked });
  }, []);

  const openTerms = useCallback(() => dispatch({ type: 'openTerms' }), []);
  const closeTerms = useCallback(() => dispatch({ type: 'closeTerms' }), []);
  const showNotice = useCallback(
    (message: string) => dispatch({ type: 'showNotice', message }),
    [],
  );

  /** Valida y, si procede, registra. Devuelve los errores para que la vista gestione el foco. */
  const submit = useCallback((): RegistrationErrors => {
    if (inFlight.current) return {};
    const data = toRegistrationData(state);
    const errors = validateRegistration(data);
    dispatch({ type: 'submit' });
    if (Object.keys(errors).length > 0) return errors;

    inFlight.current = true;
    void register(data).then((result) => {
      inFlight.current = false;
      if (!mounted.current) return;
      dispatch({ type: 'result', result });
      if (result.kind === 'success') onRegistered(normalizeEmail(data.email));
    });
    return {};
  }, [register, onRegistered, state]);

  return { state, change, blur, toggleTerms, openTerms, closeTerms, showNotice, submit };
}
