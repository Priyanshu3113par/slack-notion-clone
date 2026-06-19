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
    <aside className="h-full w-64 border-r border-slate-800 bg-slate-900 p-4 shadow-xl">
      <div className="mb-6 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Workspaces</h2>
        <button className="rounded-lg bg-slate-800 p-1 text-xs text-sky-300 transition hover:bg-slate-700">+</button>
      </div>
      <nav className="space-y-2">
        {workspaces.map((ws: Workspace) => (
          <button
            key={ws._id}
            onClick={() => onWorkspaceChange(ws)}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
              activeWorkspace?._id === ws._id
                ? 'bg-sky-500 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {ws.name}
          </button>
        ))}
      </nav>

      {activeWorkspace && (
        <>
          <div className="my-6 border-t border-slate-800" />
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Channels</h3>
            <button className="rounded-lg bg-slate-800 p-1 text-xs text-sky-300 transition hover:bg-slate-700">#</button>
          </div>
          <div className="space-y-2">
            {channels.length > 0 ? (
              channels.map((ch: Channel) => (
                <button
                  key={ch._id}
                  onClick={() => onChannelChange(ch)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    activeChannel?._id === ch._id
                      ? 'bg-sky-500 text-white font-semibold'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  #{ch.name}
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-sm text-slate-500">No channels yet</p>
            )}
          </div>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
