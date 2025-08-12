// ignore-css-loader.js
export function load(url, context, nextLoad) {
  if (url.endsWith('.css')) {
    return {
      format: 'module',
      shortCircuit: true,
      source: `
        export default new Proxy({}, {
          get: (target, prop) => prop
        });
      `
    };
  }
  return nextLoad(url, context);
}
