import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '@/test/a11y';
import { Checkbox } from './Checkbox';

function Controlled() {
  const [checked, setChecked] = useState(false);
  return <Checkbox label="Recordarme" checked={checked} onChange={setChecked} />;
}

describe('Checkbox', () => {
  it('US5-2: casilla con etiqueta que alterna su estado', async () => {
    render(<Controlled />);
    const checkbox = screen.getByRole('checkbox', { name: 'Recordarme' });
    expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    await userEvent.click(screen.getByText('Recordarme'));
    expect(checkbox).not.toBeChecked();
  });

  it('FR-015: no tiene violaciones de accesibilidad', async () => {
    const { container } = render(<Controlled />);
    await expectNoA11yViolations(container);
  });

  it('FR-021: acepta una etiqueta ReactNode y el nombre accesible incluye todo el texto', () => {
    render(
      <Checkbox
        label={
          <>
            Acepto los <button type="button">términos y condiciones</button>
          </>
        }
        checked={false}
        onChange={() => {}}
      />,
    );
    expect(
      screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }),
    ).toBeInTheDocument();
  });

  it('FR-021: activar el botón dentro de la etiqueta no alterna la casilla', async () => {
    const onChange = vi.fn();
    const onOpen = vi.fn();
    render(
      <Checkbox
        label={
          <>
            Acepto los{' '}
            <button type="button" onClick={onOpen}>
              términos y condiciones
            </button>
          </>
        }
        checked={false}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'términos y condiciones' }));
    expect(onOpen).toHaveBeenCalledOnce();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('US3-1: con error, la casilla es inválida y el error la describe', () => {
    render(
      <Checkbox
        label="Acepto"
        checked={false}
        onChange={() => {}}
        error="Debes aceptar los términos y condiciones"
      />,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Acepto' });
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    expect(checkbox).toHaveAccessibleDescription('Debes aceptar los términos y condiciones');
  });

  it('US3-2: sin error no hay aria-invalid ni descripción', () => {
    render(<Checkbox label="Acepto" checked onChange={() => {}} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Acepto' });
    expect(checkbox).not.toHaveAttribute('aria-invalid');
    expect(checkbox).not.toHaveAccessibleDescription();
  });

  it('US3-3: con error no tiene violaciones de accesibilidad', async () => {
    const { container } = render(
      <Checkbox label="Acepto" checked={false} onChange={() => {}} error="Obligatorio" />,
    );
    await expectNoA11yViolations(container);
  });
});
