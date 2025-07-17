// configuration for folio server
export type Config = {
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
    store?: any;

    // secret key used to generate JWT tokens
    tokenSecret?: string;

    // token expiration time
    // example: "1h", "2d", "1y"
    tokenExpiration?: string;
};
