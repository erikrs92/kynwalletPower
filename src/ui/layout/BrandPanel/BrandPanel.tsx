import type { ReactNode } from 'react';
import logoMark from '@/ui/assets/logo-mark.svg';
import styles from './BrandPanel.module.css';

type BrandPanelProps = {
  title: ReactNode;
  description: string;
};

/** Panel de marca del diseño (Figma, nodos 2:3 y 31:2); los textos los define cada pantalla. */
export function BrandPanel({ title, description }: BrandPanelProps) {
  return (
    <header className={styles.panel}>
      <div className={styles.logo}>
        <img src={logoMark} alt="" width={20} height={44} />
        <span className={styles.logoText}>KynWallet</span>
      </div>

      <div className={styles.headline}>
        <p className={styles.title}>{title}</p>
        <p className={styles.subtitle}>{description}</p>
      </div>

      <div className={styles.card} aria-hidden="true">
        <div className={styles.cardTop}>
          <span className={styles.cardName}>Kyn Card</span>
          <span className={styles.chip} />
        </div>
        <span className={styles.cardNumber}>{'5294  ••••  ••••  4827'}</span>
        <div className={styles.cardBottom}>
          <span>STEVEN LUNA</span>
          <span>12/29</span>
        </div>
      </div>
    </header>
  );
}
