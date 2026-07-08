import { Schema, model, Document as MongooseDocument, Types } from 'mongoose';

export interface IDocument extends MongooseDocument {
  workspaceId: Types.ObjectId | string;
  title: string;
  content: string;
  icon?: string;
  createdBy: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
    icon: { type: String, default: 'NOTE' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
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

export const Document = model<IDocument>('Document', documentSchema);
