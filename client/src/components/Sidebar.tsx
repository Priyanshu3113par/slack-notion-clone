import { useQuery } from '@tanstack/react-query';
import { workspaceService } from '../services/workspaceService';
import { Workspace, Channel } from '../types/index';

interface SidebarProps {
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
  const { data: workspacesData } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceService.getWorkspaces()
  });

  const workspaces = workspacesData?.data?.data || [];
  const currentUserName = localStorage.getItem('userName') || 'User';

  return (
    <aside className="flex h-full w-[280px] min-w-[280px] flex-col border-r border-slate-200 bg-slate-50 p-4 shadow-sm">
      {/* Brand Header */}
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white shadow-sm">
          CH
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800 leading-none">CollabHub</p>
          <p className="text-[10px] font-medium text-slate-400 mt-1">Real-time team space</p>
        </div>
      </div>

      {/* Workspaces Section */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Workspaces</p>
        <div className="flex gap-1">
          <button
            onClick={onJoinWorkspace}
            title="Join a workspace"
            className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
          >
            Join
          </button>
          <button
            onClick={onAddWorkspace}
            title="Create a workspace"
            className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
          >
            + New
          </button>
        </div>
      </div>

      <div className="space-y-1 overflow-y-auto max-h-[220px] mb-4">
        {workspaces.map((ws: Workspace) => (
          <button
            key={ws._id}
            onClick={() => onWorkspaceChange(ws)}
            className={`flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition duration-200 cursor-pointer ${
              activeWorkspace?._id === ws._id
                ? 'border-indigo-100 bg-indigo-50/70 text-indigo-700 shadow-sm'
                : 'border-transparent text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
            }`}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-xs font-semibold text-indigo-700">
              {ws.name.charAt(0).toUpperCase()}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-xs font-semibold truncate">{ws.name}</span>
              <span className="block text-[10px] text-slate-400">{ws.members.length} members</span>
            </span>
          </button>
        ))}
      </div>

      {/* Channels Section */}
      {activeWorkspace && (
        <div className="flex flex-1 flex-col border-t border-slate-200/60 pt-4 overflow-hidden">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Channels</p>
            <button
              onClick={onAddChannel}
              title="Create a channel"
              className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
            >
              + Add
            </button>
          </div>
          
          <div className="space-y-1 overflow-y-auto flex-1 mb-4">
            {channels.length > 0 ? (
              channels.map((ch: Channel) => (
                <button
                  key={ch._id}
                  onClick={() => onChannelChange(ch)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition cursor-pointer ${
                    activeChannel?._id === ch._id
                      ? 'bg-indigo-50/70 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                  }`}
                >
                  <span># {ch.name}</span>
                </button>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-3 py-3 text-center text-[10px] text-slate-400">
                No channels yet
              </p>
            )}
          </div>

          {/* Presence Section */}
          <div className="border-t border-slate-200/60 pt-4 mb-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Team Presence</p>
            <div className="space-y-1.5 overflow-y-auto max-h-[100px] text-xs text-slate-600">
              {activeWorkspace.members.map((member) => {
                const isOnline = onlineUsers.includes(member.id);
                return (
                  <div key={member.id} className="flex items-center gap-2 px-1">
                    <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-500 shadow-sm' : 'bg-slate-300'}`} />
                    <span className={`truncate ${isOnline ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                      {member.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* User Footer Profile & Logout */}
      <div className="mt-auto border-t border-slate-200 pt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 font-semibold text-xs uppercase">
            {currentUserName.charAt(0)}
          </div>
          <span className="text-xs font-semibold text-slate-700 truncate max-w-[130px]" title={currentUserName}>
            {currentUserName}
          </span>
        </div>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition cursor-pointer"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
