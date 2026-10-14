# Meme'd Campaign Payout Tracker

Brands create campaigns with a milestone payout ladder. Creators submit posts to those campaigns and get paid as their views cross milestones. Total payouts never go over the campaign budget.

**Live app:** <>
**API:** https://memed-payout-tracker-theta.vercel.app/
**API health check:** https://memed-payout-tracker-theta.vercel.app/health (returns `{ "status": "ok" }`)

Demo accounts (password `Demo@1234` for both):

| Role | Email |
|---|---|
| Brand | `brand@demo.com` |
| Creator | `creator@demo.com` |

## Tech stack

- **Backend:** Node.js, Express 5, TypeScript, MongoDB + Mongoose, Redis, Zod, Jest
- **Frontend:** Next.js 16 (App Router), TypeScript, Mantine, Axios
- **Hosting:** Vercel (frontend and backend), MongoDB Atlas, Upstash Redis

## Project structure

```
backend/
  src/
    models/        User, Campaign, Submission
    controllers/   auth, campaign, submission
    routes/        auth, brand, creator, campaigns, submissions (all mounted in routes/index.ts)
    middleware/    auth (JWT + role check), validate (Zod), errorHandler
    validators/    Zod schemas for every request body
    utils/         payout.ts (payout + budget cap), tokens.ts, cache.ts, platform.ts
    config/        MongoDB and Redis connections
    scripts/       seed.ts (demo data)
  tests/           payout.test.ts
frontend/
  app/             /login, /signup, /brand, /creator
  components/      dashboards, forms and modals
  lib/axios.ts     API client with automatic token refresh
  proxy.ts         redirects users to the right page for their role
```

## Running locally

**Requirements:** Node 24+, pnpm, and either Docker or a MongoDB Atlas + Redis URL.

> MongoDB must run as a **replica set**, because the views update uses a transaction. Atlas is a replica set by default. A plain local `mongod` will not work; use the Docker setup below.

### Backend

```bash
cd backend
pnpm install
cp .env.example .env      # fill in the values, see the table below
pnpm seed                 # optional: add demo accounts and campaigns
pnpm dev                  # http://localhost:5000
```

Check that the API is up:

```bash
curl http://localhost:5000/health
# {"status":"ok"}
```

Or run the API, MongoDB (as a replica set) and Redis together with Docker:

```bash
cd backend
docker compose up --build
```

### Frontend

```bash
cd frontend
pnpm install
cp .env.example .env.local
pnpm dev                  # http://localhost:3000
```

### Tests

```bash
cd backend
pnpm test
```

These are unit tests for the payout calculation and the budget cap: highest milestone, several milestones crossed at once, repeated updates, partial payout when the budget runs short, and budget never exceeded.

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Port the API listens on (default `5000`) |
| `NODE_ENV` | `production` makes cookies `Secure` and `SameSite=None` |
| `MONGODB_URI` | MongoDB connection string (must be a replica set) |
| `JWT_SECRET` | Secret used to sign access tokens |
| `REDIS_URL` | Redis connection string, used for refresh tokens and the campaign cache |
| `CLIENT_URL` | Frontend URL, allowed by CORS |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `BACKEND_URL` | Backend URL. Next.js forwards every `/api/*` request here. |

## API

