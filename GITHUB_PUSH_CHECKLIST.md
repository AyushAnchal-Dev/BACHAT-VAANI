# GitHub Push Checklist

Before pushing to a public repository, ensure the following:

- Remove any local `.env` files from the repository and commit (use `git rm --cached .env`).
- Ensure `.gitignore` contains `.env` and build artifacts (`.next`, `node_modules`, `dist`, `coverage`).
- Replace any secrets committed in history using `git filter-repo` or `BFG Repo-Cleaner`.
- Remove or redact any test credentials and debug logs.
- Run `npm run build` and fix all TypeScript/ESLint errors.
- Verify that no API keys or secrets remain in the codebase (`git grep -I "SECRET\|API_KEY\|PRIVATE KEY"`).
- Update `README.md` and add `docs/DEPLOYMENT.md` and `.env.example`.
- Create a release or tag for the initial public push.
