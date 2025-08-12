import('ts-node').then(tsNode => {
  tsNode.register({
    project: './tsconfig.codemod.json',
  });
  import('./fix-import-extensions.ts');
});

