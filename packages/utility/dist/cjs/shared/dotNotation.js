"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function dotNotation(path) {
    path = path.slice(0, 1) === '/' ? path.slice(1) : path;
    return path ? path.replace(/\//g, '.') : undefined;
}
exports.dotNotation = dotNotation;
//# sourceMappingURL=dotNotation.js.map