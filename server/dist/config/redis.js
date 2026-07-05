"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisOps = exports.getRedisClient = exports.connectRedis = exports.subClient = exports.pubClient = void 0;
const redis_1 = require("redis");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const client = (0, redis_1.createClient)({
    url: env_1.env.redisUrl,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 3) {
                return new Error('Max retries reached'); // Reject promise after 3 attempts
            }
            return 500; // Wait 500ms before retrying
        }
    }
});
client.on('error', (err) => {
    // Only log if it's connected or in standard mode to prevent excessive spam
    if (client.isOpen) {
        logger_1.log.error('Redis error:', err);
    }
});
client.on('connect', () => logger_1.log.info('Redis connected'));
exports.pubClient = null;
exports.subClient = null;
const connectRedis = async () => {
    try {
        await client.connect();
        exports.pubClient = client.duplicate();
        exports.subClient = client.duplicate();
        await Promise.all([exports.pubClient.connect(), exports.subClient.connect()]);
        return client;
    }
    catch (error) {
        logger_1.log.warn('Failed to connect to Redis. Falling back to in-memory mode.', error);
        // Graceful degradation: set pubClient/subClient to null
        exports.pubClient = null;
        exports.subClient = null;
        return null;
    }
};
exports.connectRedis = connectRedis;
const getRedisClient = () => client;
exports.getRedisClient = getRedisClient;
// In-memory fallback stores
const inMemoryStore = new Map();
const inMemorySets = new Map();
exports.redisOps = {
    set: (key, value, ttl) => {
        if (client.isOpen) {
            if (ttl) {
                return client.setEx(key, ttl, value);
            }
            return client.set(key, value);
        }
        inMemoryStore.set(key, value);
        return Promise.resolve('OK');
    },
    get: (key) => {
        if (client.isOpen) {
            return client.get(key);
        }
        return Promise.resolve(inMemoryStore.get(key) || null);
    },
    delete: (key) => {
        if (client.isOpen) {
            return client.del(key);
        }
        const existed = inMemoryStore.delete(key);
        return Promise.resolve(existed ? 1 : 0);
    },
    addToSet: (key, member) => {
        if (client.isOpen) {
            return client.sAdd(key, member);
        }
        if (!inMemorySets.has(key)) {
            inMemorySets.set(key, new Set());
        }
        inMemorySets.get(key).add(member);
        return Promise.resolve(1);
    },
    removeFromSet: (key, member) => {
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
    getSet: (key) => {
        if (client.isOpen) {
            return client.sMembers(key);
        }
        const set = inMemorySets.get(key);
        return Promise.resolve(set ? Array.from(set) : []);
    },
    expire: (key, ttl) => {
        if (client.isOpen) {
            return client.expire(key, ttl);
        }
        return Promise.resolve(true);
    }
};
//# sourceMappingURL=redis.js.map