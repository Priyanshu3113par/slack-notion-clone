import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:4000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      const userId = localStorage.getItem('userId');
      if (userId) {
        newSocket.emit('user-online', userId);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return { socket, isConnected };
};

export const useChatEvents = (socket: Socket | null, channelId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join-channel', channelId);

    socket.on('receive-message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('user-typing', (data) => {
      if (!typingUsers.includes(data.name)) {
        setTypingUsers((prev) => [...prev, data.name]);
      }
    });

    socket.on('user-stopped-typing', () => {
      setTypingUsers([]);
    });

    return () => {
      socket.emit('leave-channel', channelId);
      socket.off('receive-message');
      socket.off('user-typing');
      socket.off('user-stopped-typing');
    };
  }, [socket, channelId, typingUsers]);

  const sendMessage = useCallback(
    (message: string, senderId: string) => {
      if (socket && message.trim()) {
        socket.emit('send-message', { channelId, senderId, message });
      }
    },
    [socket, channelId]
  );

  const emitTyping = useCallback(
    (userId: string, name: string) => {
      if (socket) {
        socket.emit('typing', { channelId, userId, name });
      }
    },
    [socket, channelId]
  );

  const emitStopTyping = useCallback(() => {
    if (socket) {
      socket.emit('stop-typing', channelId);
    }
  }, [socket, channelId]);

  return { messages, typingUsers, sendMessage, emitTyping, emitStopTyping };
};
