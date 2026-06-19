import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const generateAccessToken = (payload: { userId: string; role: string }) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export const verifyAccessToken = (token: string) => jwt.verify(token, env.jwtSecret);

export const generateRefreshToken = (payload: { userId: string }) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: env.refreshTokenExpiresIn });
