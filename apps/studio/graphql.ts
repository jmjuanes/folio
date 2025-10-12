// @description get a list of documents that matches the specified collection
// @params collection - the id of the collection (board, drawing, library, etc)
export const QUERY_DOCUMENTS = `
    query QueryDocuments($collection: String) {
        queryDocuments(collection: $collection) {
            id
            collection
            created_at
            updated_at
            name
            attributes
        }
    }
`;

// @description get a single document by id
// @params id - the id of the document (REQUIRED)
export const GET_DOCUMENT = `
    query GetDocument($id: String!) {
        getDocument(id: $id) {
            id
            collection
            created_at
            updated_at
            name
            attributes
            data
        }
    }
`;

// @description mutation to create a new document
// @params collection - the id of the collection (board, drawing, library, etc) (REQUIRED)
// @params name - the name of the document
// @params attributes - additional attributes of the document
// @params data - the data of the document (JSON stringified)
export const ADD_DOCUMENT = `
    mutation AddDocument($collection: String!, $name: String, $attributes: String, $data: String) {
        addDocument(collection: $collection, name: $name, attributes: $attributes, data: $data) {
            id
        }
    }
`;

// @description mutation to update a document by id
// @params id - the id of the document (REQUIRED)
// @params name - the name of the document
// @params attributes - additional attributes of the document
// @params data - the data of the document (JSON stringified)
export const UPDATE_DOCUMENT = `
    mutation UpdateDocument($id: String!, $name: String, $attributes: String, $data: String) {
        updateDocument(id: $id, name: $name, attributes: $attributes, data: $data) {
            id
        }
    }
`;

// @description mutation to delete a document
// @params id - the id of the document (REQUIRED)
export const DELETE_DOCUMENT = `
    mutation DeleteDocument($id: String!) {
        deleteDocument(id: $id) {
            id
        }
    }
`;

// @description get the current authenticated user
export const GET_USER = `
    query GetUser {
        getUser {
            username
            display_name
        }
    }
`;
