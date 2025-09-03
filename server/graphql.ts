import * as graphql from "graphql";
import { v4 as uuidv4 } from "uuid";

const DocumentType = new graphql.GraphQLObjectType({
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
        thumbnail: {
            type: graphql.GraphQLString,
            description: "thumbnail image of the document",
        },
        data: {
            type: graphql.GraphQLString,
            description: "data assigned to the document",
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
                args: {
                    id: {
                        type: graphql.GraphQLString,
                    },
                },
                resolve: async (source, args, context) => {
                    return await context.store.getDocument(context.username, args.id);
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
                    thumbnail: {
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
                    thumbnail: {
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
