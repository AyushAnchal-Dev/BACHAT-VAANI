# BachatVaani 🪙

BachatVaani is a production-ready, voice-enabled micro-savings Progressive Web App (PWA) designed for daily wage workers, street vendors, and helpers in India. Built with Next.js 15, React 19, Neon PostgreSQL, and Tailwind CSS, it enables workers to deposit daily earnings, query their balances, track streaks, and view financial literacy tips in English and Hindi using standard browser voice commands.

---

## 🏗️ Architecture Diagram

```mermaid

    BachatKhata is a voice-enabled Progressive Web App (PWA) that enables daily-wage workers, street vendors, and helpers to save micro-amounts, query balances by voice, and track streaks. The app is built with Next.js (App Router), Tailwind CSS, Prisma + PostgreSQL (Neon), and a lightweight serverless API.

    ---

    **Project Summary**
    - **Problem Statement**: Millions of informal workers lack simple, low-friction tools to save small amounts daily and track progress in local languages.
    - **Solution**: A PWA that uses browser voice input + a compact UI to record micro-savings, show progress, and surface localized tips.

    **Key Features**
    - Voice-driven save and balance queries (English & Hindi)
    - Offline-capable PWA shell with service worker
    - Secure cookie-based authentication with signed JWTs
    - Admin panel for tips, withdrawals, and reports
    - Audit logs and basic rate-limiting

    ---

    **Voice Saving Workflow (user-facing)**
    1. User opens the PWA and allows microphone access.
    2. User says: “Save 50 rupees” or taps the Save button.
    3. Client captures intent, sends authenticated request to `/api/savings`.
    4. Server updates ledger, increments streak if applicable, returns updated balance.
    5. Client plays confirmation (TTS) and updates UI.

    ---

    **Technology Stack**
    - Next.js (App Router)
    - React + TypeScript
    - Tailwind CSS
    - Prisma ORM + PostgreSQL (Neon)
    - Vercel for hosting (recommended)

    ---

    **System Architecture**
    See the `app/` directory for the Next.js App Router implementation. API routes live under `src/app/api/*`. The `src/lib/prisma.ts` file initializes Prisma using `DATABASE_URL` and the schema is in `prisma/schema.prisma`.

    ---

    **Database Design (high level)**
    - `users`, `transactions`, `withdrawals`, `goals`, `tips`, `audit_logs`, `notifications`, `voice_commands`.
    - Prisma schema lives in `prisma/schema.prisma` and targets a dedicated `bachatvaani` schema to enable isolation.

    ---

    **Security Measures**
    - Keep secrets out of source control; use host-provided environment variables.
    - Use `HttpOnly`, `Secure`, `SameSite` cookies for session tokens.
    - Apply strict CSP via middleware and avoid inline scripts.
    - Limit CORS origins in production via `ALLOWED_ORIGINS` and `src/lib/cors.ts`.

    ---

    **Environment Variables**
    Create a `.env` locally by copying `.env.example` and filling values.

    - `DATABASE_URL` — Purpose: Postgres connection string. Required: Yes.
    - `JWT_SECRET` — Purpose: HMAC secret for signing JWTs/cookies. Required: Yes.
    - `NODE_ENV` — Purpose: `development` or `production`. Required: No (defaults to `development`).
    - `ALLOWED_ORIGINS` — Purpose: Comma-separated allowed production origins (no wildcards). Required: Yes for production.
    - `CLOUDINARY_*` or `CLOUDINARY_URL` — Purpose: Optional media storage. Required: No.

    The app will throw during startup if `DATABASE_URL` is missing; `src/lib/prisma.ts` contains a clear error message.

    ---

    **Local Development**
    1. Install dependencies: `npm ci`
    2. Copy environment: `cp .env.example .env` and fill values locally
    3. Push Prisma schema (dev): `npx prisma db push`
    4. Run dev server: `npm run dev`

    **Tests**
    - Run unit/e2e tests: `npm run test`

    ---

    **Production Deployment (recommendations)**
    - Host on Vercel and add `DATABASE_URL`, `JWT_SECRET`, and `ALLOWED_ORIGINS` in the Vercel dashboard.
    - Ensure `ALLOWED_ORIGINS` lists production domains only (no `*`).
    - Use `prisma migrate deploy` for production migrations.

    See `docs/DEPLOYMENT.md` for more details.

    ---

    **Future Roadmap**
    - Add OTP phone verification for registration
    - Offline sync improvements and conflict resolution
    - Multi-language ML intent parsing for voice commands

    ---

    **Team**
    - Ayush Anchal — Lead developer

    ---

    For a safety checklist before publishing publicly, see `GITHUB_PUSH_CHECKLIST.md` and ensure you remove local `.env` and purge any secret from git history.
  { "amount": 250 }
  ```

---

## 🛠️ Local Installation & Development

### 1. Prerequisites
* Node.js v18 or later
* PostgreSQL database instance (local or Neon serverless)

### 2. Environment Configuration
Create a `.env` file in the root of the project:

```env
# Database connection string pointing to Neon PostgreSQL
DATABASE_URL="postgresql://user:password@hostname/dbname?sslmode=require&schema=bachatvaani"

# Secret key used for signing JWT cookies (minimum 32 characters)
JWT_SECRET="YOUR_LONG_HMAC_SECRET_KEY_FOR_JWT_SIGNING"
```

### 3. Database Sync & Push
Sync the database tables to your Postgres instance:
```bash
npx prisma db push
```

### 4. Running the Dev Server
Launch the compiler and Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view.

### 5. Running Tests
Run Vitest unit and end-to-end integration tests:
```bash
npm run test
```


