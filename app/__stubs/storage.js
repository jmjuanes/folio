export default [
    {
        method: "GET",
        path: "/_storage/status",
        headers: {
            "Content-Type": "application/json"
        },
        response: {
            body: {
                data: {
                    message: "ok",
                }
            }
        }
    },
    {
        method: "GET",
        path: "/_storage/",
        headers: {
            "Content-Type": "application/json"
        },
        response: {
            body: {
                data: [
                    {
                        id: "board:board1",
                        metadata: {
                            "name": "Board 1",
                            "created_at": "2025-07-25 00:00:00",
                            "updated_at": "2025-09-02 00:00:00",
                        },
                    },
                ],
            },
        },
    },
    {
        method: "GET",
        path: "/_storage/board:board1",
        headers: {
            "Content-Type": "application/json"
        },
        response: {
            body: {
                data: {
                    id: "board:board1",
                    value: {},
                    metadata: {
                        "name": "Board 1",
                        "created_at": "2025-07-25 00:00:00",
                        "updated_at": "2025-09-02 00:00:00",
                    },
                },
            },
        },
    },
];
