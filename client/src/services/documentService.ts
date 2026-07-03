import api from './api';

export const documentService = {
  createDocument: (workspaceId: string, title: string, content: string = '') =>
    api.post('/documents', { workspaceId, title, content }),

  getDocuments: (workspaceId: string) =>
    api.get(`/documents/workspace/${workspaceId}`),

  getDocument: (id: string) =>
    api.get(`/documents/${id}`),

  updateDocument: (id: string, title: string, content: string) =>
    api.put(`/documents/${id}`, { title, content }),

  deleteDocument: (id: string) =>
    api.delete(`/documents/${id}`)
};
