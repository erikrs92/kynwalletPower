import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { Authenticate } from '@/application/authenticate';
import { validateCredentials } from '@/domain/validation';
import {
  createInitialLoginState,
  loginReducer,
  type Field,
  type FieldErrors,
} from './loginReducer';

export function useLoginForm(authenticate: Authenticate, registeredEmail?: string) {
  const [state, dispatch] = useReducer(loginReducer, registeredEmail, createInitialLoginState);
  const inFlight = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const change = useCallback((field: Field, value: string) => {
    dispatch({ type: 'change', field, value });
  }, []);

  const blur = useCallback((field: Field) => dispatch({ type: 'blur', field }), []);

  /** Valida y, si procede, autentica. Devuelve los errores para que la vista gestione el foco. */
  const submit = useCallback((): FieldErrors => {
    if (inFlight.current) return {};
    const errors = validateCredentials(state.values);
    dispatch({ type: 'submit' });
    if (Object.keys(errors).length > 0) return errors;

    inFlight.current = true;
    void authenticate(state.values).then((result) => {
      inFlight.current = false;
      if (mounted.current) dispatch({ type: 'result', result });
    });
    return {};
  }, [authenticate, state.values]);

  const logout = useCallback(() => dispatch({ type: 'logout' }), []);

  const toggleRemember = useCallback(
    (checked: boolean) => dispatch({ type: 'toggleRemember', checked }),
    [],
  );

  const showNotice = useCallback(
    (message: string) => dispatch({ type: 'showNotice', message }),
    [],
  );

  return { state, change, blur, submit, logout, toggleRemember, showNotice };
}
