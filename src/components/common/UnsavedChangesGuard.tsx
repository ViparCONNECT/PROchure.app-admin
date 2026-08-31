import { useEffect } from 'react';

interface UnsavedChangesGuardProps {
  isDirty: boolean;
}

// useBlocker requires a data router; with BrowserRouter we guard reload/tab-close only
export function UnsavedChangesGuard({ isDirty }: UnsavedChangesGuardProps) {
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  return null;
}

export default UnsavedChangesGuard;
