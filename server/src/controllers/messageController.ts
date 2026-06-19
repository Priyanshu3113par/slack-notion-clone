import { Request, Response } from 'express';
import { Message } from '../models/Message';

export const getMessages = async (req: Request, res: Response) => {
  const { channelId } = req.params;
  const messages = await Message.find({ channelId })
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

  const newMessage = await Message.create({
    channelId,
    senderId: userId,
    message
  });

  const populated = await newMessage.populate('senderId', 'name email avatar');
  res.status(201).json({ success: true, data: populated });
};
