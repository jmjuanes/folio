---
{
    "title": "Installation",
    "description": "Learn how to install Folio Studio on your own computer",
    "permalink": "/docs/installation.html",
    "prevPage": "/docs/index.html",
    "nextPage": "/docs/configuration.html"
}
---
{{>>layout.mustache}}

**Folio Studio** runs as a Docker container and can be installed on Linux, macOS, or Windows.

{{>>alert.mustache}}
Folio Studio is **not designed to be exposed to public networks or the open internet**. It is intended for **local or internal use only**, such as on a personal machine or within a private LAN. If you choose to expose it externally, **you do so entirely at your own risk and responsibility**.
{{/alert.mustache}}

## Requirements

Before installing Folio Studio, make sure you have the following minimum requirements on your local computer:

- [Docker](https://www.docker.com/) installed and running.
- At least **512 MB of RAM**.
- Internet access to pull the container from GitHub Container Registry.

## Installation 

First, you have to pull Folio Studio using `docker pull`:

{{>>code.mustache language="bash" label="terminal" icon="code"}}
$ docker pull ghcr.io/jmjuanes/folio-studio:{{site.version}}
{{/code.mustache}}

Then, you can launch a new docker container with `docker run`: 

{{>>code.mustache language="bash" label="terminal" icon="code"}}
$ docker run -it --name folio-studio -p 8080:8080 jmjuanes/folio-studio
{{/code.mustache}}

Open a new browser window and type `localhost:8080` to start using **Folio**.

{{/layout.mustache}}
