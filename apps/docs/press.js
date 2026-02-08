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
            return `<svg class="${className}" width="1em" height="1em"><use xlink:href="/icons.svg#${params.opt.icon}"></use></svg>`;
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
            folder: "content",
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
            classNames: websiteConfig.markdown,
        })),
        // press.TransformPlugin(node => {
        //     if (node.label === press.LABEL_PAGE && node.content && path.extname(node.source) === ".md") {
        //         node.content = `{{#markdown}}\n\n${node.content}\n\n{{/markdown}}\n`;
        //     }
        // }),
        press.ContentPagePlugin(),
        press.CopyAssetsPlugin({
            patterns: [
                {
                    from: path.resolve("../../resources/brand.css"),
                },
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
        // press.CopyAssetsPlugin({
        //     basePath: ".",
        //     patterns: press.utils.walkdir(path.resolve("./public")).map(file => ({
        //         from: path.resolve(path.join("./public", file)),
        //         to: file,
        //     })),
        // }),
    ],
});
