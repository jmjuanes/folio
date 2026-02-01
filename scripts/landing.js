import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { parseArgs } from "node:util";
import mime from "mime/lite";
import mikel from "mikel";

const COMMANDS = {
    BUILD: "build",
    SERVE: "serve",
};

// @description start a server on the current context
const serveContext = (context, options = {}) => {
    const port = parseInt(options?.port || "3000");
    const server = http.createServer((request, response) => {
        let responseCode = 200;
        let url = path.join(context.destination, path.normalize(request.url));
        // check for directory
        if (url.endsWith("/") || (fs.existsSync(url) && fs.statSync(url).isDirectory())) {
            url = path.join(url, "index.html");
        }
        // check if we have to append the '.html' extension
        if (!fs.existsSync(url) && fs.existsSync(url + ".html")) {
            url = url + ".html";
        }
        // check if the file does not exist
        if (!fs.existsSync(url)) {
            url = path.join(context.destination, "404.html");
            responseCode = 404;
        }
        // send the file
        response.writeHead(responseCode, {
            "Content-Type": mime.getType(path.extname(url)) || "text/plain",
        });
        fs.createReadStream(url).pipe(response);
        console.log(`[${responseCode}] ${request.method} ${request.url}`);
    });
    // launch server
    server.listen(port);
    console.log(`Server running at http://127.0.0.1:${port}/`);
};

const main = (command = "", options = {}) => {
    const configPath = resolveConfigPath(ROOT_PATH, options.config);
    const config = await getConfiguration(configPath);
    const data = JSON.parse(options.data || "{}");

    // 1. start the folio server
    if (command === COMMANDS.START) {
        return startServer(config);
    }

};

// parse command line arguments
const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
        port: {
            type: "string",
            short: "p",
            description: "port to serve landing page",
        },
        output: {
            type: "string",
            short: "o",
            description: "path to the output folder",
        },
    },
    allowPositionals: true,
});

// run folio server
main(positionals[0] || "", values);

