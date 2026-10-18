import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createAuthenticate } from '@/application/authenticate';
import { createRegister } from '@/application/register';
import { InMemoryAccountStore } from '@/infrastructure/InMemoryAccountStore';
import { InMemoryAuthGateway } from '@/infrastructure/InMemoryAuthGateway';
import { InMemoryRegistrationGateway } from '@/infrastructure/InMemoryRegistrationGateway';
import { loadDemoAccounts } from '@/infrastructure/loadDemoAccounts';
import '@/ui/styles/tokens.css';
import '@/ui/styles/global.css';
import { App } from './App';

// Raíz de composición: único lugar que conoce las implementaciones concretas (Constitución 2.5).
// Login y registro comparten un único almacén de cuentas en memoria.
const accounts = loadDemoAccounts(import.meta.env.VITE_DEMO_USERS);
const store = new InMemoryAccountStore(accounts);
const authenticate = createAuthenticate(new InMemoryAuthGateway(store));
const register = createRegister(new InMemoryRegistrationGateway(store));

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App authenticate={authenticate} register={register} />
    </StrictMode>,
  );
}
