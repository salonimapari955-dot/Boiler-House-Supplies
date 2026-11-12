import { useMemo, useState } from "react";

function SearchIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

export default function ProductSearch({
  category,
  products = [],
  loading,
  error,
  onProductSelect,
}) {
  const [query, setQuery] = useState("");
  const categoryName = category?.name || "this category";
  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return [];

    return products
      .filter((product) =>
        product.name.toLocaleLowerCase().includes(normalizedQuery),
      )
      .slice(0, 8);
  }, [products, query]);

  return (
    <div className="relative z-20 mb-5 rounded-xl border border-[#E3E7EB] bg-white p-3 shadow-[0_12px_34px_-30px_rgba(10,24,38,0.5)] sm:p-4">
      <label className="relative block">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A8694]" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search products in ${categoryName}...`}
          aria-label={`Search products in ${categoryName}`}
          className="h-11 w-full rounded-lg border border-[#E2E5E8] bg-[#F9FAFB] pl-10 pr-3 text-sm text-[#2D3239] outline-none transition focus:border-[#C7460D] focus:bg-white focus:ring-2 focus:ring-[#C7460D]/10"
        />
      </label>

      {query.trim() ? (
        <div className="mt-2">
          {loading ? (
            <p className="px-2 py-2 text-sm text-[#7A8694]">
              Loading products...
            </p>
          ) : error ? (
            <p role="status" className="px-2 py-2 text-sm text-[#7A8694]">
              Products could not be loaded.
            </p>
          ) : results.length > 0 ? (
            <ul
              aria-label={`Product search results in ${categoryName}`}
              className="max-h-64 space-y-0.5 overflow-y-auto"
            >
              {results.map((product) => (
                <li key={product.id || product.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      onProductSelect(product);
                    }}
                    className="flex w-full flex-col rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[#FFF4ED]"
                  >
                    <span className="w-full truncate text-sm font-semibold text-[#2D3239]">
                      {product.name}
                    </span>
                    <span className="mt-0.5 w-full truncate text-xs text-[#7A8694]">
                      {categoryName}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p role="status" className="px-2 py-2 text-sm text-[#7A8694]">
              No matching products found.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
