import { httpClient } from "@/lib/http-client";
import { AxiosError } from "axios";
import { use, useCallback, useEffect, useState } from "react";

type ApiResponse<T> = {
  data: T | null;
  loading: boolean;
  error: null | string;
  refetch: () => Promise<void>;
};

export function useApi<T>(
  url: string,
  queryParams?: Record<string, string>
): ApiResponse<T> {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<null | string>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryString = new URLSearchParams(queryParams).toString();
      const { data } = await httpClient.get(`${url}?${queryString}`);
      setData(data);
    } catch (err) {
      const error = err as AxiosError;

      if (error.response) {
        setError((error.response as any).data.message);
        return;
      }

      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}
