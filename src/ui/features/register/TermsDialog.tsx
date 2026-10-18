import { useEffect, useId, useRef } from 'react';
import { Button } from '@/ui/components/Button/Button';
import styles from './TermsDialog.module.css';

type TermsDialogProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Diálogo modal con términos de ejemplo (FR-021). Usa el elemento nativo <dialog>: el navegador
 * aporta la modalidad, la contención del foco y el cierre con Escape (research.md R8).
 */
export function TermsDialog({ open, onClose }: TermsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // El estado se sincroniza al pedir el cierre; no se depende solo del evento "close", que el
  // navegador dispara de forma asíncrona.
  const handleCloseClick = () => {
    dialogRef.current?.close();
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={onClose}
      onClose={onClose}
    >
      <h2 id={titleId} className={styles.title}>
        Términos y condiciones
      </h2>
      <div className={styles.body}>
        <p>
          Texto de ejemplo para la demostración, sin validez legal. KynWallet es una aplicación de
          práctica y no ofrece servicios financieros reales.
        </p>
        <p>
          Al crear una cuenta de demostración aceptas que los datos ingresados solo existen en la
          memoria de esta página y se pierden al recargarla.
        </p>
      </div>
      <Button variant="secondary" onClick={handleCloseClick}>
        Cerrar
      </Button>
    </dialog>
  );
}
