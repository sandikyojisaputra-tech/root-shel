import { useState, useCallback } from 'react';

interface UseAPIOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
}

interface UseAPIState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export const useAPI = <T = any>() => {
  const [state, setState] = useState<UseAPIState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const request = useCallback(async (
    url: string,
    options?: UseAPIOptions
  ): Promise<T> => {
    setState({ data: null, loading: true, error: null });

    try {
      const fetchOptions: RequestInit = {
        method: options?.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      };

      if (options?.body) {
        fetchOptions.body = JSON.stringify(options.body);
      }

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState({ data: null, loading: false, error: err });
      throw err;
    }
  }, []);

  const get = useCallback(
    (url: string, headers?: Record<string, string>) =>
      request(url, { method: 'GET', headers }),
    [request]
  );

  const post = useCallback(
    (url: string, body?: any, headers?: Record<string, string>) =>
      request(url, { method: 'POST', body, headers }),
    [request]
  );

  const put = useCallback(
    (url: string, body?: any, headers?: Record<string, string>) =>
      request(url, { method: 'PUT', body, headers }),
    [request]
  );

  const delete_ = useCallback(
    (url: string, headers?: Record<string, string>) =>
      request(url, { method: 'DELETE', headers }),
    [request]
  );

  const patch = useCallback(
    (url: string, body?: any, headers?: Record<string, string>) =>
      request(url, { method: 'PATCH', body, headers }),
    [request]
  );

  return {
    ...state,
    request,
    get,
    post,
    put,
    delete: delete_,
    patch,
  };
};
