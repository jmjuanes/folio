import crypto from "node:crypto";
import jwt from "jsonwebtoken";

export type JwtTokenGenerationOptions = {
    secret?: string; // secret key used to sign the JWT
    expiration?: string; // expiration time for the JWT, e.g., "1h", "2d"
    payload?: object; // additional payload to include in the JWT
};

export type JwtTokenVerificationOptions = {
    secret?: string; // secret key used to verify the JWT
};

// generate a secure random token
export const generateToken = (size: number = 32): string => {
    return crypto.randomBytes(size).toString("hex");
};

const JWT_TOKEN_LENGTH = 64;
const JWT_TOKEN_SECRET = generateToken(JWT_TOKEN_LENGTH);
const JWT_TOKEN_EXPIRATION = "1y"; // 1 year

// Generate a JWT token for API access after authentication
export const generateJwtToken = (options: JwtTokenGenerationOptions): string => {
    return jwt.sign(options.payload || {}, options.secret || JWT_TOKEN_SECRET, {
        expiresIn: options.expiration || JWT_TOKEN_EXPIRATION,
    });
};

// verify the provided JWT token
export const verifyJwtToken = (token: string, options: JwtTokenVerificationOptions): any => {
    try {
        return jwt.verify(token, options?.secret || JWT_TOKEN_SECRET);
    }
    catch (error) {
        return null;
    }
};
