"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.verifyAccessToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const jwtSecret = env_1.env.jwtSecret;
const accessTokenOptions = { expiresIn: env_1.env.jwtExpiresIn };
const refreshTokenOptions = { expiresIn: env_1.env.refreshTokenExpiresIn };
const generateAccessToken = (payload) => jsonwebtoken_1.default.sign(payload, jwtSecret, accessTokenOptions);
exports.generateAccessToken = generateAccessToken;
const verifyAccessToken = (token) => jsonwebtoken_1.default.verify(token, jwtSecret);
exports.verifyAccessToken = verifyAccessToken;
const generateRefreshToken = (payload) => jsonwebtoken_1.default.sign(payload, jwtSecret, refreshTokenOptions);
exports.generateRefreshToken = generateRefreshToken;
//# sourceMappingURL=tokenService.js.map