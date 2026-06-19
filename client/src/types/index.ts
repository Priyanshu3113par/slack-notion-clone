export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  owner: User;
  members: User[];
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface Channel {
  _id: string;
  workspaceId: string;
  name: string;
  description?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  channelId: string;
  senderId: string;
  message: string;
  createdAt: string;
}
