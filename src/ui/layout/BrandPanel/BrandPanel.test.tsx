import { render, screen } from '@testing-library/react';
import { BrandPanel } from './BrandPanel';

describe('BrandPanel', () => {
  it('FR-001a: muestra el titular y la descripción recibidos por props', () => {
    render(
      <BrandPanel
        title={
          <>
            Comienza tu
            <br />
            camino financiero.
          </>
        }
        description="Crea tu cuenta en minutos."
      />,
    );
    expect(screen.getByText(/Comienza tu/)).toBeInTheDocument();
    expect(screen.getByText(/camino financiero\./)).toBeInTheDocument();
    expect(screen.getByText('Crea tu cuenta en minutos.')).toBeInTheDocument();
  });

  it('FR-001: muestra el logo "KynWallet"', () => {
    render(<BrandPanel title="Titular" description="Descripción" />);
    expect(screen.getByText('KynWallet')).toBeInTheDocument();
  });

  it('FR-001: la tarjeta ilustrativa es decorativa (aria-hidden)', () => {
    render(<BrandPanel title="Titular" description="Descripción" />);
    const card = screen.getByText('Kyn Card').parentElement?.parentElement;
    expect(card).toHaveAttribute('aria-hidden', 'true');
  });
});
