# NNPTUD_BCCK
# Decor Shop
- `backend/`: Node.js + Express + SQL Server + Socket.IO
- `frontend/`: React + Vite
- `database/`: SQL Server scripts
## Database Setup
Run the SQL files in this order:
1. `database/01_create_database.sql`
2. `database/02_schema.sql`
3. `database/03_indexes.sql`
4. `database/04_seed_roles.sql`
5. `database/05_seed_sample_catalog.sql` (optional sample catalog)
6. `database/06_seed_sample_users.sql` (optional sample users, cart, and address)

## Backend Setup

```bash
cd backend
npm install
npm run dev
```
Default backend URL:
- `http://localhost:5000`
- API base: `http://localhost:5000/api/v1`

- `GET /health`
## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Default frontend URL:

- `http://localhost:5173`

Create a local env file from `frontend/.env.example` if needed.

Default values:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

## Sample Seed Accounts

If you run `database/06_seed_sample_users.sql` or `npm run seed` in `backend/`, these accounts are created:

- `admin@decor.local` / `Pass@123`
- `staff@decor.local` / `Pass@123`
- `customer@decor.local` / `Pass@123`

## Backend Modules

- auth
- roles
- users
- categories
- products
- product-images
- inventory
- carts
- addresses
- orders
- payments
- messages
- notifications
- uploads
- reviews
- dashboard

## Checkout Transaction Flow

The checkout service performs these SQL Server steps in one transaction:

1. Load cart and cart items
2. Validate cart is not empty
3. Lock and validate inventory
4. Create order
5. Create order items
6. Create payment
7. Update inventory
8. Clear cart items
9. Create notification
10. Commit

Any failure triggers rollback for the whole flow.

## Useful Commands

Backend:

```bash
npm run dev
npm run seed
npm start
```
Frontend:
```bash
npm run dev
npm run build
npm run preview
```