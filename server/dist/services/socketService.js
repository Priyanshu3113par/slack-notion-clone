"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = void 0;
const socket_io_1 = require("socket.io");
const Channel_1 = require("../models/Channel");
const Message_1 = require("../models/Message");
const redis_1 = require("../config/redis");
const setupSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: ['http://localhost:5173', 'http://localhost:3000'],
            methods: ['GET', 'POST']
        }
    });
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        socket.on('user-online', async (userId) => {
            socket.data.userId = userId;
            await redis_1.redisOps.addToSet('online-users', userId);
            const onlineUsers = await redis_1.redisOps.getSet('online-users');
            io.emit('online-users-update', onlineUsers);
        });
        socket.on('join-channel', async (channelId) => {
            socket.join(`channel-${channelId}`);
            const recentMessages = await Message_1.Message.find({ channelId })
                .sort({ createdAt: 1 })
                .limit(50)
                .lean();
            socket.emit('channel-history', recentMessages.map((message) => ({
                _id: message._id.toString(),
                channelId,
                senderId: message.senderId.toString(),
                message: message.message,
                createdAt: message.createdAt
            })));
            console.log(`User joined channel: ${channelId}`);
        });
        socket.on('leave-channel', (channelId) => {
            socket.leave(`channel-${channelId}`);
            console.log(`User left channel: ${channelId}`);
        });
        socket.on('send-message', async (data) => {
            const { channelId, senderId, message } = data;
            const channel = await Channel_1.Channel.findById(channelId);
            const workspaceId = channel?.workspaceId;
            const newMessage = await Message_1.Message.create({
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
        socket.on('typing', (data) => {
            socket.to(`channel-${data.channelId}`).emit('user-typing', data);
        });
        socket.on('stop-typing', (data) => {
            socket.to(`channel-${data.channelId}`).emit('user-stopped-typing', data);
        });
        socket.on('disconnect', async () => {
            const userId = socket.data.userId;
            if (userId) {
                await redis_1.redisOps.removeFromSet('online-users', userId);
                const onlineUsers = await redis_1.redisOps.getSet('online-users');
                io.emit('online-users-update', onlineUsers);
            }
            console.log('User disconnected:', socket.id);
        });
    });
    return io;
};
exports.setupSocket = setupSocket;
//# sourceMappingURL=socketService.js.map