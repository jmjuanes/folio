import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { uid } from "uid/secure";

export type JwtTokenGenerationOptions = {
    secret?: string; // secret key used to sign the JWT
    expiration?: string; // expiration time for the JWT, e.g., "1h", "2d"
    payload?: object; // additional payload to include in the JWT
};

export type JwtTokenVerificationOptions = {
    secret?: string; // secret key used to verify the JWT
};

// generate an unique identifier
export const generateUid = (size: number = 16): string => {
    return uid(size);
};

// generate a secure random token
export const generateToken = (size: number = 32): string => {
    return crypto.randomBytes(size).toString("hex");
};

const JWT_TOKEN_SECRET = generateToken(64);
const JWT_TOKEN_EXPIRATION = "1y"; // 1 year

// Generate a JWT token for API access after authentication
export const generateJwtToken = (options: JwtTokenGenerationOptions): string => {
    return jwt.sign(options.payload || {}, options.secret || JWT_TOKEN_SECRET, {
        expiresIn: options.expiration || JWT_TOKEN_EXPIRATION,
    });
};

// verify the provided JWT token
export const verifyJwtToken = (token: string, options: JwtTokenVerificationOptions): object|null => {
    try {
        return jwt.verify(token, options?.secret || JWT_TOKEN_SECRET);
    }
    catch (error) {
        return null;
    }
};

// hashing tokens to store them securely
// this is useful for access tokens or other sensitive information
export const hashToken = (token: string, secret: string, digest?: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(token, secret, 1000, 64, digest || "sha512", (error, derivedKey) => {
            if (error) {
                return reject(error);
            }
            resolve(derivedKey.toString("hex"));
        });
    });
};
