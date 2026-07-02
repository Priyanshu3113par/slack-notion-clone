import { useQuery } from '@tanstack/react-query';
import { workspaceService } from '../services/workspaceService';
import { Workspace, Channel } from '../types/index';

interface SidebarProps {
  activeWorkspace: Workspace | null;
  activeChannel: Channel | null;
  onWorkspaceChange: (workspace: Workspace) => void;
  onChannelChange: (channel: Channel) => void;
  channels: Channel[];
}

const Sidebar = ({ activeWorkspace, activeChannel, onWorkspaceChange, onChannelChange, channels }: SidebarProps) => {
  const { data: workspacesData } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceService.getWorkspaces()
  });

  const workspaces = workspacesData?.data?.data || [];

  return (
    <aside className="flex h-full w-full max-w-[320px] flex-col border-r border-white/10 bg-slate-950/95 p-3 shadow-[20px_0_60px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-5 lg:max-w-[320px]">
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-3 transition-transform duration-300 hover:scale-[1.01]">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-400 to-indigo-500 text-sm font-semibold text-slate-950">
          CP
        </div>
        <div>
          <p className="text-sm font-semibold text-white">CollaboratePro</p>
          <p className="text-xs text-slate-400">Real-time team hub</p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">Workspaces</p>
        <button className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-sky-300 transition hover:border-sky-400">
          +
        </button>
      </div>

      <div className="space-y-2">
        {workspaces.map((ws: Workspace) => (
          <button
            key={ws._id}
            onClick={() => onWorkspaceChange(ws)}
            className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition duration-300 hover:-translate-y-0.5 ${
              activeWorkspace?._id === ws._id
                ? 'border-sky-400/40 bg-sky-500/10 text-white shadow-lg shadow-sky-500/10'
                : 'border-transparent bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
            }`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-400 text-sm font-semibold text-slate-950">
              {ws.name.charAt(0).toUpperCase()}
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium">{ws.name}</span>
              <span className="block text-xs text-slate-400">{ws.members.length} members</span>
            </span>
          </button>
        ))}
      </div>

      {activeWorkspace && (
        <>
          <div className="mt-6 border-t border-white/10 pt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">Channels</p>
              <button className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-sky-300 transition hover:border-sky-400">
                #
              </button>
            </div>
            <div className="space-y-2">
              {channels.length > 0 ? (
                channels.map((ch: Channel) => (
                  <button
                    key={ch._id}
                    onClick={() => onChannelChange(ch)}
                    className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm transition ${
                      activeChannel?._id === ch._id
                        ? 'bg-sky-500/15 text-white shadow-inner shadow-sky-500/10'
                        : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-medium"># {ch.name}</span>
                    <span className="text-xs text-slate-500">Live</span>
                  </button>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 px-3 py-3 text-sm text-slate-500">
                  No channels yet
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">Presence</p>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              {activeWorkspace.members.slice(0, 4).map((member) => (
                <div key={member.id} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span>{member.name}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
