import bodyParser from "body-parser";
import graphqlResponses from "./__stubs/graphql.json" with { type: "json" };

// fake rules for the API
const rules = [
    {
        method: "GET",
        path: "/_status",
        headers: {
            "Content-Type": "application/json",
        },
        response: {
            body: {
                message: "ok",
            },
        },
    },
    {
        method: "POST",
        path: "/_login",
        headers: {
            "Content-Type": "application/json",
        },
        response: {
            fn: request => {
                if (request?.body?.token === "12345") {
                    return Promise.resolve({
                        data: {
                            token: "12345",
                        },
                    });
                }
                // return a fake error if the token is not 12345
                return Promise.resolve({
                    errors: [
                        { message: "Invalid token" },
                    ],
                });
            },
        },
    },
    {
        method: "GET",
        path: "/_config",
        headers: {
            "Content-Type": "application/json",
        },
        response: {
            body: {
                data: {
                    title: "folio.",
                    login_messages: [
                        {
                            title: "Development environment",
                            content: "You are using a development environment. Some features may not work correctly or may contain bugs.",
                        },
                    ],
                },
            },
        },
    },
    {
        method: "POST",
        path: "/_graphql",
        secure: true,
        headers: {
            "Content-Type": "application/json",
        },
        response: {
            fn: request => {
                // console.log("GraphQL request:", request.body);
                const query = (request?.body?.query || "").trim().match(/(?:query|mutation) (\w+)/)?.[1] || "";
                return Promise.resolve({
                    data: graphqlResponses[query] || {},
                });
            },
        },
    },
];

export const createServer = () => {
    return (middlewares, devServer) => {
        if (!devServer) {
            throw new Error("webpack-dev-server is not defined");
        }

        // register bodyparser middleware to parse JSON requests
        devServer.app.use(bodyParser.json({
            limit: "10mb",
        }));

        // set middleware to catch all requests
        devServer.app.all("*", (request, response, next) => {
            // find the rule that matches the request
            const rule = rules.find(rule => {
                return rule.method === request.method && request.originalUrl === rule.path;
            });

            // if we have found the rule, set the headers and return the JSON data
            if (rule) {
                // if rule is masked as secure, we need to check that the request has
                // the authorization header
                if (rule.secure && !request.header("Authorization")) {
                    return response.status(403).json({});
                }
                // 1. set headers
                const headers = Object.assign({}, rule.headers || {});
                Object.keys(headers).forEach(name => {
                    response.setHeader(name, headers[name]);
                });
                // 2.1 send JSON data calling the provided function
                if (rule.response?.fn) {
                    rule.response.fn(request).then(data => {
                        response.status(rule.response?.status || 200);
                        response.json(data);
                    });
                }
                // 2.2. if the rule has a data property, use it to send the data object
                else if (rule.response?.body) {
                    response.status(rule.response?.status || 200);
                    response.json(rule.response.body);
                }
                // 2.3. if the rule does not have a filename or data property,
                // we return an empty object
                else {
                    response.status(rule.response?.status || 200);
                    response.json({});
                }
            }
            else {
                next();
            }
        });
        return middlewares;
    };
};
