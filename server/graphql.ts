import * as graphql from "graphql";
import { uid } from "uid/secure";
import { Collections } from "./types/storage.ts";

// declare the primary document type
export const documentType = new graphql.GraphQLObjectType({
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
}) as graphql.GraphQLObjectType;

// declare the primary user type
export const userType = new graphql.GraphQLObjectType({
    name: "User",
    fields: {
        id: {
            type: graphql.GraphQLString,
            description: "the unique identifier of the user",
        },
    },
}) as graphql.GraphQLObjectType;

// declare the full schema object
export const schema = new graphql.GraphQLSchema({
    query: new graphql.GraphQLObjectType({
        name: "Query",
        fields: {
            getCurrentUser: {
                type: userType,
                description: "Retrieve the information about the logged-in user",
                resolve: (source, args, context) => {
                    return context.user || null;
                },
            },
            getAllBoards: {
                type: new graphql.GraphQLList(documentType),
                description: "Retrieve all boards",
                resolve: async (source, args, context) => {
                    const allBoards = [];
                    await context.store.cursor(Collections.BOARD, (error: any, board: any) => {
                        allBoards.push({
                            id: board.id,
                            created_at: board.created_at,
                            updated_at: board.updated_at,
                            collection: Collections.BOARD,
                        });
                    });
                    return allBoards;
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
                    return context.store.get(Collections.BOARD, args.id);
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
                    content: {
                        type: graphql.GraphQLString,
                        description: "the content of the board",
                    },
                },
                resolve: async (source, args, context) => {
                    const id = uid(20); // generate a unique ID for the object
                    await context.store.insert(Collections.BOARD, id, args.content || "{}");
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
                    content: {
                        type: graphql.GraphQLString,
                        description: "the new content for the board",
                    },
                },
                resolve: async (source, args, context) => {
                    await context.store.update(Collections.BOARD, args.id, args.content);
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
                    await context.store.delete(Collections.BOARD, args.id);
                    return { id: args.id };
                },
            },
        },
    }),
}) as graphql.GraphQLSchema;
