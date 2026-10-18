import { useEffect, useRef, type FormEvent } from 'react';
import type { Register } from '@/application/register';
import { MESSAGES } from '@/domain/messages';
import { Alert } from '@/ui/components/Alert/Alert';
import { Button } from '@/ui/components/Button/Button';
import { Checkbox } from '@/ui/components/Checkbox/Checkbox';
import { Divider } from '@/ui/components/Divider/Divider';
import { PasswordField } from '@/ui/components/PasswordField/PasswordField';
import { SocialButton } from '@/ui/components/SocialButton/SocialButton';
import { TextField } from '@/ui/components/TextField/TextField';
import { Link } from '@/ui/navigation/Link';
import { useRegisterForm } from './useRegisterForm';
import { TermsDialog } from './TermsDialog';
import styles from './RegisterForm.module.css';

type RegisterFormProps = {
  register: Register;
  onRegistered: (email: string) => void;
};

export function RegisterForm({ register, onRegistered }: RegisterFormProps) {
  const { state, change, blur, toggleTerms, openTerms, closeTerms, showNotice, submit } =
    useRegisterForm(register, onRegistered);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);
  const termsLinkRef = useRef<HTMLButtonElement>(null);

  // US2-9: con un correo ya registrado, el foco va al campo de correo.
  useEffect(() => {
    if (state.serverError === 'email-taken') emailRef.current?.focus();
  }, [state.serverError]);

  // US3-5: al cerrar el diálogo el foco vuelve al enlace que lo abrió.
  const handleCloseTerms = () => {
    closeTerms();
    termsLinkRef.current?.focus();
  };

  // FR-014: Google y Apple se muestran por fidelidad al diseño y avisan "Próximamente".
  const comingSoon = () => showNotice(MESSAGES.COMING_SOON);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = submit();
    // FR-009: el foco va al primer elemento con error, en el orden del formulario.
    if (errors.fullName) fullNameRef.current?.focus();
    else if (errors.email) emailRef.current?.focus();
    else if (errors.password) passwordRef.current?.focus();
    else if (errors.confirmPassword) confirmRef.current?.focus();
    else if (errors.acceptedTerms) termsRef.current?.focus();
  };

  const emailError =
    state.fieldErrors.email ??
    (state.serverError === 'email-taken' ? MESSAGES.EMAIL_TAKEN : undefined);

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <div className={styles.heading}>
        <h1 className={styles.title} tabIndex={-1}>
          Crea tu cuenta
        </h1>
        <p className={styles.subtitle}>Completa tus datos para comenzar</p>
      </div>

      <TextField
        label="Nombre completo"
        ref={fullNameRef}
        name="fullName"
        autoComplete="name"
        placeholder="Ej: Diego Martínez"
        value={state.values.fullName}
        error={state.fieldErrors.fullName}
        onChange={(event) => change('fullName', event.target.value)}
        onBlur={() => blur('fullName')}
      />

      <TextField
        label="Correo electrónico"
        ref={emailRef}
        type="email"
        name="email"
        autoComplete="username"
        placeholder="tucorreo@ejemplo.com"
        value={state.values.email}
        error={emailError}
        onChange={(event) => change('email', event.target.value)}
        onBlur={() => blur('email')}
      />

      <PasswordField
        label="Contraseña"
        ref={passwordRef}
        name="password"
        autoComplete="new-password"
        placeholder="••••••••"
        value={state.values.password}
        error={state.fieldErrors.password}
        onChange={(event) => change('password', event.target.value)}
        onBlur={() => blur('password')}
      />

      <PasswordField
        label="Confirmar contraseña"
        ref={confirmRef}
        toggleSubject="confirmación de contraseña"
        name="confirmPassword"
        autoComplete="new-password"
        placeholder="••••••••"
        value={state.values.confirmPassword}
        error={state.fieldErrors.confirmPassword}
        onChange={(event) => change('confirmPassword', event.target.value)}
        onBlur={() => blur('confirmPassword')}
      />

      <Checkbox
        ref={termsRef}
        label={
          <>
            Acepto los{' '}
            <Button ref={termsLinkRef} variant="link" onClick={openTerms}>
              términos y condiciones
            </Button>
          </>
        }
        checked={state.acceptedTerms}
        error={state.fieldErrors.acceptedTerms}
        onChange={toggleTerms}
      />

      <TermsDialog open={state.termsOpen} onClose={handleCloseTerms} />

      {state.serverError === 'unavailable' && (
        <Alert tone="error">{MESSAGES.REGISTER_UNAVAILABLE}</Alert>
      )}

      <Button type="submit" loading={state.status === 'submitting'} loadingLabel="Creando cuenta…">
        Crear cuenta
      </Button>

      <Divider>o regístrate con</Divider>

      <div className={styles.social}>
        <SocialButton provider="Google" onClick={comingSoon} />
        <SocialButton provider="Apple" onClick={comingSoon} />
      </div>

      {state.notice && <Alert tone="info">{state.notice}</Alert>}

      <p className={styles.footer}>
        ¿Ya tienes cuenta?
        <Link to="login">Inicia sesión</Link>
      </p>
    </form>
  );
}
