import { useCallback, useEffect, useState } from "react";
import { fetchProducts } from "../lib/productCatalog.js";

const initialState = {
  products: [],
  loading: true,
  error: null,
  source: null,
  warning: null,
};

export function useProducts() {
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

    fetchProducts({ signal: controller.signal })
      .then((result) => {
        if (!active) return;
        setState({
          products: result.products,
          loading: false,
          error: null,
          source: result.source,
          warning: result.warning,
        });
      })
      .catch((error) => {
        if (!active || error?.name === "AbortError") return;
        setState({
          products: [],
          loading: false,
          error: error?.message || "Unable to load products.",
          source: null,
          warning: null,
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [attempt]);

  return { ...state, reload };
}
