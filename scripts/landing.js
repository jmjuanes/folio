import { readdirSync, readFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { build, createInput } from "mikel-cli";
import mikel from "mikel";
import frontmatterPlugin from "mikel-frontmatter";
import markdownPlugin from "mikel-markdown";

import site from "../resources/sites/landing.json" with { type: "json" };

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

build({
    context: process.cwd(),
    input: Object.keys(site.pages).map(page => {
        const pageConfig = JSON.stringify(site.pages[page], null, "    ");
        return createInput(page, `{{#frontmatter as="page" format="json"}}${pageConfig}{{/frontmatter}}{{>folio::landing}}`);
    }),
    output: {
        dir: ".cache/landing",
    },
    partials: {
        ...getPartials(join(process.cwd(), "resources/partials")),
        ...getPartials(join(process.cwd(), "resources/templates")),
    },
    plugins: [
        mikel.SetStatePlugin("site", site),
        mikel.SetStatePlugin("changelog", getChangelog(join(process.cwd(), "CHANGELOG.md"))),
        frontmatterPlugin(),
        markdownPlugin({
            classNames: {
                link: "font-medium underline",
                code: "bg-gray-100 rounded-md py-1 px-2 text-sm font-mono font-bold",
                pre: "w-full overflow-x-auto bg-gray-950 text-gray-100 text-sm font-mono leading-relaxed my-6 p-4 rounded-xl",
                heading: "font-bold mb-4 first:mt-0 mt-8 text-gray-950",
                heading3: "text-2xl",
                heading4: "text-xl",
                list: "list-inside mb-6 pl-4",
                listItem: "mb-3 pl-1",
                paragraph: "block leading-relaxed mb-6"
            }
        }),
    ],
});
