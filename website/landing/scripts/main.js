import * as path from "node:path";
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
        to: "sprite.svg",
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
        press.serveContext(context, {
            port: 8081,
        });
        press.watchContext(context);
    }
};

// run the main function
main(process.argv.slice(2));
