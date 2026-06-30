import http from 'http';
import mongoose from 'mongoose';
import app from './app';
import { env } from './config/env';
import { log } from './utils/logger';
import { setupSocket } from './services/socketService';
import { connectRedis } from './config/redis';

const server = http.createServer(app);
setupSocket(server);

const start = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    log.info('Connected to MongoDB');

    // Connect to Redis
    await connectRedis();
    log.info('Successfully Connected to Redis');

    server.listen(env.port, () => {
      log.info(`Server listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    log.error('Failed to start the server', error);
    process.exit(1);
  }
};

start();
