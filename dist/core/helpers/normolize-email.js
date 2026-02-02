"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeEmail = normalizeEmail;
function normalizeEmail(email) {
    let normalized = email.toLowerCase().trim();
    const atIndex = normalized.indexOf('@');
    if (atIndex > 0) {
        const localPart = normalized.substring(0, atIndex);
        const domain = normalized.substring(atIndex);
        const plusIndex = localPart.indexOf('+');
        if (plusIndex > 0) {
            normalized = localPart.substring(0, plusIndex) + domain;
        }
    }
    return normalized;
}
//# sourceMappingURL=normolize-email.js.map