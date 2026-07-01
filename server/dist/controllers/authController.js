"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profile = exports.refreshSession = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const env_1 = require("../config/env");
const tokenService_1 = require("../services/tokenService");
const register = async (req, res) => {
    const { name, email, password } = req.body;
    const existingUser = await User_1.User.findOne({ email });
    if (existingUser) {
        return res.status(409).json({ success: false, message: 'Email already in use' });
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 12);
    const user = await User_1.User.create({ name, email, password: hashedPassword });
    const accessToken = (0, tokenService_1.generateAccessToken)({ userId: user.id, role: user.role });
    const refreshToken = (0, tokenService_1.generateRefreshToken)({ userId: user.id });
    res.status(201).json({
        success: true,
        data: {
            user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
            accessToken,
            refreshToken
        }
    });
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User_1.User.findOne({ email });
    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isValid = await bcrypt_1.default.compare(password, user.password);
    if (!isValid) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const accessToken = (0, tokenService_1.generateAccessToken)({ userId: user.id, role: user.role });
    const refreshToken = (0, tokenService_1.generateRefreshToken)({ userId: user.id });
    res.json({
        success: true,
        data: {
            user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
            accessToken,
            refreshToken
        }
    });
};
exports.login = login;
const refreshSession = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ success: false, message: 'Refresh token missing' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.env.jwtSecret);
        const user = await User_1.User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }
        const accessToken = (0, tokenService_1.generateAccessToken)({ userId: user.id, role: user.role });
        const newRefreshToken = (0, tokenService_1.generateRefreshToken)({ userId: user.id });
        res.json({
            success: true,
            data: {
                accessToken,
                refreshToken: newRefreshToken
            }
        });
    }
    catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
};
exports.refreshSession = refreshSession;
const profile = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const user = await User_1.User.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
        success: true,
        data: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        }
    });
};
exports.profile = profile;
//# sourceMappingURL=authController.js.map