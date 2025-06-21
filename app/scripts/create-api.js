import fs from "node:fs";
import path from "node:path";
import {minimatch} from "minimatch";

// @description create an api middleware
export const createApi = (config = {}) => {
    return (middlewares, devServer) => {
        if (!devServer) {
            throw new Error("webpack-dev-server is not defined");
        }
        // set middleware to catch all requests to the entry path
        devServer.app.all(config.entry || "*", (request, response) => {
            // find the rule that matches the request
            const rule = (config.rules || []).find(rule => {
                const method = rule.method || "GET";
                if (method === request.method) {
                    if (minimatch(request.originalUrl, rule.test)) {
                        return true;
                    }
                }
                return false;
            });
            // if we have found the rule, set the headers and return the JSON data
            if (rule) {
                // if rule is masked as secure, we need to check that the request has
                // the authorization header
                if (rule.secure && !request.header("Authorization")) {
                    return response.status(403).json({});
                }
                // 1. set headers
                const headers = Object.assign({}, config.headers || {}, rule.headers || {});
                Object.keys(headers).forEach(name => {
                    response.setHeader(name, headers[name]);
                });
                // 2. send JSON data
                if (rule.filename) {
                    const data = JSON.parse(fs.readFileSync(path.join(config.source, rule.filename), "utf8"));
                    response.json(data)
                }
                else {
                    // if no filename is configured, just return an empty json object
                    response.json({});
                }
            }
            else {
                console.warn(`404 ${request.method} '${request.originalUrl}'`);
                response.status(404);
                response.json({
                    message: "Not found",
                });
            }
        });
        return middlewares;
    };
};
