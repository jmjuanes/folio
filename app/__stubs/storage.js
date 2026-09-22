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
                ],
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
                    value: {},
                    metadata: {
                        "name": "Board 1",
                        "created_at": "2026-07-25 00:00:00",
                        "updated_at": "2026-09-10 00:00:00",
                    },
                },
            },
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
        method: "POST",
        path: "/_storage/preferences",
        headers: {
            "Content-Type": "application/json"
        },
        response: {
            body: {},
        },
    },
];
