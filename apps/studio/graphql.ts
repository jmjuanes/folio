// @deprecated
// get information about the authenticated user
export const GET_USER_QUERY = `
    query GetUser {
        user {
            name
        }
    }
`;

// @description get a list of documents that matches the specified collection
// @params collection the id of the collection (board, user)
export const LIST_DOCUMENTS_QUERY = `
    query List($collection: String!) {
        listDocuments(collection: $collection) {
            id
            created_at
            updated_at
            attributes
        }
    }
`;

// @description get a single document by id
export const GET_DOCUMENT_QUERY = `
    query Get($collection: String!, $id: String!) {
        getDocument(collection: $collection, id: $id) {
            id
            created_at
            updated_at
            attributes
            data
        }
    }
`;

// @description mutation to create a new document
export const ADD_DOCUMENT_MUTATION = `
    mutation Add($collection: String!, $id: String!, $attributes: Any, $data: String) {
        addDocument(collection: $collection, id: $id, attributes: $attributes, data: $data) {
            id
        }
    }
`;

// @description mutation to update a document by id
export const UPDATE_DOCUMENT_MUTATION = `
    mutation Update($collection: String!, $id: String!, $attributes: Any, $data: String) {
        updateDocument(collection: $collection, id: $id, attributes: $attributes, data: $data) {
            id
        }
    }
`;

// @description mutation to delete a document
export const DELETE_DOCUMENT_MUTATION = `
    mutation Delete($collection: String!, $id: String!) {
        deleteDocument(collection: $collection, id: $id) {
            id
        }
    }
`;
