import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '@/test/a11y';
import { TermsDialog } from './TermsDialog';

describe('TermsDialog (FR-021)', () => {
  it('US3-4: abierto, tiene role="dialog" con nombre "Términos y condiciones"', () => {
    render(<TermsDialog open onClose={() => {}} />);
    expect(screen.getByRole('dialog', { name: 'Términos y condiciones' })).toBeInTheDocument();
  });

  it('US3-4: el texto se identifica como ejemplo ficticio', () => {
    render(<TermsDialog open onClose={() => {}} />);
    expect(screen.getByText(/ejemplo/i)).toBeInTheDocument();
  });

  it('cerrado no se muestra', () => {
    render(<TermsDialog open={false} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('US3-5: el botón "Cerrar" cierra el diálogo y avisa con onClose', async () => {
    const onClose = vi.fn();
    render(<TermsDialog open onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('US3-5: Escape (el navegador emite cancel y close) avisa con onClose', () => {
    const onClose = vi.fn();
    render(<TermsDialog open onClose={onClose} />);
    const dialog = screen.getByRole('dialog');
    // jsdom no implementa el cierre nativo con Escape: se simulan los eventos del navegador.
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    dialog.removeAttribute('open');
    fireEvent(dialog, new Event('close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('FR-019: no tiene violaciones de accesibilidad', async () => {
    const { container } = render(<TermsDialog open onClose={() => {}} />);
    await expectNoA11yViolations(container);
  });
});
