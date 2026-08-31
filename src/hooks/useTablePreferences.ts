import { useCallback } from 'react';

const PREFIX = 'admin-panel:table:';

export interface TablePreferences {
  limit: number;
}

export function useTablePreferences(tableKey: string) {
  const storageKey = PREFIX + tableKey;

  const get = useCallback((): TablePreferences => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw) as TablePreferences;
    } catch {
      // ignore
    }
    return { limit: 10 };
  }, [storageKey]);

  const set = useCallback(
    (prefs: Partial<TablePreferences>) => {
      try {
        const current = get();
        localStorage.setItem(storageKey, JSON.stringify({ ...current, ...prefs }));
      } catch {
        // ignore storage quota errors
      }
    },
    [storageKey, get],
  );

  return { get, set };
}
