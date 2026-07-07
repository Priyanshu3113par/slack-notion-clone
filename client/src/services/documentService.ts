import api from './api';

export const documentService = {
  createDocument: (workspaceId: string, title: string, content: string = '', icon: string = '📄') =>
    api.post('/documents', { workspaceId, title, content, icon }),

  getDocuments: (workspaceId: string) =>
    api.get(`/documents/workspace/${workspaceId}`),

  getDocument: (id: string) =>
    api.get(`/documents/${id}`),

  updateDocument: (id: string, title: string, content: string, icon?: string) =>
    api.put(`/documents/${id}`, { title, content, icon }),

  deleteDocument: (id: string) =>
    api.delete(`/documents/${id}`)
};
