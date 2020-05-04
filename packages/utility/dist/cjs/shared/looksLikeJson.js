"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function looksLikeJson(data) {
    return data.trim().slice(0, 1) === '{' && data.trim().slice(-1) === '}'
        ? true
        : false;
}
exports.looksLikeJson = looksLikeJson;
//# sourceMappingURL=looksLikeJson.js.map