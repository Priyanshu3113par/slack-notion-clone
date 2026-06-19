import { Schema, model, Document } from 'mongoose';

export interface IMessage extends Document {
  channelId: string;
  senderId: string;
  message: string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    channelId: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true }
  },
  { timestamps: true }
);

export const Message = model<IMessage>('Message', messageSchema);
