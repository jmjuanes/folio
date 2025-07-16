import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { environment } from "./env";

// generate a secure random token
const generateToken = (size: number = 32): string => {
    return crypto.randomBytes(size).toString("hex");
};

// get JWT secret from environment or use a default
const TOKEN_SECRET = environment.FOLIO_TOKEN_SECRET || generateToken(64) as string;
const TOKEN_EXPIRATION = environment.FOLIO_TOKEN_EXPIRATION || "10y" as string;

// the access token is generated once when the server starts
export const ACCESS_TOKEN = environment.FOLIO_ACCESS_TOKEN || generateToken() as string;

// Generate a JWT token for API access after authentication
export const generateJwtToken = (payload: object = {}): string => {
    return jwt.sign(payload || {}, TOKEN_SECRET, {expiresIn: TOKEN_EXPIRATION});
};

// verify the provided JWT token
export const verifyJwtToken = (token: string): object|null => {
    try {
        return jwt.verify(token, TOKEN_SECRET);
    }
    catch (error) {
        return null;
    }
};
