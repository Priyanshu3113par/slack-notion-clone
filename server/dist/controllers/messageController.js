"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessage = exports.getMessages = void 0;
const Message_1 = require("../models/Message");
const getMessages = async (req, res) => {
    const { channelId } = req.params;
    const messages = await Message_1.Message.find({ channelId })
        .populate('senderId', 'name email avatar')
        .sort({ createdAt: 1 });
    res.json({ success: true, data: messages });
};
exports.getMessages = getMessages;
const createMessage = async (req, res) => {
    const { channelId, message } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const newMessage = await Message_1.Message.create({
        channelId,
        senderId: userId,
        message
    });
    const populated = await newMessage.populate('senderId', 'name email avatar');
    res.status(201).json({ success: true, data: populated });
};
exports.createMessage = createMessage;
//# sourceMappingURL=messageController.js.map