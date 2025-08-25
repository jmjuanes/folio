---
{
    "title": "Installation",
    "description": "Learn how to install Folio Studio on your own computer",
    "permalink": "/docs/installation.html"
}
---
{{>>layout.mustache}}

**Folio Studio** is the full-featured version of Folio, designed for local use with support for multiple boards and advanced configuration. It runs as a Docker container and can be installed on Linux, macOS, or Windows.

> Folio Studio is **not designed to be exposed to public networks or the open internet**. It is intended for **local or internal use only**, such as on a personal machine or within a private LAN. If you choose to expose it externally, **you do so entirely at your own risk and responsibility**.

## Requirements

Before installing Folio Studio, make sure you have the following minimum requirements on your local computer:

- [Docker](https://www.docker.com/) installed and running.
- At least **512 MB of RAM**.
- Internet access to pull the container from GitHub Container Registry.

## Installation 

First, you have to pull Folio Studio using `docker pull`:

{{>>code.mustache code="bash" label="terminal"}}
$ docker pull ghcr.io/jmjuanes/folio-studio:{{site.version}}
{{/code.mustache}}

Then, you can launch a new docker container with `docker run`: 

{{>>code.mustache code="bash" label="terminal"}}
$ docker run -it --name folio-studio -p 8080:8080 jmjuanes/folio-studio
{{/code.mustache}}

Open a new browser window and type `localhost:8080` to start using **Folio**.

{{/layout.mustache}}
