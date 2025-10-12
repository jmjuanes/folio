import * as graphql from "graphql";
import { v4 as uuidv4 } from "uuid";

export const DocumentType = new graphql.GraphQLObjectType({
    name: "Document",
    fields: {
        owner: {
            type: graphql.GraphQLString,
            description: "the owner of the document",
        },
        collection: {
            type: graphql.GraphQLString,
            description: "the collection the document belongs to",
        },
        id: {
            type: graphql.GraphQLString,
            description: "the unique identifier of the document",
        },
        created_at: {
            type: graphql.GraphQLString,
            description: "the timestamp when the document was created",
        },
        updated_at: {
            type: graphql.GraphQLString,
            description: "the timestamp when the document was last updated",
        },
        name: {
            type: graphql.GraphQLString,
            description: "name of the document",
        },
        attributes: {
            type: graphql.GraphQLString,
            description: "additional attributes of the document",
        },
        data: {
            type: graphql.GraphQLString,
            description: "data assigned to the document",
        },
    },
}) as graphql.GraphQLObjectType;

export const UserType = new graphql.GraphQLObjectType({
    name: "User",
    fields: {
        username: {
            type: graphql.GraphQLString,
            description: "the unique username of the user",
        },
        name: {
            type: graphql.GraphQLString,
            description: "name of the user or 'username' if not defined",
        },
        display_name: {
            type: graphql.GraphQLString,
            description: "display name of the user or 'name' if not defined",
        },
        avatar_url: {
            type: graphql.GraphQLString,
            description: "link to the avatar image of the user",
        },
        initials: {
            type: graphql.GraphQLString,
            description: "initials of the user, used to generate an avatar if 'avatar_url' is not defined",
        },
        color: {
            type: graphql.GraphQLString,
            description: "color associated to the user, used to generate an avatar if 'avatar_url' is not defined",
        },
    },
}) as graphql.GraphQLObjectType;

// declare the full schema object
export const schema = new graphql.GraphQLSchema({
    query: new graphql.GraphQLObjectType({
        name: "Query",
        fields: {
            queryDocuments: {
                type: new graphql.GraphQLList(DocumentType),
                description: "retrieve all documents of the specified collection",
                args: {
                    collection: {
                        type: graphql.GraphQLString,
                        description: "collection to retrieve documents",
                    },
                },
                resolve: async (source, args, context) => {
                    return await context.store.queryDocuments(context.username, {
                        collection: args.collection || null,
                    });
                },
            },
            getDocument: {
                type: DocumentType,
                description: "retrieve a single document by ID",
                args: {
                    id: {
                        type: graphql.GraphQLString,
                    },
                },
                resolve: async (source, args, context) => {
                    return await context.store.getDocument(context.username, args.id);
                },
            },
            getUser: {
                type: UserType,
                description: "retrieve information about the authenticated user",
                resolve: async (source, args, context) => {
                    return await context.auth.getUser(context.username);
                },
            },
        },
    }),
    mutation: new graphql.GraphQLObjectType({
        name: "Mutation",
        fields: {
            addDocument: {
                type: DocumentType,
                description: "create a new document",
                args: {
                    collection: {
                        type: graphql.GraphQLString,
                    },
                    name: {
                        type: graphql.GraphQLString,
                    },
                    attributes: {
                        type: graphql.GraphQLString,
                    },
                    data: {
                        type: graphql.GraphQLString,
                    },
                },
                resolve: async (source, args, context) => {
                    const newDocumentId = uuidv4(); // generate a unique ID for the object
                    await context.store.addDocument(context.username, newDocumentId, args || {});
                    return {
                        id: newDocumentId,
                    };
                },
            },
            updateDocument: {
                type: DocumentType,
                description: "update a document",
                args: {
                    id: {
                        type: graphql.GraphQLString,
                    },
                    name: {
                        type: graphql.GraphQLString,
                    },
                    attributes: {
                        type: graphql.GraphQLString,
                    },
                    data: {
                        type: graphql.GraphQLString,
                    },
                },
                resolve: async (source, args, context) => {
                    await context.store.updateDocument(context.username, args.id, args || {});
                    return {
                        id: args.id,
                    };
                },
            },
            deleteDocument: {
                type: DocumentType,
                description: "delete a document by ID",
                args: {
                    id: {
                        type: graphql.GraphQLString,
                    },
                },
                resolve: async (source, args, context) => {
                    await context.store.deleteDocument(context.username, args.id);
                    return {
                        id: args.id,
                    };
                },
            },
        },
    }),
}) as graphql.GraphQLSchema;
