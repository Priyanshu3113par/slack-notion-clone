import { Schema, model, Document as MongooseDocument, Types } from 'mongoose';

export interface IDocument extends MongooseDocument {
  workspaceId: Types.ObjectId | string;
  title: string;
  content: string;
  createdBy: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export const Document = model<IDocument>('Document', documentSchema);
