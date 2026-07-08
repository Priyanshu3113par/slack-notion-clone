import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message } from '../types';

// --- Singleton socket instance ---
// We create ONE socket for the whole app lifetime, not per-component.
let globalSocket: Socket | null = null;

const getSocket = (): Socket => {
  if (!globalSocket || !globalSocket.connected) {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
    globalSocket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 15,
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return globalSocket;
};

type TypingUser = {
  userId: string;
  name: string;
};

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket>(getSocket());

  useEffect(() => {
    const socket = socketRef.current;

    const onConnect = () => {
      setIsConnected(true);
      const userId = localStorage.getItem('userId');
      if (userId) {
        socket.emit('user-online', userId);
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    // Sync initial state
    setIsConnected(socket.connected);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (!socket.connected) {
      socket.connect();
    } else {
      // Already connected — emit presence immediately
      const userId = localStorage.getItem('userId');
      if (userId) {
        socket.emit('user-online', userId);
      }
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return { socket: socketRef.current, isConnected };
};

export const useChatEvents = (socket: Socket | null, channelId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  useEffect(() => {
    if (!socket) return;

    setMessages([]);
    setTypingUsers([]);
    socket.emit('join-channel', channelId);

    const handleHistory = (history: Message[]) => {
      setMessages(history);
    };

    const handleIncomingMessage = (message: Message) => {
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
