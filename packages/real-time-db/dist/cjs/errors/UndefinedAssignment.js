"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UndefinedAssignment = void 0;
class UndefinedAssignment extends Error {
    constructor(e) {
        super(e.message);
        this.stack = e.stack;
        if (e.name === "Error") {
            e.name = "AbstractedFirebase";
        }
    }
}
exports.UndefinedAssignment = UndefinedAssignment;
