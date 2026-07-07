import { useContext, useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { WorkspaceContext } from '../contexts/WorkspaceContext';
import { workspaceService, channelService } from '../services/workspaceService';
import { documentService } from '../services/documentService';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { DocumentEditor } from '../components/DocumentEditor';
import { Workspace, Channel, Document } from '../types/index';
import { useToast } from '../components/ToastProvider';
import { useSocket } from '../hooks/useSocket';

type View = 'overview' | 'documents' | 'settings';
type Modal = 'create-workspace' | 'join-workspace' | 'create-channel' | 'invite' | 'create-document' | null;

const DashboardPage = () => {
  const qc = useQueryClient();
  const { showToast } = useToast();
  const ctx = useContext(WorkspaceContext);
  const { socket } = useSocket();

  const [activeWs, setActiveWs] = useState<Workspace | null>(ctx?.activeWorkspace || null);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [activeDoc, setActiveDoc] = useState<Document | null>(null);
  const [view, setView] = useState<View>('overview');
  const [modal, setModal] = useState<Modal>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Modal form state
  const [wsName, setWsName] = useState('');
  const [wsDesc, setWsDesc] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [chName, setChName] = useState('');
  const [chDesc, setChDesc] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [docIcon, setDocIcon] = useState('📄');

  const userId = localStorage.getItem('userId') || '';
  const userName = localStorage.getItem('userName') || 'User';

  useEffect(() => {
    if (!socket) return;
    socket.on('online-users-update', setOnlineUsers);
    return () => { socket.off('online-users-update', setOnlineUsers); };
  }, [socket]);

  const { data: wsData, isLoading } = useQuery({ queryKey: ['workspaces'], queryFn: workspaceService.getWorkspaces });
  const { data: chData } = useQuery({ queryKey: ['channels', activeWs?._id], queryFn: () => activeWs ? channelService.getChannels(activeWs._id) : Promise.resolve(null), enabled: !!activeWs?._id });
  const { data: docData, refetch: refetchDocs } = useQuery({ queryKey: ['documents', activeWs?._id], queryFn: () => activeWs ? documentService.getDocuments(activeWs._id) : Promise.resolve(null), enabled: !!activeWs?._id });

  const workspaces: Workspace[] = wsData?.data?.data || [];
  const channels: Channel[] = chData?.data?.data || [];
  const documents: Document[] = docData?.data?.data || [];

  const closeModal = () => {
    setModal(null);
    setWsName(''); setWsDesc(''); setInviteCode(''); setChName(''); setChDesc(''); setDocTitle(''); setDocIcon('📄');
  };

  const handleCreateWs = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await workspaceService.createWorkspace(wsName, wsDesc);
      if (r.data?.success) {
        showToast('Workspace Created', `"${wsName}" is ready!`, 'success');
        qc.invalidateQueries({ queryKey: ['workspaces'] });
        setActiveWs(r.data.data); ctx?.setActiveWorkspace(r.data.data); closeModal();
      }
    } catch (e: any) { showToast('Error', e.response?.data?.message || 'Failed', 'error'); }
  };

  const handleJoinWs = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await workspaceService.joinWorkspace(inviteCode);
      if (r.data?.success) {
        showToast('Joined!', `Welcome to "${r.data.data.name}"`, 'success');
        qc.invalidateQueries({ queryKey: ['workspaces'] });
        setActiveWs(r.data.data); ctx?.setActiveWorkspace(r.data.data); closeModal();
      }
    } catch (e: any) { showToast('Error', e.response?.data?.message || 'Invalid code', 'error'); }
  };

  const handleCreateCh = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWs) return;
    try {
      const r = await channelService.createChannel(activeWs._id, chName, chDesc);
      if (r.data?.success) {
        showToast('Channel Created', `#${chName} is live!`, 'success');
        qc.invalidateQueries({ queryKey: ['channels', activeWs._id] });
        setActiveChannel(r.data.data); closeModal();
      }
    } catch (e: any) { showToast('Error', e.response?.data?.message || 'Failed', 'error'); }
  };

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWs) return;
    try {
      const r = await documentService.createDocument(activeWs._id, docTitle, '', docIcon);
      if (r.data?.success) {
        showToast('Document Created', `"${docTitle}" is ready to edit!`, 'success');
        refetchDocs(); setActiveDoc(r.data.data); closeModal();
      }
    } catch (e: any) { showToast('Error', e.response?.data?.message || 'Failed', 'error'); }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!confirm('Delete this document?')) return;
    try {
      await documentService.deleteDocument(docId);
      showToast('Deleted', 'Document removed.', 'success');
      refetchDocs();
    } catch (e: any) { showToast('Error', e.response?.data?.message || 'Failed', 'error'); }
  };

  const DOC_ICONS = ['📄','📝','📋','🚀','💡','🎯','✅','📌','🔥','⭐','📈','🎨'];

  if (isLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100">
      <div className="text-center space-y-4">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="text-slate-600 font-medium">Loading your workspace…</p>
      </div>
    </div>
  );

  // If document is open
  if (activeWs && activeDoc) return (
    <div className="flex h-screen overflow-hidden">
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar activeWorkspace={activeWs} activeChannel={activeChannel} channels={channels} onlineUsers={onlineUsers}
          onWorkspaceChange={ws => { setActiveWs(ws); setActiveChannel(null); setActiveDoc(null); ctx?.setActiveWorkspace(ws); setSidebarOpen(false); }}
          onChannelChange={ch => { setActiveChannel(ch); setActiveDoc(null); setSidebarOpen(false); }}
          onAddWorkspace={() => setModal('create-workspace')} onJoinWorkspace={() => setModal('join-workspace')} onAddChannel={() => setModal('create-channel')} />
      </div>
      <main className="flex flex-1 flex-col overflow-hidden">
        <DocumentEditor documentId={activeDoc._id} userId={userId} userName={userName} onClose={() => { setActiveDoc(null); refetchDocs(); }} />
      </main>
    </div>
  );

  // If channel is open
  if (activeWs && activeChannel) return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/20 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar activeWorkspace={activeWs} activeChannel={activeChannel} channels={channels} onlineUsers={onlineUsers}
          onWorkspaceChange={ws => { setActiveWs(ws); setActiveChannel(null); setActiveDoc(null); ctx?.setActiveWorkspace(ws); setSidebarOpen(false); }}
          onChannelChange={ch => { setActiveChannel(ch); setActiveDoc(null); setSidebarOpen(false); }}
          onAddWorkspace={() => setModal('create-workspace')} onJoinWorkspace={() => setModal('join-workspace')} onAddChannel={() => setModal('create-channel')} />
      </div>
      <main className="flex flex-1 flex-col overflow-hidden">
        <ChatWindow channelId={activeChannel._id} channelName={activeChannel.name} userId={userId} />
      </main>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/20 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Mobile trigger */}
      <button onClick={() => setSidebarOpen(true)} className="fixed left-4 top-4 z-40 md:hidden rounded-xl border border-slate-200 bg-white p-2 shadow-md cursor-pointer">☰</button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar activeWorkspace={activeWs} activeChannel={activeChannel} channels={channels} onlineUsers={onlineUsers}
          onWorkspaceChange={ws => { setActiveWs(ws); setActiveChannel(null); setActiveDoc(null); setView('overview'); ctx?.setActiveWorkspace(ws); setSidebarOpen(false); }}
          onChannelChange={ch => { setActiveChannel(ch); setActiveDoc(null); setSidebarOpen(false); }}
          onAddWorkspace={() => setModal('create-workspace')} onJoinWorkspace={() => setModal('join-workspace')} onAddChannel={() => setModal('create-channel')} />
      </div>

      {/* Main */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {activeWs ? (
          <>
            {/* Workspace Header */}
            <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm flex-shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-lg flex-shrink-0">
                    {activeWs.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg font-bold text-slate-900 truncate">{activeWs.name}</h1>
                    <p className="text-xs text-slate-500 truncate">{activeWs.description || 'Your collaborative workspace'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setModal('invite')} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer">
                    🔗 Invite
                  </button>
                  <button onClick={() => { setModal('create-channel'); }} className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition cursor-pointer">
                    + Channel
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-4 flex gap-1 border-t border-slate-100 pt-3">
                {([['overview','Overview'],['documents','Documents'],['settings','Settings']] as const).map(([id, label]) => (
                  <button key={id} onClick={() => { setView(id); setActiveChannel(null); }}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${view===id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* OVERVIEW */}
              {view === 'overview' && (
                <div className="space-y-6 max-w-5xl">
                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Members', value: activeWs.members.length, icon: '👥', color: 'bg-indigo-50 text-indigo-700' },
                      { label: 'Channels', value: channels.length, icon: '💬', color: 'bg-sky-50 text-sky-700' },
                      { label: 'Documents', value: documents.length, icon: '📄', color: 'bg-violet-50 text-violet-700' },
                      { label: 'Online', value: onlineUsers.filter(uid => activeWs.members.some(m => m.id === uid || (m as any)._id?.toString() === uid)).length, icon: '🟢', color: 'bg-emerald-50 text-emerald-700' },
                    ].map(s => (
                      <div key={s.label} className={`rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition`}>
                        <div className="text-2xl mb-2">{s.icon}</div>
                        <p className="text-3xl font-bold text-slate-800">{s.value}</p>
                        <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Channels quick list */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-slate-700">Channels</h2>
                        <button onClick={() => setModal('create-channel')} className="text-xs text-indigo-600 hover:underline cursor-pointer">+ New</button>
                      </div>
                      {channels.length > 0 ? (
                        <div className="space-y-2">
                          {channels.slice(0,6).map(ch => (
                            <button key={ch._id} onClick={() => setActiveChannel(ch)}
                              className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left hover:bg-indigo-50 hover:border-indigo-100 transition cursor-pointer group">
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-indigo-100 text-slate-600 font-bold text-sm">#</span>
                              <div>
                                <p className="text-sm font-semibold text-slate-800">{ch.name}</p>
                                {ch.description && <p className="text-xs text-slate-400 truncate">{ch.description}</p>}
                              </div>
                              <span className="ml-auto text-xs text-indigo-600 opacity-0 group-hover:opacity-100 transition">Open →</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                          <p className="font-semibold text-slate-600 mb-1">No channels yet</p>
                          <button onClick={() => setModal('create-channel')} className="text-indigo-600 hover:underline cursor-pointer">Create your first channel →</button>
                        </div>
                      )}
                    </div>

                    {/* Members */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-slate-700">Team Members</h2>
                        <button onClick={() => setModal('invite')} className="text-xs text-indigo-600 hover:underline cursor-pointer">Invite</button>
                      </div>
                      <div className="space-y-2 max-h-[240px] overflow-y-auto">
                        {activeWs.members.map((m: any) => {
                          const memberId = m.id || m._id?.toString();
                          const isOnline = onlineUsers.includes(memberId);
                          return (
                            <div key={memberId} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-slate-50 transition">
                              <div className="relative">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700 font-bold text-sm">
                                  {m.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-800 truncate">{m.name}</p>
                                <p className="text-[10px] text-slate-400 truncate">{m.email}</p>
                              </div>
                              {isOnline && <span className="text-[10px] text-emerald-600 font-medium">Online</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Recent Docs */}
                  {documents.length > 0 && (
                    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-slate-700">Recent Documents</h2>
                        <button onClick={() => setView('documents')} className="text-xs text-indigo-600 hover:underline cursor-pointer">View all →</button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {documents.slice(0,3).map((d: Document) => (
                          <button key={d._id} onClick={() => setActiveDoc(d)}
                            className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 text-left hover:bg-indigo-50 hover:border-indigo-100 transition cursor-pointer group">
                            <span className="text-2xl">{(d as any).icon || '📄'}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{d.title}</p>
                              <p className="text-[10px] text-slate-400">{new Date(d.updatedAt).toLocaleDateString()}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* DOCUMENTS */}
              {view === 'documents' && (
                <div className="space-y-4 max-w-5xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Documents</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Collaborative markdown editing with real-time sync</p>
                    </div>
                    <button onClick={() => setModal('create-document')}
                      className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition cursor-pointer">
                      + New Document
                    </button>
                  </div>

                  {documents.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {documents.map((d: Document) => (
                        <div key={d._id} className="group flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-indigo-100 transition">
                          <div className="mb-3 flex items-start justify-between">
                            <span className="text-3xl">{(d as any).icon || '📄'}</span>
                            <button onClick={() => handleDeleteDoc(d._id)}
                              className="opacity-0 group-hover:opacity-100 rounded-lg border border-slate-200 px-2 py-1 text-[10px] text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 transition cursor-pointer">
                              Delete
                            </button>
                          </div>
                          <h3 className="font-bold text-slate-800 mb-1 truncate">{d.title}</h3>
                          <p className="text-xs text-slate-400 mb-1">By {d.createdBy?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-400 mb-4">Updated {new Date(d.updatedAt).toLocaleDateString()}</p>
                          <button onClick={() => setActiveDoc(d)}
                            className="mt-auto w-full rounded-xl bg-indigo-50 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-100 transition cursor-pointer">
                            Open & Edit →
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center">
                      <div className="text-5xl mb-4">📄</div>
                      <p className="text-slate-700 font-semibold mb-2">No documents yet</p>
                      <p className="text-slate-400 text-sm mb-6">Create your first collaborative document with real-time co-editing</p>
                      <button onClick={() => setModal('create-document')}
                        className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition cursor-pointer">
                        Create First Document
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SETTINGS */}
              {view === 'settings' && (
                <div className="space-y-4 max-w-2xl">
                  <h2 className="text-xl font-bold text-slate-800">Workspace Settings</h2>
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Workspace Name</label>
                      <p className="mt-1 font-semibold text-slate-800">{activeWs.name}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Owner</label>
                      <p className="mt-1 font-semibold text-slate-800">{activeWs.owner.name}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Invite Code</label>
                      <div className="mt-2 flex items-center gap-3">
                        <code className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-mono text-indigo-600 font-bold text-sm">
                          {activeWs.inviteCode}
                        </code>
                        <button onClick={() => { navigator.clipboard.writeText(activeWs.inviteCode); showToast('Copied!', 'Invite code copied.', 'success'); }}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer">
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 pt-4">
                      <label className="text-xs font-bold uppercase tracking-wider text-rose-400">Danger Zone</label>
                      <button onClick={async () => {
                        if (!confirm('Leave this workspace?')) return;
                        try {
                          await workspaceService.leaveWorkspace(activeWs._id);
                          showToast('Left', 'You left the workspace.', 'success');
                          qc.invalidateQueries({ queryKey: ['workspaces'] });
                          setActiveWs(null); setActiveChannel(null);
                        } catch (e: any) { showToast('Error', e.response?.data?.message || 'Failed', 'error'); }
                      }} className="mt-2 block rounded-xl border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer">
                        Leave Workspace
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="w-full max-w-lg text-center">
              <div className="mx-auto mb-6 text-6xl">🚀</div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to CollabHub</h2>
              <p className="text-slate-500 text-sm mb-8">Create a workspace to get started, or join one with an invite code.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <button onClick={() => setModal('create-workspace')}
                  className="flex flex-col items-center gap-2 rounded-2xl border-2 border-indigo-100 bg-white p-6 hover:border-indigo-400 hover:bg-indigo-50 transition cursor-pointer group">
                  <span className="text-3xl group-hover:scale-110 transition-transform">✨</span>
                  <span className="font-bold text-slate-800">Create Workspace</span>
                  <span className="text-xs text-slate-400">Start fresh with a new team</span>
                </button>
                <button onClick={() => setModal('join-workspace')}
                  className="flex flex-col items-center gap-2 rounded-2xl border-2 border-slate-100 bg-white p-6 hover:border-indigo-400 hover:bg-indigo-50 transition cursor-pointer group">
                  <span className="text-3xl group-hover:scale-110 transition-transform">🔗</span>
                  <span className="font-bold text-slate-800">Join Workspace</span>
                  <span className="text-xs text-slate-400">Use an invite code</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===== MODALS ===== */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="bg-white rounded-3xl border border-slate-100 p-7 shadow-2xl w-full max-w-sm animate-in fade-in-0 zoom-in-95">

            {modal === 'create-workspace' && (
              <form onSubmit={handleCreateWs}>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Create Workspace</h3>
                <p className="text-xs text-slate-400 mb-5">Build a hub for your team.</p>
                <div className="space-y-3">
                  <input required autoFocus placeholder="Workspace name" value={wsName} onChange={e=>setWsName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10" />
                  <textarea placeholder="Description (optional)" value={wsDesc} onChange={e=>setWsDesc(e.target.value)} rows={2}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10" />
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <button type="button" onClick={closeModal} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                  <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer shadow-md shadow-indigo-600/20">Create</button>
                </div>
              </form>
            )}

            {modal === 'join-workspace' && (
              <form onSubmit={handleJoinWs}>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Join Workspace</h3>
                <p className="text-xs text-slate-400 mb-5">Enter the invite code from your team admin.</p>
                <input required autoFocus placeholder="Invite code e.g. AB12CD" value={inviteCode} onChange={e=>setInviteCode(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-mono text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 tracking-widest" />
                <div className="mt-5 flex justify-end gap-2">
                  <button type="button" onClick={closeModal} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                  <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer shadow-md shadow-indigo-600/20">Join</button>
                </div>
              </form>
            )}

            {modal === 'create-channel' && (
              <form onSubmit={handleCreateCh}>
                <h3 className="text-lg font-bold text-slate-800 mb-1">New Channel</h3>
                <p className="text-xs text-slate-400 mb-5">Channels are where team conversations happen.</p>
                <div className="space-y-3">
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10">
                    <span className="text-slate-400 font-bold mr-2">#</span>
                    <input required autoFocus placeholder="channel-name" value={chName} onChange={e=>setChName(e.target.value.toLowerCase().replace(/\s+/g,'-'))}
                      className="flex-1 bg-transparent text-sm text-slate-900 outline-none" />
                  </div>
                  <textarea placeholder="What's this channel for? (optional)" value={chDesc} onChange={e=>setChDesc(e.target.value)} rows={2}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10" />
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <button type="button" onClick={closeModal} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                  <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer shadow-md shadow-indigo-600/20">Create Channel</button>
                </div>
              </form>
            )}

            {modal === 'invite' && activeWs && (
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Invite Members</h3>
                <p className="text-xs text-slate-400 mb-5">Share this code to invite people to "{activeWs.name}".</p>
                <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-5 text-center mb-5">
                  <p className="text-xs text-indigo-500 font-semibold uppercase tracking-widest mb-2">Invite Code</p>
                  <p className="text-3xl font-bold text-indigo-600 font-mono tracking-widest">{activeWs.inviteCode}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={closeModal} className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer">Close</button>
                  <button onClick={() => { navigator.clipboard.writeText(activeWs.inviteCode); showToast('Copied!', 'Code copied to clipboard.', 'success'); closeModal(); }}
                    className="flex-1 rounded-xl bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer">Copy Code</button>
                </div>
              </div>
            )}

            {modal === 'create-document' && (
              <form onSubmit={handleCreateDoc}>
                <h3 className="text-lg font-bold text-slate-800 mb-1">New Document</h3>
                <p className="text-xs text-slate-400 mb-5">Start a collaborative markdown document.</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Icon</label>
                    <div className="flex flex-wrap gap-1.5">
                      {DOC_ICONS.map(ic => (
                        <button key={ic} type="button" onClick={() => setDocIcon(ic)}
                          className={`text-xl rounded-lg p-1.5 cursor-pointer transition ${docIcon===ic ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'hover:bg-slate-100'}`}>
                          {ic}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input required autoFocus placeholder="Document title" value={docTitle} onChange={e=>setDocTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10" />
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <button type="button" onClick={closeModal} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                  <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer shadow-md shadow-indigo-600/20">
                    {docIcon} Create
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
