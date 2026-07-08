import { useContext, useEffect, useState } from 'react';
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
import { formatShortDate, getEntityId, getInitials } from '../utils/entities';

type View = 'overview' | 'documents' | 'settings';
type Modal = 'create-workspace' | 'join-workspace' | 'create-channel' | 'invite' | 'create-document' | null;

const DOCUMENT_LABELS = ['NOTE', 'SPEC', 'PLAN', 'OPS', 'DATA', 'IDEA', 'QA', 'ROADMAP'];

const DashboardPage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const workspaceContext = useContext(WorkspaceContext);
  const { socket } = useSocket();

  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [activeDoc, setActiveDoc] = useState<Document | null>(null);
  const [view, setView] = useState<View>('overview');
  const [modal, setModal] = useState<Modal>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const [wsName, setWsName] = useState('');
  const [wsDesc, setWsDesc] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [chName, setChName] = useState('');
  const [chDesc, setChDesc] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [docIcon, setDocIcon] = useState('NOTE');

  const userId = localStorage.getItem('userId') || '';
  const userName = localStorage.getItem('userName') || 'User';

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on('online-users-update', setOnlineUsers);

    return () => {
      socket.off('online-users-update', setOnlineUsers);
    };
  }, [socket]);

  const { data: workspaceResponse, isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: workspaceService.getWorkspaces
  });

  const workspaces: Workspace[] = workspaceResponse?.data?.data || [];
  const activeWorkspaceId = workspaceContext?.activeWorkspaceId || '';
  const activeWs = workspaces.find((workspace) => getEntityId(workspace) === activeWorkspaceId) || workspaces[0] || null;
  const activeWsId = getEntityId(activeWs);

  useEffect(() => {
    if (!workspaceContext) {
      return;
    }

    if (!workspaces.length) {
      workspaceContext.setActiveWorkspaceId(null);
      return;
    }

    const hasSelectedWorkspace = workspaces.some((workspace) => getEntityId(workspace) === workspaceContext.activeWorkspaceId);
    if (!hasSelectedWorkspace) {
      workspaceContext.setActiveWorkspaceId(getEntityId(workspaces[0]));
    }
  }, [workspaces, workspaceContext]);

  const { data: channelResponse } = useQuery({
    queryKey: ['channels', activeWsId],
    queryFn: () => channelService.getChannels(activeWsId),
    enabled: Boolean(activeWsId)
  });

  const { data: documentResponse, refetch: refetchDocs } = useQuery({
    queryKey: ['documents', activeWsId],
    queryFn: () => documentService.getDocuments(activeWsId),
    enabled: Boolean(activeWsId)
  });

  const channels: Channel[] = channelResponse?.data?.data || [];
  const documents: Document[] = documentResponse?.data?.data || [];

  const closeModal = () => {
    setModal(null);
    setWsName('');
    setWsDesc('');
    setInviteCode('');
    setChName('');
    setChDesc('');
    setDocTitle('');
    setDocIcon('NOTE');
  };

  const handleWorkspaceChange = (workspace: Workspace) => {
    workspaceContext?.setActiveWorkspaceId(getEntityId(workspace));
    setActiveChannel(null);
    setActiveDoc(null);
    setView('overview');
    setSidebarOpen(false);
  };

  const handleCreateWorkspace = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await workspaceService.createWorkspace(wsName.trim(), wsDesc.trim());
      if (response.data?.success) {
        const createdWorkspace = response.data.data as Workspace;
        showToast('Workspace created', `${createdWorkspace.name} is ready.`, 'success');
        await queryClient.invalidateQueries({ queryKey: ['workspaces'] });
        workspaceContext?.setActiveWorkspaceId(getEntityId(createdWorkspace));
        closeModal();
      }
    } catch (error: any) {
      showToast('Workspace error', error.response?.data?.message || 'Could not create workspace.', 'error');
    }
  };

  const handleJoinWorkspace = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await workspaceService.joinWorkspace(inviteCode.trim().toUpperCase());
      if (response.data?.success) {
        const joinedWorkspace = response.data.data as Workspace;
        showToast('Workspace joined', `You joined ${joinedWorkspace.name}.`, 'success');
        await queryClient.invalidateQueries({ queryKey: ['workspaces'] });
        workspaceContext?.setActiveWorkspaceId(getEntityId(joinedWorkspace));
        closeModal();
      }
    } catch (error: any) {
      showToast('Invite error', error.response?.data?.message || 'Invalid invite code.', 'error');
    }
  };

  const handleCreateChannel = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!activeWsId) {
      return;
    }

    try {
      const response = await channelService.createChannel(activeWsId, chName.trim(), chDesc.trim());
      if (response.data?.success) {
        showToast('Channel created', `#${response.data.data.name} is ready.`, 'success');
        await queryClient.invalidateQueries({ queryKey: ['channels', activeWsId] });
        setActiveChannel(response.data.data);
        closeModal();
      }
    } catch (error: any) {
      showToast('Channel error', error.response?.data?.message || 'Could not create channel.', 'error');
    }
  };

  const handleCreateDocument = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!activeWsId) {
      return;
    }

    try {
      const response = await documentService.createDocument(activeWsId, docTitle.trim(), '', docIcon);
      if (response.data?.success) {
        showToast('Document created', `${response.data.data.title} is ready.`, 'success');
        await refetchDocs();
        setActiveDoc(response.data.data);
        closeModal();
      }
    } catch (error: any) {
      showToast('Document error', error.response?.data?.message || 'Could not create document.', 'error');
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Delete this document?')) {
      return;
    }

    try {
      await documentService.deleteDocument(documentId);
      showToast('Document deleted', 'The document was removed.', 'success');
      await refetchDocs();
      if (getEntityId(activeDoc) === documentId) {
        setActiveDoc(null);
      }
    } catch (error: any) {
      showToast('Delete error', error.response?.data?.message || 'Could not delete document.', 'error');
    }
  };

  const sidebar = (
    <Sidebar
      workspaces={workspaces}
      activeWorkspace={activeWs}
      activeChannel={activeChannel}
      channels={channels}
      onlineUsers={onlineUsers}
      onWorkspaceChange={handleWorkspaceChange}
      onChannelChange={(channel) => {
        setActiveChannel(channel);
        setActiveDoc(null);
        setSidebarOpen(false);
      }}
      onAddWorkspace={() => setModal('create-workspace')}
      onJoinWorkspace={() => setModal('join-workspace')}
      onAddChannel={() => setModal('create-channel')}
    />
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-lg border border-slate-200 bg-white px-8 py-6 text-center shadow-sm">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />
          <p className="text-sm font-semibold text-slate-700">Loading workspace</p>
        </div>
      </div>
    );
  }

  if (activeWs && activeDoc) {
    return (
      <div className="flex h-screen overflow-hidden">
        {sidebar}
        <main className="min-w-0 flex-1">
          <DocumentEditor documentId={getEntityId(activeDoc)} userId={userId} userName={userName} onClose={() => { setActiveDoc(null); refetchDocs(); }} />
        </main>
      </div>
    );
  }

  if (activeWs && activeChannel) {
    return (
      <div className="flex h-screen overflow-hidden">
        {sidebar}
        <main className="min-w-0 flex-1">
          <ChatWindow channelId={getEntityId(activeChannel)} channelName={activeChannel.name} userId={userId} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f8fb]">
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-slate-950/40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <button onClick={() => setSidebarOpen(true)} className="fixed left-4 top-4 z-40 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm md:hidden">
        Menu
      </button>

      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebar}
      </div>

      <main className="min-w-0 flex-1 overflow-y-auto">
        {activeWs ? (
          <>
            <header className="border-b border-slate-200 bg-white px-8 py-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-sm font-black text-white">
                    {getInitials(activeWs.name)}
                  </div>
                  <div className="min-w-0">
                    <h1 className="truncate text-2xl font-bold text-slate-950">{activeWs.name}</h1>
                    <p className="truncate text-sm text-slate-500">{activeWs.description || 'Collaboration workspace'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setModal('invite')} className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                    Invite
                  </button>
                  <button onClick={() => setModal('create-channel')} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
                    New channel
                  </button>
                </div>
              </div>

              <div className="mt-5 flex gap-1 rounded-md border border-slate-200 bg-slate-50 p-1">
                {([
                  ['overview', 'Overview'],
                  ['documents', 'Documents'],
                  ['settings', 'Settings']
                ] as const).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => {
                      setView(id);
                      setActiveChannel(null);
                    }}
                    className={`rounded px-4 py-2 text-sm font-bold ${view === id ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </header>

            <section className="p-8">
              {view === 'overview' && (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      { label: 'Members', value: activeWs.members.length },
                      { label: 'Channels', value: channels.length },
                      { label: 'Documents', value: documents.length },
                      { label: 'Online', value: onlineUsers.filter((id) => activeWs.members.some((member) => member.id === id)).length }
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                        <p className="mt-3 text-3xl font-black text-slate-950">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-base font-bold text-slate-950">Channels</h2>
                        <button onClick={() => setModal('create-channel')} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50">New</button>
                      </div>

                      {channels.length > 0 ? (
                        <div className="space-y-2">
                          {channels.slice(0, 8).map((channel) => (
                            <button key={getEntityId(channel)} onClick={() => setActiveChannel(channel)} className="flex w-full items-center justify-between rounded-md border border-slate-200 px-4 py-3 text-left hover:border-sky-200 hover:bg-sky-50">
                              <span>
                                <span className="block text-sm font-bold text-slate-900"># {channel.name}</span>
                                {channel.description && <span className="mt-0.5 block truncate text-xs text-slate-500">{channel.description}</span>}
                              </span>
                              <span className="text-xs font-bold text-slate-400">Open</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-md border border-dashed border-slate-300 p-8 text-center">
                          <p className="font-bold text-slate-900">No channels yet</p>
                          <button onClick={() => setModal('create-channel')} className="mt-3 rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white">Create channel</button>
                        </div>
                      )}
                    </section>

                    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-base font-bold text-slate-950">Team</h2>
                        <button onClick={() => setModal('invite')} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Invite</button>
                      </div>

                      <div className="space-y-2">
                        {activeWs.members.map((member) => {
                          const isOnline = onlineUsers.includes(member.id);

                          return (
                            <div key={member.id} className="flex items-center gap-3 rounded-md border border-slate-100 px-3 py-2.5">
                              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-700">{getInitials(member.name)}</span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-bold text-slate-900">{member.name}</span>
                                <span className="block truncate text-xs text-slate-500">{member.email}</span>
                              </span>
                              <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {view === 'documents' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-slate-950">Documents</h2>
                      <p className="text-sm text-slate-500">Collaborative markdown docs for decisions, plans, and specs.</p>
                    </div>
                    <button onClick={() => setModal('create-document')} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
                      New document
                    </button>
                  </div>

                  {documents.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {documents.map((document) => (
                        <article key={getEntityId(document)} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                          <div className="mb-4 flex items-start justify-between gap-3">
                            <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-black tracking-[0.18em] text-slate-600">{document.icon || 'NOTE'}</span>
                            <button onClick={() => handleDeleteDocument(getEntityId(document))} className="rounded-md border border-slate-200 px-2 py-1 text-xs font-bold text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700">
                              Delete
                            </button>
                          </div>
                          <h3 className="truncate text-base font-bold text-slate-950">{document.title}</h3>
                          <p className="mt-1 text-xs text-slate-500">By {document.createdBy?.name || 'Unknown'}</p>
                          <p className="mt-1 text-xs text-slate-400">Updated {formatShortDate(document.updatedAt)}</p>
                          <button onClick={() => setActiveDoc(document)} className="mt-5 w-full rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                            Open
                          </button>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
                      <p className="text-lg font-bold text-slate-950">No documents yet</p>
                      <button onClick={() => setModal('create-document')} className="mt-4 rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white">
                        Create document
                      </button>
                    </div>
                  )}
                </div>
              )}

              {view === 'settings' && (
                <div className="max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-950">Workspace settings</h2>
                  <div className="mt-5 space-y-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Name</p>
                      <p className="mt-1 font-semibold text-slate-900">{activeWs.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Owner</p>
                      <p className="mt-1 font-semibold text-slate-900">{activeWs.owner?.name || 'Owner'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Invite code</p>
                      <div className="mt-2 flex gap-2">
                        <code className="min-w-0 flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm font-bold text-slate-800">{activeWs.inviteCode}</code>
                        <button onClick={() => { navigator.clipboard.writeText(activeWs.inviteCode); showToast('Copied', 'Invite code copied.', 'success'); }} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="flex min-h-full items-center justify-center p-8">
            <div className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-2xl font-black text-slate-950">Create your first workspace</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Start a team space or join one with an invite code.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button onClick={() => setModal('create-workspace')} className="rounded-md bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800">Create workspace</button>
                <button onClick={() => setModal('join-workspace')} className="rounded-md border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Join workspace</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-2xl">
            {modal === 'create-workspace' && (
              <form onSubmit={handleCreateWorkspace}>
                <h3 className="text-xl font-bold text-slate-950">Create workspace</h3>
                <div className="mt-5 space-y-3">
                  <input required autoFocus placeholder="Workspace name" value={wsName} onChange={(event) => setWsName(event.target.value)} className="w-full rounded-md border border-slate-200 px-3 py-3 text-sm outline-none focus:border-sky-400" />
                  <textarea placeholder="Description" value={wsDesc} onChange={(event) => setWsDesc(event.target.value)} rows={3} className="w-full resize-none rounded-md border border-slate-200 px-3 py-3 text-sm outline-none focus:border-sky-400" />
                </div>
                <ModalActions onCancel={closeModal} submitLabel="Create" />
              </form>
            )}

            {modal === 'join-workspace' && (
              <form onSubmit={handleJoinWorkspace}>
                <h3 className="text-xl font-bold text-slate-950">Join workspace</h3>
                <input required autoFocus placeholder="Invite code" value={inviteCode} onChange={(event) => setInviteCode(event.target.value.toUpperCase())} className="mt-5 w-full rounded-md border border-slate-200 px-3 py-3 font-mono text-sm font-bold tracking-[0.18em] outline-none focus:border-sky-400" />
                <ModalActions onCancel={closeModal} submitLabel="Join" />
              </form>
            )}

            {modal === 'create-channel' && (
              <form onSubmit={handleCreateChannel}>
                <h3 className="text-xl font-bold text-slate-950">New channel</h3>
                <div className="mt-5 space-y-3">
                  <input required autoFocus placeholder="channel-name" value={chName} onChange={(event) => setChName(event.target.value.toLowerCase().replace(/\s+/g, '-'))} className="w-full rounded-md border border-slate-200 px-3 py-3 text-sm outline-none focus:border-sky-400" />
                  <textarea placeholder="Channel purpose" value={chDesc} onChange={(event) => setChDesc(event.target.value)} rows={3} className="w-full resize-none rounded-md border border-slate-200 px-3 py-3 text-sm outline-none focus:border-sky-400" />
                </div>
                <ModalActions onCancel={closeModal} submitLabel="Create channel" />
              </form>
            )}

            {modal === 'create-document' && (
              <form onSubmit={handleCreateDocument}>
                <h3 className="text-xl font-bold text-slate-950">New document</h3>
                <div className="mt-5 space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    {DOCUMENT_LABELS.map((label) => (
                      <button key={label} type="button" onClick={() => setDocIcon(label)} className={`rounded-md border px-2 py-2 text-xs font-black tracking-[0.16em] ${docIcon === label ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <input required autoFocus placeholder="Document title" value={docTitle} onChange={(event) => setDocTitle(event.target.value)} className="w-full rounded-md border border-slate-200 px-3 py-3 text-sm outline-none focus:border-sky-400" />
                </div>
                <ModalActions onCancel={closeModal} submitLabel="Create document" />
              </form>
            )}

            {modal === 'invite' && activeWs && (
              <div>
                <h3 className="text-xl font-bold text-slate-950">Invite members</h3>
                <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-5 text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Invite code</p>
                  <p className="mt-2 font-mono text-2xl font-black tracking-[0.2em] text-slate-950">{activeWs.inviteCode}</p>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button onClick={closeModal} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">Close</button>
                  <button onClick={() => { navigator.clipboard.writeText(activeWs.inviteCode); showToast('Copied', 'Invite code copied.', 'success'); closeModal(); }} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">Copy code</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ModalActions = ({ onCancel, submitLabel }: { onCancel: () => void; submitLabel: string }) => (
  <div className="mt-6 flex justify-end gap-2">
    <button type="button" onClick={onCancel} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
      Cancel
    </button>
    <button type="submit" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
      {submitLabel}
    </button>
  </div>
);

export default DashboardPage;
