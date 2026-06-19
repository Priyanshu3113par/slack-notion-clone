import { useContext, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WorkspaceContext } from '../contexts/WorkspaceContext';
import { workspaceService, channelService } from '../services/workspaceService';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { Workspace, Channel } from '../types/index';

const DashboardPage = () => {
  const workspaceContext = useContext(WorkspaceContext);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(workspaceContext?.activeWorkspace || null);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const userId = localStorage.getItem('userId') || '';

  const { data: workspacesData, isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceService.getWorkspaces()
  });

  const { data: channelsData } = useQuery({
    queryKey: ['channels', activeWorkspace?._id],
    queryFn: () => activeWorkspace ? channelService.getChannels(activeWorkspace._id) : Promise.resolve(null),
    enabled: !!activeWorkspace?._id
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-slate-400">Loading workspaces...</div>
      </div>
    );
  }

  const workspaces = workspacesData?.data?.data || [];

  return (
    <div className="flex h-screen gap-0 bg-slate-950">
      <Sidebar
        activeWorkspace={activeWorkspace}
        activeChannel={activeChannel}
        onWorkspaceChange={(ws) => {
          setActiveWorkspace(ws);
          setActiveChannel(null);
          if (workspaceContext) {
            workspaceContext.setActiveWorkspace(ws);
          }
        }}
        onChannelChange={setActiveChannel}
        channels={channelsData?.data?.data || []}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        {activeWorkspace && activeChannel ? (
          <ChatWindow
            channelId={activeChannel._id}
            channelName={activeChannel.name}
            userId={userId}
          />
        ) : activeWorkspace ? (
          <>
            <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold text-white">{activeWorkspace.name}</h1>
                  <p className="mt-1 text-sm text-slate-400">{activeWorkspace.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700">
                    Invite
                  </button>
                  <button className="rounded-2xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700">
                    Settings
                  </button>
                </div>
              </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
              <section className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
                    <h2 className="mb-4 text-lg font-semibold text-white">Welcome to {activeWorkspace.name}</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[
                        { label: 'Members', value: activeWorkspace.members.length },
                        { label: 'Channels', value: (channelsData?.data?.data || []).length }
                      ].map((stat) => (
                        <div key={stat.label} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                          <p className="text-xs uppercase tracking-wider text-slate-400">{stat.label}</p>
                          <p className="mt-2 text-2xl font-semibold text-sky-400">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
                    <h3 className="mb-4 text-lg font-semibold text-white">Team Members</h3>
                    <div className="space-y-3">
                      {activeWorkspace.members.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{member.name}</p>
                            <p className="text-xs text-slate-400">{member.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <p className="text-slate-400">No workspace selected</p>
              <p className="mt-2 text-sm text-slate-500">Create or join a workspace to get started</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;


