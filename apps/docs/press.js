import path from "node:path";
import mikel from "mikel";
import press from "mikel-press";
import markdown from "mikel-markdown";
import hljs from "highlight.js";
import websiteConfig from "./docs.json" with { type: "json" };
import pkg from "../../package.json" with { type: "json" };

const highlightCode = (code = "", language) => {
    return hljs.highlight(code.trim(), { language: language || "html" }).value;
};

const template = mikel.create({
    helpers: {
        isArray: params => !!params.args[0] && Array.isArray(params.args[0]) ? params.fn(params.data) : "",
        isString: params => typeof params.args[0] === "string" ? params.fn(params.data) : "",
        withPage: params => {
            const page = params?.variables?.root?.site?.pages?.find(page => (page.source || "").endsWith(params.args[0]));
            return page ? params.fn(page) : "";
        },
    },
    functions: {
        icon: params => {
            const className = params.opt.className || "";
            return `<svg class="${className}" width="1em" height="1em"><use xlink:href="/vendor/icons.svg#${params.opt.icon}"></use></svg>`;
        },
        highlight: params => {
            return highlightCode(params?.opt?.code, params?.opt?.language);
        },
    },
});

press({
    destination: "www",
    extensions: [".mustache"],
    template: template,
    ...websiteConfig,
    version: pkg.version,
    repository: pkg.repository,
    plugins: [
        press.SourcePlugin({
            folder: "pages",
            extensions: [".mustache"],
        }),
        press.SourcePlugin({
            folder: "../../docs",
            extensions: [".md"],
        }),
        press.PartialsPlugin({
            folder: "partials",
            extensions: [".mustache"],
        }),
        press.LayoutsPlugin({
            folder: "layouts",
            extensions: [".mustache"],
        }),
        press.FrontmatterPlugin(),
        press.UsePlugin(markdown({
            highlight: (code, language) => {
                return highlightCode(code, language);
            },
            classNames: {
                link: "font-medium underline",
                code: "rounded-md py-1 px-2 text-xs font-mono font-bold folio:bg-dark-medium",
                pre: "w-full overflow-x-auto folio:bg-dark-medium text-white text-xs font-mono leading-relaxed p-6 mb-6 rounded-md",
                heading: "font-bold mb-4 first:mt-0 mt-8",
                heading1: "text-4xl font-extrabold",
                heading2: "text-2xl",
                heading3: "text-xl",
                heading4: "text-lg",
                table: "w-full mb-6",
                tableColumn: "p-3 border-b-1 folio:border-dark-high",
                tableHead: "font-bold",
                list: "list-inside mb-6 pl-4",
                listItem: "mb-3 pl-1",
                paragraph: "block leading-relaxed mb-6 opacity-80",
            },
        })),
        // press.TransformPlugin(node => {
        //     if (node.label === press.LABEL_PAGE && node.content && path.extname(node.source) === ".md") {
        //         node.content = `{{#markdown}}\n\n${node.content}\n\n{{/markdown}}\n`;
        //     }
        // }),
        press.ContentPagePlugin(),
        press.CopyAssetsPlugin({
            basePath: "vendor",
            patterns: [
                {
                    from: path.resolve("../../node_modules/lowcss/low.css"),
                    to: "low.css",
                },
                {
                    from: path.resolve("../../node_modules/highlight.js/styles/atom-one-dark.css"),
                    to: "highlight.css",
                },
                {
                    from: path.resolve("../../node_modules/@josemi-icons/svg/sprite.svg"),
                    to: "icons.svg",
                },
            ],
        }),
        press.CopyAssetsPlugin({
            basePath: ".",
            patterns: press.utils.walkdir(path.resolve("./public")).map(file => ({
                from: path.resolve(path.join("./public", file)),
                to: file,
            })),
        }),
    ],
});
