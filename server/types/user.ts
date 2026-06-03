// identity model of the authenticated user
// based on https://jupyter-server.readthedocs.io/en/latest/operators/security.html#identity-model
export type User = {
    // this is the identifier of the user
    // this is the only required field in the user model
    username: string;

    // name of the user displayed in the user interface
    display_name?: string;

    // link to the avatar of the user
    avatar_url?: string;

    // the following information is used to generate the avatar
    // of the user, in case that the avatar_url is not defined
    initials?: string;
    color?: string;
};

// general user preferences object
export type UserPreferences = Record<string, any>;
