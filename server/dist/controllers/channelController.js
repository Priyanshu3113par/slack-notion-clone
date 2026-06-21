"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteChannel = exports.updateChannel = exports.getChannel = exports.getChannels = exports.createChannel = void 0;
const Channel_1 = require("../models/Channel");
const Workspace_1 = require("../models/Workspace");
const createChannel = async (req, res) => {
    const { workspaceId, name, description } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const workspace = await Workspace_1.Workspace.findById(workspaceId);
    if (!workspace || !workspace.members.includes(userId)) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const channel = await Channel_1.Channel.create({
        workspaceId,
        name,
        description,
        createdBy: userId
    });
    res.status(201).json({ success: true, data: channel });
};
exports.createChannel = createChannel;
const getChannels = async (req, res) => {
    const { workspaceId } = req.params;
    const channels = await Channel_1.Channel.find({ workspaceId }).populate('createdBy', 'name email');
    res.json({ success: true, data: channels });
};
exports.getChannels = getChannels;
const getChannel = async (req, res) => {
    const { id } = req.params;
    const channel = await Channel_1.Channel.findById(id).populate('createdBy', 'name email');
    if (!channel) {
        return res.status(404).json({ success: false, message: 'Channel not found' });
    }
    res.json({ success: true, data: channel });
};
exports.getChannel = getChannel;
const updateChannel = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user?.id;
    const channel = await Channel_1.Channel.findById(id);
    if (!channel) {
        return res.status(404).json({ success: false, message: 'Channel not found' });
    }
    if (channel.createdBy.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    channel.name = name || channel.name;
    channel.description = description || channel.description;
    await channel.save();
    res.json({ success: true, data: channel });
};
exports.updateChannel = updateChannel;
const deleteChannel = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const channel = await Channel_1.Channel.findById(id);
    if (!channel) {
        return res.status(404).json({ success: false, message: 'Channel not found' });
    }
    if (channel.createdBy.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    await Channel_1.Channel.deleteOne({ _id: id });
    res.json({ success: true, message: 'Channel deleted' });
};
exports.deleteChannel = deleteChannel;
//# sourceMappingURL=channelController.js.map