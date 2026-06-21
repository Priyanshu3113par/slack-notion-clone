"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveWorkspace = exports.joinWorkspace = exports.deleteWorkspace = exports.updateWorkspace = exports.getWorkspace = exports.getWorkspaces = exports.createWorkspace = void 0;
const Workspace_1 = require("../models/Workspace");
const crypto_1 = __importDefault(require("crypto"));
const createWorkspace = async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const inviteCode = crypto_1.default.randomBytes(6).toString('hex').toUpperCase();
    const workspace = await Workspace_1.Workspace.create({
        name,
        description,
        owner: userId,
        members: [userId],
        inviteCode
    });
    res.status(201).json({
        success: true,
        data: workspace
    });
};
exports.createWorkspace = createWorkspace;
const getWorkspaces = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const workspaces = await Workspace_1.Workspace.find({ members: userId }).populate('owner', 'name email');
    res.json({ success: true, data: workspaces });
};
exports.getWorkspaces = getWorkspaces;
const getWorkspace = async (req, res) => {
    const { id } = req.params;
    const workspace = await Workspace_1.Workspace.findById(id).populate('members', 'name email avatar').populate('owner', 'name email');
    if (!workspace) {
        return res.status(404).json({ success: false, message: 'Workspace not found' });
    }
    res.json({ success: true, data: workspace });
};
exports.getWorkspace = getWorkspace;
const updateWorkspace = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user?.id;
    const workspace = await Workspace_1.Workspace.findById(id);
    if (!workspace) {
        return res.status(404).json({ success: false, message: 'Workspace not found' });
    }
    if (workspace.owner.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    workspace.name = name || workspace.name;
    workspace.description = description || workspace.description;
    await workspace.save();
    res.json({ success: true, data: workspace });
};
exports.updateWorkspace = updateWorkspace;
const deleteWorkspace = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const workspace = await Workspace_1.Workspace.findById(id);
    if (!workspace) {
        return res.status(404).json({ success: false, message: 'Workspace not found' });
    }
    if (workspace.owner.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    await Workspace_1.Workspace.deleteOne({ _id: id });
    res.json({ success: true, message: 'Workspace deleted' });
};
exports.deleteWorkspace = deleteWorkspace;
const joinWorkspace = async (req, res) => {
    const { inviteCode } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const workspace = await Workspace_1.Workspace.findOne({ inviteCode });
    if (!workspace) {
        return res.status(404).json({ success: false, message: 'Invalid invite code' });
    }
    if (workspace.members.includes(userId)) {
        return res.status(400).json({ success: false, message: 'Already a member' });
    }
    workspace.members.push(userId);
    await workspace.save();
    res.json({ success: true, data: workspace });
};
exports.joinWorkspace = joinWorkspace;
const leaveWorkspace = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const workspace = await Workspace_1.Workspace.findById(id);
    if (!workspace) {
        return res.status(404).json({ success: false, message: 'Workspace not found' });
    }
    workspace.members = workspace.members.filter((m) => m.toString() !== userId);
    await workspace.save();
    res.json({ success: true, message: 'Left workspace' });
};
exports.leaveWorkspace = leaveWorkspace;
//# sourceMappingURL=workspaceController.js.map