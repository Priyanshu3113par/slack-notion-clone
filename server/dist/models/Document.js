"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Document = void 0;
const mongoose_1 = require("mongoose");
const documentSchema = new mongoose_1.Schema({
    workspaceId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
    icon: { type: String, default: 'NOTE' },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (_doc, ret) => {
            ret.id = ret._id?.toString();
            delete ret._id;
            return ret;
        }
    }
});
exports.Document = (0, mongoose_1.model)('Document', documentSchema);
//# sourceMappingURL=Document.js.map