import { Workspace, Channel } from '../types/index';
import { getEntityId, getInitials } from '../utils/entities';

interface SidebarProps {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  activeChannel: Channel | null;
  onWorkspaceChange: (workspace: Workspace) => void;
  onChannelChange: (channel: Channel | null) => void;
  channels: Channel[];
  onAddWorkspace: () => void;
  onJoinWorkspace: () => void;
  onAddChannel: () => void;
  onlineUsers: string[];
}

const Sidebar = ({
  workspaces,
  activeWorkspace,
  activeChannel,
  onWorkspaceChange,
  onChannelChange,
  channels,
  onAddWorkspace,
  onJoinWorkspace,
  onAddChannel,
  onlineUsers
}: SidebarProps) => {
  const currentUserName = localStorage.getItem('userName') || 'User';

  return (
    <aside className="flex h-full w-[304px] min-w-[304px] flex-col border-r border-slate-200 bg-[#111827] p-4 text-slate-100 shadow-xl">
      <div className="mb-5 rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-sm font-black tracking-[0.18em] text-slate-950">
            CH
          </div>
          <div>
            <p className="font-semibold text-white">CollabHub</p>
            <p className="text-xs text-slate-400">Team operating room</p>
          </div>
        </div>
      </div>

      <section className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Workspaces</p>
          <div className="flex gap-1">
            <button onClick={onJoinWorkspace} className="rounded-md border border-white/10 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:bg-white/10">
              Join
            </button>
            <button onClick={onAddWorkspace} className="rounded-md border border-white/10 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:bg-white/10">
              New
            </button>
          </div>
        </div>

        <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
          {workspaces.map((workspace) => {
            const isActive = getEntityId(activeWorkspace) === getEntityId(workspace);

            return (
              <button
                key={getEntityId(workspace)}
                onClick={() => onWorkspaceChange(workspace)}
                className={`flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition ${
                  isActive
                    ? 'border-sky-400/40 bg-sky-400/10 text-white'
                    : 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 text-xs font-bold text-white">
                  {getInitials(workspace.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{workspace.name}</span>
                  <span className="block text-[11px] text-slate-500">{workspace.members.length} members</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {activeWorkspace && (
        <section className="flex min-h-0 flex-1 flex-col rounded-lg border border-white/10 bg-white/[0.035] p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Channels</p>
            <button onClick={onAddChannel} className="rounded-md border border-white/10 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:bg-white/10">
              Add
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
            {channels.length > 0 ? (
              channels.map((channel) => {
                const isActive = getEntityId(activeChannel) === getEntityId(channel);

                return (
                  <button
                    key={getEntityId(channel)}
                    onClick={() => onChannelChange(channel)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${
                      isActive ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    <span className="truncate"># {channel.name}</span>
                    <span className="text-[10px] opacity-60">Open</span>
                  </button>
                );
              })
            ) : (
              <div className="rounded-md border border-dashed border-white/10 px-3 py-5 text-center text-xs text-slate-500">
                No channels yet
              </div>
            )}
          </div>

          <div className="mt-4 border-t border-white/10 pt-3">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Presence</p>
            <div className="max-h-28 space-y-1 overflow-y-auto pr-1">
              {activeWorkspace.members.map((member) => {
                const isOnline = onlineUsers.includes(member.id);

                return (
                  <div key={member.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs">
                    <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    <span className={isOnline ? 'text-white' : 'text-slate-500'}>{member.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-xs font-bold">
            {getInitials(currentUserName)}
          </span>
          <span className="truncate text-sm font-semibold">{currentUserName}</span>
        </div>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="rounded-md border border-white/10 px-2 py-1 text-[11px] font-bold text-slate-300 hover:border-rose-300/30 hover:bg-rose-500/10 hover:text-rose-100"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
