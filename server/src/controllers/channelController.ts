import { Request, Response } from 'express';
import { Channel } from '../models/Channel';
import { Workspace } from '../models/Workspace';

export const createChannel = async (req: Request, res: Response) => {
  const { workspaceId, name, description } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace || !workspace.members.includes(userId)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const channel = await Channel.create({
    workspaceId,
    name,
    description,
    createdBy: userId
  });

  res.status(201).json({ success: true, data: channel });
};

export const getChannels = async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  const channels = await Channel.find({ workspaceId }).populate('createdBy', 'name email');

  res.json({ success: true, data: channels });
};

export const getChannel = async (req: Request, res: Response) => {
  const { id } = req.params;
  const channel = await Channel.findById(id).populate('createdBy', 'name email');

  if (!channel) {
    return res.status(404).json({ success: false, message: 'Channel not found' });
  }

  res.json({ success: true, data: channel });
};

export const updateChannel = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const userId = req.user?.id;

  const channel = await Channel.findById(id);
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

export const deleteChannel = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const channel = await Channel.findById(id);
  if (!channel) {
    return res.status(404).json({ success: false, message: 'Channel not found' });
  }

  if (channel.createdBy.toString() !== userId) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  await Channel.deleteOne({ _id: id });
  res.json({ success: true, message: 'Channel deleted' });
};
