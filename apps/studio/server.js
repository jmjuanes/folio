import bodyParser from "body-parser";
import * as graphql from "graphql";

// declare the attribute type
const attributeType = new graphql.GraphQLObjectType({
    name: "Attribute",
    fields: {
        key: {
            type: graphql.GraphQLString,
            description: "the key of the attribute",
        },
        value: {
            type: graphql.GraphQLString,
            description: "the value of the attribute",
        },
    },
});

// declare the primary document type
const documentType = new graphql.GraphQLObjectType({
    name: "Document",
    fields: {
        id: {
            type: graphql.GraphQLString,
            description: "the unique identifier of the document",
        },
        collection: {
            type: graphql.GraphQLString,
            description: "the type of the object, e.g. 'board', 'user', etc.",
        },
        created_at: {
            type: graphql.GraphQLString,
            description: "the timestamp when the document was created",
        },
        updated_at: {
            type: graphql.GraphQLString,
            description: "the timestamp when the document was last updated",
        },
        content: {
            type: graphql.GraphQLString,
            description: "the content of the document",
        },
    },
});

// declare the full schema object
export const schema = new graphql.GraphQLSchema({
    query: new graphql.GraphQLObjectType({
        name: "Query",
        fields: {
            getDocuments: {
                type: new graphql.GraphQLList(documentType),
                args: {
                    collection: {
                        type: graphql.GraphQLString,
                    },
                },
                resolve: () => {
                    return [
                        {
                            "id": "board1",
                            "created_at": "2025-06-27 00:00:00",
                            "updated_at": "2025-06-27 00:00:00",
                        },
                    ];
                },
            },
            getDocument: {
                type: documentType,
                args: {
                    collection: {
                        type: graphql.GraphQLString,
                    },
                    id: {
                        type: graphql.GraphQLString,
                    },
                },
                resolve: (source, args, context) => {
                    return null;
                },
            },
        },
    }),
    mutation: new graphql.GraphQLObjectType({
        name: "Mutation",
        fields: {
            createDocument: {
                type: documentType,
                args: {
                    collection: {
                        type: graphql.GraphQLString,
                    },
                    content: {
                        type: graphql.GraphQLString,
                    },
                },
                resolve: async (source, args, context) => {
                    return null;
                },
            },
            updateDocument: {
                type: documentType,
                args: {
                    collection: {
                        type: graphql.GraphQLString,
                    },
                    id: {
                        type: graphql.GraphQLString,
                    },
                    content: {
                        type: graphql.GraphQLString,
                    },
                },
                resolve: async (source, args, context) => {
                    return null;
                },
            },
            deleteDocument: {
                type: documentType,
                args: {
                    collection: {
                        type: graphql.GraphQLString,
                    },
                    id: {
                        type: graphql.GraphQLString,
                    },
                },
                resolve: async (source, args, context) => {
                    return null;
                },
            },
        },
    }),
});

// fake rules for the API
const rules = [
    {
        method: "POST",
        path: "/_login",
        response: {
            body: {
                token: "12345",
            },
        },
    },
    {
        method: "GET",
        path: "/_user",
        response: {
            body: {
                name: "test",
            },
        },
    },
    {
        method: "POST",
        path: "/_graphql",
        response: {
            fn: request => {
                console.log("GraphQL request:", request.body);
                return graphql.graphql({
                    schema: schema,
                    source: request.body.query || "",
                    variableValues: request.body.variables,
                });
            },
        },
    },
];

export const createServer = (config = {}) => {
    return (middlewares, devServer) => {
        if (!devServer) {
            throw new Error("webpack-dev-server is not defined");
        }

        // register bodyparser middleware to parse JSON requests
        devServer.app.use(bodyParser.json({
            limit: "10mb",
        }));

        // set middleware to catch all requests
        devServer.app.all(config.entry || "*", (request, response, next) => {
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
                const headers = Object.assign({}, config.headers || {}, rule.headers || {});
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
