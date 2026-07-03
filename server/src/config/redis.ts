import { createClient } from 'redis';
import { env } from '../config/env';
import { log } from '../utils/logger';

const client = createClient({
  url: env.redisUrl
});

client.on('error', (err) => {
  // Only log if it's connected or in standard mode to prevent excessive spam
  if (client.isOpen) {
    log.error('Redis error:', err);
  }
});
client.on('connect', () => log.info('Redis connected'));

export let pubClient: ReturnType<typeof createClient> | null = null;
export let subClient: ReturnType<typeof createClient> | null = null;

export const connectRedis = async () => {
  try {
    await client.connect();
    
    pubClient = client.duplicate();
    subClient = client.duplicate();
    
    await Promise.all([pubClient.connect(), subClient.connect()]);
    return client;
  } catch (error) {
    log.warn('Failed to connect to Redis. Falling back to in-memory mode.', error);
    // Graceful degradation: set pubClient/subClient to null
    pubClient = null;
    subClient = null;
    return null;
  }
};

export const getRedisClient = () => client;

// In-memory fallback stores
const inMemoryStore = new Map<string, string>();
const inMemorySets = new Map<string, Set<string>>();

export const redisOps = {
  set: (key: string, value: string, ttl?: number) => {
    if (client.isOpen) {
      if (ttl) {
        return client.setEx(key, ttl, value);
      }
      return client.set(key, value);
    }
    inMemoryStore.set(key, value);
    return Promise.resolve('OK');
  },

  get: (key: string) => {
    if (client.isOpen) {
      return client.get(key);
    }
    return Promise.resolve(inMemoryStore.get(key) || null);
  },

  delete: (key: string) => {
    if (client.isOpen) {
      return client.del(key);
    }
    const existed = inMemoryStore.delete(key);
    return Promise.resolve(existed ? 1 : 0);
  },

  addToSet: (key: string, member: string) => {
    if (client.isOpen) {
      return client.sAdd(key, member);
    }
    if (!inMemorySets.has(key)) {
      inMemorySets.set(key, new Set());
    }
    inMemorySets.get(key)!.add(member);
    return Promise.resolve(1);
  },

  removeFromSet: (key: string, member: string) => {
    if (client.isOpen) {
      return client.sRem(key, member);
    }
    const set = inMemorySets.get(key);
    if (set) {
      const deleted = set.delete(member);
      return Promise.resolve(deleted ? 1 : 0);
    }
    return Promise.resolve(0);
  },

  getSet: (key: string) => {
    if (client.isOpen) {
      return client.sMembers(key);
    }
    const set = inMemorySets.get(key);
    return Promise.resolve(set ? Array.from(set) : []);
  },

  expire: (key: string, ttl: number) => {
    if (client.isOpen) {
      return client.expire(key, ttl);
    }
    return Promise.resolve(true);
  }
};

