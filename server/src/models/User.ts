import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'Admin' | 'Member';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Member'], default: 'Member' },
    avatar: { type: String, default: '' }
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
