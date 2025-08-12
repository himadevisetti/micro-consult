import Module from 'module';
const originalRequire = Module.prototype.require;
Module.prototype.require = function hijackedRequire(id) {
    if (id === 'path-to-regexp') {
        const mod = originalRequire.call(this, id);
        const originalParse = mod.parse;
        mod.parse = function safeParse(input, options) {
            try {
                return originalParse(input, options);
            }
            catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                console.warn('⚠️ path-to-regexp parse error on:', input);
                console.warn('🧨 Swallowing error to prevent crash:', message);
                return [];
            }
        };
        return mod;
    }
    return originalRequire.call(this, id);
};
