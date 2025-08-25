---
{
    "title": "Configuration",
    "description": "Setting up all necessary configuration to run folio studio.",
    "permalink": "/docs/configuration.html"
}
---
{{>>layout.mustache}}

Folio Studio supports two levels of configuration: environment variables and a YAML configuration file. Environment variables take precedence over the YAML file and are useful for quick overrides, although they only expose a limited subset of the full configuration options.

## Configuration file

The main configuration file is located at `/opt/folio/config.yaml`. It allows for detailed customization across several areas of the application.

This is the default configuration:

```yaml
## port where folio server will listen
port: 8080

## configure the authentication method
authentication: 'access_token'

## configure here your access token, if want a fixed access token
## if not provided, a new one will be generated and printed in logs every time the server is restarted
## you can override this token also using the FOLIO_ACCESS_TOKEN env variable
# access_token: "123456abcd"

## information about the user to display in the website
## only applicable if the authentication method is 'access_token'
user_name: 'john_doe'
user_display_name: 'John Doe'

## configure the storage method to use
storage: 'local'
storage_file: 'data/folio.db'

## configure the generation of JWT tokens for authentication
# jwt_token_secret: "abcd"
# jwt_token_expiration: "1y"

## website configuration
website: true
website_title: "folio."
```

### Configure Port

The `port` field defines the port where Folio Studio will listen for incoming requests. By default, this is set to `8080`, but it can be overridden using the `FOLIO_PORT` environment variable.

### Authentication

Authentication is configured using the `authentication` block. The default method is `access_token`, which can be paired with a fixed token using the `access_token` field.

```yaml
authentication: 'access_token'
```

If no token is provided, Folio Studio will generate one automatically on each restart.

### User Information

User information is defined using `user_name`, `user_display_name`, and optionally `user_avatar_url`. These values personalize the interface and help identify the user within the application.

```yaml
user_name: 'john'
user_display_name: 'John Doe'
user_avatar_url: 'https://gravatar.com/avatar/12345'
```

### Storage

Storage settings are managed through the `storage` section. The default backend is `local`, which stores data in a file defined by `storage_file`.

```yaml
storage: 'local'
storage_file: 'data/folio.db'
```

Alternatively, the `memory` option can be used for ephemeral sessions. For more information, see the Persistence guide.

```yaml
storage: 'memory'
```

### JWT Tokens

JWT token behavior is controlled using `jwt_token_secret` and `jwt_token_expiration`. These fields define the secret key used for signing tokens and the duration for which they remain valid.

```yaml
jwt_token_secret: 'abcde12345'
jwt_token_expiration: '1y'
```

### Website configuration

The `website` section allows you to enable or disable the built-in UI. You can also customize the browser title using `website_title`.

## Environment Variables

Folio Studio supports a small set of environment variables for quick configuration:

| Variable | Description |
|----------|-------------|
| `FOLIO_PORT` | Port where the server will run. |
| `FOLIO_STORAGE_FILE` | Path to the local storage file. |
| `FOLIO_TOKEN_SECRET` | Secret key used to sign JWT tokens. |
| `FOLIO_TOKEN_EXPIRATION` | Expiration time for JWT tokens (e.g. `7d`, `30d`, `1y`). |
| `FOLIO_ACCESS_TOKEN` | Fixed access token (not recommended; for testing only). |

Environment variables always take precedence over values defined in `config.yaml`, making them ideal for temporary overrides or container-based deployments.

{{/layout.mustache}}
