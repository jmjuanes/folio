import { readdirSync, readFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { parseArgs } from "node:util";
import hljs from "highlight.js";
import { build, createInput } from "mikel-cli";
import mikel from "mikel";
import press from "mikel-press";
import frontmatterPlugin from "mikel-frontmatter";
import markdownPlugin from "mikel-markdown";

import pkg from "../package.json" with { type: "json" };

const BLOCK_REGEX = /^```(\w+)((?:\s+[\w-]+=(?:"[^"]*"|'[^']*'|[^\s`]+))*)\n([\s\S]*?)^```$/gm;

// utility method to convert code blocks into calls to folio::code partial
const replaceCodeBlocks = (markdownCode) => {
    return markdownCode.replace(BLOCK_REGEX, (_, lang, attrs, content) => {
        const attrString = attrs.trim() ? ` ${attrs.trim()}` : "";
        const trimmedContent = content.replace(/\n$/, "");
        return `{{>>folio::code language="${lang}"${attrString}}}\n${trimmedContent}\n{{/folio::code}}`;
    });
};

// 1. get cli arguments
const { values } = parseArgs({
    options: {
        config: {
            type: "string",
            short: "c",
        },
        output: {
            type: "string",
            short: "o",
        },
    },
    allowPositionals: false,
});

// 2. load site configuration from --config argument
// import site from "../resources/sites/landing.json" with { type: "json" };
const root = process.cwd();
const nameMapper = {}; // to save file name mappings
const site = JSON.parse(readFileSync(join(root, values.config), "utf8"));

// 3. prepare all pages list
const pages = (() => {
    // 1. read as markdown/html files with a frontmatter
    if (typeof site.pages === "object" && Array.isArray(site.pages)) {
        return site.pages.map(file => {
            const content = readFileSync(join(root, file), "utf8");
            const { body, attributes } = press.utils.frontmatter(content, frontmatterPlugin.yamlParser);
            return {
                source: file,
                body: replaceCodeBlocks(body),
                attributes: attributes,
            };
        });
    }
    // 2. read from inline data
    else if (typeof site.pages === "object") {
        return Object.keys(site.pages).map(page => {
            return {
                source: page,
                body: "",
                attributes: site.pages[page],
            };
        });
    }
    // 3. empty pages??
    return [];
})();

const getPartials = (folder = "") => {
    return readdirSync(folder, "utf8").reduce((partials, file) => {
        if (extname(file) === ".mustache") {
            const name = "folio::" + basename(file, ".mustache");
            partials[name] = readFileSync(join(folder, file), "utf8");
        }
        return partials;
    }, {});
};

const getChangelog = (changelogPath) => {
    const changelogContent = readFileSync(changelogPath, "utf8");
    const blocks = changelogContent.split("\n").filter(Boolean).slice(1).reduce((blocks, line) => {
        if (line.startsWith("## ")) {
            blocks.push([]);
        }
        if (line.trim().length > 0) {
            blocks[blocks.length - 1].push(line);
        }
        return blocks;
    }, []);
    // parse blocks
    return blocks.map(lines => {
        const [versionAndDate, title] = lines[0].replace("## ", "").split(" - ");
        return {
            url: title.trim().toLowerCase().replaceAll(" ", "-"),
            title: title.trim(),
            version: versionAndDate.split("(")[0].trim(),
            date: versionAndDate.split("(")[1].replace(")", "").trim(),
            description: lines[1].trim(),
            content: lines.slice(2).join("\n\n"),
        };
    });
};

const highlightCode = (code = "", language) => {
    return hljs.highlight(code.trim(), { language: language || "html" }).value;
};

build({
    context: root,
    input: pages.map(page => {
        const pageConfig = JSON.stringify(page.attributes, null, "    ");
        const pageContent = [
            `{{#frontmatter as="page" format="json"}}${pageConfig}{{/frontmatter}}`,
            `{{>>folio::${site.template}}}${page.body}{{/folio::${site.template}}}`,
        ];
        return createInput(page.source, pageContent.join("\n"));
    }),
    output: {
        dir: values.output,
        nameMapper: Object.fromEntries(pages.map(page => {
            return [
                page.source, // .replaceAll(".", "\\."),
                page.attributes?.permalink || page.source,
            ];
        })),
    },
    partials: {
        ...getPartials(join(root, "resources/partials")),
        ...getPartials(join(root, "resources/templates")),
    },
    helpers: {
        withPage: params => {
            const page = Object.values(params?.state?.pages).find(page => {
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
        mikel.SetStatePlugin("pkg", {
            version: pkg.version,
        }),
        mikel.SetStatePlugin("site", site),
        mikel.SetStatePlugin("pages", pages),
        mikel.SetStatePlugin("changelog", getChangelog(join(root, "CHANGELOG.md"))),
        frontmatterPlugin(),
        markdownPlugin({
            classNames: site.markdown?.classNames || {},
            highlight: (code, language) => {
                return highlightCode(code, language);
            },
        }),
    ],
});
