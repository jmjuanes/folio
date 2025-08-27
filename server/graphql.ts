import * as graphql from "graphql";
import { uid } from "uid/secure";

// custom any type
const GraphQlAnyType = new graphql.GraphQLScalarType({
	name: "Any",
	serialize: (value: any) => value,
});

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

// generic document type
const DocumentType = new graphql.GraphQLObjectType({
    name: "Document",
    fields: {
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
        attributes: {
            type: GraphQlAnyType,
            description: "additional attributes of the document",
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
            user: {
                type: userType,
                description: "retrieve the information about the logged-in user",
                resolve: async (source, args, context) => {
                    return context.auth.getUser(context.username);
                },
            },
            listDocuments: {
                type: new graphql.GraphQLList(DocumentType),
                description: "retrieve all documents of the specified collection",
                args: {
                    collection: {
                        type: graphql.GraphQLString,
                        description: "collection to retrieve documents",
                    },
                },
                resolve: async (source, args, context) => {
                    return await context.store.list(args.collection);
                },
            },
            getDocument: {
                type: DocumentType,
                args: {
                    collection: {
                        type: graphql.GraphQLString,
                        description: "the collection of the document",
                    },
                    id: {
                        type: graphql.GraphQLString,
                        description: "the ID of the document to retrieve",
                    },
                },
                resolve: async (source, args, context) => {
                    return await context.store.get(args.collection, args.id);
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
                    attributes: {
                        type: GraphQlAnyType,
                        description: "attributes assigned to the document",
                    },
                    data: {
                        type: graphql.GraphQLString,
                        description: "data assigned to the document",
                    },
                },
                resolve: async (source, args, context) => {
                    const id = uid(20); // generate a unique ID for the object
                    try {
                        await context.store.add(args.collection, id, args.attributes, args.data);
                    }
                    catch (error) {
                        console.error(error);
                        throw new graphql.GraphQLError(error.message);
                    }
                    return { id: id };
                },
            },
            updateDocument: {
                type: DocumentType,
                description: "update a document",
                args: {
                    collection: {
                        type: graphql.GraphQLString,
                    },
                    id: {
                        type: graphql.GraphQLString,
                    },
                    attributes: {
                        type: GraphQlAnyType,
                        description: "the attributes of the document to update",
                    },
                    data: {
                        type: graphql.GraphQLString,
                        description: "the data of the document to update",
                    },
                },
                resolve: async (source, args, context) => {
                    try {
                        await context.store.update(args.collection, args.id, args.attributes, args.data);
                    }
                    catch (error) {
                        // possible errors: document does not exist, user does not have permission to edit this document
                        console.error(error);
                        throw new graphql.GraphQLError(error.message);
                    }
                    return { id: args.id };
                },
            },
            deleteDocument: {
                type: DocumentType,
                description: "delete a document by ID",
                args: {
                    collection: {
                        type: graphql.GraphQLString,
                    },
                    id: {
                        type: graphql.GraphQLString,
                    },
                },
                resolve: async (source, args, context) => {
                    try {
                        await context.store.delete(args.collection, args.id);
                    }
                    catch (error) {
                        // possible errors: document does not exist, user does not have permission to delete this document
                        console.error(error);
                        throw new graphql.GraphQLError(error.message);
                    }
                    return { id: args.id };
                },
            },
        },
    }),
}) as graphql.GraphQLSchema;
