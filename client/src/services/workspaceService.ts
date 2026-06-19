import api from './api';
import { Workspace, Channel } from '../types/index';

export const workspaceService = {
  createWorkspace: (name: string, description: string) =>
    api.post('/workspaces', { name, description }),
  
  getWorkspaces: () =>
    api.get('/workspaces'),
  
  getWorkspace: (id: string) =>
    api.get(`/workspaces/${id}`),
  
  updateWorkspace: (id: string, name: string, description: string) =>
    api.put(`/workspaces/${id}`, { name, description }),
  
  deleteWorkspace: (id: string) =>
    api.delete(`/workspaces/${id}`),
  
  joinWorkspace: (inviteCode: string) =>
    api.post('/workspaces/join', { inviteCode }),
  
  leaveWorkspace: (id: string) =>
    api.post(`/workspaces/${id}/leave`, {})
};

export const channelService = {
  createChannel: (workspaceId: string, name: string, description: string) =>
    api.post('/channels', { workspaceId, name, description }),
  
  getChannels: (workspaceId: string) =>
    api.get(`/channels/workspace/${workspaceId}`),
  
  getChannel: (id: string) =>
    api.get(`/channels/${id}`),
  
  updateChannel: (id: string, name: string, description: string) =>
    api.put(`/channels/${id}`, { name, description }),
  
  deleteChannel: (id: string) =>
    api.delete(`/channels/${id}`)
};
