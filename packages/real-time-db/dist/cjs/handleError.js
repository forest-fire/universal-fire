"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
const common_types_1 = require("common-types");
function handleError(err, method, props = {}) {
    const name = err.code || err.name !== 'Error' ? err.name : 'RealTimeDb';
    const e = common_types_1.createError(`RealTimeDb/${name}`, `An error [ ${name} ] occurred in RealTimeDb while calling the ${method}() method.` +
        props
        ? `\n${JSON.stringify(props, null, 2)}`
        : '');
    e.name = name;
    e.stack = err.stack;
    throw e;
}
exports.handleError = handleError;
