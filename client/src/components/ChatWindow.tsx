import { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { useChatEvents, useSocket } from '../hooks/useSocket';
import { formatShortTime, getInitials } from '../utils/entities';

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

  const stopTypingSoon = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emitStopTyping(userId);
    }, 2500);
  };

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value;
    setInputValue(nextValue);

    if (!isTyping && nextValue.trim()) {
      setIsTyping(true);
      emitTyping(userId, localStorage.getItem('userName') || 'User');
    }

    stopTypingSoon();
  };

  const submitMessage = () => {
    const message = inputValue.trim();
    if (!message) {
      return;
    }

    sendMessage(message, userId);
    setInputValue('');
    setIsTyping(false);
    emitStopTyping(userId);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitMessage();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#f6f8fb]">
      <header className="border-b border-slate-200 bg-white px-8 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Channel</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950"># {channelName}</h1>
          </div>
          <span className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Live
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-lg font-bold text-slate-950">Start the conversation</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Messages posted here are shared with everyone in #{channelName}.</p>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl space-y-3">
            {messages.map((message) => {
              const senderName = message.sender?.name || 'User';
              const senderId = message.sender?.id || message.senderId || '';
              const isOwn = senderId === userId;

              return (
                <article key={message.id || message._id} className={`flex gap-3 rounded-lg border p-4 shadow-sm ${isOwn ? 'border-sky-200 bg-sky-50' : 'border-slate-200 bg-white'}`}>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-sm font-bold ${isOwn ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    {getInitials(senderName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-slate-950">{senderName}</p>
                      {isOwn && <span className="rounded-sm bg-slate-950 px-1.5 py-0.5 text-[10px] font-bold text-white">You</span>}
                      <span className="text-xs text-slate-400">{formatShortTime(message.createdAt)}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">{message.message}</p>
                  </div>
                </article>
              );
            })}

            {typingUsers.length > 0 && (
              <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                {typingUsers.map((user) => user.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-5">
        <div className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <textarea
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message #${channelName}`}
            rows={3}
            className="w-full resize-none bg-transparent px-2 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400">Shift+Enter adds a new line</span>
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
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
