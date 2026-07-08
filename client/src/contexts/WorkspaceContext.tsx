import { createContext, useEffect, useState, ReactNode } from 'react';

interface WorkspaceContextType {
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (workspaceId: string | null) => void;
}

export const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(() => localStorage.getItem('activeWorkspaceId'));

  useEffect(() => {
    if (activeWorkspaceId) {
      localStorage.setItem('activeWorkspaceId', activeWorkspaceId);
      return;
    }

    localStorage.removeItem('activeWorkspaceId');
  }, [activeWorkspaceId]);

  return (
    <WorkspaceContext.Provider value={{ activeWorkspaceId, setActiveWorkspaceId }}>
      {children}
    </WorkspaceContext.Provider>
  );
};
