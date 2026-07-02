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

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = e.target.value;
    setInputValue(nextValue);

    if (!isTyping && nextValue.trim()) {
      setIsTyping(true);
      emitTyping(userId, 'You');
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
    <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_24%),linear-gradient(180deg,_#020617_0%,_#071120_100%)]">
      <header className="border-b border-white/10 bg-slate-900/80 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white"># {channelName}</p>
            <p className="text-sm text-slate-400">Focused team conversation with live updates</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            12 online
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center text-slate-400">
            <p className="text-lg font-semibold text-white">No messages yet</p>
            <p className="mt-2 max-w-md text-sm leading-6">Start the conversation with a thoughtful update, file, or quick note.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg._id} className="flex gap-3 rounded-[1.35rem] border border-white/10 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 font-semibold text-slate-950">
                  {String(msg.senderId).slice(-2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">User {msg.senderId}</p>
                    <span className="text-xs text-slate-500">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-300">{msg.message}</p>
                </div>
              </div>
            ))}
            {typingUsers.length > 0 && (
              <div className="rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2 text-sm text-slate-400">
                {typingUsers.map((user) => user.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-white/10 bg-slate-900/80 p-4 backdrop-blur-xl">
        <div className="rounded-[1.35rem] border border-slate-700 bg-slate-950/70 p-3">
          <textarea
            value={inputValue}
            onChange={handleInputChange}
            placeholder={`Message #${channelName}`}
            rows={3}
            className="w-full resize-none bg-transparent px-2 py-2 text-sm text-slate-100 outline-none"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <button type="button" className="rounded-full border border-slate-700 px-3 py-2 transition hover:border-sky-400 hover:text-sky-300">
                😀
              </button>
              <button type="button" className="rounded-full border border-slate-700 px-3 py-2 transition hover:border-sky-400 hover:text-sky-300">
                📎
              </button>
            </div>
            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:from-sky-400 hover:to-cyan-300"
            >
              Send
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
