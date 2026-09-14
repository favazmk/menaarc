'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Subscribes to a media query.
 *
 * `useSyncExternalStore` rather than useEffect + setState: a media query IS an
 * external store, and reading it in an effect costs an extra render on every
 * mount and trips react-hooks/set-state-in-effect. The server snapshot is the
 * explicit `serverValue`, so SSR output is deterministic instead of guessing at
 * the device.
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/** True when the visitor has asked for less motion. Assumed false on the server. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)', false);
}

/** True where a custom cursor and magnetic hover are appropriate. */
export function useFinePointer(): boolean {
  return useMediaQuery('(pointer: fine)', false);
}

const neverChanges = () => () => {};

/**
 * False during SSR and the hydration pass, true thereafter.
 *
 * The usual `useEffect(() => setMounted(true), [])` does the same job but
 * schedules a second render from inside an effect. Modelling "am I on the
 * client" as an external store that never changes gets React to handle the
 * transition itself.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  );
}
