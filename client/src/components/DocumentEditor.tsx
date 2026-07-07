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

interface TypingUser { userId: string; userName: string; }

const ICONS = ['📄','📝','📋','🗒️','📊','🚀','💡','🎯','✅','📌','🔥','⭐','🏆','💎','🌟','📈','🎨','🔧','📱','🌐'];

const TOOLBAR_BUTTONS = [
  { label: 'H1', action: (s: string) => s ? `# ${s}` : '# Heading 1' },
  { label: 'H2', action: (s: string) => s ? `## ${s}` : '## Heading 2' },
  { label: 'H3', action: (s: string) => s ? `### ${s}` : '### Heading 3' },
  { label: 'B', action: (s: string) => s ? `**${s}**` : '**bold text**' },
  { label: 'I', action: (s: string) => s ? `*${s}*` : '*italic text*' },
  { label: '~~', action: (s: string) => s ? `~~${s}~~` : '~~strikethrough~~' },
  { label: '`code`', action: (s: string) => s ? `\`${s}\`` : '`inline code`' },
  { label: '• List', action: () => '\n- Item 1\n- Item 2\n- Item 3' },
  { label: '1. List', action: () => '\n1. First\n2. Second\n3. Third' },
  { label: '☐ Task', action: () => '\n- [ ] Task item\n- [ ] Another task' },
  { label: '> Quote', action: (s: string) => s ? `> ${s}` : '> Blockquote' },
  { label: '---', action: () => '\n---\n' },
  { label: '```', action: () => '\n```\ncode block here\n```\n' },
];

