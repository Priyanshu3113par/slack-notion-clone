import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
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
      await redisOps.addToSet(`online-users`, userId);
      const onlineUsers = await redisOps.getSet('online-users');
      io.emit('online-users-update', onlineUsers);
    });

    socket.on('join-channel', (channelId: string) => {
      socket.join(`channel-${channelId}`);
      console.log(`User joined channel: ${channelId}`);
    });

    socket.on('leave-channel', (channelId: string) => {
      socket.leave(`channel-${channelId}`);
      console.log(`User left channel: ${channelId}`);
    });

    socket.on('send-message', async (data: { channelId: string; senderId: string; message: string }) => {
      const { channelId, senderId, message } = data;

      const newMessage = await Message.create({
        channelId,
        senderId,
        message
      });

      io.to(`channel-${channelId}`).emit('receive-message', {
        _id: newMessage._id,
        channelId,
        senderId,
        message,
        createdAt: newMessage.createdAt
      });
    });

    socket.on('typing', (data: { channelId: string; userId: string; name: string }) => {
      socket.to(`channel-${data.channelId}`).emit('user-typing', data);
    });

    socket.on('stop-typing', (channelId: string) => {
      socket.to(`channel-${channelId}`).emit('user-stopped-typing');
    });

    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);
      const onlineUsers = await redisOps.getSet('online-users');
      io.emit('online-users-update', onlineUsers);
    });
  });

  return io;
};
