# Build Rules and Constraints

This project uses two TypeScript configs:

- **tsconfig.json** → for Vite/client build (`moduleResolution: Bundler`).
- **tsconfig.build.json** → for server build (also `Bundler` mode).

### Why Bundler Mode?
- Most of the source tree uses extensionless imports (`../foo/bar`).
- Vite resolves these fine, but Node’s ESM loader requires `.js` extensions.
- Switching to `NodeNext` would force us to rewrite hundreds of imports, which is not feasible right now.

### Current Approach
- We keep both configs in Bundler mode so the source compiles cleanly.
- The server is started via `npm run start-prod`, which runs the build pipeline and produces Node‑runnable output.
- Do not attempt to run raw `tsc` output directly with Node — it will fail on extensionless imports.

### Future Migration
If we ever want to migrate to `NodeNext`:
- All relative imports must be updated to include `.js`.
- This should be done with a codemod and validated across the repo.
- Until then, stick with Bundler mode for both client and server builds.

