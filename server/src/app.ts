import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes';
import workspaceRoutes from './routes/workspaceRoutes';
import channelRoutes from './routes/channelRoutes';
import messageRoutes from './routes/messageRoutes';
import documentRoutes from './routes/documentRoutes';
import { errorHandler } from './utils/errorHandler';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/documents', documentRoutes);

app.get('/api/health', (_, res) => res.json({ success: true, status: 'ok' }));

app.use(errorHandler);

export default app;
