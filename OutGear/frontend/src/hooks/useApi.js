import { useState, useEffect } from "react";

export function useApi(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url, {
          signal: controller.signal,
          ...options,
        });

        if (!response.ok)
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        const json = await response.json();
        setData(json.data || json); // Mengambil .data jika ada dari response success backend
        setError(null);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
          console.error("Fetch error:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [url, options]);

  return { data, loading, error };
}
