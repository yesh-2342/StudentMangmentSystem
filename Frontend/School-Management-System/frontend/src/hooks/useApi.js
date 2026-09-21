import { useState, useCallback } from 'react';

export const useApi = (apiFunc) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFunc(...args);
        setData(result);
        return { data: result, error: null };
      } catch (err) {
        const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'An error occurred';
        setError(errMsg);
        return { data: null, error: errMsg };
      } finally {
        setLoading(false);
      }
    },
    [apiFunc]
  );

  return { data, loading, error, execute, setData };
};

export default useApi;
