import { Request, Response } from 'express';
import { Document } from '../models/Document';
import { Workspace } from '../models/Workspace';

export const createDocument = async (req: Request, res: Response) => {
  const { workspaceId, title, content } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace || !workspace.members.includes(userId)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const document = await Document.create({
    workspaceId,
    title,
    content,
    createdBy: userId
  });

  res.status(201).json({ success: true, data: document });
};

export const getDocuments = async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  const documents = await Document.find({ workspaceId }).populate('createdBy', 'name email');

  res.json({ success: true, data: documents });
};

export const getDocument = async (req: Request, res: Response) => {
  const { id } = req.params;
  const document = await Document.findById(id).populate('createdBy', 'name email');

  if (!document) {
    return res.status(404).json({ success: false, message: 'Document not found' });
  }

  res.json({ success: true, data: document });
};

export const updateDocument = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const userId = req.user?.id;

  const document = await Document.findById(id);
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

export const deleteDocument = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const document = await Document.findById(id);
  if (!document) {
    return res.status(404).json({ success: false, message: 'Document not found' });
  }

  if (document.createdBy.toString() !== userId) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  await Document.deleteOne({ _id: id });
  res.json({ success: true, message: 'Document deleted' });
};
