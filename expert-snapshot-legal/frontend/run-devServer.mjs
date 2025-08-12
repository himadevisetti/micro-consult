// run-devServer.mjs
import { register } from 'ts-node';

register({
  transpileOnly: true,
  compilerOptions: {
    module: 'ESNext',
  },
});

// Dynamically import the TypeScript entrypoint
await import('./devServer.ts');

