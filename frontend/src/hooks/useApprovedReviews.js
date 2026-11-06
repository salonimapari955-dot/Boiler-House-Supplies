import { useCallback, useEffect, useState } from "react";
import { fetchApprovedReviews } from "../lib/reviewApi.js";

const initialState = {
  reviews: [],
  loading: true,
  error: null,
};

export function useApprovedReviews() {
  const [state, setState] = useState(initialState);
  const [attempt, setAttempt] = useState(0);

  const reload = useCallback(() => {
    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));
    setAttempt((current) => current + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    fetchApprovedReviews({ signal: controller.signal })
      .then((reviews) => {
        if (!active) return;

        setState({
          reviews,
          loading: false,
          error: null,
        });
      })
      .catch((error) => {
        if (
          !active ||
          error?.code === "ERR_CANCELED" ||
          error?.name === "CanceledError" ||
          error?.name === "AbortError"
        ) {
          return;
        }

        setState({
          reviews: [],
          loading: false,
          error: error?.message || "Unable to load approved reviews.",
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [attempt]);

  return { ...state, reload };
}
