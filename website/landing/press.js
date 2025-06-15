import * as path from "node:path";
import mikel from "mikel";
import press from "mikel-press";
import websiteConfig from "./website.config.json" with {type: "json"};

press({
    destination: "www",
    template: mikel.create({
        functions: {
            icon: params => {
                return [
                    `<svg class="${params.opt.className || "size-4"}">`,
                    `<use xlink:href="/sprite.svg#${params.opt.icon}"></use>`,
                    `</svg>`,
                ].join("");
            },
        },
    }),
    ...websiteConfig,
    plugins: [
        press.SourcePlugin({
            folder: "content",
        }),
        press.PartialsPlugin(),
        press.FrontmatterPlugin(),
        press.ContentPagePlugin(),
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
