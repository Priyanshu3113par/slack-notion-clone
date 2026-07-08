"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = void 0;
const socket_io_1 = require("socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
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
    // Bind to Redis Pub/Sub adapter if connected
    if (redis_1.pubClient && redis_1.subClient) {
        io.adapter((0, redis_adapter_1.createAdapter)(redis_1.pubClient, redis_1.subClient));
        console.log('Socket.IO scaled horizontally using Redis Adapter.');
    }
    else {
        console.log('Socket.IO running on default in-memory adapter (Redis offline).');
    }
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        socket.on('user-online', async (userId) => {
            socket.data.userId = userId;
            await redis_1.redisOps.addToSet('online-users', userId);
            const onlineUsers = await redis_1.redisOps.getSet('online-users');
            io.emit('online-users-update', onlineUsers);
        });
        // --- Channel / Chat Events ---
        socket.on('join-channel', async (channelId) => {
            socket.join(`channel-${channelId}`);
            const recentMessages = await Message_1.Message.find({ channelId })
                .populate('senderId', 'name avatar')
                .sort({ createdAt: 1 })
                .limit(50)
                .lean();
            socket.emit('channel-history', recentMessages.map((message) => ({
                id: message._id.toString(),
                channelId,
                sender: {
                    id: message.senderId._id?.toString()
                        ?? message.senderId.id
                        ?? '',
                    name: message.senderId.name ?? 'User',
                    avatar: message.senderId.avatar ?? ''
                },
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
            if (!channel || !message.trim()) {
                return;
            }
            const newMessage = await Message_1.Message.create({
                workspaceId: channel.workspaceId,
                channelId,
                senderId,
                message
            });
            const populatedMessage = await newMessage.populate('senderId', 'name avatar');
            io.to(`channel-${channelId}`).emit('receive-message', {
                id: populatedMessage._id.toString(),
                channelId,
                sender: {
                    id: (populatedMessage.senderId._id?.toString())
                        ?? populatedMessage.senderId.id
                        ?? '',
                    name: populatedMessage.senderId.name ?? 'User',
                    avatar: populatedMessage.senderId.avatar ?? ''
                },
                message,
                createdAt: populatedMessage.createdAt
            });
        });
        socket.on('typing', (data) => {
            socket.to(`channel-${data.channelId}`).emit('user-typing', data);
        });
        socket.on('stop-typing', (data) => {
            socket.to(`channel-${data.channelId}`).emit('user-stopped-typing', data);
        });
        // --- Document Collaboration Events ---
        socket.on('join-document', (docId) => {
            socket.join(`document-${docId}`);
            console.log(`User joined document: ${docId}`);
        });
        socket.on('leave-document', (docId) => {
            socket.leave(`document-${docId}`);
            console.log(`User left document: ${docId}`);
        });
        socket.on('edit-document', (data) => {
            socket.to(`document-${data.docId}`).emit('document-updated', data);
        });
        socket.on('document-typing', (data) => {
            socket.to(`document-${data.docId}`).emit('document-user-typing', data);
        });
        // --- Disconnect Event ---
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