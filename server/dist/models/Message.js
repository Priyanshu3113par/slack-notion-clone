"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    channelId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Channel', required: true },
    senderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true }
}, { timestamps: true });
exports.Message = (0, mongoose_1.model)('Message', messageSchema);
//# sourceMappingURL=Message.js.map