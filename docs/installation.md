---
title: "Installation"
description: "Learn how to install Folio Studio on your own computer"
permalink: "/docs/studio/installation.html"
prevPage: "docs/index.md"
nextPage: "docs/configuration.md"
---

**Folio Studio** runs as a Docker container and can be installed on Linux, macOS, or Windows.

{{>>folio::alert className="border-yellow-200 bg-yellow-100 text-yellow-800"}}
⚠️ Folio Studio is **not designed to be exposed to public networks or the open internet**. It is intended for **local or internal use only**, such as on a personal machine or within a private LAN. If you choose to expose it externally, **you do so entirely at your own risk and responsibility**.
{{/folio::alert}}

## Requirements

Before installing Folio Studio, make sure you have the following minimum requirements on your local computer:

- [Docker](https://www.docker.com/) installed and running.
- At least **512 MB of RAM**.
- Internet access to pull the container from GitHub Container Registry.

## Installation 

First, you have to pull Folio Studio using `docker pull`:

```bash icon="terminal" label="Terminal"
$ docker pull ghcr.io/jmjuanes/folio-studio:{{@pkg.version}}
```

Then, you can launch a new docker container with `docker run`: 

```bash icon="terminal" label="Terminal"
$ docker run -it --name folio-studio -p 8080:8080 jmjuanes/folio-studio
```

Open a new browser window and type `localhost:8080` to start using **Folio**.
