import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import environment from "./environment.js";

// Generate a secure random token
const generateToken = (size = 32) => {
    return crypto.randomBytes(size).toString("hex");
};

// Get JWT secret from environment or use a default
const JWT_SECRET = environment.JWT_SECRET || generateToken(64);
const TOKEN_EXPIRATION = environment.JWT_EXPIRATION || "7d"; // JWT tokens will expire after 7 days

// The access token is generated once when the server starts
export const ACCESS_TOKEN = environment.ACCESS_TOKEN || generateToken();

// Generate a JWT token for API access after authentication
export const generateJwtToken = () => {
    return jwt.sign({authenticated: true}, JWT_SECRET, {expiresIn: TOKEN_EXPIRATION});
};

// verify the provided JWT token
export const verifyJwtToken = token => {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
