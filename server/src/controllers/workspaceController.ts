import { Request, Response } from 'express';
import { Workspace } from '../models/Workspace';
import crypto from 'crypto';

export const createWorkspace = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const inviteCode = crypto.randomBytes(6).toString('hex').toUpperCase();
  const workspace = await Workspace.create({
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

export const getWorkspaces = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const workspaces = await Workspace.find({ members: userId }).populate('owner', 'name email');
  res.json({ success: true, data: workspaces });
};

export const getWorkspace = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const workspace = await Workspace.findById(id)
    .populate('members', 'name email avatar')
    .populate('owner', 'name email');

  if (!workspace) {
    return res.status(404).json({ success: false, message: 'Workspace not found' });
  }

  if (!userId || !workspace.members.some((member) => member.toString() === userId)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  res.json({ success: true, data: workspace });
};

export const updateWorkspace = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const userId = req.user?.id;

  const workspace = await Workspace.findById(id);
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

export const deleteWorkspace = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const workspace = await Workspace.findById(id);
  if (!workspace) {
    return res.status(404).json({ success: false, message: 'Workspace not found' });
  }

  if (workspace.owner.toString() !== userId) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  await Workspace.deleteOne({ _id: id });
  res.json({ success: true, message: 'Workspace deleted' });
};

export const joinWorkspace = async (req: Request, res: Response) => {
  const { inviteCode } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const workspace = await Workspace.findOne({ inviteCode });
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

export const leaveWorkspace = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const workspace = await Workspace.findById(id);
  if (!workspace) {
    return res.status(404).json({ success: false, message: 'Workspace not found' });
  }

  workspace.members = workspace.members.filter((m) => m.toString() !== userId);
  await workspace.save();

  res.json({ success: true, message: 'Left workspace' });
};
