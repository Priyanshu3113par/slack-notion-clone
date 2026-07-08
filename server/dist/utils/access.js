"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWorkspaceMember = exports.matchesId = void 0;
const mongoose_1 = require("mongoose");
const matchesId = (value, expectedId) => {
    if (!value || !expectedId) {
        return false;
    }
    if (typeof value === 'string') {
        return value === expectedId;
    }
    if (value instanceof mongoose_1.Types.ObjectId) {
        return value.toString() === expectedId;
    }
    if (typeof value === 'object') {
        const candidate = value.id ?? value._id;
        return (0, exports.matchesId)(candidate, expectedId);
    }
    return false;
};
exports.matchesId = matchesId;
const isWorkspaceMember = (members, userId) => {
    if (!userId) {
        return false;
    }
    return members.some((member) => (0, exports.matchesId)(member, userId));
};
exports.isWorkspaceMember = isWorkspaceMember;
//# sourceMappingURL=access.js.map