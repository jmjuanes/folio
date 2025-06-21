import fs, { readFile } from "node:fs";
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
                // 2.1 send JSON data from the provided file
                if (rule.filename) {
                    const data = JSON.parse(fs.readFileSync(path.join(config.source, rule.filename), "utf8"));
                    response.json(data)
                }
                // 2.2. if the rule has a data property, use it to send the data object
                else if (rule.data) {
                    response.json(rule.data);
                }
                // 2.3. if the rule does not have a filename or data property,
                // we return an empty object
                else {
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
