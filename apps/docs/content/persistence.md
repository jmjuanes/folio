---
{
    "title": "Persistence",
    "description": "Persist data across sessions.",
    "permalink": "/studio/persistence.html",
    "layout": "docs.mustache",
    "prevPage": "/studio/configuration.html",
    "nextPage": "/studio/authentication.html"
}
---

By default, Folio Studio uses `storage: 'local'`, which enables persistent storage through a lightweight SQLite database. This database is saved at the path defined by the `storage_file` parameter in the configuration file. If no custom path is provided, the default location is `/opt/folio/data/folio.db` inside the Docker container.

This setup ensures that all boards and user data are retained across sessions. However, when running Folio Studio in a containerized environment, it's important to understand that the container filesystem is ephemeral. If the container is deleted or rebuilt, any data stored inside it will be lost unless a volume is mounted.

## Persist data using a volume

To preserve data between container restarts or image updates, you should mount a persistent volume to `/opt/folio/data`. This allows the SQLite database to live outside the container and remain intact even if the container is removed. For example, you can run Folio Studio with a volume like this:

```bash
$ docker run -d \
  --name folio-studio \
  -p 3000:3000 \
  -v $(pwd)/folio-data:/opt/folio/data \
  ghcr.io/jmjuanes/folio-studio
```

In this example, the local folder `folio-data` will store the SQLite database, ensuring full persistence across deployments. This approach is highly recommended for production or long-term usage.

## Memory storage

If you prefer not to persist data, you can also switch the storage mode to `memory`, which stores everything in RAM and discards it when the application stops. This is useful for testing or temporary sessions, but not suitable for real use cases where data retention is required.

```yaml
storage: 'memory'
``` 
