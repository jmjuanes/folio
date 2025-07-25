// get information about the authenticated user
export const GET_USER_QUERY = `
    query GetUser {
        user {
            name
        }
    }
`;

// note that this query does not include the 'content' field of the boards
export const GET_USER_BOARDS_QUERY = `
    query GetUserBoards {
        boards {
            id
            created_at
            updated_at
            attributes {
                name
            }
        }
    }
`;

// get a single board data by id
export const GET_BOARD_QUERY = `
    query GetBoard($id: String!) {
        board(id: $id) {
            id
            created_at
            updated_at
            attributes {
                name
            }
            content
        }
    }
`;

// mutation to create a new board
export const CREATE_BOARD_MUTATION = `
    mutation CreateBoard($attributes: BoardAttributesInput, $content: String) {
        createBoard(attributes: $attributes, content: $content) {
            id
        }
    }
`;

// mutation to update a board by id
export const UPDATE_BOARD_MUTATION = `
    mutation UpdateBoard($id: ID!, $attributes: BoardAttributesInput, $content: String) {
        updateBoard(id: $id, attributes: $attributes, content: $content) {
            id
        }
    }
`;

// mutation to delete a board by id
export const DELETE_BOARD_MUTATION = `
    mutation DeleteBoard($id: ID!) {
        deleteBoard(id: $id) {
            id
        }
    }
`;
