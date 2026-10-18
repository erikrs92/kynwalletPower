import type { ReactNode } from 'react';
import styles from './Alert.module.css';

type AlertProps = {
  tone: 'error' | 'info' | 'success';
  children: ReactNode;
};

/** Mensaje global anunciado por tecnologías de asistencia (FR-015). */
export function Alert({ tone, children }: AlertProps) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`${styles.alert} ${styles[tone]}`}>
      {children}
    </div>
  );
}
