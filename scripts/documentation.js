import { readdirSync, readFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import hljs from "highlight.js";
import { build, createInput } from "mikel-cli";
import mikel from "mikel";
import press from "mikel-press";
import frontmatterPlugin from "mikel-frontmatter";
import markdownPlugin from "mikel-markdown";

import site from "../resources/sites/documentation.json" with { type: "json" };

// name mappings
const fileNameMapper = {};

const highlightCode = (code = "", language) => {
    return hljs.highlight(code.trim(), { language: language || "html" }).value;
};

const getPartials = (folder = "") => {
    return readdirSync(folder, "utf8").reduce((partials, file) => {
        if (extname(file) === ".mustache") {
            const name = "folio::" + basename(file, ".mustache");
            partials[name] = readFileSync(join(folder, file), "utf8");
        }
        return partials;
    }, {});
};

// read documentation pages in docs folder and save them as pages
site.pages = readdirSync(join(process.cwd(), "docs")).reduce((pages, file) => {
    if (extname(file) === ".md") {
        const content = readFileSync(join(process.cwd(), "docs", file), "utf8");
        const { body, attributes } = press.utils.frontmatter(content, frontmatterPlugin.yamlParser);
        fileNameMapper[file] = attributes.permalink;
        pages[file] = {
            source: file,
            body: body,
            attributes: attributes,
        };
    }
    return pages;
}, {});

build({
    context: process.cwd(),
    input: Object.keys(site.pages).map(page => {
        const pageConfig = JSON.stringify(site.pages[page].attributes, null, "    ");
        const pageContent = site.pages[page].body;
        const input = [
            `{{#frontmatter as="page" format="json"}}${pageConfig}{{/frontmatter}}`,
            `{{>>folio::documentation}}${pageContent}{{/folio::documentation}}`,
        ];
        return createInput(page, input.join("\n"));
    }),
    output: {
        dir: ".cache/documentation",
        nameMapper: fileNameMapper,
    },
    partials: {
        ...getPartials(join(process.cwd(), "resources/partials")),
        ...getPartials(join(process.cwd(), "resources/templates")),
    },
    helpers: {
        isArray: params => !!params.args[0] && Array.isArray(params.args[0]) ? params.fn(params.data) : "",
        isString: params => typeof params.args[0] === "string" ? params.fn(params.data) : "",
        withPage: params => {
            const page = Object.values(params?.state?.site?.pages).find(page => {
                return page.source === params.args[0];
            });
            return page ? params.fn(page) : "";
        },
    },
    functions: {
        highlight: params => {
            return highlightCode(params?.options?.code, params?.options?.language);
        },
    },
    plugins: [
        mikel.SetStatePlugin("site", site),
        frontmatterPlugin(),
        markdownPlugin({
            classNames: {
                // link: "font-medium underline",
                // code: "bg-gray-100 rounded-md py-1 px-2 text-sm font-mono font-bold",
                // pre: "w-full overflow-x-auto bg-gray-950 text-gray-100 text-sm font-mono leading-relaxed my-6 p-4 rounded-xl",
                // heading: "font-bold mb-4 first:mt-0 mt-8 text-gray-950",
                // heading3: "text-2xl",
                // heading4: "text-xl",
                // list: "list-inside mb-6 pl-4",
                // listItem: "mb-3 pl-1",
                // paragraph: "block leading-relaxed mb-6"
                "link": "font-medium underline",
                "code": "rounded-md py-1 px-2 text-xs font-mono font-bold bg-gray-200",
                "pre": "w-full overflow-x-auto bg-gray-200 text-xs font-mono leading-relaxed p-6 mb-6 rounded-md",
                "heading": "font-bold mb-4 first:mt-0 mt-8",
                "heading1": "text-4xl font-extrabold",
                "heading2": "text-2xl",
                "heading3": "text-xl",
                "heading4": "text-lg",
                "table": "w-full mb-6",
                "tableColumn": "p-3 border-b-1 border-gray-200",
                "tableHead": "font-bold",
                "list": "list-inside mb-6 pl-4",
                "listItem": "mb-3 pl-1",
                "paragraph": "block leading-relaxed mb-6 opacity-80"
            },
            highlight: (code, language) => {
                return highlightCode(code, language);
            },
        }),
    ],
});
