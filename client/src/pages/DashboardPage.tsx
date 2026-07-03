import { useContext, useState, useEffect } from 'react';
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

type DashboardView = 'overview' | 'documents' | 'settings';
type ModalType = 'create-workspace' | 'join-workspace' | 'create-channel' | 'invite-members' | 'create-document' | null;

const DashboardPage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const workspaceContext = useContext(WorkspaceContext);
  
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(workspaceContext?.activeWorkspace || null);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  
  // Socket and Presence
  const { socket } = useSocket();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  
  const userId = localStorage.getItem('userId') || '';
  const currentUserName = localStorage.getItem('userName') || 'User';

  // Modal form states
  const [wsName, setWsName] = useState('');
  const [wsDesc, setWsDesc] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [channelName, setChannelName] = useState('');
  const [channelDesc, setChannelDesc] = useState('');
  const [docTitle, setDocTitle] = useState('');

  // Socket online users hook
  useEffect(() => {
    if (!socket) return;
    
    socket.on('online-users-update', (users: string[]) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off('online-users-update');
    };
  }, [socket]);

  // Fetch workspaces
  const { data: workspacesData, isLoading: workspacesLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceService.getWorkspaces()
  });

  // Fetch channels
  const { data: channelsData } = useQuery({
    queryKey: ['channels', activeWorkspace?._id],
    queryFn: () => (activeWorkspace ? channelService.getChannels(activeWorkspace._id) : Promise.resolve(null)),
    enabled: !!activeWorkspace?._id
  });

  // Fetch documents
  const { data: documentsData, refetch: refetchDocs } = useQuery({
    queryKey: ['documents', activeWorkspace?._id],
    queryFn: () => (activeWorkspace ? documentService.getDocuments(activeWorkspace._id) : Promise.resolve(null)),
    enabled: !!activeWorkspace?._id
  });

  const workspaces = workspacesData?.data?.data || [];
  const channels = channelsData?.data?.data || [];
  const documents = documentsData?.data?.data || [];

  // Handle Workspace Creation
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsName.trim()) return;

    try {
      const res = await workspaceService.createWorkspace(wsName, wsDesc);
      if (res.data?.success) {
        showToast('Workspace Created', `Successfully created workspace "${wsName}"`, 'success');
        queryClient.invalidateQueries({ queryKey: ['workspaces'] });
        setActiveWorkspace(res.data.data);
        setActiveModal(null);
        setWsName('');
        setWsDesc('');
      }
    } catch (err: any) {
      showToast('Error', err.response?.data?.message || 'Failed to create workspace', 'error');
    }
  };

  // Handle Joining Workspace
  const handleJoinWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    try {
      const res = await workspaceService.joinWorkspace(inviteCode);
      if (res.data?.success) {
        showToast('Workspace Joined', `Successfully joined workspace "${res.data.data.name}"`, 'success');
        queryClient.invalidateQueries({ queryKey: ['workspaces'] });
        setActiveWorkspace(res.data.data);
        setActiveModal(null);
        setInviteCode('');
      }
    } catch (err: any) {
      showToast('Error', err.response?.data?.message || 'Invalid invite code or already a member', 'error');
    }
  };

  // Handle Channel Creation
  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim() || !activeWorkspace) return;

    try {
      const res = await channelService.createChannel(activeWorkspace._id, channelName, channelDesc);
      if (res.data?.success) {
        showToast('Channel Created', `Successfully created channel #${channelName}`, 'success');
        queryClient.invalidateQueries({ queryKey: ['channels', activeWorkspace._id] });
        setActiveChannel(res.data.data);
        setActiveModal(null);
        setChannelName('');
        setChannelDesc('');
      }
    } catch (err: any) {
      showToast('Error', err.response?.data?.message || 'Failed to create channel', 'error');
    }
  };

  // Handle Document Creation
  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !activeWorkspace) return;

    try {
      const res = await documentService.createDocument(activeWorkspace._id, docTitle, '');
      if (res.data?.success) {
        showToast('Document Created', `Successfully created document "${docTitle}"`, 'success');
        refetchDocs();
        setActiveDocument(res.data.data);
        setActiveModal(null);
        setDocTitle('');
      }
    } catch (err: any) {
      showToast('Error', err.response?.data?.message || 'Failed to create document', 'error');
    }
  };

  // Handle Document Deletion
  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const res = await documentService.deleteDocument(docId);
      if (res.data?.success) {
        showToast('Document Deleted', 'Document deleted successfully.', 'success');
        refetchDocs();
      }
    } catch (err: any) {
      showToast('Error', err.response?.data?.message || 'Failed to delete document', 'error');
    }
  };

  if (workspacesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        <div className="w-full max-w-3xl space-y-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-md text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="font-semibold text-slate-800">Loading your collaborative workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white text-slate-800">
      {/* Mobile Sidebar Trigger */}
      <div className="md:hidden">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed left-4 top-4 z-40 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-md cursor-pointer"
          aria-label="Open workspace navigation"
        >
          ☰
        </button>
      </div>

      {isSidebarOpen && <div className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-xs md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 md:static md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar
          activeWorkspace={activeWorkspace}
          activeChannel={activeChannel}
          onWorkspaceChange={(ws) => {
            setActiveWorkspace(ws);
            setActiveChannel(null);
            setActiveDocument(null);
            setActiveView('overview');
            setIsSidebarOpen(false);
            if (workspaceContext) {
              workspaceContext.setActiveWorkspace(ws);
            }
          }}
          onChannelChange={(channel) => {
            setActiveChannel(channel);
            setActiveDocument(null);
            setIsSidebarOpen(false);
          }}
          channels={channels}
          onAddWorkspace={() => setActiveModal('create-workspace')}
          onJoinWorkspace={() => setActiveModal('join-workspace')}
          onAddChannel={() => setActiveModal('create-channel')}
          onlineUsers={onlineUsers}
        />
      </div>

      <main className="flex flex-1 flex-col overflow-hidden bg-slate-50/50">
        {/* Render Collaborative Document Editor if active */}
        {activeWorkspace && activeDocument ? (
          <DocumentEditor
            documentId={activeDocument._id}
            userId={userId}
            userName={currentUserName}
            onClose={() => {
              setActiveDocument(null);
              refetchDocs();
            }}
          />
        ) : activeWorkspace && activeChannel ? (
          <ChatWindow channelId={activeChannel._id} channelName={activeChannel.name} userId={userId} />
        ) : activeWorkspace ? (
          <>
            {/* Workspace Dashboard Header */}
            <header className="border-b border-slate-200 bg-white px-6 py-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Workspace Dashboard</p>
                  <h1 className="mt-1 text-2xl font-bold text-slate-800">{activeWorkspace.name}</h1>
                  <p className="mt-1 text-xs text-slate-500">{activeWorkspace.description || 'A unified, clean workspace for real-time collaboration.'}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setActiveModal('invite-members')}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Invite code
                  </button>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="mt-6 flex gap-1.5 border-t border-slate-100 pt-4">
                {([
                  { id: 'overview', label: 'Overview' },
                  { id: 'documents', label: 'Documents' },
                  { id: 'settings', label: 'Preferences & Settings' }
                ] as const).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveView(tab.id);
                      setActiveChannel(null);
                    }}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      activeView === tab.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </header>

            {/* Dashboard Content Pages */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeView === 'overview' && (
                <div className="space-y-6 max-w-5xl">
                  {/* Overview Stats */}
                  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Workspace at a glance</h2>
                    <div className="mt-5 grid gap-4 sm:grid-cols-4">
                      {[
                        { label: 'Total Members', value: activeWorkspace.members.length },
                        { label: 'Active Channels', value: channels.length },
                        { label: 'Collaborative Docs', value: documents.length },
                        { label: 'Active Online', value: onlineUsers.filter(uid => activeWorkspace.members.some(m => m.id === uid)).length }
                      ].map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
                          <p className="mt-1 text-2xl font-bold text-indigo-600">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Recent Activities */}
                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Workspace Info</h3>
                      <div className="space-y-3.5 text-slate-600 text-sm">
                        <div className="flex justify-between py-2 border-b border-slate-50">
                          <span className="font-medium text-slate-400">Owner</span>
                          <span className="font-semibold text-slate-700">{activeWorkspace.owner.name}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-50">
                          <span className="font-medium text-slate-400">Created On</span>
                          <span className="text-slate-700">{new Date(activeWorkspace.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-50">
                          <span className="font-medium text-slate-400">Invite Code</span>
                          <span className="font-mono text-indigo-600 font-semibold">{activeWorkspace.inviteCode}</span>
                        </div>
                      </div>
                    </div>

                    {/* Members List */}
                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Team Members</h3>
                      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                        {activeWorkspace.members.map((member) => {
                          const isOnline = onlineUsers.includes(member.id);
                          return (
                            <div key={member.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs uppercase">
                                {member.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 truncate">{member.name}</p>
                                <p className="text-[10px] text-slate-400 truncate">{member.email}</p>
                              </div>
                              <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500 shadow-sm' : 'bg-slate-300'}`} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'documents' && (
                <div className="space-y-6 max-w-5xl">
                  {/* Document Dashboard list */}
                  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">Collaborative Documents</h3>
                        <p className="text-xs text-slate-500">Live text synchronization and side-by-side markdown editing.</p>
                      </div>
                      <button
                        onClick={() => setActiveModal('create-document')}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-700 transition cursor-pointer"
                      >
                        + New Document
                      </button>
                    </div>

                    {documents.length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {documents.map((doc: Document) => (
                          <div key={doc._id} className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50/50 p-4 shadow-xs hover:shadow-md transition">
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-800 truncate" title={doc.title}>{doc.title}</h4>
                              <p className="mt-1 text-[10px] text-slate-400">
                                Created by {doc.createdBy?.name || 'Unknown'}
                              </p>
                              <p className="mt-1 text-[10px] text-slate-400">
                                Updated {new Date(doc.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                              <button
                                onClick={() => setActiveDocument(doc)}
                                className="flex-1 rounded-lg bg-indigo-50 py-1.5 text-center text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition cursor-pointer"
                              >
                                Edit Live
                              </button>
                              <button
                                onClick={() => handleDeleteDocument(doc._id)}
                                className="rounded-lg border border-slate-200 px-2 py-1.5 text-center text-xs text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center text-slate-400">
                        <p className="text-sm font-semibold text-slate-700">No collaborative documents yet</p>
                        <p className="mt-1.5 text-xs">Create your first live document and invite team members to write together.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeView === 'settings' && (
                <div className="space-y-6 max-w-3xl">
                  {/* Preferences settings panel */}
                  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800">Workspace Settings</h3>
                    <p className="text-xs text-slate-500 mt-1">Manage details for "{activeWorkspace.name}".</p>
                    
                    <div className="mt-6 space-y-4">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Invite Code</span>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-mono text-indigo-600 font-bold text-sm bg-white border border-slate-100 rounded-lg px-3 py-1.5">
                            {activeWorkspace.inviteCode}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(activeWorkspace.inviteCode);
                              showToast('Copied', 'Invite code copied to clipboard!', 'success');
                            }}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            Copy Code
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <h4 className="font-semibold text-slate-800 text-sm">Leave Workspace</h4>
                        <p className="text-xs text-slate-400 mt-1">If you leave, you will need a new invite code to reconnect with this workspace.</p>
                        <button
                          onClick={async () => {
                            if (!confirm('Are you sure you want to leave this workspace?')) return;
                            try {
                              await workspaceService.leaveWorkspace(activeWorkspace._id);
                              showToast('Left Workspace', 'You have left the workspace.', 'success');
                              queryClient.invalidateQueries({ queryKey: ['workspaces'] });
                              setActiveWorkspace(null);
                              setActiveChannel(null);
                            } catch (err: any) {
                              showToast('Error', err.response?.data?.message || 'Failed to leave workspace', 'error');
                            }
                          }}
                          className="mt-3 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          Leave Workspace
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty Workspace State Dashboard */
          <div className="flex flex-1 items-center justify-center p-6 bg-slate-50">
            <div className="w-full max-w-xl text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-100 text-indigo-600 font-bold text-xl shadow-xs">
                +
              </div>
              <h2 className="mt-6 text-xl font-bold text-slate-800">Welcome to CollabHub</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                You are not currently active in a workspace. Start collaborating by creating a new workspace, or input an invite code to join an existing team.
              </p>
              
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <button
                  onClick={() => setActiveModal('create-workspace')}
                  className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-xs hover:shadow-md hover:border-indigo-200 transition cursor-pointer"
                >
                  <span className="text-indigo-600 font-bold text-base mb-1">Create Workspace</span>
                  <span className="text-xs text-slate-400">Scaffold a brand new team control center</span>
                </button>
                <button
                  onClick={() => setActiveModal('join-workspace')}
                  className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-xs hover:shadow-md hover:border-indigo-200 transition cursor-pointer"
                >
                  <span className="text-indigo-600 font-bold text-base mb-1">Join with Invite Code</span>
                  <span className="text-xs text-slate-400">Join an existing workspace created by others</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- Dialog Modals --- */}

      {/* Create Workspace Modal */}
      {activeModal === 'create-workspace' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-2xl max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-800">Create new workspace</h3>
            <p className="text-xs text-slate-400 mt-1">Start a private workspace for your team.</p>
            <form onSubmit={handleCreateWorkspace} className="mt-4 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Workspace Name
                <input
                  type="text"
                  required
                  placeholder="Acme Corp, Sprint 1..."
                  value={wsName}
                  onChange={(e) => setWsName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </label>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Description (Optional)
                <textarea
                  placeholder="What is this workspace for?"
                  value={wsDesc}
                  onChange={(e) => setWsDesc(e.target.value)}
                  rows={2}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </label>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Workspace Modal */}
      {activeModal === 'join-workspace' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-2xl max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-800">Join a workspace</h3>
            <p className="text-xs text-slate-400 mt-1">Input the code provided by your workspace admin.</p>
            <form onSubmit={handleJoinWorkspace} className="mt-4 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Invite Code
                <input
                  type="text"
                  required
                  placeholder="HEX-CODE..."
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-mono"
                />
              </label>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  Join Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Channel Modal */}
      {activeModal === 'create-channel' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-2xl max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-800">Create new channel</h3>
            <p className="text-xs text-slate-400 mt-1">Channels are where conversations happen.</p>
            <form onSubmit={handleCreateChannel} className="mt-4 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Channel Name
                <input
                  type="text"
                  required
                  placeholder="e.g. general, frontend-dev"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </label>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Description (Optional)
                <textarea
                  placeholder="What should people chat about in this channel?"
                  value={channelDesc}
                  onChange={(e) => setChannelDesc(e.target.value)}
                  rows={2}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </label>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Code Modal */}
      {activeModal === 'invite-members' && activeWorkspace && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-2xl max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-800">Invite team members</h3>
            <p className="text-xs text-slate-400 mt-1">Share this code with teammates so they can join "{activeWorkspace.name}".</p>
            
            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Invite Code</span>
              <span className="mt-2 block font-mono text-2xl font-bold text-indigo-600 tracking-wider">
                {activeWorkspace.inviteCode}
              </span>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(activeWorkspace.inviteCode);
                  showToast('Copied', 'Invite code copied to clipboard!', 'success');
                  setActiveModal(null);
                }}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition cursor-pointer shadow-md shadow-indigo-600/10"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Document Modal */}
      {activeModal === 'create-document' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-2xl max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-800">Create co-editing document</h3>
            <p className="text-xs text-slate-400 mt-1">Scaffold a collaborative markdown editor.</p>
            <form onSubmit={handleCreateDocument} className="mt-4 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Document Title
                <input
                  type="text"
                  required
                  placeholder="e.g. Design Roadmap, Notes..."
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </label>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  Create Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
