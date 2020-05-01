"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FileDepthExceeded extends Error {
    constructor(e) {
        super(e.message);
        this.stack = e.stack;
        const name = 'RealTimeDb/depth-exceeded';
        if (e.name === 'Error') {
            this.name = name;
        }
        this.code = name.split('/')[1];
        this.stack = e.stack;
    }
}
exports.FileDepthExceeded = FileDepthExceeded;
