# Boiler House Supplies — Frontend

React + Vite + Tailwind CSS storefront for Boiler House Supplies.

## Routes

| Route | Page |
| --- | --- |
| `/` | Homepage (hero, 3 featured products, reviews, contact, footer) |
| `/products` | Full product listing |
| `/products/:slug` | Product detail |

## Product data / admin integration

The storefront is **API-first**. It does not contain a separate product
catalogue. Products are loaded through `src/lib/productCatalog.js`:

1. If `VITE_API_URL` is configured, the app fetches
   `${VITE_API_URL}${VITE_PRODUCTS_PATH}` (default `/products`).
2. The response may be a plain array or an object containing one of
   `products`, `data`, `data.products`, `items`, `results`, or
   `data.data`.
3. Product fields are normalised from common admin names:
   `name` / `title`, `description` / `shortDescription`, `image` /
   `imageUrl` / `images[]`, `slug`, `category`, `price`, `items` /
   `features`, and `featured` / `isFeatured` / `showOnHomepage`.
4. The homepage picks three products, with featured products sorted first.
5. Until the API is connected, the existing catalogue in
   `src/data/products.js` is reused as a fallback so the site keeps working.

Copy `.env.example` to `.env` and set the API URL:

```env
VITE_API_URL=https://your-admin-api.example.com
```

If the API endpoint lives elsewhere, use `VITE_PRODUCTS_URL` for the full
URL. Set `VITE_DISABLE_LOCAL_PRODUCTS=true` once the API is live to remove
the fallback and show the clean empty state instead.

### Expected API response example

```json
{
  "products": [
    {
      "id": "p_1",
      "name": "Bronze Gauge Glass Valve",
      "slug": "bronze-gauge-glass-valve",
      "description": "Product description",
      "image": "https://.../product.jpg",
      "category": "Boiler Mountings",
      "featured": true
    }
  ]
}
```

## Reviews

There is no review backend in this repository, so the homepage shows an
honest empty state and **no invented ratings or testimonials**. To publish
real reviews, add an API/model with at least:

- `productId` (optional), `customerName`, `rating` (1–5), `reviewText`
- `verified` flag, `createdAt`, and a moderation status
- an endpoint for approved reviews and an aggregate rating

Connect that endpoint to the `Reviews` component
(`src/components/Reviews.jsx`) and keep the existing verified-only policy.

## Contact form

The contact form reuses the project’s existing `mailto:` enquiry flow
(`info@boilerhouse.in`). No contact backend exists yet, so the form opens
the visitor’s email client rather than storing data. If a backend is added,
replace the `handleSubmit` mailto call in
`src/components/ContactSection.jsx` with the API request.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```
