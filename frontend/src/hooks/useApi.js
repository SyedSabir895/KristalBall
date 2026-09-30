import { useEffect, useRef, useState } from 'react';
import { errorMessage } from '../api/client';

export function useApi(fetcher, key = '') {
  const [version, setVersion] = useState(0);
  const requestKey = `${key}#${version}`;
  const [result, setResult] = useState({ key: null, data: null, error: '' });
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    let active = true;
    fetcherRef.current().then(
      (data) => active && setResult({ key: requestKey, data, error: '' }),
      (err) => active && setResult({ key: requestKey, data: null, error: errorMessage(err) })
    );
    return () => {
      active = false;
    };
  }, [requestKey]);

  const loading = result.key !== requestKey;
  return {
    data: result.data,
    error: loading ? '' : result.error,
    loading,
    reload: () => setVersion((v) => v + 1),
  };
}
