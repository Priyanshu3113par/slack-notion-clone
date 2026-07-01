import { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { useChatEvents, useSocket } from '../hooks/useSocket';

interface ChatWindowProps {
  channelId: string;
  channelName: string;
  userId: string;
}

const ChatWindow = ({ channelId, channelName, userId }: ChatWindowProps) => {
  const { socket } = useSocket();
  const { messages, typingUsers, sendMessage, emitTyping, emitStopTyping } = useChatEvents(socket, channelId);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    setInputValue(nextValue);

    if (!isTyping && nextValue.trim()) {
      setIsTyping(true);
      emitTyping(userId, 'User');
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emitStopTyping(userId);
    }, 3000);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    sendMessage(inputValue, userId);
    setInputValue('');
    setIsTyping(false);
    emitStopTyping(userId);
  };

  return (
    <div className="flex h-full flex-col bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4">
        <h2 className="text-lg font-semibold text-white">#{channelName}</h2>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-slate-500">
            No messages yet. Start a conversation!
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg._id} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                <p className="text-xs text-slate-400">
                  User {msg.senderId} • {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
                <p className="mt-2 text-white">{msg.message}</p>
              </div>
            ))}
            {typingUsers.length > 0 && (
              <div className="text-xs italic text-slate-500">
                {typingUsers.map((user) => user.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-slate-800 bg-slate-900 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="submit"
            className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
