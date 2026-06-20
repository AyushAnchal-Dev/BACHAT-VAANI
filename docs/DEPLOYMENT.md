# Deployment Guide — BachatKhata

This document lists production readiness checks and recommended settings for deploying BachatKhata.

1) Build & CI
- Run `npm ci` and `npm run build` in CI. Ensure `npm run build` exits 0.
- Run `npm run lint` and `npm run typecheck` (if configured).

2) Environment
- Provide `DATABASE_URL` and `JWT_SECRET` via the hosting platform environment settings.
- Provide `ALLOWED_ORIGINS` (comma-separated) for production (no wildcards).

3) HTTPS & Security
- Enforce HTTPS (STS header). Vercel provides HTTPS by default.
- Use `Secure`, `HttpOnly`, `SameSite=Strict` cookies for session tokens.
- Apply CSP via middleware; avoid inline scripts/styles.

4) Cookies & Sessions
- Ensure cookie `secure` flag is set when `NODE_ENV === 'production'`.
- Limit cookie path and set `SameSite=Strict` where applicable.

5) CORS
- Use `ALLOWED_ORIGINS` and the included `src/lib/cors.ts` helper.
- Do not allow `*` in `Access-Control-Allow-Origin` in production.

6) Compression & CDN
- Enable gzip/br compression at the CDN/edge.
- Cache static assets with long TTL and use cache-busting for build outputs.

7) Prisma & Database
- Run migrations in a controlled environment; prefer `prisma migrate deploy`.
- Keep database credentials and connection strings out of repository.

8) Monitoring & Logging
- Configure error reporting (Sentry or similar) and audit logging.
