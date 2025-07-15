import * as graphql from "graphql";
import { OBJECT_TYPES } from "./env";
import { getObject, getChildrenObjects } from "./database";

// declare the primary document type
export const documentType = new graphql.GraphQLObjectType({
    name: "Document",
    fields: {
        id: {
            type: graphql.GraphQLString,
            description: "the unique identifier of the document",
        },
        parent: {
            type: graphql.GraphQLString,
            description: "the ID of the parent document, if any",
        },
        object: {
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
        metadata: {
            type: graphql.GraphQLString,
            description: "additional metadata associated with the document",
        },
        content: {
            type: graphql.GraphQLString,
            description: "the content of the document",
        },
    },
}) as graphql.GraphQLObjectType;

// declare the full schema object
export const schema = new graphql.GraphQLSchema({
    query: new graphql.GraphQLObjectType({
        name: "Query",
        fields: {
            getCurrentUser: {
                type: documentType,
                description: "Retrieve the information about the logged-in user",
                resolve: (source, args, context) => {
                    return getObject(OBJECT_TYPES.USER, context.userId);
                },
            },
            getUser: {
                type: documentType,
                description: "Retrieve the information about a user by ID",
                args: {
                    id: {
                        type: graphql.GraphQLString,
                        description: "the ID of the user to retrieve",
                    },
                },
                resolve: (source, args) => {
                    return getObject(OBJECT_TYPES.USER, args.id);
                }
            },
            getUserBoards: {
                type: new graphql.GraphQLList(documentType),
                description: "Retrieve all boards created by the provided user ID",
                args: {
                    userId: {
                        type: graphql.GraphQLString,
                        description: "the ID of the user whose boards to retrieve",
                    },
                },
                resolve: (source, args) => {
                    return getChildrenObjects(OBJECT_TYPES.BOARD, args.userId);
                },
            },
            getBoard: {
                type: documentType,
                args: {
                    id: {
                        type: graphql.GraphQLString,
                        description: "the ID of the board to retrieve",
                    },
                },
                resolve: (source, args) => {
                    return getObject(OBJECT_TYPES.BOARD, args.id);
                },
            },
        },
    }),
    mutation: new graphql.GraphQLObjectType({
        name: "Mutation",
        fields: {},
    }),
}) as graphql.GraphQLSchema;
