import { createClient } from 'redis';
import { env } from '../config/env';
import { log } from '../utils/logger';

const client = createClient({
  url: env.redisUrl
});

client.on('error', (err) => log.error('Redis error:', err));
client.on('connect', () => log.info('Redis connected'));

export const connectRedis = async () => {
  try {
    await client.connect();
    return client;
  } catch (error) {
    log.error('Failed to connect to Redis:', error);
    throw error;
  }
};

export const getRedisClient = () => client;

export const redisOps = {
  set: (key: string, value: string, ttl?: number) => {
    if (ttl) {
      return client.setEx(key, ttl, value);
    }
    return client.set(key, value);
  },

  get: (key: string) => client.get(key),

  delete: (key: string) => client.del(key),

  addToSet: (key: string, member: string) => client.sAdd(key, member),

  removeFromSet: (key: string, member: string) => client.sRem(key, member),

  getSet: (key: string) => client.sMembers(key),

  expire: (key: string, ttl: number) => client.expire(key, ttl)
};
