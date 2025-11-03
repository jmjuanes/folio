import path from "node:path";
import mikel from "mikel";
import press from "mikel-press";
import markdown from "mikel-markdown";
import hljs from "highlight.js";
import websiteConfig from "./website.config.json" with { type: "json" };
import pkg from "../../package.json" with { type: "json" };

const highlightCode = (code = "", language) => {
    return hljs.highlight(code.trim(), { language: language || "html" }).value;
};

press({
    destination: "www",
    extensions: [ ".md" ],
    template: mikel.create({
        helpers: {
            withPage: params => {
                const p = params?.data?.site?.pages?.find(p => p.path === params.args[0]);
                return p ? params.fn(p) : "";
            },
        },
        functions: {
            icon: params => {
                return `<svg width="1em" height="1em"><use xlink:href="/docs/icons.svg#${params.opt.icon}"></use></svg>`;
            },
            highlight: params => {
                return highlightCode(params?.opt?.code, params?.opt?.language);
            },
        },
    }),
    version: pkg.version,
    ...websiteConfig,
    plugins: [
        press.SourcePlugin({
            folder: "content",
            extensions: [ ".md" ],
        }),
        press.PartialsPlugin({
            folder: "partials",
            extensions: [ ".mustache" ],
        }),
        press.LayoutsPlugin({
            folder: "layouts",
            extensions: [ ".mustache" ],
        }),
        press.FrontmatterPlugin(),
        press.UsePlugin(markdown({
            highlight: (code, language) => {
                return highlightCode(code, language);
            },
            classNames: {
                link: "font-medium underline",
                code: "bg-gray-100 rounded-md py-1 px-2 text-xs font-mono font-bold bg-gray-900",
                pre: "w-full overflow-x-auto bg-gray-900 text-white text-xs font-mono leading-relaxed p-4 mb-6 rounded-md border-1 border-gray-800",
                heading: "font-bold mb-4 first:mt-0 mt-8",
                heading2: "text-2xl",
                heading3: "text-xl",
                heading4: "text-lg",
                table: "w-full mb-6",
                tableColumn: "p-3 border-b-1 border-gray-800",
                tableHead: "font-bold",
                list: "list-inside mb-6 pl-4",
                listItem: "mb-3 pl-1",
                paragraph: "block leading-relaxed mb-6 opacity-80",
            },
        })),
        press.ContentPagePlugin(),
        press.CopyAssetsPlugin({
            // basePath: "docs",
            patterns: [
                {
                    from: path.resolve("../../node_modules/lowcss/low.css"),
                    to: "low.css",
                },
                {
                    from: path.resolve("../../node_modules/highlight.js/styles/atom-one-dark.css"),
                    to: "docs/highlight.css",
                },
                {
                    from: path.resolve("../../node_modules/@josemi-icons/svg/sprite.svg"),
                    to: "icons.svg",
                },
                {
                    from: "../../brand.css",
                    to: "brand.css",
                },
            ],
        }),
    ],
});
