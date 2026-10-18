import { useCallback, useState } from 'react';
import type { Authenticate } from '@/application/authenticate';
import type { Register } from '@/application/register';
import { LoginForm } from '@/ui/features/login/LoginForm';
import { RegisterForm } from '@/ui/features/register/RegisterForm';
import { AuthScreen } from '@/ui/layout/AuthScreen/AuthScreen';
import { navigate, useRoute } from '@/ui/navigation/navigation';
import { useRouteAnnouncement } from '@/ui/navigation/useRouteAnnouncement';

type AppProps = {
  authenticate: Authenticate;
  register: Register;
};

/** Aviso de registro exitoso: solo en memoria, nunca en la URL ni en el historial (FR-011, FR-012). */
type Flash = { kind: 'registered'; email: string };

export function App({ authenticate, register }: AppProps) {
  const route = useRoute();
  useRouteAnnouncement(route);
  const [flash, setFlash] = useState<Flash | null>(null);
  const [previousRoute, setPreviousRoute] = useState(route);

  // El aviso se descarta al salir de /login (data-model.md, Aviso de registro exitoso).
  if (route !== previousRoute) {
    setPreviousRoute(route);
    if (route !== 'login') setFlash(null);
  }

  const handleRegistered = useCallback((email: string) => {
    setFlash({ kind: 'registered', email });
    navigate('login');
  }, []);

  const dismissFlash = useCallback(() => setFlash(null), []);

  if (route === 'register') {
    return (
      <AuthScreen
        brandTitle={
          <>
            Comienza tu
            <br />
            camino financiero.
          </>
        }
        brandDescription="Crea tu cuenta en minutos y empieza a enviar, recibir y administrar tu dinero desde cualquier lugar."
      >
        <RegisterForm register={register} onRegistered={handleRegistered} />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      brandTitle={
        <>
          Tu dinero,
          <br />
          sin fronteras.
        </>
      }
      brandDescription="Envía, recibe y paga en segundos. Una billetera pensada para tu día a día."
    >
      <LoginForm
        authenticate={authenticate}
        registered={flash ? { email: flash.email } : undefined}
        onRegisteredDismiss={dismissFlash}
      />
    </AuthScreen>
  );
}
