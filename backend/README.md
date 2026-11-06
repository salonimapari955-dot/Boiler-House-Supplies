# Boiler House Supplies — Backend

Express + MongoDB (Mongoose) API for the Boiler House Supplies website. It powers
products, categories, enquiries, admin authentication, uploads and customer
reviews.

## Requirements

- Node.js 18 or newer
- MongoDB (local MongoDB or a MongoDB Atlas connection string)

## Setup

1. Open a terminal in the `backend` folder:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in `backend` with these values:

   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/boiler_house
   JWT_SECRET=replace-with-a-long-random-secret
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=replace-with-a-strong-password
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-smtp-username
   SMTP_PASS=your-smtp-password
   SMTP_FROM=Boiler House Supplies <no-reply@example.com>
   ```

   `PORT`, `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` and the
   `SMTP_*` settings are read from the environment. Email OTP requires
   `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` and
   `SMTP_FROM`. Do not commit real credentials to source control.

4. Create the admin account (only needed once):

   ```bash
   node createAdmin.js
   ```

5. Start the API:

   ```bash
   npm run dev
   ```

   or, for a normal start:

   ```bash
   npm start
   ```

   The API runs at `http://localhost:5000` by default.

## Project structure

```text
backend/
  config/        MongoDB connection
  controllers/   Request handlers (including reviewController.js)
  middleware/    JWT auth and upload middleware
  models/        Mongoose schemas (including Review.js)
  routes/        Express routers (including reviewRoutes.js)
  uploads/       Uploaded product images and brochures
  server.js      Express app entry point
```

## Review API

Base URL: `http://localhost:5000/api/reviews`

| Method | Endpoint        | Access | Description                                  |
| ------ | --------------- | ------ | -------------------------------------------- |
| POST   | `/`             | Public | Submit a review. New reviews are `pending`.  |
| GET    | `/`             | Public | Get approved reviews only, newest first.     |
| GET    | `/admin`        | Admin  | Get every review, newest first.              |
| PUT    | `/:id`          | Admin  | Update review content and/or approve/reject. |
| DELETE | `/:id`          | Admin  | Delete a review.                             |

### Review fields

| Field          | Type   | Required | Notes                                      |
| -------------- | ------ | -------- | ------------------------------------------ |
| `customerName` | String | Yes      | Maximum 120 characters.                    |
| `companyName`  | String | No       | Maximum 160 characters.                    |
| `location`     | String | Yes      | Maximum 160 characters.                    |
| `rating`       | Number | Yes      | Whole number from 1 to 5.                  |
| `review`       | String | Yes      | Maximum 2000 characters.                   |
| `status`       | String | No       | `pending`, `approved` or `rejected`.       |
| `createdAt`    | Date   | Auto     | Added by Mongoose timestamps.              |
| `updatedAt`    | Date   | Auto     | Added by Mongoose timestamps.              |

Public submissions always start with `status: "pending"`, even if a client sends
a different status. The API accepts either `customerName` or `name` and stores
the value as `customerName`.

### Submit a review

```bash
curl -X POST http://localhost:5000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Rahul Sharma",
    "companyName": "Sharma Industries",
    "location": "Pune, Maharashtra",
    "rating": 5,
    "review": "Good quality products and quick delivery."
  }'
```

Successful response (`201 Created`):

```json
{
  "success": true,
  "message": "Thank you. Your review has been submitted and is awaiting approval.",
  "review": {
    "_id": "...",
    "customerName": "Rahul Sharma",
    "companyName": "Sharma Industries",
    "location": "Pune, Maharashtra",
    "rating": 5,
    "review": "Good quality products and quick delivery.",
    "status": "pending",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Get approved reviews

```bash
curl http://localhost:5000/api/reviews
```

Only reviews with `status: "approved"` are returned. This is the endpoint used by
the public Testimonials page.

### Admin login

Admin review endpoints require the JWT returned by the existing admin login
route:

```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'
```

Copy the `token` from the response and send it as a Bearer token.

### Get all reviews (admin)

```bash
curl http://localhost:5000/api/reviews/admin \
  -H "Authorization: Bearer YOUR_TOKEN"
```

You can filter by status:

```bash
curl "http://localhost:5000/api/reviews/admin?status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Approve or reject a review

```bash
curl -X PUT http://localhost:5000/api/reviews/REVIEW_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status":"approved"}'
```

Use `"status":"rejected"` to reject a review, or `"status":"pending"` to move it
back to the approval queue.

### Edit review content

The same endpoint accepts any of the review fields. Only the fields included in
the request are changed, so the current status is preserved unless a new status
is also sent.

```bash
curl -X PUT http://localhost:5000/api/reviews/REVIEW_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customerName": "Rahul Sharma",
    "companyName": "Sharma Industries",
    "location": "Pune, Maharashtra",
    "rating": 4,
    "review": "Updated review text approved by the admin."
  }'
```

### Delete a review

```bash
curl -X DELETE http://localhost:5000/api/reviews/REVIEW_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Validation and errors

All endpoints return JSON in this shape:

```json
{
  "success": false,
  "message": "Explanation of the problem"
}
```

Handled cases include:

- Missing required fields (`customerName`, `location`, `rating`, `review`)
- Ratings outside 1–5 or non-whole ratings
- Invalid MongoDB review IDs (`400 Invalid review id`)
- Review not found (`404 Review not found`)
- Missing or invalid admin token (`401`)
- Invalid status values (`400`)

## Frontend connection

The React app uses Axios (`frontend/src/api.js`) with
`baseURL: "http://localhost:5000/api"`. The Testimonials page:

- loads approved reviews from `GET /api/reviews`
- submits the review form to `POST /api/reviews`
- shows loading, success, validation and API error states

Run the frontend separately:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server normally runs at `http://localhost:5173`.
