# 🎓 Campus Marketplace

A full-stack MERN campus-only second-hand marketplace where students can **buy, sell, and rent** items within their college campus — no delivery, no payment gateway, just safe in-person exchanges between students.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Application Flow](#application-flow)
- [Screenshots](#screenshots)

---

## ✨ Features

### Auth
- Register with email + OTP verification (no login until verified)
- JWT access token (15 min) + refresh token (7 days) with HTTP-only cookies
- Forgot password via OTP email
- Secure logout — clears tokens from DB and cookies

### Products
- List items for **sale** or **rent** (per day pricing)
- Upload up to 5 images via Cloudinary
- Full-text search, filter by category / condition / price range, sort
- "Deal in Progress" and "Currently Rented" badges on active listings
- Edit and soft-delete your own listings
- Products auto-disappear from browse after seller marks order complete

### Orders (Campus Flow — No Payment)
- Buyer sends a buy/rental request with an optional note
- Seller accepts, sets meetup location + time
- Both parties receive each other's contact details via email on acceptance
- Seller marks order complete after in-person exchange
- Rental listings become available again after rental completion

### Reviews
- Buyers can leave a 1–5 star rating + comment after a completed order
- Seller's average rating updates automatically
- Reviews visible on public seller profiles

### Profile
- Edit profile, upload/change avatar (Cloudinary)
- View own listings, purchase history, sales history
- Seller dashboard: incoming requests with Accept / Decline / Complete actions
- Public profile page per seller with listings + reviews

### AI Integration (Google Gemini)
- **Description Generator** — generates a compelling 80-word product description from title + category + condition
- **Price Suggester** — suggests fair resale price range with visual range bar and reasoning
- **Chat Assistant** — floating chat widget for buyers, context-aware when viewing a product

### Email Notifications (Nodemailer + Mailtrap)
- OTP verification on signup
- Welcome email after verification
- Password reset OTP
- Order request notification (with buyer's contact to seller)
- Order acceptance notification (with seller's contact + meetup to buyer)
- Rental emails include full timeline: start date → end date → total cost

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database + ODM |
| JWT | Access & refresh token auth |
| Bcrypt | Password hashing |
| Nodemailer | Email (OTP, notifications) |
| Multer | File upload (temp disk storage) |
| Cloudinary | Image storage & CDN |
| Google Gemini API | AI features |
| Express Rate Limit | Rate limiting for AI routes |

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| React Router v7 | Client-side routing |
| Tailwind CSS v4 | Utility-first styling |
| Lucide React | Icon library |
| Vite | Dev server + bundler |
| Native Fetch API | HTTP requests (no Axios) |

---

## 📁 Project Structure

```
Campus_Marketplace/
├── server1/                          # Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # Register, login, OTP, refresh, logout
│   │   │   ├── user.controller.js    # Profile, avatar, listings, reviews
│   │   │   ├── product.controller.js # CRUD, search, browse
│   │   │   ├── order.controller.js   # Buy flow, accept, complete, cancel
│   │   │   └── ai.controller.js      # Description, price, chat
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js    # verifyJWT
│   │   │   └── multer.middleware.js  # File upload
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── product.model.js
│   │   │   ├── order.model.js
│   │   │   └── review.model.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── order.routes.js
│   │   │   └── ai.routes.js
│   │   ├── services/
│   │   │   ├── email.service.js      # All email templates
│   │   │   └── ai.service.js         # Gemini API wrapper
│   │   ├── utils/
│   │   │   ├── ApiError.js
│   │   │   ├── ApiResponse.js
│   │   │   ├── asyncHandler.js
│   │   │   ├── generateOTP.js
│   │   │   └── cloudinary.js
│   │   ├── app.js                    # Express app setup
│   │   └── index.js                  # Server entry point
│   ├── .env
│   └── package.json
│
└── Frontend/                         # Frontend
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── AITools.jsx           # Description + price AI tools
    │   │   └── AIChatWidget.jsx      # Floating chat assistant
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── SignupPage.jsx         # Includes OTP verify step
    │   │   ├── ForgotPasswordPage.jsx
    │   │   ├── HomePage.jsx           # Browse + search + flip cards
    │   │   ├── SellItemPage.jsx       # List with AI tools
    │   │   ├── ProfilePage.jsx        # Tabs: listings, purchases, sales, requests
    │   │   └── OrdersPage.jsx
    │   ├── services/
    │   │   └── api.js                 # Centralized fetch wrapper
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css                  # CSS variables + animations
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)
- Mailtrap account (free, for dev email testing)
- Google AI Studio account (free Gemini API key)

### 1. Clone the repository

```bash
git clone https://github.com/mohit234563/Campus_Marketplace.git
cd Campus_Marketplace
```

### 2. Setup Backend

```bash
cd server1
npm install
```

Create `.env` file (see [Environment Variables](#environment-variables) below).

```bash
npm run dev
# Server starts on http://localhost:5000
```

### 3. Setup Frontend

```bash
cd Frontend
npm install
npm run dev
# App starts on http://localhost:5173
```

---

## 🔐 Environment Variables

Create `server1/.env`:

```env
# ── Server ────────────────────────────────────────────
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# ── MongoDB ───────────────────────────────────────────
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net
DB_NAME=campus_marketplace

# ── JWT ───────────────────────────────────────────────
ACCESS_TOKEN_SECRET=your_long_random_secret_here
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=another_different_long_secret
REFRESH_TOKEN_EXPIRY=7d

# ── Email — use Mailtrap for development ──────────────
# Get from: mailtrap.io → Inboxes → SMTP Settings
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_mailtrap_smtp_user
SMTP_PASS=your_mailtrap_smtp_pass
SMTP_FROM=noreply@campusmarketplace.com

# ── Cloudinary ────────────────────────────────────────
# Get from: cloudinary.com → Dashboard
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── Google Gemini AI ──────────────────────────────────
# Get from: aistudio.google.com → Get API Key (free)
GEMINI_API_KEY=AIzaSy...your_key_here
```

---

## 📡 API Reference

### Auth — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | ❌ | Register + send OTP |
| POST | `/verify-otp` | ❌ | Verify email OTP |
| POST | `/resend-otp` | ❌ | Resend verification OTP |
| POST | `/login` | ❌ | Login → access + refresh tokens |
| POST | `/logout` | ✅ | Clear tokens |
| POST | `/refresh-token` | ❌ | Issue new access token |
| POST | `/forgot-password` | ❌ | Send reset OTP |
| POST | `/reset-password` | ❌ | Reset password with OTP |

### Users — `/api/users`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/profile` | ✅ | Own full profile |
| PATCH | `/profile` | ✅ | Edit profile fields |
| PATCH | `/avatar` | ✅ | Upload/change avatar |
| DELETE | `/avatar` | ✅ | Remove avatar |
| POST | `/change-password` | ✅ | Change password |
| GET | `/my-listings` | ✅ | Own listings with filters |
| GET | `/purchase-history` | ✅ | Orders as buyer |
| GET | `/sales-history` | ✅ | Orders as seller |
| POST | `/reviews` | ✅ | Submit review after completed order |
| GET | `/:username/profile` | ❌ | Public seller profile |
| GET | `/:username/reviews` | ❌ | Seller's reviews |

### Products — `/api/products`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | ❌ | Browse with search, filter, sort, paginate |
| GET | `/:productId` | ❌ | Single product detail |
| POST | `/` | ✅ | List new product (multipart/form-data) |
| PATCH | `/:productId` | ✅ | Update product fields |
| DELETE | `/:productId` | ✅ | Soft delete product |

### Orders — `/api/orders`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | ✅ | Send buy/rental request |
| GET | `/my-orders` | ✅ | My requests as buyer |
| GET | `/incoming` | ✅ | Requests on my listings |
| GET | `/:orderId` | ✅ | Order detail (contact revealed when confirmed) |
| PATCH | `/:orderId/accept` | ✅ | Accept + set meetup (seller only) |
| PATCH | `/:orderId/complete` | ✅ | Mark done after exchange (seller only) |
| PATCH | `/:orderId/cancel` | ✅ | Cancel (buyer or seller) |

### AI — `/api/ai` (rate limited: 20 req / 15 min)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/generate-description` | ✅ | Generate product description |
| POST | `/suggest-price` | ✅ | Suggest fair price range |
| POST | `/chat` | ✅ | Chat with AI assistant |

---

## 🔄 Application Flow

### First-time user
```
Register → Check email (OTP) → Verify OTP → Login → Browse / Sell
```

### Buying flow
```
Browse products → Click "Request" → (Rental: pick dates) → Order created (pending)
→ Seller sees request in "Requests" tab → Accepts + sets meetup
→ Both get contact details via email → Meet on campus + exchange item + cash
→ Seller clicks "Mark as Completed" → Product removed from listings
→ Buyer can now leave a review
```

### Token lifecycle
```
Login → accessToken (15 min) + refreshToken (7 days)
Every request → verifyJWT checks accessToken
Token expired → frontend calls /refresh-token → new accessToken issued
RefreshToken expired → force logout → redirect to login
```

---

## 📦 Backend Dependencies

```json
{
  "dependencies": {
    "express": "^4.x",
    "mongoose": "^8.x",
    "dotenv": "^16.x",
    "cors": "^2.x",
    "cookie-parser": "^1.x",
    "bcrypt": "^5.x",
    "jsonwebtoken": "^9.x",
    "nodemailer": "^6.x",
    "multer": "^1.x",
    "cloudinary": "^2.x",
    "@google/generative-ai": "^0.x",
    "express-rate-limit": "^7.x"
  },
  "devDependencies": {
    "nodemon": "^3.x"
  }
}
```

## 📦 Frontend Dependencies

```json
{
  "dependencies": {
    "react": "^19.x",
    "react-dom": "^19.x",
    "react-router-dom": "^7.x",
    "lucide-react": "^0.x"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.x",
    "@tailwindcss/vite": "^4.x",
    "tailwindcss": "^4.x",
    "vite": "^7.x"
  }
}
```

---

## 👨‍💻 Author

**Mohit** — [github.com/mohit234563](https://github.com/mohit234563)

---

> Built for students, by students. No delivery fees, no payment gateway, just campus trust. 🎓