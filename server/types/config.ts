export type LocalStorageConfig = {
    // path to the folder where the database will be stored
    storePath?: string;

    // name of the database file. Defaults to "folio.db"
    storeName?: string;
};

// configuration for folio server
export type Config = {
    // internal secret used to generate access tokens
    // this should be a long, random string
    secret: string;

    // port where the server will run
    port?: number;

    // path to the data directory, used to save for example the database
    // example: "/opt/folio/data"
    dataPath: string;

    // path to the www directory, used to serve static content
    // example: "/opt/folio/www"
    wwwPath: string;

    // custom store configuration
    // each store plugin can define its own configuration
    store?: LocalStorageConfig | Record<string, any>;

    // secret key used to generate JWT tokens
    tokenSecret?: string;

    // token expiration time
    // example: "1h", "2d", "1y"
    tokenExpiration?: string;
};
