"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Channel = void 0;
const mongoose_1 = require("mongoose");
const channelSchema = new mongoose_1.Schema({
    workspaceId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
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
exports.Channel = (0, mongoose_1.model)('Channel', channelSchema);
//# sourceMappingURL=Channel.js.map