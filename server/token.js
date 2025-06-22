import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import environment from "./env.js";

// Generate a secure random token
const generateToken = (size = 32) => {
    return crypto.randomBytes(size).toString("hex");
};

// Get JWT secret from environment or use a default
const TOKEN_SECRET = environment.FOLIO_TOKEN_SECRET || generateToken(64);
const TOKEN_EXPIRATION = environment.FOLIO_TOKEN_EXPIRATION || "10y";

// The access token is generated once when the server starts
export const ACCESS_TOKEN = environment.FOLIO_ACCESS_TOKEN || generateToken();

// Generate a JWT token for API access after authentication
export const generateJwtToken = (payload = {}) => {
    return jwt.sign(payload, TOKEN_SECRET, {expiresIn: TOKEN_EXPIRATION});
};

// verify the provided JWT token
export const verifyJwtToken = token => {
    try {
        return jwt.verify(token, TOKEN_SECRET);
    }
    catch (error) {
        return null;
    }
};
