import { Request, Response } from 'express';
import { Message } from '../models/Message';
import { Channel } from '../models/Channel';

export const getMessages = async (req: Request, res: Response) => {
  const { channelId, workspaceId } = req.query;
  const filters: Record<string, string> = {};

  if (channelId) {
    filters.channelId = String(channelId);
  }

  if (workspaceId) {
    filters.workspaceId = String(workspaceId);
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

  const newMessage = await Message.create({
    workspaceId: channel.workspaceId,
    channelId,
    senderId: userId,
    message
  });

  const populated = await newMessage.populate('senderId', 'name email avatar');
  res.status(201).json({ success: true, data: populated });
};
