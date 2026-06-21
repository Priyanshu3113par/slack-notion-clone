"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const mongoose_1 = require("mongoose");
const taskSchema = new mongoose_1.Schema({
    workspaceId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['todo', 'in-progress', 'review', 'completed'], default: 'todo' },
    assignedTo: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    dueDate: { type: Date }
}, { timestamps: true });
exports.Task = (0, mongoose_1.model)('Task', taskSchema);
//# sourceMappingURL=Task.js.map