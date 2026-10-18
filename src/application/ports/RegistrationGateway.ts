import type { NewAccount, RegisterResult } from '@/domain/auth';

export interface RegistrationGateway {
  register(account: NewAccount): Promise<RegisterResult>;
}
