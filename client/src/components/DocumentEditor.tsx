import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../hooks/useSocket';
import { documentService } from '../services/documentService';
import { useToast } from './ToastProvider';

interface DocumentEditorProps {
  documentId: string;
  userId: string;
  userName: string;
  onClose: () => void;
}

interface TypingUser {
  userId: string;
  userName: string;
}

export const DocumentEditor = ({ documentId, userId, userName, onClose }: DocumentEditorProps) => {
  const { socket } = useSocket();
  const { showToast } = useToast();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [collaborators, setCollaborators] = useState<TypingUser[]>([]);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch document details on mount
  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const response = await documentService.getDocument(documentId);
        if (response.data?.success) {
          setTitle(response.data.data.title);
          setContent(response.data.data.content || '');
        }
      } catch (err) {
        showToast('Error', 'Could not load document content.', 'error');
      }
    };
    fetchDoc();
  }, [documentId]);

  // Connect to document room and listen for changes
  useEffect(() => {
    if (!socket) return;

    socket.emit('join-document', documentId);

    const handleDocumentUpdated = (data: { docId: string; content: string; userId: string }) => {
      if (data.userId !== userId) {
        setContent(data.content);
      }
    };

    const handleUserTyping = (data: { docId: string; userId: string; userName: string; isTyping: boolean }) => {
      if (data.userId === userId) return;
      
      setCollaborators((prev) => {
        const filtered = prev.filter((c) => c.userId !== data.userId);
        if (data.isTyping) {
          return [...filtered, { userId: data.userId, userName: data.userName }];
        }
        return filtered;
      });
    };

    socket.on('document-updated', handleDocumentUpdated);
    socket.on('document-user-typing', handleUserTyping);

    return () => {
      socket.emit('leave-document', documentId);
      socket.off('document-updated', handleDocumentUpdated);
      socket.off('document-user-typing', handleUserTyping);
    };
  }, [socket, documentId, userId]);

  // Auto-save logic
  const triggerAutoSave = useCallback((newTitle: string, newContent: string) => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await documentService.updateDocument(documentId, newTitle, newContent);
        if (res.data?.success) {
          setSaveStatus('saved');
        } else {
          setSaveStatus('error');
        }
      } catch (err) {
        setSaveStatus('error');
      }
    }, 1200);
  }, [documentId]);

  // Handle document changes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextContent = e.target.value;
    setContent(nextContent);
    triggerAutoSave(title, nextContent);

    // Emit live change to other editors
    if (socket) {
      socket.emit('edit-document', {
        docId: documentId,
        content: nextContent,
        userId,
        userName
      });

      // Typing indicators
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        socket.emit('document-typing', { docId: documentId, userId, userName, isTyping: true });
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        socket.emit('document-typing', { docId: documentId, userId, userName, isTyping: false });
      }, 2500);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextTitle = e.target.value;
    setTitle(nextTitle);
    triggerAutoSave(nextTitle, content);
  };

  // Simple Markdown Parser
  const renderMarkdown = (md: string) => {
    if (!md) return <p className="text-slate-400 italic">Start typing to see document preview...</p>;
    
    const lines = md.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-3xl font-bold text-slate-800 mt-6 mb-3 border-b border-slate-100 pb-2">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-2xl font-semibold text-slate-800 mt-5 mb-2">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-xl font-medium text-slate-800 mt-4 mb-2">{line.substring(4)}</h3>;
      }
      
      // Lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <ul key={idx} className="list-disc pl-6 my-1 text-slate-700">
            <li>{line.substring(2)}</li>
          </ul>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <ol key={idx} className="list-decimal pl-6 my-1 text-slate-700">
            <li>{line.replace(/^\d+\.\s/, '')}</li>
          </ol>
        );
      }

      // Checkboxes
      if (line.startsWith('- [ ] ')) {
        return (
          <div key={idx} className="flex items-center gap-2 my-1 text-slate-700">
            <input type="checkbox" disabled className="rounded border-slate-300" />
            <span>{line.substring(6)}</span>
          </div>
        );
      }
      if (line.startsWith('- [x] ') || line.startsWith('- [X] ')) {
        return (
          <div key={idx} className="flex items-center gap-2 my-1 text-slate-700 line-through opacity-60">
            <input type="checkbox" checked disabled className="rounded border-slate-300" />
            <span>{line.substring(6)}</span>
          </div>
        );
      }

      // Code blocks
      if (line.startsWith('```')) {
        return null; // Handle code blocks simply by wrapping, or let it output standard code text
      }

      // Empty line
      if (line.trim() === '') {
        return <div key={idx} className="h-3" />;
      }

      // Plain paragraph
      return <p key={idx} className="my-1.5 leading-7 text-slate-700">{line}</p>;
    });
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Editor Header */}
      <header className="flex flex-wrap items-center justify-between border-b border-slate-100 bg-white px-6 py-4 shadow-sm">
        <div className="flex flex-1 items-center gap-3">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled Document"
            className="w-full max-w-md bg-transparent text-xl font-bold text-slate-800 outline-none border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:ring-0 py-1 transition"
          />
          <div className="flex items-center gap-1.5">
            {saveStatus === 'saved' && (
              <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-600">
                ✓ Saved
              </span>
            )}
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-600 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                Saving...
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="rounded-full bg-rose-50 border border-rose-100 px-2.5 py-1 text-[11px] font-medium text-rose-600">
                ⚠ Connection Error
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Active Collaborators */}
          {collaborators.length > 0 && (
            <div className="flex items-center gap-1 bg-indigo-50/50 border border-indigo-100/50 rounded-full px-3 py-1 text-xs text-indigo-600 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span>
                {collaborators.map((c) => c.userName).join(', ')} is typing...
              </span>
            </div>
          )}

          {/* View Toggles */}
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            {(['split', 'edit', 'preview'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
                  viewMode === mode
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </header>

      {/* Editor Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Textarea Writer */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`flex flex-col h-full ${viewMode === 'split' ? 'w-1/2 border-r border-slate-100' : 'w-full'}`}>
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder="Write something beautiful in Markdown... (e.g. # Hello, - [ ] Task item)"
              className="flex-1 resize-none bg-white p-8 text-sm leading-8 text-slate-700 outline-none placeholder:text-slate-400 placeholder:italic"
            />
          </div>
        )}

        {/* Right Side: Render Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`h-full overflow-y-auto bg-slate-50/50 p-8 ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
            <div className="prose max-w-none">
              {renderMarkdown(content)}
            </div>
          </div>
        )}
      </div>

      {/* Markdown Helper Footer */}
      <footer className="border-t border-slate-100 bg-white px-6 py-2.5 text-xs text-slate-400 flex items-center justify-between">
        <span>Markdown is supported.</span>
        <div className="flex gap-4">
          <span><code># Header 1</code></span>
          <span><code>## Header 2</code></span>
          <span><code>- List item</code></span>
          <span><code>- [ ] Task</code></span>
        </div>
      </footer>
    </div>
  );
};
