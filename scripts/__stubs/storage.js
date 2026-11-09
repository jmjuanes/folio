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
                        id: "board1",
                        metadata: {
                            "name": "Board 1",
                            "created_at": "2026-07-25 00:00:00",
                            "updated_at": "2026-09-10 00:00:00",
                        },
                    },
                    {
                        id: "board2",
                        metadata: {
                            "name": "Board 2",
                            "created_at": "2026-07-26 00:00:00",
                            "updated_at": "2026-09-01 00:00:00",
                        },
                    },
                ],
            },
        },
    },
    {
        method: "POST",
        path: "/_storage/",
        headers: {
            "Content-Type": "application/json"
        },
        response: {
            body: {
                data: {
                    id: "board1",
                },
            },
        },
    },
    {
        method: "GET",
        path: "/_storage/board1",
        headers: {
            "Content-Type": "application/json"
        },
        response: {
            body: {
                data: {
                    id: "board1",
                    value: {
                        title: "Board 1",
                    },
                    metadata: {
                        "name": "Board 1",
                        "created_at": "2026-07-26 00:00:00",
                        "updated_at": "2026-09-10 00:00:00",
                    },
                },
            },
        },
    },
    {
        method: "PATCH",
        path: "/_storage/board1",
        headers: {
            "Content-Type": "application/json"
        },
        response: {
            body: {},
        },
    },
    {
        method: "DELETE",
        path: "/_storage/board1",
        headers: {
            "Content-Type": "application/json"
        },
        response: {
            body: {},
        },
    },
    {
        method: "GET",
        path: "/_storage/board2",
        headers: {
            "Content-Type": "application/json"
        },
        response: {
            body: {
                data: {
                    id: "board2",
                    value: {
                        title: "Board 2",
                    },
                    metadata: {
                        "name": "Board 2",
                        "created_at": "2026-07-26 00:00:00",
                        "updated_at": "2026-09-01 00:00:00",
                    },
                },
            },
        },
    },
    {
        method: "PATCH",
        path: "/_storage/board2",
        headers: {
            "Content-Type": "application/json"
        },
        response: {
            body: {},
        },
    },
    {
        method: "DELETE",
        path: "/_storage/board2",
        headers: {
            "Content-Type": "application/json"
        },
        response: {
            body: {},
        },
    },
    {
        method: "GET",
        path: "/_storage/preferences",
        headers: {
            "Content-Type": "application/json"
        },
        response: {
            body: {
                data: {
                    id: "preferences",
                    value: {},
                    metadata: {},
                },
            },
        },
    },
    {
        method: "PATCH",
        path: "/_storage/preferences",
        headers: {
            "Content-Type": "application/json"
        },
        response: {
            body: {},
        },
    },
];
