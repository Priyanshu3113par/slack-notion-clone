import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

type TypingUser = {
  userId: string;
  name: string;
};

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      transports: ['websocket']
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
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  useEffect(() => {
    if (!socket) return;

    setMessages([]);
    setTypingUsers([]);
    socket.emit('join-channel', channelId);

    const handleHistory = (history: any[]) => {
      setMessages(history);
    };

    const handleIncomingMessage = (message: any) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleUserTyping = (data: TypingUser) => {
      setTypingUsers((prev) => {
        if (prev.some((user) => user.userId === data.userId)) {
          return prev;
        }
        return [...prev, data];
      });
    };

    const handleUserStoppedTyping = (data: { userId: string }) => {
      setTypingUsers((prev) => prev.filter((user) => user.userId !== data.userId));
    };

    socket.on('channel-history', handleHistory);
    socket.on('receive-message', handleIncomingMessage);
    socket.on('user-typing', handleUserTyping);
    socket.on('user-stopped-typing', handleUserStoppedTyping);

    return () => {
      socket.emit('leave-channel', channelId);
      socket.off('channel-history', handleHistory);
      socket.off('receive-message', handleIncomingMessage);
      socket.off('user-typing', handleUserTyping);
      socket.off('user-stopped-typing', handleUserStoppedTyping);
    };
  }, [socket, channelId]);

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

  const emitStopTyping = useCallback(
    (userId: string) => {
      if (socket) {
        socket.emit('stop-typing', { channelId, userId });
      }
    },
    [socket, channelId]
  );

  return { messages, typingUsers, sendMessage, emitTyping, emitStopTyping };
};
