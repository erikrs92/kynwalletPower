import type { RegistrationErrors } from './registration';

export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthResult =
  | { kind: 'success'; displayName: string }
  | { kind: 'invalid-credentials' }
  | { kind: 'unavailable' };

export type DemoAccount = {
  email: string;
  password: string;
  displayName: string;
};

export type NewAccount = DemoAccount;

export type RegisterResult =
  | { kind: 'success' }
  | { kind: 'invalid'; errors: RegistrationErrors }
  | { kind: 'email-taken' }
  | { kind: 'unavailable' };
