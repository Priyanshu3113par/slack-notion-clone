"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Workspace = void 0;
const mongoose_1 = require("mongoose");
const workspaceSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    inviteCode: { type: String, required: true, unique: true }
}, { timestamps: true });
exports.Workspace = (0, mongoose_1.model)('Workspace', workspaceSchema);
//# sourceMappingURL=Workspace.js.map