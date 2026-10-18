import type { ReactNode } from 'react';
import { BrandPanel } from '@/ui/layout/BrandPanel/BrandPanel';
import styles from './AuthScreen.module.css';

type AuthScreenProps = {
  brandTitle: ReactNode;
  brandDescription: string;
  children: ReactNode;
};

/** Layout compartido de dos paneles: marca a la izquierda y formulario a la derecha. */
export function AuthScreen({ brandTitle, brandDescription, children }: AuthScreenProps) {
  return (
    <div className={styles.screen}>
      <BrandPanel title={brandTitle} description={brandDescription} />
      <main className={styles.formPanel}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
