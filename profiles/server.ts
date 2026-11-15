import type { Profile } from "../lib/types/profile.ts";

// profile for the version served by the Folio server (see server/index.ts)
export default {
    name: "Folio",
    config: () => {
        return Promise.resolve({});
    },
    client: {
        type: "http",
        options: {
            host: "/_storage",
        },
    },
} as Profile;
