# Primerch Server

Backend API for Primerch - an e-commerce merchandise platform built with Express.js, Prisma, and PostgreSQL.

## Tech Stack

- **Runtime**: Bun
- **Framework**: Express.js v5
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (Access & Refresh tokens)
- **File Upload**: Cloudinary
- **Validation**: Zod
- **Logging**: Winston

## Features

- 🔐 JWT-based authentication with refresh token rotation
- 🛍️ Product management with variants (size, color)
- 📦 Shopping cart functionality
- 📝 Order processing with multiple payment methods
- ⭐ Product reviews and ratings
- 💝 Product likes and bookmarks
- 🎨 Category management
- 📷 Image upload via Cloudinary
- 👤 User and admin role management

## Prerequisites

- [Bun](https://bun.sh/) (latest version)
- PostgreSQL database
- Cloudinary account

## Installation

1. Clone the repository and install dependencies:

```bash
bun install
```

2. Set up environment variables:

Create a `.env` file in the root directory:

```env
PORT=8000
DATABASE_URL="postgresql://user:password@localhost:5432/primerch"
ACCESS_TOKEN_SECRET="your-access-token-secret"
REFRESH_TOKEN_SECRET="your-refresh-token-secret"
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"
```

3. Set up the database:

```bash
# Generate Prisma client
bunx prisma generate

# Run migrations
bunx prisma migrate dev

# (Optional) Seed the database
node prisma/seed.js
```

## Development

Start the development server with hot reload:

```bash
bun run dev
```

Start the production server:

```bash
bun run start
```

The server will run on `http://localhost:8000` (or the PORT specified in `.env`).

## Project Structure

```
server/
├── app/
│   ├── controller/      # Request handlers
│   ├── database/        # Database config and logging
│   ├── generated/       # Prisma client
│   ├── helper/          # Utility functions
│   ├── middleware/      # Express middlewares
│   ├── response/        # Response formatters
│   ├── route/           # API routes
│   ├── service/         # Business logic
│   ├── type/            # TypeScript types
│   ├── validation/      # Zod schemas
│   └── server.ts        # Express app setup
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.js          # Database seeder
├── index.ts             # Entry point
└── package.json
```

## API Endpoints

### Public Routes

#### Authentication
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /refresh-token` - Refresh access token

#### Products
- `GET /products` - Query products with filters
- `GET /products/get` - Get single product
- `POST /products/stock` - Check product stock

#### Categories
- `GET /categories` - Query categories
- `GET /categories/get` - Get single category

#### Social Features
- `GET /products/:productId/like-count` - Get product like count
- `GET /products/:productId/bookmark-count` - Get product bookmark count
- `GET /products/:productId/reviews` - Get product reviews
- `GET /products/:productId/total-reviews` - Get total review count

### User Routes (Requires Authentication)

#### Profile
- `GET /me` - Get current user profile

#### Cart
- `GET /cart` - Get user's cart
- `POST /product-in-cart` - Add product to cart
- `PATCH /product-in-cart/:productInCartId/quantity/inc` - Increase quantity
- `PATCH /product-in-cart/:productInCartId/quantity/dec` - Decrease quantity
- `DELETE /product-in-cart/:productInCartId` - Remove from cart

#### Orders
- `GET /orders` - Get user orders
- `GET /orders/:orderId` - Get order details
- `GET /order-information` - Get order summary information
- `POST /orders` - Create new order

#### Likes
- `GET /products/:productId/liked-check` - Check if user liked product
- `POST /products/:productId/like-toggle` - Toggle product like
- `GET /liked` - Get user's liked products

#### Bookmarks
- `GET /products/:productId/bookmarked-check` - Check if user bookmarked product
- `POST /products/:productId/bookmark-toggle` - Toggle product bookmark
- `GET /bookmarked` - Get user's bookmarked products

#### Reviews
- `POST /products/:productId/review` - Create product review
- `GET /products/:productId/check-review` - Check if user reviewed product

### Admin Routes (Requires Admin Role)

- `POST /products` - Create new product

### Upload Routes

Image upload endpoints (requires authentication)

## Database Schema

The application uses the following main models:

- **User** - User accounts with roles (USER/ADMIN)
- **Product** - Product catalog with variants
- **Category** - Product categories
- **Variant** - Product variations (size + color combinations)
- **Cart** - Shopping carts
- **Order** - Customer orders
- **Review** - Product reviews and ratings
- **Media** - Cloudinary image references

## Payment Methods

Supported payment methods:
- Cash on Delivery
- Bank Transfer
- Virtual Account
- QRIS
- E-Wallets (Dana, OVO, GoPay, ShopeePay)
- Credit/Debit Cards

## Order Status Flow

`PENDING` → `PAID` → `SHIPPED` → `COMPLETED`

Alternative states: `FAILED`, `CANCELLED`, `REFUNDED`

## CORS Configuration

The server is configured to accept requests from `http://localhost:3000`. Update `app/server.ts` to modify CORS settings.

## License

Private project - All rights reserved
