import { render, screen } from '@testing-library/react';
import { expectNoA11yViolations } from '@/test/a11y';
import { AuthScreen } from './AuthScreen';

describe('AuthScreen', () => {
  it('FR-017: renderiza el panel de marca con los textos recibidos', () => {
    render(
      <AuthScreen brandTitle="Titular de marca" brandDescription="Descripción de marca">
        <p>Contenido</p>
      </AuthScreen>,
    );
    expect(screen.getByText('Titular de marca')).toBeInTheDocument();
    expect(screen.getByText('Descripción de marca')).toBeInTheDocument();
  });

  it('FR-017: los children van dentro de un main', () => {
    render(
      <AuthScreen brandTitle="Titular" brandDescription="Descripción">
        <p>Contenido</p>
      </AuthScreen>,
    );
    expect(screen.getByRole('main')).toContainElement(screen.getByText('Contenido'));
  });

  it('FR-019: no tiene violaciones de accesibilidad', async () => {
    const { container } = render(
      <AuthScreen brandTitle="Titular" brandDescription="Descripción">
        <h1>Pantalla</h1>
      </AuthScreen>,
    );
    await expectNoA11yViolations(container);
  });
});
