"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainError = void 0;
class DomainError extends Error {
    constructor(message, code, field) {
        super(message);
        this.code = code;
        this.field = field;
    }
}
exports.DomainError = DomainError;
//# sourceMappingURL=domain.error.js.map