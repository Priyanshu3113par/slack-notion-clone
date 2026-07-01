"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const socketService_1 = require("./services/socketService");
const redis_1 = require("./config/redis");
const server = http_1.default.createServer(app_1.default);
(0, socketService_1.setupSocket)(server);
const start = async () => {
    try {
        await mongoose_1.default.connect(env_1.env.mongoUri);
        logger_1.log.info('Connected to MongoDB');
        // Connect to Redis
        await (0, redis_1.connectRedis)();
        logger_1.log.info('Successfully Connected to Redis');
        server.listen(env_1.env.port, () => {
            logger_1.log.info(`Server listening on http://localhost:${env_1.env.port}`);
        });
    }
    catch (error) {
        logger_1.log.error('Failed to start the server', error);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=index.js.map