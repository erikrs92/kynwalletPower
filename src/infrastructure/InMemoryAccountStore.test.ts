import { TEST_ACCOUNT } from '@/test/fixtures';
import { InMemoryAccountStore } from './InMemoryAccountStore';

describe('InMemoryAccountStore (contracts/registration-gateway.md)', () => {
  it('isAvailable: false con null y true con una lista', () => {
    expect(new InMemoryAccountStore(null).isAvailable()).toBe(false);
    expect(new InMemoryAccountStore([TEST_ACCOUNT]).isAvailable()).toBe(true);
  });

  it('findByEmail compara el correo normalizado', () => {
    const store = new InMemoryAccountStore([TEST_ACCOUNT]);
    expect(store.findByEmail('  STEVEN.Luna@Example.test ')?.displayName).toBe('Steven Luna');
  });

  it('findByEmail devuelve undefined si no existe', () => {
    expect(
      new InMemoryAccountStore([TEST_ACCOUNT]).findByEmail('nadie@example.test'),
    ).toBeUndefined();
  });

  it('add: devuelve "added" y la cuenta pasa a ser localizable', () => {
    const store = new InMemoryAccountStore([TEST_ACCOUNT]);
    const created = {
      email: 'nueva@example.test',
      password: 'fixture-pass-02',
      displayName: 'Nueva',
    };
    expect(store.add(created)).toBe('added');
    expect(store.findByEmail('nueva@example.test')?.displayName).toBe('Nueva');
  });

  it('FR-024: add con un correo existente (otra capitalización) → "duplicate" sin modificar', () => {
    const store = new InMemoryAccountStore([TEST_ACCOUNT]);
    const result = store.add({
      email: ' STEVEN.LUNA@example.test ',
      password: 'otra-clave-99',
      displayName: 'Impostor',
    });
    expect(result).toBe('duplicate');
    expect(store.findByEmail(TEST_ACCOUNT.email)?.displayName).toBe('Steven Luna');
  });

  it('copia defensiva: mutar la lista original no afecta al almacén', () => {
    const first = { ...TEST_ACCOUNT };
    const accounts = [first];
    const store = new InMemoryAccountStore(accounts);
    accounts.push({ email: 'otra@example.test', password: 'fixture-pass-03', displayName: 'Otra' });
    first.displayName = 'Alterado';
    expect(store.findByEmail('otra@example.test')).toBeUndefined();
    expect(store.findByEmail(TEST_ACCOUNT.email)?.displayName).toBe('Steven Luna');
  });

  it('un almacén no disponible no encuentra cuentas', () => {
    expect(new InMemoryAccountStore(null).findByEmail(TEST_ACCOUNT.email)).toBeUndefined();
  });
});
