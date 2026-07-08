"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocument = exports.updateDocument = exports.getDocument = exports.getDocuments = exports.createDocument = void 0;
const Document_1 = require("../models/Document");
const Workspace_1 = require("../models/Workspace");
const access_1 = require("../utils/access");
const createDocument = async (req, res) => {
    const { workspaceId, title, content, icon } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const workspace = await Workspace_1.Workspace.findById(workspaceId);
    if (!workspace || !(0, access_1.isWorkspaceMember)(workspace.members, userId)) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const document = await Document_1.Document.create({
        workspaceId,
        title,
        content,
        icon,
        createdBy: userId
    });
    res.status(201).json({ success: true, data: document });
};
exports.createDocument = createDocument;
const getDocuments = async (req, res) => {
    const { workspaceId } = req.params;
    const userId = req.user?.id;
    const workspace = await Workspace_1.Workspace.findById(workspaceId);
    if (!workspace || !(0, access_1.isWorkspaceMember)(workspace.members, userId)) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const documents = await Document_1.Document.find({ workspaceId }).populate('createdBy', 'name email');
    res.json({ success: true, data: documents });
};
exports.getDocuments = getDocuments;
const getDocument = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const document = await Document_1.Document.findById(id).populate('createdBy', 'name email');
    if (!document) {
        return res.status(404).json({ success: false, message: 'Document not found' });
    }
    const workspace = await Workspace_1.Workspace.findById(document.workspaceId);
    if (!workspace || !(0, access_1.isWorkspaceMember)(workspace.members, userId)) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    res.json({ success: true, data: document });
};
exports.getDocument = getDocument;
const updateDocument = async (req, res) => {
    const { id } = req.params;
    const { title, content, icon } = req.body;
    const userId = req.user?.id;
    const document = await Document_1.Document.findById(id);
    if (!document) {
        return res.status(404).json({ success: false, message: 'Document not found' });
    }
    const workspace = await Workspace_1.Workspace.findById(document.workspaceId);
    if (!workspace || !(0, access_1.isWorkspaceMember)(workspace.members, userId)) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    document.title = title || document.title;
    document.content = content || document.content;
    document.icon = icon || document.icon;
    await document.save();
    res.json({ success: true, data: document });
};
exports.updateDocument = updateDocument;
const deleteDocument = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const document = await Document_1.Document.findById(id);
    if (!document) {
        return res.status(404).json({ success: false, message: 'Document not found' });
    }
    const isCreator = (0, access_1.matchesId)(document.createdBy, userId);
    const ws = await Workspace_1.Workspace.findById(document.workspaceId);
    const isOwner = (0, access_1.matchesId)(ws?.owner, userId);
    if (!isCreator && !isOwner) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    await Document_1.Document.deleteOne({ _id: id });
    res.json({ success: true, message: 'Document deleted' });
};
exports.deleteDocument = deleteDocument;
//# sourceMappingURL=documentController.js.map