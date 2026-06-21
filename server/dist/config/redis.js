"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisOps = exports.getRedisClient = exports.connectRedis = void 0;
const redis_1 = require("redis");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const client = (0, redis_1.createClient)({
    url: env_1.env.redisUrl
});
client.on('error', (err) => logger_1.log.error('Redis error:', err));
client.on('connect', () => logger_1.log.info('Redis connected'));
const connectRedis = async () => {
    try {
        await client.connect();
        return client;
    }
    catch (error) {
        logger_1.log.error('Failed to connect to Redis:', error);
        throw error;
    }
};
exports.connectRedis = connectRedis;
const getRedisClient = () => client;
exports.getRedisClient = getRedisClient;
exports.redisOps = {
    set: (key, value, ttl) => {
        if (ttl) {
            return client.setEx(key, ttl, value);
        }
        return client.set(key, value);
    },
    get: (key) => client.get(key),
    delete: (key) => client.del(key),
    addToSet: (key, member) => client.sAdd(key, member),
    removeFromSet: (key, member) => client.sRem(key, member),
    getSet: (key) => client.sMembers(key),
    expire: (key, ttl) => client.expire(key, ttl)
};
//# sourceMappingURL=redis.js.map