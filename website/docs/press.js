import path from "node:path";
import mikel from "mikel";
import press from "mikel-press";
import markdown from "mikel-markdown";
import hljs from "highlight.js";
import websiteConfig from "./website.config.json" with {type: "json"};

press({
    destination: "www",
    template: mikel.create({
        functions: {
            highlight: params => {
                return hljs.highlight((params?.opt?.code || "").trim(), {language: params.opt.language || "html"}).value;
            },
        },
    }),
    ...websiteConfig,
    plugins: [
        press.SourcePlugin({
            folder: "content",
        }),
        press.PartialsPlugin({
            folder: "partials",
        }),
        press.FrontmatterPlugin(),
        press.UsePlugin(markdown({
            classNames: {
                link: "font-medium underline",
                code: "bg-gray-100 rounded-md py-1 px-2 text-xs font-mono font-medium",
                table: "w-full mb-6",
                tableColumn: "p-3 border-b-1 border-gray-200",
                tableHead: "font-bold",
            },
        })),
        press.ContentPagePlugin(),
        press.CopyAssetsPlugin({
            basePath: "docs/vendor",
            patterns: [
                {
                    from: path.resolve("node_modules/lowcss/low.css"),
                    to: "low.css",
                },
                {
                    from: path.resolve("node_modules/highlight.js/styles/atom-one-light.css"),
                    to: "highlight.css",
                },
            ],
        }),
    ],
});
