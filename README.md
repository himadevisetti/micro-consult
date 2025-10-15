# micro-consult

## Build Notes

- Use `npm run build` to compile both client and server.
- The server build uses `tsconfig.build.json` in **Bundler mode** so that source imports can remain extensionless.
- Node cannot run the raw `tsc` output directly with extensionless imports. Instead, rely on the build pipeline (`npm run start-prod`) which compiles and bundles correctly.
- Do not switch `tsconfig.build.json` to `NodeNext` without a coordinated migration of imports across the codebase.

## Environment Configuration

This project uses three environment files:

- **.env.example** – committed to the repo. Documents all required variables with safe defaults or placeholders.  
- **.env.local** – committed to the repo. Contains safe, non‑secret defaults for local development (ports, paths, feature flags, project paths).  
- **.env** – **not committed**. Contains secrets (API keys, DB credentials). Each developer and environment must supply their own.

### Key variables

- `PROJECT_ROOT` – absolute path to the project root.  
- `FRONTEND_SOURCE_PATH` – path to the `frontend/` source folder, used by the Vite dev server in **development mode**.  
- `FRONTEND_BUILD_PATH` – path to the built frontend assets (`frontend/build/frontend`), used in **production mode**.  
- `STORAGE_PATH` – path to the storage folder for customer templates/manifests.  
- `DATABASE_URL` – local database connection string (SQLite by default).  
- `NEXT_PUBLIC_DEBUG_LOGS` – frontend flag to enable verbose logging in the browser.  
- `AZURE_FORM_RECOGNIZER_ENDPOINT` / `AZURE_FORM_RECOGNIZER_KEY` – secrets for Azure Form Recognizer (only set in `.env`, never in `.env.local`).

### Getting started

1. Copy `.env.example` to `.env.local` and adjust the safe defaults for your machine (e.g. `PROJECT_ROOT`, `FRONTEND_SOURCE_PATH`).  
2. Copy `.env.example` to `.env` and fill in the secret values (Azure keys, real DB credentials).  
3. Run the app – the server will load `.env` first, then override with `.env.local`.  
4. For **dev mode**: `NODE_ENV=development` → Vite serves from `FRONTEND_SOURCE_PATH`.  
5. For **prod mode**: `NODE_ENV=production` → Express serves static assets from `FRONTEND_BUILD_PATH`.


