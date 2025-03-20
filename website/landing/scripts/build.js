import * as path from "node:path";
import press from "mikel-press";
import * as yaml from "js-yaml";
import websiteConfig from "../website.config.json" with {type: "json"};

press.build({
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
                    return [
                        `<svg class="${opt.className || "size-4"}">`,
                        `<use xlink:href="/sprite.svg#${opt.icon}"></use>`,
                        `</svg>`,
                    ].join("");
                },
            },
        }),
        press.CopyAssetsPlugin({
            patterns: [
                {
                    from: path.resolve("node_modules/lowcss/low.css"),
                    to: "low.css",
                },
                {
                    from: path.resolve("../../node_modules/@josemi-icons/svg/sprite.svg"),
                    to: "sprite.svg",
                },
                {
                    from: "public/og-image.png",
                    to: "og-image.png",
                },
                {
                    from: "public/icon.png",
                    to: "icon.png",
                },
            ],
        }),
    ],
});
