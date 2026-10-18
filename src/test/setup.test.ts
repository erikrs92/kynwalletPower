describe('setup de pruebas', () => {
  it('FR-021: showModal marca el diálogo como abierto y close lo cierra disparando "close"', () => {
    const dialog = document.createElement('dialog');
    document.body.append(dialog);
    const onClose = vi.fn();
    dialog.addEventListener('close', onClose);

    dialog.showModal();
    expect(dialog.open).toBe(true);

    dialog.close();
    expect(dialog.open).toBe(false);
    expect(onClose).toHaveBeenCalledOnce();
  });

  // Estas dos pruebas son consecutivas a propósito: la segunda verifica el afterEach de setup.ts.
  it('N2: tras navegar a /registro en una prueba, la siguiente empieza en /login (parte 1)', () => {
    window.history.pushState({}, '', '/registro');
    expect(window.location.pathname).toBe('/registro');
  });

  it('N2: tras navegar a /registro en una prueba, la siguiente empieza en /login (parte 2)', () => {
    expect(window.location.pathname).toBe('/login');
  });
});
