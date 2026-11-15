import type { Profile } from "../lib/types/profile.ts";

// the development server answers /api with the rules of scripts/__stubs/storage.js
export default {
    name: "Folio Development",
    config: {
        "routing.mode": "memory",
        "routing.restoreLastEditedDocument": true,
        "ui.welcome.enabled": true,
        "ui.welcome.features": [
            {
                title: "Feature 1",
                description: "Feature 1 description",
                icon: "drawing",
            },
            {
                title: "Feature 2",
                description: "Feature 2 description",
                icon: "drawing",
            },
        ],
    },
    client: {
        type: "memory",
        options: {
            dbName: "folio",
            storeName: "folio-store",
        },
    },
} as Profile;
