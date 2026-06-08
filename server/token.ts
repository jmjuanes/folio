import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

// generate a secure random token
export const generateToken = (size: number = 32): string => {
    return crypto.randomBytes(size).toString("hex");
};

const JWT_TOKEN_LENGTH = 64;
const JWT_TOKEN_SECRET = generateToken(JWT_TOKEN_LENGTH);
const JWT_TOKEN_EXPIRATION = "1y"; // 1 year

// Generate a JWT token for API access after authentication
export const generateJwtToken = (payload: any, secret?: string | undefined, expiration?: string): string => {
    return jwt.sign(payload, secret || JWT_TOKEN_SECRET, {
        expiresIn: (expiration || JWT_TOKEN_EXPIRATION) as SignOptions["expiresIn"],
    });
};

// verify the provided JWT token
export const verifyJwtToken = (token: string, secret?: string): any => {
    try {
        return jwt.verify(token, secret || JWT_TOKEN_SECRET);
    }
    catch (error) {
        return null;
    }
};
