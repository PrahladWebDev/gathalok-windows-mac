import { useCallback, useEffect, useRef, useState } from 'react';

// Desktop port of the RN app's useFocusedFetch: each route renders its own
// component instance (React Router unmounts/remounts on navigation), so
// "fetch on focus" becomes "fetch on mount" here — plus a silent refetch
// when the app window regains OS focus, which is the closest desktop
// equivalent of returning to a screen on mobile.
//
//   const { data, status, error, refreshing, refresh, reload, setData } =
//     useFocusedFetch(() => api.get('/x').then((r) => r.data), [dep]);
export default function useFocusedFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const reqId = useRef(0);
  const hasData = useRef(false);

  const run = useCallback(async ({ silent = false } = {}) => {
    const id = ++reqId.current;
    if (!silent && !hasData.current) setStatus('loading');
    try {
      const result = await fetcher();
      if (id !== reqId.current) return;
      hasData.current = true;
      setData(result);
      setError(null);
      setStatus('ready');
    } catch (err) {
      if (id !== reqId.current) return;
      setError(err?.message || 'Something went wrong');
      if (!hasData.current) setStatus('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
    const onFocus = () => run({ silent: true });
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await run({ silent: true });
    setRefreshing(false);
  }, [run]);

  const reload = useCallback(() => {
    hasData.current = false;
    return run();
  }, [run]);

  return { data, status, error, refreshing, refresh, reload, setData };
}
