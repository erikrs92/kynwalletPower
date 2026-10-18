import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '@/test/a11y';
import { PasswordField } from './PasswordField';

function renderField(props: Partial<Parameters<typeof PasswordField>[0]> = {}) {
  render(<PasswordField label="Contraseña" value="secreto-123" onChange={() => {}} {...props} />);
  return {
    input: screen.getByLabelText('Contraseña'),
    toggle: () => screen.getByRole('button', { name: /contraseña$/ }),
  };
}

describe('PasswordField', () => {
  it('US4-1: oculta por defecto y muestra al activar el control', async () => {
    const { input, toggle } = renderField();
    expect(input).toHaveAttribute('type', 'password');
    expect(toggle()).toHaveAccessibleName('Mostrar contraseña');
    expect(toggle()).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(toggle());
    expect(input).toHaveAttribute('type', 'text');
    expect(toggle()).toHaveAccessibleName('Ocultar contraseña');
    expect(toggle()).toHaveAttribute('aria-pressed', 'true');
  });

  it('US4-2: se vuelve a ocultar', async () => {
    const { input, toggle } = renderField();
    await userEvent.click(toggle());
    await userEvent.click(toggle());
    expect(input).toHaveAttribute('type', 'password');
    expect(toggle()).toHaveAccessibleName('Mostrar contraseña');
  });

  it('US4-3: alcanzable con Tab y activable con Enter y Espacio', async () => {
    const user = userEvent.setup();
    const { input, toggle } = renderField();
    await user.click(input);
    await user.tab();
    expect(toggle()).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(input).toHaveAttribute('type', 'text');
    await user.keyboard(' ');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('propaga error, ref y autoComplete', () => {
    const ref = createRef<HTMLInputElement>();
    const { input } = renderField({
      ref,
      error: 'Ingresa tu contraseña',
      autoComplete: 'current-password',
    });
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('autocomplete', 'current-password');
    expect(input).toHaveAccessibleDescription('Ingresa tu contraseña');
  });

  it('FR-013: con toggleSubject el control nombra el campo (confirmación)', async () => {
    renderField({ toggleSubject: 'confirmación de contraseña' });
    const toggle = screen.getByRole('button', { name: 'Mostrar confirmación de contraseña' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(toggle);
    expect(
      screen.getByRole('button', { name: 'Ocultar confirmación de contraseña' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('FR-013: dos campos en la misma pantalla tienen controles de nombre distinto', () => {
    render(
      <>
        <PasswordField label="Contraseña" value="" onChange={() => {}} />
        <PasswordField
          label="Confirmar contraseña"
          toggleSubject="confirmación de contraseña"
          value=""
          onChange={() => {}}
        />
      </>,
    );
    expect(screen.getByRole('button', { name: 'Mostrar contraseña' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Mostrar confirmación de contraseña' }),
    ).toBeInTheDocument();
  });

  it('FR-015: no tiene violaciones de accesibilidad', async () => {
    render(<PasswordField label="Contraseña" value="" onChange={() => {}} />);
    await expectNoA11yViolations(document.body);
  });
});
