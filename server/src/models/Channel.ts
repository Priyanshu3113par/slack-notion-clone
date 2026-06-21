import { Schema, model, Document, Types } from 'mongoose';

export interface IChannel extends Document {
  workspaceId: Types.ObjectId | string;
  name: string;
  description?: string;
  createdBy: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const channelSchema = new Schema<IChannel>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export const Channel = model<IChannel>('Channel', channelSchema);
