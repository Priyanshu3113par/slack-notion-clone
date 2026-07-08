import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../hooks/useSocket';
import { documentService } from '../services/documentService';
import { useToast } from './ToastProvider';
import { formatShortDate } from '../utils/entities';

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

const LABELS = ['NOTE', 'SPEC', 'PLAN', 'OPS', 'DATA', 'IDEA', 'QA', 'ROADMAP'];

const TOOLBAR_BUTTONS = [
  { label: 'H1', action: (selection: string) => selection ? `# ${selection}` : '# Heading 1' },
  { label: 'H2', action: (selection: string) => selection ? `## ${selection}` : '## Heading 2' },
  { label: 'B', action: (selection: string) => selection ? `**${selection}**` : '**bold text**' },
  { label: 'I', action: (selection: string) => selection ? `*${selection}*` : '*italic text*' },
  { label: 'Code', action: (selection: string) => selection ? `\`${selection}\`` : '`inline code`' },
  { label: 'List', action: () => '\n- Item 1\n- Item 2\n- Item 3' },
  { label: 'Task', action: () => '\n- [ ] Task item\n- [ ] Another task' },
  { label: 'Quote', action: (selection: string) => selection ? `> ${selection}` : '> Blockquote' }
];

export const DocumentEditor = ({ documentId, userId, userName, onClose }: DocumentEditorProps) => {
  const { socket } = useSocket();
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [icon, setIcon] = useState('NOTE');
  const [updatedAt, setUpdatedAt] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [collaborators, setCollaborators] = useState<TypingUser[]>([]);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    documentService.getDocument(documentId).then((response) => {
      if (response.data?.success) {
        setTitle(response.data.data.title);
        setContent(response.data.data.content || '');
        setIcon(response.data.data.icon || 'NOTE');
        setUpdatedAt(response.data.data.updatedAt || '');
      }
    }).catch(() => showToast('Error', 'Could not load document.', 'error'));
  }, [documentId, showToast]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.emit('join-document', documentId);

    const handleDocumentUpdate = (data: { userId: string; content: string }) => {
      if (data.userId !== userId) {
        setContent(data.content);
      }
    };

    const handleTyping = (data: TypingUser & { isTyping: boolean }) => {
      if (data.userId === userId) {
        return;
      }

      setCollaborators((current) => {
        const withoutUser = current.filter((collaborator) => collaborator.userId !== data.userId);
        return data.isTyping ? [...withoutUser, { userId: data.userId, userName: data.userName }] : withoutUser;
      });
    };

    socket.on('document-updated', handleDocumentUpdate);
    socket.on('document-user-typing', handleTyping);

    return () => {
      socket.emit('leave-document', documentId);
      socket.off('document-updated', handleDocumentUpdate);
      socket.off('document-user-typing', handleTyping);
    };
  }, [socket, documentId, userId]);

  const save = useCallback((nextTitle: string, nextContent: string, nextIcon: string) => {
    setSaveStatus('saving');

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    saveTimeout.current = setTimeout(async () => {
      try {
        const response = await documentService.updateDocument(documentId, nextTitle, nextContent, nextIcon);
        setUpdatedAt(response.data?.data?.updatedAt || new Date().toISOString());
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, 700);
  }, [documentId]);

  const emitDocumentTyping = (nextContent: string) => {
    if (!socket) {
      return;
    }

    socket.emit('edit-document', { docId: documentId, content: nextContent, userId, userName });

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('document-typing', { docId: documentId, userId, userName, isTyping: true });
    }

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit('document-typing', { docId: documentId, userId, userName, isTyping: false });
    }, 1800);
  };

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextContent = event.target.value;
    setContent(nextContent);
    save(title, nextContent, icon);
    emitDocumentTyping(nextContent);
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextTitle = event.target.value;
    setTitle(nextTitle);
    save(nextTitle, content, icon);
  };

  const handleLabelSelect = (nextIcon: string) => {
    setIcon(nextIcon);
    setShowLabelPicker(false);
    save(title, content, nextIcon);
  };

  const insertFormat = (action: (selection: string) => string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const inserted = action(selected);
    const nextContent = content.slice(0, start) + inserted + content.slice(end);

    setContent(nextContent);
    save(title, nextContent, icon);

    window.setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + inserted.length, start + inserted.length);
    }, 0);
  };

  const renderInline = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|~~.*?~~)/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
      if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>;
      if (part.startsWith('`') && part.endsWith('`')) return <code key={index} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-rose-600">{part.slice(1, -1)}</code>;
      if (part.startsWith('~~') && part.endsWith('~~')) return <del key={index}>{part.slice(2, -2)}</del>;
      return part;
    });
  };

  const renderMarkdown = (markdown: string) => {
    if (!markdown) {
      return <p className="text-sm italic text-slate-400">Start typing to preview the document.</p>;
    }

    return markdown.split('\n').map((line, index) => {
      if (line.startsWith('# ')) return <h1 key={index} className="mb-3 mt-7 border-b border-slate-200 pb-2 text-3xl font-bold text-slate-950">{renderInline(line.slice(2))}</h1>;
      if (line.startsWith('## ')) return <h2 key={index} className="mb-2 mt-6 text-2xl font-bold text-slate-900">{renderInline(line.slice(3))}</h2>;
      if (line.startsWith('> ')) return <blockquote key={index} className="my-3 border-l-4 border-sky-400 bg-sky-50 px-4 py-3 text-slate-700">{renderInline(line.slice(2))}</blockquote>;
      if (line.startsWith('- [x] ') || line.startsWith('- [X] ')) return <div key={index} className="my-1 flex items-center gap-2"><input type="checkbox" checked readOnly className="accent-slate-950" /><span className="text-slate-400 line-through">{renderInline(line.slice(6))}</span></div>;
      if (line.startsWith('- [ ] ')) return <div key={index} className="my-1 flex items-center gap-2"><input type="checkbox" readOnly className="accent-slate-950" /><span className="text-slate-700">{renderInline(line.slice(6))}</span></div>;
      if (line.startsWith('- ') || line.startsWith('* ')) return <li key={index} className="ml-6 list-disc text-slate-700">{renderInline(line.slice(2))}</li>;
      if (line.trim() === '') return <div key={index} className="h-3" />;
      return <p key={index} className="my-1 text-slate-700 leading-7">{renderInline(line)}</p>;
    });
  };

  return (
    <div className="flex h-full flex-col bg-[#f8fafc]">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-5 py-3">
        {TOOLBAR_BUTTONS.map((button) => (
          <button
            key={button.label}
            onClick={() => insertFormat(button.action)}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
          >
            {button.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 p-1">
          {(['split', 'edit', 'preview'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`rounded px-3 py-1 text-xs font-bold capitalize ${viewMode === mode ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="relative shrink-0">
            <button onClick={() => setShowLabelPicker((current) => !current)} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black tracking-[0.18em] text-slate-700">
              {icon}
            </button>
            {showLabelPicker && (
              <div className="absolute left-0 top-12 z-50 grid w-64 grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-2xl">
                {LABELS.map((label) => (
                  <button
                    key={label}
                    onClick={() => handleLabelSelect(label)}
                    className={`rounded-md border px-3 py-2 text-left text-xs font-bold tracking-[0.18em] ${icon === label ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <input value={title} onChange={handleTitleChange} placeholder="Untitled" className="w-full bg-transparent text-2xl font-bold text-slate-950 outline-none placeholder:text-slate-300" />
            <p className="mt-1 text-sm text-slate-500">Updated {formatShortDate(updatedAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveStatus === 'saved' && <span className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">Saved</span>}
          {saveStatus === 'saving' && <span className="rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">Saving</span>}
          {saveStatus === 'error' && <span className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700">Error</span>}
          {collaborators.length > 0 && <span className="rounded-md border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700">{collaborators.length} editing</span>}
          <button onClick={onClose} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
            Back
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`h-full ${viewMode === 'split' ? 'w-1/2 border-r border-slate-200' : 'w-full'}`}>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              placeholder={'# Start with a heading\n\nWrite notes, specs, decisions, or tasks here.'}
              className="h-full w-full resize-none bg-white p-8 font-mono text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-300"
            />
          </div>
        )}

        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`h-full overflow-y-auto bg-white p-8 ${viewMode === 'split' ? 'w-1/2' : 'mx-auto w-full max-w-4xl'}`}>
            {renderMarkdown(content)}
          </div>
        )}
      </div>

      <footer className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3 text-xs text-slate-500">
        <span>{wordCount} words</span>
        <span>{content.length} characters</span>
      </footer>
    </div>
  );
};
