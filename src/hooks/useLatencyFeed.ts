import { useEffect } from "react";
import useSWR from "swr";
import { fetchLatencySnapshot } from "@/lib/latencyApi";
import { useLatencyStore } from "@/store/latencyStore";

const REFRESH_INTERVAL = 10_000;

export const useLatencyFeed = () => {
  const updateSnapshot = useLatencyStore((state) => state.updateSnapshot);

  const swrResponse = useSWR("latency-feed", fetchLatencySnapshot, {
    refreshInterval: REFRESH_INTERVAL,
    revalidateOnFocus: true,
    suspense: false,
  });

  const { data, error, isLoading, mutate } = swrResponse;

  useEffect(() => {
    if (data) {
      updateSnapshot(data);
    }
  }, [data, updateSnapshot]);

  return {
    isLoading,
    error,
    mutate,
  };
};