Every response has the shape `{ success, statusCode, message, data }`.

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/health` | public | Health check, returns `{ "status": "ok" }` |
| POST | `/api/auth/signup` | public | Create an account (brand or creator) |
| POST | `/api/auth/login` | public | Log in |
| POST | `/api/auth/refresh` | refresh cookie | Get a new access token |
| POST | `/api/auth/logout` | public | Log out and revoke the refresh token |
| GET | `/api/auth/me` | logged in | Current user |
| POST | `/api/brand/campaigns` | brand | Create a campaign |
| GET | `/api/brand/campaigns` | brand | Own campaigns with spent and remaining budget |
| GET | `/api/brand/campaigns/:id/submissions` | brand (owner) | Posts submitted to a campaign |
| GET | `/api/campaigns` | logged in | Live campaigns (cached in Redis) |
| POST | `/api/campaigns/:id/submissions` | creator | Submit a post link |
| GET | `/api/creator/submissions` | creator | Own posts and total earnings |
| PATCH | `/api/submissions/:id/views` | none, as the brief asks | Update views and pay out |

## How payouts work

When `PATCH /api/submissions/:id/views` is called:

1. Find the **highest milestone** the new view count has crossed. That is what the post has earned in total.
2. Subtract what this post has **already been paid**. The difference is what is owed now.
3. Cap that at the campaign's **remaining budget**.
4. Add it to the post's `paidAmount` and the campaign's `spent`.

Steps 1–3 are a pure function (`calculatePayout` in `backend/src/utils/payout.ts`), so they can be tested on their own.

Example with the ladder 10K → ₹500, 50K → ₹2,000, 100K → ₹5,000:

| Update | Earned | Already paid | Paid now |
|---|---|---|---|
| 12,000 views | ₹500 | ₹0 | ₹500 |
| 12,000 views again | ₹500 | ₹500 | ₹0 |
| 120,000 views | ₹5,000 | ₹500 | ₹4,500 |

### Concurrency (stretch)

The read, calculation and both writes run inside one **MongoDB transaction**. If two updates touch the same submission or campaign at the same time, MongoDB aborts one and it is retried with fresh data. So:

- two simultaneous updates can never spend more than the remaining budget
- the same milestone can never be paid twice

I tested this by sending three updates at once to a campaign with ₹5,500 left. They paid ₹4,500, ₹1,000 and ₹0, and `spent` ended exactly at the budget.

## Assumptions and decisions

- **Several milestones crossed in one update:** only the highest one counts. The creator gets that milestone's amount minus what they were already paid, not the sum of every milestone.
- **Budget runs out mid-payout:** the creator is paid whatever is left (a partial payout) and the campaign is then exhausted. The unpaid part is not owed later.
- **Payouts are never taken back.** View counts can only go up; a lower count is rejected with `400`.
- **Repeating the same update pays nothing,** because only the difference from what was already paid is paid.
- **A campaign is "live" while it has budget left.** Exhausted campaigns disappear from the creator list and stop accepting posts.
- **Milestones** must increase in both views and payout, and are sent in ascending order.
- **Money is stored in whole rupees** (integers) to avoid floating point errors.
- **Post links** must match the campaign's platform (Instagram or YouTube links only). The same link cannot be submitted to the same campaign twice.
- **The views endpoint has no auth,** as the brief says. In production it would be a signed webhook or an internal job pulling from the platform APIs. The creator dashboard has a "Simulate views" button that calls it.
- **Payouts are recorded, not transferred.** Moving real money would be a separate step.

## Authentication

- **Access token:** a JWT that lasts 15 minutes.
- **Refresh token:** a random string that lasts 7 days, stored in Redis so it can be revoked.
- Both tokens are sent in **httpOnly cookies**, so JavaScript cannot read them.
- Each refresh deletes the old refresh token and issues a new one (rotation). Logout deletes it from Redis.
- The frontend retries a request once after refreshing when it gets a `401`.
- A `role` cookie (also httpOnly) lets `proxy.ts` send users to the right dashboard. It only controls which page is shown; the backend always checks the role from the JWT.
- The frontend forwards `/api/*` to the backend with a Next.js rewrite, so the browser sees the cookies as same-site.

## Bonus features

- **Redis cache:** the live campaign list is cached for 60 seconds. The cache is cleared when a campaign is created and when a payout changes a campaign's budget. If Redis is down, requests fall back to MongoDB.
- **Rate limiting:** 100 requests per 15 minutes per IP on `/api`.
- **Docker:** `docker compose up` runs the API, MongoDB (as a replica set) and Redis.

## What I would add with more time

- Spotting stolen refresh tokens: if an already-used refresh token is sent again, log the user out everywhere.
- A signed webhook for view updates instead of an open endpoint.
- Integration tests for the API routes using an in-memory MongoDB replica set.