export const DocumentEditor = ({ documentId, userId, userName, onClose }: DocumentEditorProps) => {
  const { socket } = useSocket();
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [icon, setIcon] = useState('📄');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [collaborators, setCollaborators] = useState<TypingUser[]>([]);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    documentService.getDocument(documentId).then(r => {
      if (r.data?.success) {
        setTitle(r.data.data.title);
        setContent(r.data.data.content || '');
        setIcon(r.data.data.icon || '📄');
      }
    }).catch(() => showToast('Error', 'Could not load document.', 'error'));
  }, [documentId]);

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [content]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('join-document', documentId);
    const onUpdate = (d: any) => { if (d.userId !== userId) setContent(d.content); };
    const onTyping = (d: any) => {
      if (d.userId === userId) return;
      setCollaborators(prev => {
        const f = prev.filter(c => c.userId !== d.userId);
        return d.isTyping ? [...f, { userId: d.userId, userName: d.userName }] : f;
      });
    };
    socket.on('document-updated', onUpdate);
    socket.on('document-user-typing', onTyping);
    return () => {
      socket.emit('leave-document', documentId);
      socket.off('document-updated', onUpdate);
      socket.off('document-user-typing', onTyping);
    };
  }, [socket, documentId, userId]);

  const save = useCallback((t: string, c: string, ic: string) => {
    setSaveStatus('saving');
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      try {
        await documentService.updateDocument(documentId, t, c, ic);
        setSaveStatus('saved');
      } catch { setSaveStatus('error'); }
    }, 1000);
  }, [documentId]);

  const handleContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setContent(v);
    save(title, v, icon);
    if (socket) {
      socket.emit('edit-document', { docId: documentId, content: v, userId, userName });
      if (!isTypingRef.current) { isTypingRef.current = true; socket.emit('document-typing', { docId: documentId, userId, userName, isTyping: true }); }
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => { isTypingRef.current = false; socket.emit('document-typing', { docId: documentId, userId, userName, isTyping: false }); }, 2000);
    }
  };

  const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    save(e.target.value, content, icon);
  };

  const handleIconSelect = (ic: string) => {
    setIcon(ic);
    setShowIconPicker(false);
    save(title, content, ic);
  };

  const insertFormat = (action: (sel: string) => string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end);
    const inserted = action(selected);
    const next = content.slice(0, start) + inserted + content.slice(end);
    setContent(next);
    save(title, next, icon);
    setTimeout(() => { el.focus(); el.setSelectionRange(start + inserted.length, start + inserted.length); }, 0);
  };

  const renderMarkdown = (md: string) => {
    if (!md) return <p className="text-slate-400 italic text-sm">Start typing to see your document rendered here...</p>;
    return md.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold text-slate-900 mt-8 mb-3 pb-2 border-b-2 border-indigo-100">{renderInline(line.slice(2))}</h1>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold text-slate-800 mt-6 mb-2">{renderInline(line.slice(3))}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-semibold text-slate-800 mt-4 mb-2">{renderInline(line.slice(4))}</h3>;
      if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-indigo-400 bg-indigo-50 pl-4 py-2 my-2 italic text-slate-700 rounded-r-lg">{line.slice(2)}</blockquote>;
      if (line === '---') return <hr key={i} className="border-slate-200 my-6" />;
      if (line.startsWith('- [x] ') || line.startsWith('- [X] ')) return <div key={i} className="flex items-center gap-2 my-1"><input type="checkbox" checked readOnly className="accent-indigo-600"/><span className="line-through text-slate-400">{line.slice(6)}</span></div>;
      if (line.startsWith('- [ ] ')) return <div key={i} className="flex items-center gap-2 my-1"><input type="checkbox" readOnly/><span className="text-slate-700">{line.slice(6)}</span></div>;
      if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-6 list-disc text-slate-700 my-0.5">{renderInline(line.slice(2))}</li>;
      if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-6 list-decimal text-slate-700 my-0.5">{renderInline(line.replace(/^\d+\.\s/, ''))}</li>;
      if (line.startsWith('```')) return null;
      if (line.trim() === '') return <div key={i} className="h-3"/>;
      return <p key={i} className="text-slate-700 leading-7 my-1">{renderInline(line)}</p>;
    });
  };

  const renderInline = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|~~.*?~~)/g);
    return parts.map((p, i) => {
      if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
      if (p.startsWith('*') && p.endsWith('*')) return <em key={i}>{p.slice(1, -1)}</em>;
      if (p.startsWith('`') && p.endsWith('`')) return <code key={i} className="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded font-mono text-[13px]">{p.slice(1, -1)}</code>;
      if (p.startsWith('~~') && p.endsWith('~~')) return <del key={i}>{p.slice(2, -2)}</del>;
      return p;
    });
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 bg-slate-50/80 px-4 py-2">
        {TOOLBAR_BUTTONS.map((btn) => (
          <button key={btn.label} onClick={() => insertFormat(btn.action)} title={btn.label}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition cursor-pointer whitespace-nowrap">
            {btn.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          {(['split','edit','preview'] as const).map(m => (
            <button key={m} onClick={() => setViewMode(m)}
              className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition cursor-pointer ${viewMode===m ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800 border border-slate-200'}`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-3">
        <div className="flex flex-1 items-center gap-3 min-w-0">
          {/* Icon Picker */}
          <div className="relative">
            <button onClick={() => setShowIconPicker(!showIconPicker)}
              className="text-3xl hover:scale-110 transition-transform cursor-pointer" title="Change icon">
              {icon}
            </button>
            {showIconPicker && (
              <div className="absolute top-10 left-0 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
                <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Choose icon</p>
                <div className="grid grid-cols-10 gap-1">
                  {ICONS.map(ic => (
                    <button key={ic} onClick={() => handleIconSelect(ic)}
                      className={`text-xl p-1 rounded-lg hover:bg-indigo-50 transition cursor-pointer ${icon===ic ? 'bg-indigo-100' : ''}`}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <input type="text" value={title} onChange={handleTitle} placeholder="Untitled"
            className="flex-1 bg-transparent text-xl font-bold text-slate-900 outline-none placeholder:text-slate-300 min-w-0" />
          <div className="flex items-center gap-2 flex-shrink-0">
            {saveStatus === 'saved' && <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">✓ Saved</span>}
            {saveStatus === 'saving' && <span className="text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full animate-pulse">Saving…</span>}
            {saveStatus === 'error' && <span className="text-xs text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-full">⚠ Error</span>}
            {collaborators.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping inline-flex"/>
                {collaborators.map(c=>c.userName).join(', ')} typing…
              </span>
            )}
          </div>
        </div>
        <button onClick={onClose}
          className="ml-4 rounded-xl border border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer flex-shrink-0">
          ← Back
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`flex flex-col h-full ${viewMode==='split' ? 'w-1/2 border-r border-slate-100' : 'w-full'}`}>
            <textarea ref={textareaRef} value={content} onChange={handleContent}
              placeholder={'Write in Markdown...\n\n# Start with a heading\n- Add bullet points\n- [ ] Or task items'}
              className="flex-1 resize-none bg-white p-8 font-mono text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-300 placeholder:not-italic" />
          </div>
        )}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`h-full overflow-y-auto bg-white p-8 ${viewMode==='split' ? 'w-1/2' : 'w-full max-w-3xl mx-auto'}`}>
            <div className="min-h-full">{renderMarkdown(content)}</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-2 text-xs text-slate-400">
        <div className="flex gap-4">
          <span>{wordCount} words</span>
          <span>{content.length} chars</span>
        </div>
        <div className="flex gap-3">
          <span><code className="bg-slate-100 px-1 rounded"># H1</code></span>
          <span><code className="bg-slate-100 px-1 rounded">**bold**</code></span>
          <span><code className="bg-slate-100 px-1 rounded">*italic*</code></span>
          <span><code className="bg-slate-100 px-1 rounded">- [ ] task</code></span>
        </div>
      </footer>
    </div>
  );
};
