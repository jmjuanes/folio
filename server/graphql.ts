import * as graphql from "graphql";
import { OBJECT_TYPES } from "./env";

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
                    return context.db.getObject(OBJECT_TYPES.USER, context.userId, false);
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
                resolve: (source, args, context) => {
                    return context.db.getObject(OBJECT_TYPES.USER, args.id, false);
                }
            },
            getUserBoards: {
                type: new graphql.GraphQLList(documentType),
                description: "Retrieve all boards created by the provided user ID",
                args: {
                    id: {
                        type: graphql.GraphQLString,
                        description: "the ID of the user whose boards to retrieve",
                    },
                },
                resolve: (source, args, context) => {
                    return context.db.getChildrenObjects(OBJECT_TYPES.BOARD, args.id, false);
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
                resolve: (source, args, context) => {
                    return context.db.getObject(OBJECT_TYPES.BOARD, args.id, true);
                },
            },
        },
    }),
    mutation: new graphql.GraphQLObjectType({
        name: "Mutation",
        fields: {
            createBoard: {
                type: documentType,
                description: "create a new board",
                args: {
                    attributes: {
                        type: graphql.GraphQLString,
                        description: "additional attributes for the board",
                    },
                    content: {
                        type: graphql.GraphQLString,
                        description: "the content of the board",
                    },
                },
                resolve: async (source, args, context) => {
                    const id = await context.db.insertObject(OBJECT_TYPES.BOARD, context.userId, args.attributes, args.content);
                    return { id };
                },
            },
            updateBoard: {
                type: documentType,
                description: "update a board's content",
                args: {
                    id: {
                        type: graphql.GraphQLString,
                        description: "the ID of the board to update",
                    },
                    attributes: {
                        type: graphql.GraphQLString,
                        description: "the new attributes for the board",
                    },
                    content: {
                        type: graphql.GraphQLString,
                        description: "the new content for the board",
                    },
                },
                resolve: async (source, args, context) => {
                    await context.db.updateObject(OBJECT_TYPES.BOARD, args.id, args.attributes, args.content);
                    return { id: args.id };
                },
            },
            deleteBoard: {
                type: documentType,
                description: "delete a board by ID",
                args: {
                    id: {
                        type: graphql.GraphQLString,
                        description: "the ID of the board to delete",
                    },
                },
                resolve: async (source, args, context) => {
                    await context.db.deleteObject(OBJECT_TYPES.BOARD, args.id);
                    return { id: args.id };
                },
            },
        },
    }),
}) as graphql.GraphQLSchema;
