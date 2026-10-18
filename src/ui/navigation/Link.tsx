import type { MouseEvent, ReactNode } from 'react';
import { navigate } from './navigation';
import { ROUTE_PATHS, type RouteName } from './routes';
import styles from './Link.module.css';

type LinkProps = {
  to: RouteName;
  children: ReactNode;
};

/** Enlace real (<a href>) que solo intercepta el clic simple (N3, N4). */
export function Link({ to, children }: LinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(to);
  };
  return (
    <a className={styles.link} href={ROUTE_PATHS[to]} onClick={handleClick}>
      {children}
    </a>
  );
}
