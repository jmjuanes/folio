![Folio logo](./cover.png)

> A minimalistic and infinite whiteboard. Sketch, Prototype, and Design with total freedom.

[Website](https://folio.josemi.xyz) · [Try it](https://folio.josemi.xyz/app) · [Changelog](https://folio.josemi.xyz/changelog) · [Report a bug](https://github.com/jmjuanes/folio/issues)

![](https://badgen.net/github/license/jmjuanes/folio?labelColor=1d2734&color=21bf81)
![](https://badgen.net/badge/PRs/welcome/codecake?labelColor=1d2734&color=21bf81)

## Note: Folio is still a Work in Progress

We are excited to share our drawing application with you, but please be aware that it is currently in active development. While the app is fully functional and offers a range of features, we are continuously working to enhance and expand its capabilities.

You might encounter occasional bugs or experience features that are still being refined. We appreciate your patience and understanding as we work to deliver the best possible drawing experience.

We encourage you to share your thoughts, suggestions, and any issues you encounter.

## About this Repository

This repository contains the core source code for [Folio](https://folio.josemi.xyz), a modular whiteboard built with React and TypeScript (mostly), designed for structured sketching and local-first workflows. It also includes the full codebase for [Folio Studio](https://folio.josemi.xyz/studio) - a full-stack and self-hosted application combining a Node.js backend (GraphQL + SQLite) with the frontend editor — as well as the [landing page](https://folio.josemi.xyz) and [documentation](https://folio.josemi.xyz/docs) for the project.

## Development

### Prerequisites

Make sure you have the following software installed on your computer: 

- [Node.js](https://nodejs.org) - preferably the latest version, or at least version 20.
- [Yarn](https://classic.yarnpkg.com/lang/en/) - recommended package manager for consistency across environments.
- [Git](https://git-scm.com) - to clone the repository.
- [Docker](https://www.docker.com/get-started) (optional) - to build and run the Folio Studio server image.

### Clone and Install Dependencies

Clone the repository in your local machine:

```bash
$ git clone https://github.com/jmjuanes/folio
```

Navigate into the cloned repository and install all dependencies:

```bash
$ yarn install
```

### Development commands

#### 🧪 Development Commands  

Used during active development to run Folio in watch mode, preview changes, or serve local builds.

| Command           | Description                                      |
|-------------------|--------------------------------------------------|
| `yarn dev:lite`   | Start Folio Lite in development mode.            |
| `yarn dev:studio` | Start Folio Studio in development mode. It uses a mock backend to simulate server interactions. |

#### 🏗️ Build Commands  

Compile Folio's components for production.

| Command              | Description                                      |
|----------------------|--------------------------------------------------|
| `yarn build:lite`    | Build Folio Lite (browser version).              |
| `yarn build:studio`  | Build Folio Studio (frontend).                   |
| `yarn build:server`  | Build the backend (GraphQL + SQLite).            |

#### 🌐 Website Commands  

Build and serve the public-facing parts of Folio: Lite, landing page, and documentation.

| Command              | Description                                       |
|----------------------|---------------------------------------------------|
| `yarn build:website` | Build all website assets (Lite + landing + docs). |
| `yarn build:landing` | Build the landing page.                           |
| `yarn build:docs`    | Build the documentation site.                     |
| `yarn copy:website`  | Copy all website builds to `www/` folder.         |

#### 🧰 Other Commands  

Utility scripts for Docker, asset management, cleanup, and type checking.

| Command              | Description                                      |
|----------------------|--------------------------------------------------|
| `yarn docker:studio` | Build Docker image for Folio Studio.             |
| `yarn clean`         | Remove build output (`www/`).                    |
| `yarn copy-assets`   | Copy static assets.                              |
| `yarn test`          | Run tests with Jest.                             |
| `yarn typecheck`     | Type check Folio Server.                         |
| `yarn typecheck:lite`| Type check Folio Lite.                           |
| `yarn typecheck:studio` | Type check Folio Studio.                      |

## 🤝 Contributing

Pull requests are welcome. If you are planning to add a new feature or make a significant change, please open a [discussion or issue](https://github.com/jmjuanes/folio/issues) first - it helps keep the project aligned and avoids duplicated work.

Before submitting a PR:

- Make sure your code follows the existing style and structure.
- Prefer TypeScript and modular design when possible.
- Keep UI changes minimal unless they improve clarity or usability.
- If your change affects multiple packages (Lite, Studio, Docs), mention it clearly.

Bug fixes, documentation improvements, and small enhancements are always appreciated.

## License

Code is released under the [MIT](./LICENSE) license.
