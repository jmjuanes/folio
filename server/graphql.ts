import * as graphql from "graphql";
import { uid } from "uid/secure";
import { Collections } from "./types/storage.ts";

// custom any type
const GraphQlAnyType = new graphql.GraphQLScalarType({
	name: "Any",
	serialize: (value: any) => value
});

// declare the common fields in any object
const commonFields = {
    _id: {
        type: graphql.GraphQLString,
        description: "the unique identifier of the document",
    },
    _created_at: {
        type: graphql.GraphQLString,
        description: "the timestamp when the document was created",
    },
    _updated_at: {
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
        name: {
            type: graphql.GraphQLString,
            description: "the name of the board",
        },
        content: {
            type: GraphQlAnyType,
            description: "the content of the board",
        },
    },
}) as graphql.GraphQLObjectType;

// declare the full schema object
export const schema = new graphql.GraphQLSchema({
    query: new graphql.GraphQLObjectType({
        name: "Query",
        fields: {
            user: {
                type: userType,
                description: "retrieve the information about the logged-in user",
                resolve: async (source, args, context) => {
                    return context.auth.getUser(context.username);
                },
            },
            boards: {
                type: new graphql.GraphQLList(boardType),
                description: "retrieve all boards",
                resolve: async (source, args, context) => {
                    return await context.store.all(Collections.BOARD);
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
                resolve: async (source, args, context) => {
                    return await context.store.get(Collections.BOARD, args.id);
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
                    name: {
                        type: graphql.GraphQLString,
                        description: "the name of the new board",
                    },
                    content: {
                        type: GraphQlAnyType,
                        description: "the content of the board",
                    },
                },
                resolve: async (source, args, context) => {
                    const id = uid(20); // generate a unique ID for the object
                    try {
                        await context.store.add(Collections.BOARD, id, args);
                    }
                    catch (error) {
                        console.error(error);
                        throw new graphql.GraphQLError(error.message);
                    }
                    return { _id: id };
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
                    name: {
                        type: graphql.GraphQLString,
                        description: "the name of the new board",
                    },
                    content: {
                        type: GraphQlAnyType,
                        description: "the new content for the board",
                    },
                },
                resolve: async (source, args, context) => {
                    const { id, ...data } = args;
                    try {
                        await context.store.set(Collections.BOARD, id, data);
                    }
                    catch (error) {
                        // possible errors: board does not exist, user does not have permission to edit this board
                        console.error(error);
                        throw new graphql.GraphQLError(error.message);
                    }
                    return { _id: args.id };
                },
            },
            deleteBoard: {
                type: boardType,
                description: "delete a board by ID",
                args: {
                    id: {
                        type: graphql.GraphQLString,
                        description: "the ID of the board to delete",
                    },
                },
                resolve: async (source, args, context) => {
                    try {
                        await context.store.delete(Collections.BOARD, args.id);
                    }
                    catch (error) {
                        // possible errors: board does not exist, user does not have permission to delete this board
                        console.error(error);
                        throw new graphql.GraphQLError(error.message);
                    }
                    return { _id: args.id };
                },
            },
        },
    }),
}) as graphql.GraphQLSchema;
