import { Schema, model, Document } from 'mongoose';

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  owner: string;
  members: string[];
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    inviteCode: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

export const Workspace = model<IWorkspace>('Workspace', workspaceSchema);
