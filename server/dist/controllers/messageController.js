"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessage = exports.getMessages = void 0;
const Message_1 = require("../models/Message");
const Channel_1 = require("../models/Channel");
const Workspace_1 = require("../models/Workspace");
const access_1 = require("../utils/access");
const getMessages = async (req, res) => {
    const { channelId, workspaceId } = req.query;
    const routeChannelId = req.params.channelId;
    const effectiveChannelId = String(channelId || routeChannelId || '');
    const effectiveWorkspaceId = String(workspaceId || '');
    const userId = req.user?.id;
    const filters = {};
    if (effectiveChannelId) {
        const channel = await Channel_1.Channel.findById(effectiveChannelId);
        if (!channel) {
            return res.status(404).json({ success: false, message: 'Channel not found' });
        }
        const workspace = await Workspace_1.Workspace.findById(channel.workspaceId);
        if (!workspace || !(0, access_1.isWorkspaceMember)(workspace.members, userId)) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        filters.channelId = effectiveChannelId;
    }
    if (effectiveWorkspaceId) {
        const workspace = await Workspace_1.Workspace.findById(effectiveWorkspaceId);
        if (!workspace || !(0, access_1.isWorkspaceMember)(workspace.members, userId)) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        filters.workspaceId = effectiveWorkspaceId;
    }
    if (!effectiveChannelId && !effectiveWorkspaceId) {
        return res.status(400).json({ success: false, message: 'channelId or workspaceId is required' });
    }
    const messages = await Message_1.Message.find(filters)
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
    if (!channelId || !message) {
        return res.status(400).json({ success: false, message: 'Missing channelId or message body' });
    }
    const channel = await Channel_1.Channel.findById(channelId);
    if (!channel) {
        return res.status(404).json({ success: false, message: 'Channel not found' });
    }
    const workspace = await Workspace_1.Workspace.findById(channel.workspaceId);
    if (!workspace || !(0, access_1.isWorkspaceMember)(workspace.members, userId)) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const newMessage = await Message_1.Message.create({
        workspaceId: channel.workspaceId,
        channelId,
        senderId: userId,
        message
    });
    const populated = await newMessage.populate('senderId', 'name email avatar');
    res.status(201).json({ success: true, data: populated });
};
exports.createMessage = createMessage;
//# sourceMappingURL=messageController.js.map