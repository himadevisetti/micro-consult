# micro-consult

## Build Notes

- Use `npm run build` to compile both client and server.
- The server build uses `tsconfig.build.json` in **Bundler mode** so that source imports can remain extensionless.
- Node cannot run the raw `tsc` output directly with extensionless imports. Instead, rely on the build pipeline (`npm run start-prod`) which compiles and bundles correctly.
- Do not switch `tsconfig.build.json` to `NodeNext` without a coordinated migration of imports across the codebase.

