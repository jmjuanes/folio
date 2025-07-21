export const GET_USER_QUERY = `
    query GetUser {
        getUser {
            id,
        }
    }
`;

export const GET_BOARDS_QUERY = `
    query GetBoards {
        getBoards {
            id,
            created_at,
            updated_at,
        }
    }
`;

export const CREATE_BOARD_QUERY = `
    mutation CreateBoard($content: String) {
        createBoard(content: $content) {
            id,
        }
    }
`;

export const GET_BOARD_QUERY = `
    query GetBoard($id: String) {
        getBoard(id: $id) {
            id,
            created_at,
            updated_at,
            content,
        }
    }
`;

export const UPDATE_BOARD_QUERY = `
    mutation UpdateBoard($id: String, $content: String) {
        updateBoard(id: $id, content: $content) {
            id,
        }
    }
`;

export const DELETE_BOARD_QUERY = `
    mutation DeleteBoard($id: String) {
        deleteBoard(id: $id) {
            id,
        }
    }
`;
