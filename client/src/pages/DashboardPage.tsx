import { useContext, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WorkspaceContext } from '../contexts/WorkspaceContext';
import { workspaceService, channelService } from '../services/workspaceService';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { Workspace, Channel } from '../types/index';

type DashboardView = 'overview' | 'documents' | 'settings';

const DashboardPage = () => {
  const workspaceContext = useContext(WorkspaceContext);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(workspaceContext?.activeWorkspace || null);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const userId = localStorage.getItem('userId') || '';

  const { data: workspacesData, isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceService.getWorkspaces()
  });

  const { data: channelsData } = useQuery({
    queryKey: ['channels', activeWorkspace?._id],
    queryFn: () => (activeWorkspace ? channelService.getChannels(activeWorkspace._id) : Promise.resolve(null)),
    enabled: !!activeWorkspace?._id
  });

  const documents = useMemo(
    () => [
      { id: '1', title: 'Product roadmap', updated: '2h ago', owner: 'Ava' },
      { id: '2', title: 'Design system notes', updated: '4h ago', owner: 'Noah' },
      { id: '3', title: 'Sprint planning', updated: 'Today', owner: 'Mina' }
    ],
    []
  );

  if (isLoading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${theme === 'dark' ? 'bg-slate-950 text-slate-400' : 'bg-slate-50 text-slate-600'}`}>
        <div className="w-full max-w-3xl space-y-4 rounded-[2rem] border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/20">
          <div className="h-4 w-32 animate-pulse rounded-full bg-slate-700" />
          <div className="h-8 w-3/4 animate-pulse rounded-full bg-slate-700" />
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const workspaces = workspacesData?.data?.data || [];
  const shellClass = theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const panelClass = theme === 'dark' ? 'border-white/10 bg-slate-900/70' : 'border-slate-200 bg-white/80';
  const mutedClass = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`flex h-screen overflow-hidden ${shellClass}`}>
      <div className="md:hidden">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed left-4 top-4 z-40 rounded-full border border-slate-700 bg-slate-900/90 p-2.5 text-slate-100 shadow-lg"
          aria-label="Open workspace navigation"
        >
          ☰
        </button>
      </div>

      {isSidebarOpen && <div className="fixed inset-0 z-30 bg-slate-950/70 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 md:static md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar
          activeWorkspace={activeWorkspace}
          activeChannel={activeChannel}
          onWorkspaceChange={(ws) => {
            setActiveWorkspace(ws);
            setActiveChannel(null);
            setActiveView('overview');
            setIsSidebarOpen(false);
            if (workspaceContext) {
              workspaceContext.setActiveWorkspace(ws);
            }
          }}
          onChannelChange={(channel) => {
            setActiveChannel(channel);
            setIsSidebarOpen(false);
          }}
          channels={channelsData?.data?.data || []}
        />
      </div>

      <main className="flex flex-1 flex-col overflow-hidden">
        {activeWorkspace && activeChannel ? (
          <ChatWindow channelId={activeChannel._id} channelName={activeChannel.name} userId={userId} />
        ) : activeWorkspace ? (
          <>
            <header className={`border-b px-6 py-5 backdrop-blur-xl ${theme === 'dark' ? 'border-white/10 bg-slate-900/80' : 'border-slate-200 bg-white/80'}`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-400">Workspace command center</p>
                  <h1 className="mt-2 text-2xl font-semibold">{activeWorkspace.name}</h1>
                  <p className={`mt-1 text-sm ${mutedClass}`}>{activeWorkspace.description || 'A polished collaboration workspace for modern teams.'}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${theme === 'dark' ? 'border-slate-700 bg-slate-800 hover:bg-slate-700' : 'border-slate-200 bg-slate-100 hover:bg-slate-200'}`}>
                    Invite members
                  </button>
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:from-sky-400 hover:to-cyan-300"
                  >
                    {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'documents', label: 'Documents' },
                  { id: 'settings', label: 'Settings' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveView(tab.id as DashboardView)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      activeView === tab.id
                        ? 'bg-sky-500 text-slate-950'
                        : theme === 'dark'
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {activeView === 'overview' && (
                <div className="space-y-6">
                  <div className={`rounded-[2rem] border p-6 shadow-2xl shadow-slate-950/10 transition-all duration-300 hover:-translate-y-0.5 ${panelClass}`}>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-400">Today at a glance</p>
                        <h2 className="mt-2 text-2xl font-semibold">Your team is moving quickly</h2>
                      </div>
                      <div className={`rounded-full border px-3 py-1 text-sm ${theme === 'dark' ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>
                        4 new updates
                      </div>
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-4">
                      {[
                        { label: 'Members', value: activeWorkspace.members.length },
                        { label: 'Channels', value: (channelsData?.data?.data || []).length },
                        { label: 'Open docs', value: documents.length },
                        { label: 'Live users', value: '12' }
                      ].map((stat) => (
                        <div key={stat.label} className={`rounded-2xl border p-4 transition-transform duration-300 hover:scale-[1.01] ${theme === 'dark' ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
                          <p className={`text-xs uppercase tracking-[0.26em] ${mutedClass}`}>{stat.label}</p>
                          <p className="mt-2 text-2xl font-semibold text-sky-400">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className={`rounded-[2rem] border p-6 ${panelClass}`}>
                      <div className="mb-5 flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Recent activity</h3>
                        <span className={`text-sm ${mutedClass}`}>Live sync enabled</span>
                      </div>
                      <div className="space-y-3">
                        {[
                          'Ava posted a product update in #development',
                          'Mina shared sprint notes in #design',
                          'Noah started a new draft document'
                        ].map((item) => (
                          <div key={item} className={`rounded-2xl border p-3 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'}`}>
                            <p className="text-sm text-slate-300">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`rounded-[2rem] border p-6 ${panelClass}`}>
                      <div className="mb-5 flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Team members</h3>
                        <span className={`text-sm ${mutedClass}`}>Online now</span>
                      </div>
                      <div className="space-y-3">
                        {activeWorkspace.members.map((member) => (
                          <div key={member.id} className={`flex items-center gap-3 rounded-2xl border p-3 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'}`}>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 font-semibold text-slate-950">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{member.name}</p>
                              <p className={`text-sm ${mutedClass}`}>{member.email}</p>
                            </div>
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'documents' && (
                <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                  <div className={`rounded-[2rem] border p-6 transition-all duration-300 hover:-translate-y-0.5 ${panelClass}`}>
                    <div className="mb-5 flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Documents</h3>
                      <button className="rounded-full bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950">New doc</button>
                    </div>
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div key={doc.id} className={`rounded-2xl border p-3 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'}`}>
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <p className={`text-sm ${mutedClass}`}>Updated {doc.updated} • {doc.owner}</p>
                            </div>
                            <button className={`rounded-full px-3 py-1 text-sm ${theme === 'dark' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>Open</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`rounded-[2rem] border p-6 transition-all duration-300 hover:-translate-y-0.5 ${panelClass}`}>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-400">Editor preview</p>
                    <h3 className="mt-2 text-2xl font-semibold">Collaborative notes</h3>
                    <div className={`mt-6 rounded-[1.5rem] border p-5 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                        Live collaboration enabled
                      </div>
                      <div className="mt-4 space-y-3">
                        <div className={`h-3 w-3/4 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'}`} />
                        <div className={`h-3 w-full rounded-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />
                        <div className={`h-3 w-5/6 rounded-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {['Auto-save', 'Mentions', 'Version history'].map((chip) => (
                          <span key={chip} className={`rounded-full px-3 py-1 text-sm ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'settings' && (
                <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                  <div className={`rounded-[2rem] border p-6 ${panelClass}`}>
                    <h3 className="text-lg font-semibold">Profile</h3>
                    <div className="mt-5 space-y-4">
                      <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'}`}>
                        <p className={`text-sm ${mutedClass}`}>Name</p>
                        <p className="mt-1 font-medium">Your Team Member</p>
                      </div>
                      <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'}`}>
                        <p className={`text-sm ${mutedClass}`}>Workspace role</p>
                        <p className="mt-1 font-medium">Admin</p>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-[2rem] border p-6 ${panelClass}`}>
                    <h3 className="text-lg font-semibold">Preferences</h3>
                    <div className="mt-5 space-y-4">
                      <div className={`flex items-center justify-between rounded-2xl border p-4 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'}`}>
                        <div>
                          <p className="font-medium">Theme</p>
                          <p className={`text-sm ${mutedClass}`}>Switch between dark and light surfaces.</p>
                        </div>
                        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-full bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950">
                          {theme === 'dark' ? 'Light' : 'Dark'}
                        </button>
                      </div>
                      <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'}`}>
                        <p className="font-medium">Notifications</p>
                        <p className={`mt-2 text-sm ${mutedClass}`}>Mentions, reminders, and new channels stay visible in real time.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className={`rounded-[2rem] border px-10 py-12 text-center shadow-2xl shadow-slate-950/10 ${panelClass}`}>
              <p className="text-lg font-semibold">Select a workspace and channel to begin</p>
              <p className={`mt-2 text-sm ${mutedClass}`}>Your collaboration home is ready with a polished workspace, live chat, and action-focused views.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;

