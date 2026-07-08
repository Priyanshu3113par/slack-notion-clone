export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Workspace {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  owner: User;
  members: User[];
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface Channel {
  id: string;
  _id?: string;
  workspaceId: string;
  name: string;
  description?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  _id?: string;
  channelId: string;
  senderId?: string;
  sender?: User;
  message: string;
  createdAt: string;
}

export interface Document {
  id: string;
  _id?: string;
  workspaceId: string;
  title: string;
  content: string;
  icon?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}
