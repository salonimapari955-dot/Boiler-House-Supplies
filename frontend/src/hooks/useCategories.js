import { useCallback, useEffect, useState } from "react";
import { fetchCategories } from "../lib/productCatalog.js";

const initialState = {
  categories: [],
  loading: true,
  error: null,
};

export function useCategories() {
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

    fetchCategories({ signal: controller.signal })
      .then((result) => {
        if (!active) return;

        setState({
          categories: result.categories,
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
          categories: [],
          loading: false,
          error: error?.message || "Unable to load categories.",
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [attempt]);

  return { ...state, reload };
}
