import * as graphql from "graphql";
import { uid } from "uid/secure";
import { Collections } from "./types/storage.ts";

// declare the common fields in any object
const commonFields = {
    id: {
        type: graphql.GraphQLString,
        description: "the unique identifier of the document",
    },
    parent: {
        type: graphql.GraphQLString,
        description: "the parent/owner of the document",
    },
    created_at: {
        type: graphql.GraphQLString,
        description: "the timestamp when the document was created",
    },
    updated_at: {
        type: graphql.GraphQLString,
        description: "the timestamp when the document was last updated",
    },
};

// declare the primary user type
const userType = new graphql.GraphQLObjectType({
    name: "User",
    fields: {
        name: {
            type: graphql.GraphQLString,
            description: "the unique identifier of the user",
        },
    },
}) as graphql.GraphQLObjectType;

// board document type
const boardType = new graphql.GraphQLObjectType({
    name: "Board",
    fields: {
        ...commonFields,
        attributes: {
            type: new graphql.GraphQLObjectType({
                name: "BoardAttributes",
                fields: {
                    name: {
                        type: graphql.GraphQLString,
                        description: "the name of the board",
                    },
                },
            }),
            description: "additional attributes of the board",
        },
        content: {
            type: graphql.GraphQLString,
            description: "the content of the board",
        },
    },
}) as graphql.GraphQLObjectType;

// board attributes input type
const boardAttributesInputType = new graphql.GraphQLInputObjectType({
    name: "BoardAttributesInput",
    fields: {
        name: {
            type: graphql.GraphQLString,
            description: "the name of the board",
        },
    },
});

// declare the full schema object
export const schema = new graphql.GraphQLSchema({
    query: new graphql.GraphQLObjectType({
        name: "Query",
        fields: {
            user: {
                type: userType,
                description: "retrieve the information about the logged-in user",
                resolve: (source, args, context) => {
                    return context.user || null;
                },
            },
            boards: {
                type: new graphql.GraphQLList(boardType),
                description: "retrieve all boards",
                resolve: async (source, args, context) => {
                    const allBoards = [];
                    await context.store.cursor(Collections.BOARD, (board: any) => {
                        allBoards.push({
                            id: board.id,
                            parent: board.parent,
                            created_at: board.created_at,
                            updated_at: board.updated_at,
                            attributes: board.attributes,
                        });
                    });
                    return allBoards;
                },
            },
            board: {
                type: boardType,
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
                type: boardType,
                description: "create a new board",
                args: {
                    attributes: {
                        type: boardAttributesInputType,
                        description: "attributes for the new board",
                    },
                    content: {
                        type: graphql.GraphQLString,
                        description: "the content of the board",
                    },
                },
                resolve: async (source, args, context) => {
                    const id = uid(20); // generate a unique ID for the object
                    await context.store.add(Collections.BOARD, id, context.user.name, args.attributes || {}, args.content || "{}");
                    return { id };
                },
            },
            updateBoard: {
                type: boardType,
                description: "update a board's content",
                args: {
                    id: {
                        type: graphql.GraphQLString,
                        description: "the ID of the board to update",
                    },
                    attributes: {
                        type: boardAttributesInputType,
                        description: "attributes of the board",
                    },
                    content: {
                        type: graphql.GraphQLString,
                        description: "the new content for the board",
                    },
                },
                resolve: async (source, args, context) => {
                    await context.store.set(Collections.BOARD, args.id, context.user.name, args.attributes, args.content);
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
                    await context.store.delete(Collections.BOARD, args.id, context.user.name);
                    return { id: args.id };
                },
            },
        },
    }),
}) as graphql.GraphQLSchema;
