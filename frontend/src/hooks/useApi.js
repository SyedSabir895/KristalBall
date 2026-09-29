import { useEffect, useState } from 'react';
import { errorMessage } from '../api/client';

// Loads data and re-loads whenever `key` changes (usually JSON of the filters).
//   const { data, loading, error, reload } = useApi(() => purchaseApi.list(filters), JSON.stringify(filters));
// Old data stays on screen while new data loads → no flicker when changing filters.
export function useApi(fetcher, key = '') {
  const [version, setVersion] = useState(0); // bump to force reload (after creating a record)
  const requestKey = `${key}#${version}`;
  const [result, setResult] = useState({ key: null, data: null, error: '' });

  useEffect(() => {
    let active = true; // ignore responses from outdated requests
    fetcher().then(
      (data) => active && setResult({ key: requestKey, data, error: '' }),
      (err) => active && setResult({ key: requestKey, data: null, error: errorMessage(err) })
    );
    return () => {
      active = false;
    };
    // fetcher is a new function every render; requestKey captures what matters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const loading = result.key !== requestKey;
  return {
    data: result.data,
    error: loading ? '' : result.error,
    loading,
    reload: () => setVersion((v) => v + 1),
  };
}
