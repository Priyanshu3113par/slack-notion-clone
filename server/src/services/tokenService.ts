import jwt from 'jsonwebtoken';
import { env } from '../config/env';

type JwtExpiresIn = jwt.SignOptions['expiresIn'];
const jwtSecret = env.jwtSecret as jwt.Secret;
const accessTokenOptions: jwt.SignOptions = { expiresIn: env.jwtExpiresIn as JwtExpiresIn };
const refreshTokenOptions: jwt.SignOptions = { expiresIn: env.refreshTokenExpiresIn as JwtExpiresIn };

export const generateAccessToken = (payload: { userId: string; role: string }) =>
  jwt.sign(payload, jwtSecret, accessTokenOptions);

export const verifyAccessToken = (token: string) => jwt.verify(token, jwtSecret);

export const generateRefreshToken = (payload: { userId: string }) =>
  jwt.sign(payload, jwtSecret, refreshTokenOptions);
