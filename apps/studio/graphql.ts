// get information about the authenticated user
export const GET_USER_QUERY = `
    query GetUser {
        user {
            name
        }
    }
`;

// note that this query does not include the 'content' field of the boards
export const GET_BOARDS_QUERY = `
    query GetBoards {
        boards {
            _id
            _created_at
            _updated_at
            name
        }
    }
`;

// get a single board data by id
export const GET_BOARD_QUERY = `
    query GetBoard($id: String!) {
        board(id: $id) {
            _id
            _created_at
            _updated_at
            name
            content
        }
    }
`;

// mutation to create a new board
export const CREATE_BOARD_MUTATION = `
    mutation CreateBoard($name: String, $content: Any) {
        createBoard(name: $name, content: $content) {
            _id
        }
    }
`;

// mutation to update a board by id
export const UPDATE_BOARD_MUTATION = `
    mutation UpdateBoard($id: String!, $name: String, $content: Any) {
        updateBoard(id: $id, name: $name, content: $content) {
            _id
        }
    }
`;

// mutation to delete a board by id
export const DELETE_BOARD_MUTATION = `
    mutation DeleteBoard($id: String!) {
        deleteBoard(id: $id) {
            _id
        }
    }
`;
