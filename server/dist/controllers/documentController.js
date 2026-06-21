"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocument = exports.updateDocument = exports.getDocument = exports.getDocuments = exports.createDocument = void 0;
const Document_1 = require("../models/Document");
const Workspace_1 = require("../models/Workspace");
const createDocument = async (req, res) => {
    const { workspaceId, title, content } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const workspace = await Workspace_1.Workspace.findById(workspaceId);
    if (!workspace || !workspace.members.includes(userId)) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const document = await Document_1.Document.create({
        workspaceId,
        title,
        content,
        createdBy: userId
    });
    res.status(201).json({ success: true, data: document });
};
exports.createDocument = createDocument;
const getDocuments = async (req, res) => {
    const { workspaceId } = req.params;
    const documents = await Document_1.Document.find({ workspaceId }).populate('createdBy', 'name email');
    res.json({ success: true, data: documents });
};
exports.getDocuments = getDocuments;
const getDocument = async (req, res) => {
    const { id } = req.params;
    const document = await Document_1.Document.findById(id).populate('createdBy', 'name email');
    if (!document) {
        return res.status(404).json({ success: false, message: 'Document not found' });
    }
    res.json({ success: true, data: document });
};
exports.getDocument = getDocument;
const updateDocument = async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user?.id;
    const document = await Document_1.Document.findById(id);
    if (!document) {
        return res.status(404).json({ success: false, message: 'Document not found' });
    }
    if (document.createdBy.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    document.title = title || document.title;
    document.content = content || document.content;
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
    if (document.createdBy.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    await Document_1.Document.deleteOne({ _id: id });
    res.json({ success: true, message: 'Document deleted' });
};
exports.deleteDocument = deleteDocument;
//# sourceMappingURL=documentController.js.map