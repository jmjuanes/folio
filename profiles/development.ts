import type { Profile } from "../lib/types/profile.ts";

// the development server answers /api with the rules of scripts/__stubs/storage.js
export default {
    name: "Folio Development",
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
