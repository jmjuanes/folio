export default [
    {
        method: "GET",
        path: "/_auth/status",
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
        method: "POST",
        path: "/_auth/login",
        headers: {
            "Content-Type": "application/json",
        },
        response: request => {
            if (request?.body?.token === "12345") {
                return Promise.resolve({
                    status: 200,
                    body: {
                        data: {
                            token: "folio_abcde12345",
                        },
                    },
                });
            }
            // return a fake error if the token is not 12345
            return Promise.resolve({
                status: 401,
                body: {
                    errors: [
                        { message: "Invalid token" },
                    ],
                },
            });
        },
    },
    {
        method: "GET",
        path: "/_auth/me",
        headers: {
            "Content-Type": "application/json",
        },
        response: {
            body: {
                data: {
                    username: "folio",
                },
            },
        },
    },
];
