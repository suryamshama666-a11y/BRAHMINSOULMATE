# Deployment Guide

This repo contains a Vite/React frontend and a Node/Express backend (TypeScript).
Below are the minimal steps to run locally and deploy safely without changing behavior.

## 1) Prerequisites
- Node.js 18+ (20 recommended)
- npm 9+
- Supabase project (URL + anon key + service role key)
- Razorpay sandbox keys (if using payments)

## 2) Environment Variables
Copy `.env.example` to `.env` and fill values.

Frontend (Vite):
- VITE_APP_URL = http://localhost:8080
- VITE_API_BASE_URL = http://localhost:3001
- VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
- Optional: VITE_SENTRY_DSN, VITE_SENTRY_ENVIRONMENT, VITE_SENTRY_REPLAY

Backend (Node):
- FRONTEND_URL = http://localhost:8080  # must match the Vite dev URL
- SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
- RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
- JWT_SECRET (or VITE_JWT_SECRET)

## 3) Run locally (Dev)
Terminal A (backend):
```
npm run server:dev
# Health:  http://localhost:3001/health
# Ready:   http://localhost:3001/ready
```

Terminal B (frontend):
```
npm run dev
# Open http://localhost:8080
```

The frontend calls the backend using `VITE_API_BASE_URL`.

## 4) Build & Preview
Frontend:
```
npm run build
npm run preview
```

Backend (prod):
```
npm run server:build
npm run server:start
```

## 5) Docker (Backend)
A minimal Dockerfile is provided:
```
cd backend
# Build image
docker build -t brahmin-soulmate-backend:latest .
# Run container
docker run -p 3001:3001 --env-file ../.env brahmin-soulmate-backend:latest
```

## 6) Smoke check (CI or local)
Run a minimal health probe against the backend:
```
npm run smoke:backend
```
Exits non-zero if /health or /ready fail.

## 7) Production notes
- Set `VITE_API_BASE_URL` on your frontend host to the HTTPS URL of your backend
- Set `FRONTEND_URL` on the backend to your deployed frontend origin
- Ensure CSP allows the resources you use (fonts, Sentry, Supabase); inline styles are allowed for Tailwind by default in this repo
- Optional Sentry sourcemaps: use `build:sentry:*` scripts and set SENTRY_* in CI

## 8) Routes present in backend
This repo currently includes the payments route only (`backend/src/routes/payments.ts`).
If you have additional route files (auth, profile, messages, etc.), place them under `backend/src/routes/` and we can wire them in `backend/src/server.ts`.


