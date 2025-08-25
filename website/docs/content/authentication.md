---
{
    "title": "Authentication",
    "description": "How authentication works in folio studio.",
    "permalink": "/docs/authentication.html"
}
---
{{>>layout.mustache}}

Folio Studio currently supports a single authentication method: **access token-based authentication**. This mechanism ensures that only authorized users can interact with the application.

By default, when Folio Studio starts, it automatically generates a random access token. This token is printed to the console during startup, meaning only the person who launched the Docker container has access to it. This approach is ideal for local or internal deployments where a single trusted user is expected to operate the instance.

## Customize the access token

For more control, you can define a **fixed access token**. This can be done in two ways:

### Customize the access token in configuration file

You can customize the access token by setting the `access_token` field in the `config.yaml` file:

```yaml
access_token: 'your_fixed_access_token'
```

### Customize the access token using an environment variable

You can also customize the access token by defining an environment variable called `FOLIO_ACCESS_TOKEN` with your desired access token.

If both are provided, the environment variable takes precedence over the YAML configuration.

{{/layout.mustache}}
