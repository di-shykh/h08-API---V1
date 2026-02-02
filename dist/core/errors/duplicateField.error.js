"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuplicateFieldError = void 0;
const domain_error_1 = require("./domain.error");
class DuplicateFieldError extends domain_error_1.DomainError {
    constructor(field) {
        super(`User with such ${field} already exists`, 'DUPLICATE_FIELD_ERROR', field);
    }
}
exports.DuplicateFieldError = DuplicateFieldError;
//# sourceMappingURL=duplicateField.error.js.map