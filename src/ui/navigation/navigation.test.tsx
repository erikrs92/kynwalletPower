import { act, fireEvent, render, screen } from '@testing-library/react';
import { navigate, useRoute } from './navigation';
import { Link } from './Link';
import { resolveRoute } from './routes';

function Probe() {
  const route = useRoute();
  return (
    <div>
      <span data-testid="route">{route}</span>
      <Link to="register">Ir al registro</Link>
    </div>
  );
}

describe('resolveRoute (contracts/navigation.md)', () => {
  it.each([
    ['/registro', 'register'],
    ['/login', 'login'],
  ] as const)('N1: %s → %s', (path, route) => {
    expect(resolveRoute(path)).toBe(route);
  });

  it.each(['/', '/otra', ''])('N2: ruta desconocida "%s" → login', (path) => {
    expect(resolveRoute(path)).toBe('login');
  });
});

describe('useRoute y Link', () => {
  it('N2: al cargar una ruta desconocida la URL se normaliza sin añadir historial', () => {
    window.history.replaceState({}, '', '/otra');
    const lengthBefore = window.history.length;
    render(<Probe />);
    expect(screen.getByTestId('route')).toHaveTextContent('login');
    expect(window.location.pathname).toBe('/login');
    expect(window.history.length).toBe(lengthBefore);
  });

  it('N1: cargar /registro muestra la ruta register', () => {
    window.history.pushState({}, '', '/registro');
    render(<Probe />);
    expect(screen.getByTestId('route')).toHaveTextContent('register');
  });

  it('N3: clic simple en Link navega sin recargar y añade una entrada al historial', () => {
    window.history.replaceState({}, '', '/login');
    render(<Probe />);
    const lengthBefore = window.history.length;
    fireEvent.click(screen.getByRole('link', { name: 'Ir al registro' }));
    expect(screen.getByTestId('route')).toHaveTextContent('register');
    expect(window.location.pathname).toBe('/registro');
    expect(window.history.length).toBe(lengthBefore + 1);
  });

  it('N3: el enlace es un <a> con href real', () => {
    render(<Probe />);
    expect(screen.getByRole('link', { name: 'Ir al registro' })).toHaveAttribute(
      'href',
      '/registro',
    );
  });

  it.each([
    ['Ctrl', { ctrlKey: true }],
    ['Meta', { metaKey: true }],
    ['Mayús', { shiftKey: true }],
    ['botón central', { button: 1 }],
  ])('N4: clic con %s no se intercepta', (_label, init) => {
    window.history.replaceState({}, '', '/login');
    render(<Probe />);
    const link = screen.getByRole('link', { name: 'Ir al registro' });
    // fireEvent devuelve false si algún manejador llamó a preventDefault.
    const notPrevented = fireEvent.click(link, init);
    expect(notPrevented).toBe(true);
    expect(screen.getByTestId('route')).toHaveTextContent('login');
    expect(window.location.pathname).toBe('/login');
  });

  it('N5: popstate vuelve a leer la URL', () => {
    window.history.replaceState({}, '', '/login');
    render(<Probe />);
    act(() => {
      window.history.replaceState({}, '', '/registro');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(screen.getByTestId('route')).toHaveTextContent('register');
  });

  it('N8: la URL tras navegar no contiene más que la ruta', () => {
    window.history.replaceState({}, '', '/login');
    render(<Probe />);
    act(() => navigate('register'));
    expect(window.location.search).toBe('');
    expect(window.location.hash).toBe('');
    expect(window.location.pathname).toBe('/registro');
  });
});
