import { createContext, useState, ReactNode } from 'react';
import { Workspace } from '../types/index';

interface WorkspaceContextType {
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace | null) => void;
}

export const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  return (
    <WorkspaceContext.Provider value={{ activeWorkspace, setActiveWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
};
