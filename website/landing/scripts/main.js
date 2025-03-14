import * as fs from "node:fs";
import * as path from "node:path";
import * as http from "node:http";
import mime from "mime/lite";
import press from "mikel-press";
import * as yaml from "js-yaml";
import websiteConfig from "../website.config.json" with {type: "json"};

// @description assets list
const assets = [
    {
        from: "node_modules/lowcss/low.css",
        to: "low.css",
    },
    {
        from: "node_modules/@josemi-icons/svg/sprite.svg",
        to: "./sprite.svg",
    },
    {
        from: "public/og.png",
        to: "og.png",
    },
];

// @description main function
const main = args => {
    const [command, ...otherArgs] = args;
    const context = press.createContext({
        source: process.cwd(),
        destination: path.join(process.cwd(), "www"),
        ...websiteConfig,
        plugins: [
            press.SourcePlugin({
                source: "pages",
            }),
            press.FrontmatterPlugin({
                parser: yaml.load,
            }),
            press.ContentPlugin({
                layout: "layout.html",
                functions: {
                    icon: ({opt}) => {
                        return `<svg class="${opt.className || "size-4"}"><use xlink:href="/sprite.svg#${opt.icon}"></use></svg>`;
                    },
                },
            }),
            press.CopyAssetsPlugin({
                patterns: assets,
            }),
        ],
    });
    // initial build
    press.buildContext(context);
    // initialize server
    if (command === "serve") {
        const port = 8081; // parseInt(values.port || "3000");
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
        press.watchContext(context);
    }
};

// run the main function
main(process.argv.slice(2));
