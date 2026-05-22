# API Reference — Kadke Sports

Base URL: `http://localhost:4000/api` (dev) · `https://api.kadkesports.com/api` (prod)

> **Interactive docs**: visit `/api/docs` for the full Swagger/OpenAPI UI with try-it-out.

## Authentication

All protected endpoints require:
```
Authorization: Bearer <accessToken>
```

Access tokens expire in 15 minutes. Use `/auth/refresh` to rotate.

## Endpoint Index

### Auth
| Method | Path                       | Auth   | Description                  |
| ------ | -------------------------- | ------ | ---------------------------- |
| POST   | `/auth/register`           | public | Create account               |
| POST   | `/auth/login`              | public | Email/password login         |
| POST   | `/auth/refresh`            | public | Rotate refresh token         |
| POST   | `/auth/logout`             | user   | Revoke all refresh tokens    |
| GET    | `/auth/me`                 | user   | Current user                 |
| GET    | `/auth/google`             | public | Start Google OAuth           |
| GET    | `/auth/google/callback`    | public | Google OAuth callback        |

### Users
| Method | Path                       | Auth   |
| ------ | -------------------------- | ------ |
| GET    | `/users/me`                | user   |
| PATCH  | `/users/me`                | user   |
| GET    | `/users/me/addresses`      | user   |
| POST   | `/users/me/addresses`      | user   |
| PATCH  | `/users/me/addresses/:id`  | user   |
| DELETE | `/users/me/addresses/:id`  | user   |
| GET    | `/users`                   | admin  |

### Products
| Method | Path                       | Auth   |
| ------ | -------------------------- | ------ |
| GET    | `/products`                | public | (q, category, brand, minPrice, maxPrice, sort, page, limit, featured) |
| GET    | `/products/featured`       | public |
| GET    | `/products/new-arrivals`   | public |
| GET    | `/products/top-rated`      | public |
| GET    | `/products/:slug`          | public |
| GET    | `/products/:slug/related`  | public |
| POST   | `/products`                | admin  |
| PATCH  | `/products/:id`            | admin  |
| DELETE | `/products/:id`            | admin  |

### Categories
| Method | Path                       | Auth   |
| ------ | -------------------------- | ------ |
| GET    | `/categories`              | public |
| GET    | `/categories/:slug`        | public |
| POST   | `/categories`              | admin  |
| PATCH  | `/categories/:id`          | admin  |
| DELETE | `/categories/:id`          | admin  |

### Cart
| Method | Path                       | Auth |
| ------ | -------------------------- | ---- |
| GET    | `/cart`                    | user |
| POST   | `/cart/items`              | user |
| PATCH  | `/cart/items/:id`          | user |
| DELETE | `/cart/items/:id`          | user |
| DELETE | `/cart`                    | user |

### Wishlist
| Method | Path                       | Auth |
| ------ | -------------------------- | ---- |
| GET    | `/wishlist`                | user |
| POST   | `/wishlist`                | user |
| DELETE | `/wishlist/:productId`     | user |

### Orders
| Method | Path                          | Auth   |
| ------ | ----------------------------- | ------ |
| POST   | `/orders`                     | user   |
| GET    | `/orders/my`                  | user   |
| GET    | `/orders/:orderNumber`        | user   |
| GET    | `/orders`                     | admin  |
| POST   | `/orders/:id/status`          | admin  |

### Payments (Razorpay)
| Method | Path                          | Auth   |
| ------ | ----------------------------- | ------ |
| POST   | `/payments/rzp/order`         | user   | Create Razorpay order |
| POST   | `/payments/rzp/verify`        | user   | Verify HMAC signature |
| POST   | `/payments/rzp/webhook`       | public | Webhook handler       |

### Reviews
| Method | Path                       | Auth |
| ------ | -------------------------- | ---- |
| GET    | `/reviews/:productId`      | public |
| POST   | `/reviews`                 | user   |
| DELETE | `/reviews/:id`             | user   |

### Coupons
| Method | Path                       | Auth   |
| ------ | -------------------------- | ------ |
| POST   | `/coupons/apply`           | user   |
| GET    | `/coupons`                 | admin  |
| POST   | `/coupons`                 | admin  |

### Inventory
| Method | Path                          | Auth  |
| ------ | ----------------------------- | ----- |
| GET    | `/inventory`                  | admin |
| GET    | `/inventory/low-stock`        | admin |
| GET    | `/inventory/:productId`       | admin |
| PATCH  | `/inventory/:productId`       | admin |

### Admin
| Method | Path                       | Auth  |
| ------ | -------------------------- | ----- |
| GET    | `/admin/dashboard`         | admin |

### Health & Metrics
| Method | Path                       | Auth   |
| ------ | -------------------------- | ------ |
| GET    | `/health`                  | public |
| GET    | `/health/ready`            | public |
| GET    | `/metrics`                 | public | Prometheus |

## Sample requests

### Register
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"new@user.com","password":"Strong@123","name":"New User"}'
```

### List products with filters
```bash
curl "http://localhost:4000/api/products?category=cricket&sort=price-asc&page=1&limit=20"
```

### Add to cart
```bash
curl -X POST http://localhost:4000/api/cart/items \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"clxxx","quantity":2,"size":"M","color":"Blue"}'
```

### Create order + Razorpay flow
```bash
# 1. Create order
curl -X POST http://localhost:4000/api/orders \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{"addressId":"clxxx","paymentMethod":"RAZORPAY","couponCode":"WELCOME10"}'

# 2. Get Razorpay order_id
curl -X POST http://localhost:4000/api/payments/rzp/order \
  -d '{"orderId":"<orderId from step 1>"}'

# 3. Frontend opens Razorpay checkout with returned rzpOrderId
# 4. On success, verify:
curl -X POST http://localhost:4000/api/payments/rzp/verify \
  -d '{"orderId":"...","razorpayOrderId":"...","razorpayPaymentId":"...","razorpaySignature":"..."}'
```

## Error response shape

```json
{
  "success": false,
  "statusCode": 400,
  "path": "/api/cart/items",
  "timestamp": "2026-05-22T12:34:56.789Z",
  "message": "Insufficient stock"
}
```

## Rate limits

100 requests / minute / IP by default (configurable via `THROTTLE_TTL` / `THROTTLE_LIMIT`).
Auth endpoints recommended to be tightened in production.
