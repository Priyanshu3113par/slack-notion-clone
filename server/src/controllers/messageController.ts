import { Request, Response } from 'express';
import { Message } from '../models/Message';
import { Channel } from '../models/Channel';
import { Workspace } from '../models/Workspace';
import { isWorkspaceMember } from '../utils/access';

export const getMessages = async (req: Request, res: Response) => {
  const { channelId, workspaceId } = req.query;
  const routeChannelId = req.params.channelId;
  const effectiveChannelId = String(channelId || routeChannelId || '');
  const effectiveWorkspaceId = String(workspaceId || '');
  const userId = req.user?.id;
  const filters: Record<string, string> = {};

  if (effectiveChannelId) {
    const channel = await Channel.findById(effectiveChannelId);
    if (!channel) {
      return res.status(404).json({ success: false, message: 'Channel not found' });
    }

    const workspace = await Workspace.findById(channel.workspaceId);
    if (!workspace || !isWorkspaceMember(workspace.members, userId)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    filters.channelId = effectiveChannelId;
  }

  if (effectiveWorkspaceId) {
    const workspace = await Workspace.findById(effectiveWorkspaceId);
    if (!workspace || !isWorkspaceMember(workspace.members, userId)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    filters.workspaceId = effectiveWorkspaceId;
  }

  if (!effectiveChannelId && !effectiveWorkspaceId) {
    return res.status(400).json({ success: false, message: 'channelId or workspaceId is required' });
  }

  const messages = await Message.find(filters)
    .populate('senderId', 'name email avatar')
    .sort({ createdAt: 1 });

  res.json({ success: true, data: messages });
};

export const createMessage = async (req: Request, res: Response) => {
  const { channelId, message } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (!channelId || !message) {
    return res.status(400).json({ success: false, message: 'Missing channelId or message body' });
  }

  const channel = await Channel.findById(channelId);
  if (!channel) {
    return res.status(404).json({ success: false, message: 'Channel not found' });
  }

  const workspace = await Workspace.findById(channel.workspaceId);
  if (!workspace || !isWorkspaceMember(workspace.members, userId)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const newMessage = await Message.create({
    workspaceId: channel.workspaceId,
    channelId,
    senderId: userId,
    message
  });

  const populated = await newMessage.populate('senderId', 'name email avatar');
  res.status(201).json({ success: true, data: populated });
};
