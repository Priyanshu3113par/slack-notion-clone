import { Schema, model, Document, Types } from 'mongoose';

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  owner: Types.ObjectId | string;
  members: (Types.ObjectId | string)[];
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
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        return ret;
      }
    }
  }
);

export const Workspace = model<IWorkspace>('Workspace', workspaceSchema);
