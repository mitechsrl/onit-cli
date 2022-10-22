"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseError = exports.NotFoundError = exports.StringError = void 0;
class StringError extends Error {
}
exports.StringError = StringError;
class NotFoundError extends Error {
}
exports.NotFoundError = NotFoundError;
class ParseError extends Error {
    constructor(message, filename) {
        super(message);
        this.filename = filename;
    }
}
exports.ParseError = ParseError;
//# sourceMappingURL=errors.js.map