# Rachvi Creation

<p align="center">
  <img src="frontend/public/logo.png" alt="Rachvi Creation logo" width="180" />
</p>

<p align="center">
  A full-stack e-commerce platform for premium handcrafted soy candles, aromatherapy products, festive collections, and gift sets.
</p>

## About the Project

Rachvi Creation brings handcrafted candles to customers through an elegant and responsive online shopping experience. The platform supports the complete buying journey—from discovering products and saving favourites to secure checkout, payment verification, order tracking, and product reviews.

The application also includes a protected administration area for managing products, orders, customers, inventory, and store performance.

## Features

### Customer Experience

- Responsive storefront for desktop, tablet, and mobile devices
- Product catalogue with categories, search, filters, and sorting
- Individual product pages with images, descriptions, pricing, and stock details
- Shopping cart with quantity and price management
- Wishlist for saving favourite products
- Customer registration, login, and JWT-based authentication
- Customer profile, saved addresses, and password management
- Razorpay payment integration and payment verification
- Order confirmation, history, status, and tracking information
- Ratings and product reviews
- WhatsApp ordering and customer-support shortcut

### Administration

- Protected admin dashboard
- Product creation, editing, deletion, and inventory management
- Product-image uploads through Cloudinary
- Order management with status and tracking-number updates
- Customer management and role controls
- Store statistics and overview

### Store Collections

- Scented soy candles
- Traditional matka candles
- Aromatherapy candles
- Festive collections
- Premium gift sets

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS, custom CSS |
| Animation and UI | Framer Motion, Swiper, Lucide React, Radix UI |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Authentication | JSON Web Tokens and bcrypt |
| Payments | Razorpay |
| Image storage | Cloudinary |
| API client | Axios |
| Security | Helmet, CORS, rate limiting |

## Project Structure

```text
Rachvi_Creation/
├── frontend/
│   ├── app/                 # Next.js pages and layouts
│   │   ├── (auth)/          # Login and registration
│   │   ├── (store)/         # Shop, cart, checkout and profile
│   │   └── admin/           # Admin dashboard, products and orders
│   ├── components/          # Layout and product components
│   ├── context/             # Auth, cart and wishlist state
│   ├── lib/                 # API client and request helpers
│   ├── public/              # Static assets
│   └── types/               # TypeScript types
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Application logic
│   │   ├── middleware/      # Authentication and error handling
│   │   ├── models/          # User, product and order models
│   │   ├── routes/          # REST API routes
│   │   └── utils/           # Cloudinary and token utilities
│   ├── seed.js              # Starter product data
│   └── server.js            # Express server entry point
└── .gitignore
```

## Getting Started

### Prerequisites

Install or create the following before starting:

- Node.js 20 or newer
- npm
- MongoDB Atlas database or a local MongoDB instance
- Cloudinary account for product images
- Razorpay account for online payments

### 1. Clone the Repository

```bash
git clone https://github.com/ayusharbindkumar/Rachvi_Creation.git
cd Rachvi_Creation
```

### 2. Configure the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Update `backend/.env` with your credentials:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Never commit `.env` files or production credentials to GitHub.

### 3. Add Starter Products

Run this once if you want to populate the database with sample candle products:

```bash
npm run seed
```

Review the seed file before running it against a production database.

### 4. Start the Backend

```bash
npm run dev
```

The API will run at `http://localhost:5000/api`.

Check its status at:

```text
http://localhost:5000/api/health
```

### 5. Configure and Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Available Commands

### Frontend

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |

### Backend

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API with Nodemon |
| `npm start` | Start the API in production mode |
| `npm run seed` | Add starter products to MongoDB |

## Main API Routes

| Route | Purpose |
| --- | --- |
| `/api/auth` | Registration, login, profile, addresses, and wishlist |
| `/api/products` | Product catalogue, product management, and reviews |
| `/api/orders` | Checkout, Razorpay verification, order history, and tracking |
| `/api/admin` | Store statistics, customers, and role management |
| `/api/health` | API health check |

## Deployment

One recommended production setup is:

- Deploy the Next.js frontend on Vercel.
- Deploy the Express backend on Render or another Node.js hosting service.
- Use MongoDB Atlas for the production database.
- Store product images in Cloudinary.
- Add production Razorpay keys only to the backend hosting environment.

After deployment:

1. Set `NEXT_PUBLIC_API_URL` to the public backend URL ending in `/api`.
2. Set `FRONTEND_URL` on the backend to the public frontend URL.
3. Add every backend environment variable through the hosting dashboard.
4. Never expose `JWT_SECRET`, `CLOUDINARY_API_SECRET`, or `RAZORPAY_KEY_SECRET` in frontend variables.

## Security

- Passwords are hashed with bcrypt.
- Protected API requests use JWT authentication.
- Helmet adds secure HTTP headers.
- API rate limiting helps reduce abuse.
- CORS restricts browser requests to the configured frontend origin.
- Secret files and local uploads are excluded through `.gitignore`.

## Author

Developed by **Ayush Kumar**.

GitHub: [@ayusharbindkumar](https://github.com/ayusharbindkumar)

---

If you find this project useful, consider giving the repository a star.
