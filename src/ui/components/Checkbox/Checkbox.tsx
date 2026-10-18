import { useId, type ReactNode, type Ref } from 'react';
import styles from './Checkbox.module.css';

type CheckboxProps = {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  ref?: Ref<HTMLInputElement>;
};

export function Checkbox({ label, checked, onChange, error, ref }: CheckboxProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={styles.field}>
      <div className={styles.wrapper}>
        <input
          id={id}
          ref={ref}
          type="checkbox"
          className={[styles.box, error && styles.invalid].filter(Boolean).join(' ')}
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
