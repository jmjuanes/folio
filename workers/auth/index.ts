import { startServer, createKV } from "folio-shared";
import { createLogger } from "folio-shared";
import worker from "./worker.ts";
import type { Config } from "folio-shared";
import type { Env } from "./types.ts";

// start the application
export const startAuthServer = async (config: Config) => {
    const { info } = createLogger("folio:auth");
    const isAccessTokenAuth = config.authentication === "access_token";
    // 1. create environment for the worker
    const env: Env = {
        ACCESS_TOKEN: isAccessTokenAuth ? config.access_token : "",
        ALLOWED_ORIGINS: config.cors_allowed_origins || "*",
        AUTHENTICATION: !isAccessTokenAuth ? (await createKV("authentication", config.authentication)) : null,
        SESSION_SECRET: config.session_secret,
        SESSION_EXPIRATION: config.session_expiration || "7d",
    };
    // 2. check if authentication method is access token to print the token in console
    if (isAccessTokenAuth) {
        info(`using 'access_token' as authentication method.`);
        info(`use '${env.ACCESS_TOKEN}' to login.`);
    }
    // 3. create and run the server
    startServer("server:auth", Number(config.authentication_port), env, worker);
};
