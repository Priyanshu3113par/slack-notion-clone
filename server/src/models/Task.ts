import { Schema, model, Document, Types } from 'mongoose';

export interface ITask extends Document {
  workspaceId: Types.ObjectId | string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  assignedTo?: Types.ObjectId | string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['todo', 'in-progress', 'review', 'completed'], default: 'todo' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    dueDate: { type: Date }
  },
  { timestamps: true }
);

export const Task = model<ITask>('Task', taskSchema);
