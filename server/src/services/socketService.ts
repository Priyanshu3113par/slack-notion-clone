import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { Channel } from '../models/Channel';
import { Message } from '../models/Message';
import { redisOps } from '../config/redis';

export const setupSocket = (server: HTTPServer) => {
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    socket.on('user-online', async (userId: string) => {
      socket.data.userId = userId;
      await redisOps.addToSet('online-users', userId);
      const onlineUsers = await redisOps.getSet('online-users');
      io.emit('online-users-update', onlineUsers);
    });

    socket.on('join-channel', async (channelId: string) => {
      socket.join(`channel-${channelId}`);

      const recentMessages = await Message.find({ channelId })
        .sort({ createdAt: 1 })
        .limit(50)
        .lean();

      socket.emit(
        'channel-history',
        recentMessages.map((message) => ({
          _id: message._id.toString(),
          channelId,
          senderId: message.senderId.toString(),
          message: message.message,
          createdAt: message.createdAt
        }))
      );

      console.log(`User joined channel: ${channelId}`);
    });

    socket.on('leave-channel', (channelId: string) => {
      socket.leave(`channel-${channelId}`);
      console.log(`User left channel: ${channelId}`);
    });

    socket.on('send-message', async (data: { channelId: string; senderId: string; message: string }) => {
      const { channelId, senderId, message } = data;
      const channel = await Channel.findById(channelId);
      const workspaceId = channel?.workspaceId;

      const newMessage = await Message.create({
        workspaceId,
        channelId,
        senderId,
        message
      });

      io.to(`channel-${channelId}`).emit('receive-message', {
        _id: newMessage._id.toString(),
        channelId,
        senderId,
        message,
        createdAt: newMessage.createdAt
      });
    });

    socket.on('typing', (data: { channelId: string; userId: string; name: string }) => {
      socket.to(`channel-${data.channelId}`).emit('user-typing', data);
    });

    socket.on('stop-typing', (data: { channelId: string; userId: string }) => {
      socket.to(`channel-${data.channelId}`).emit('user-stopped-typing', data);
    });

    socket.on('disconnect', async () => {
      const userId = socket.data.userId as string | undefined;
      if (userId) {
        await redisOps.removeFromSet('online-users', userId);
        const onlineUsers = await redisOps.getSet('online-users');
        io.emit('online-users-update', onlineUsers);
      }

      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};
