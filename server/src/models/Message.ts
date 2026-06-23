import { Schema, model, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  workspaceId: Types.ObjectId | string;
  channelId: Types.ObjectId | string;
  senderId: Types.ObjectId | string;
  message: string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    channelId: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true }
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

export const Message = model<IMessage>('Message', messageSchema);
