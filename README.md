# StayBnB — Full-Stack Airbnb Clone

A full-stack Airbnb clone built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Prisma + PostgreSQL**, **Leaflet maps**, and **Stripe** (test mode, with a built-in mock payment fallback).

**🔗 Live demo: [stay-bn-b-opal.vercel.app](https://stay-bn-b-opal.vercel.app)**

## Features

- **Property listings** — browse, search by destination, filter by category, guest count and date availability
- **Listing details** — photo gallery, amenities with icons, host profile, interactive map, reviews
- **Booking system** — calendar with unavailable dates blocked, live price breakdown, overlap-safe reservations
- **Payments** — checkout flow with price details; mock processor by default, real Stripe Checkout (test mode) when a key is set in `.env`
- **Maps** — Leaflet + OpenStreetMap (no API key needed) on listing pages, and a click-to-pin location picker when creating a listing
- **Reviews** — leave star ratings + comments after completed stays; averages shown across the app
- **Host dashboard** — earnings, upcoming reservations, ratings, and full listing management (create/delete)
- **Auth** — email/password signup & login with bcrypt hashing and JWT httpOnly-cookie sessions

## Getting started

```bash
npm install
npm run db:push     # sync the Postgres schema (set DATABASE_URL in .env first)
npm run db:seed     # load demo data
npm run dev         # http://localhost:3000
```

## Demo accounts

| Role  | Email              | Password    |
| ----- | ------------------ | ----------- |
| Guest | guest@staybnb.com  | password123 |
| Host  | host@staybnb.com   | password123 |

## Real Stripe payments (optional)

Add your Stripe **test** keys to `.env`:

```
STRIPE_SECRET_KEY="sk_test_..."
```

Checkout then redirects to Stripe Checkout instead of the mock processor. Use card `4242 4242 4242 4242` with any future expiry/CVC.

## Tech stack

| Layer     | Tech                                       |
| --------- | ------------------------------------------ |
| Frontend  | Next.js 15, React 19, Tailwind CSS v4      |
| Backend   | Next.js Route Handlers (REST API)          |
| Database  | PostgreSQL (Neon) via Prisma ORM           |
| Auth      | jose (JWT) + bcryptjs, httpOnly cookies    |
| Maps      | Leaflet + react-leaflet + OpenStreetMap    |
| Payments  | Stripe Checkout (test) / mock processor    |
| Dates     | react-day-picker, date-fns                 |
| Icons     | lucide-react                               |
