"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
exports.log = {
    info: (...args) => console.info('[server]', ...args),
    warn: (...args) => console.warn('[server]', ...args),
    error: (...args) => console.error('[server]', ...args)
};
//# sourceMappingURL=logger.js.map