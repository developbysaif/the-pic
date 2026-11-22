# SAGE & BOTANICA — Premium 3D Animated E-Commerce Platform

A production-ready, international luxury e-commerce experience crafted with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **MongoDB Atlas / Mongoose**, **Three.js & React Three Fiber**, **Framer Motion**, and **Lucide Icons**. Exclusively powered by **Cash on Delivery (COD)** checkout across Pakistan.

---

## 🌿 Brand Identity & Design System

- **Primary Background**: `#E5E8CE` (Pale Sage Ivory)
- **Primary Brand Color**: `#789575` (Muted Forest Sage)
- **Secondary Background**: `#FEFEF8` (Soft Ivory)
- **Dark Text**: `#263323` (Deep Forest)
- **Supporting Colors**:
  - `#FFFFFF` — White
  - `#D4DBC0` — Soft Sage
  - `#AAB99F` — Muted Green
  - `#F2F0E7` — Warm Neutral
  - `#567053` — Accent Forest Sage

---

## ✨ Key Features & Architecture

### 1. Interactive 3D Product Cards & Hero Showcase
- **3D Tilt & Floating Depth**: Framer Motion spring physics calculates dynamic `rotateX` and `rotateY` based on real-time cursor trajectory with soft drop shadows.
- **Three.js / React Three Fiber 3D Canvas**: Real-time 3D model viewer with orbital rotation, custom studio lighting (key, fill, rim lights), and PBR material reflections for bottles, ceramic candle jars, and mist sprays.

### 2. Animated Variant Selector with Soft Blur Effect
- Circular swatches pulled dynamically from MongoDB.
- Selected variant is sharp and highlighted with active ring; other variants exhibit a gentle aesthetic blur (`filter: blur(0.7px)`) that unblurs seamlessly on hover.
- Switching variants dynamically synchronizes product imagery, SKU, pricing, stock count, and cart preservation.

### 3. Interactive Product Image Hotspots & Quick View
- Clickable pulsing hot-spots positioned on product images (bamboo caps, bioactive supercritical sage core, UV-protective glass).
- Clicking or hovering reveals an animated feature inspection popup detailing part names, functions, benefits, and technical specifications.
- Instant Quick View modal with quantity adjustments, variant selection, and Add to Bag.

### 4. Trending Add-to-Cart Animation & Mini-Cart Drawer
- Product thumbnail animates and flies directly to the header cart icon upon clicking "Add to Bag".
- Header cart counter bounces with micro-interaction feedback.
- Flyout mini-cart drawer opens with free shipping progress bar, quantity counters, subtotal, and direct checkout link.
- Guest cart in `localStorage` seamlessly merges with MongoDB user cart upon login.

### 5. Cash on Delivery (COD) Checkout Workflow
- Exclusively Cash on Delivery (COD). No online card payment friction.
- Server-side price calculation and stock validation (browser prices are never trusted).
- Promo coupon code verification engine (e.g. `WELCOME10`, `SAGE500`).
- Generates unique order number (e.g. `SB-2026-XXXX`).
- Atomic stock decrement upon placement.
- Order confirmation page with live delivery date calculations.

### 6. Individual Customer Dashboard (`/account`)
- **Overview**: Order metrics and recent transactions.
- **My Orders**: Complete order history, items purchased, COD payment status.
- **Track Order**: 7-stage visual delivery timeline:
  1. *Order Placed*
  2. *Confirmed*
  3. *Processing*
  4. *Packed*
  5. *Dispatched*
  6. *Out for Delivery*
  7. *Delivered*
  Along with courier company and tracking number.
- **My Addresses**: Multi-address management with default selector.
- **Wishlist**: Saved formulations with instant "Move to Bag".
- **Profile**: Name, phone, and password updates.

### 7. Comprehensive Master Admin Panel (`/admin`)
- **Real-Time DB Analytics**: Total gross sales, order volume, patron count, low stock warnings, and status breakdown.
- **Product Management**: Full CRUD, image management, pricing, sale prices, stock counts, variant manager, and hotspot coordinates.
- **Category Management**: Create, edit, and safely delete categories with validation preventing orphan products.
- **Order Fulfillment Console**: Real-time status transitions, courier tracking number assignment, delivery note logging, and Cash on Delivery payment collection status reconciliation (`PENDING` -> `COLLECTED`).

---

## 🔑 Default Test Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@sageandbotanica.com` | `admin12345` |
| **Customer** | `customer@sageandbotanica.com` | `customer12345` |

*(Quick-fill buttons are also provided directly on the `/login` page for testing)*

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment (`.env.local`)
```env
MONGODB_URI=mongodb://127.0.0.1:27017/sage_store
JWT_SECRET=super_secret_sage_botanica_jwt_key_2026_98741352
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Seed Database
Populate real categories, AI-generated luxury botanical photography, variants, hotspots, reviews, coupons, and orders:
```bash
npm run seed
```

### 4. Run Development or Production
```bash
# Development
npm run dev

# Production Build & Start
npm run build
npm run start
```
Access the application at `http://localhost:3000`.
