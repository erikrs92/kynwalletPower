import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import styles from './Button.module.css';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'link';
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
  ref?: Ref<HTMLButtonElement>;
};

export function Button({
  variant = 'primary',
  loading = false,
  loadingLabel,
  type = 'button',
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(' ');
  return (
    <button
      {...rest}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading && loadingLabel ? loadingLabel : children}
    </button>
  );
}
