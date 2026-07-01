"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    workspaceId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    channelId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Channel', required: true },
    senderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true }
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
exports.Message = (0, mongoose_1.model)('Message', messageSchema);
//# sourceMappingURL=Message.js.map