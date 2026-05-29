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
            title: title.trim(),
            version: versionAndDate.split("(")[0].trim(),
            date: versionAndDate.split("(")[1].replace(")", "").trim(),
            description: lines[1].trim(),
            content: blocks.slice(2).join("\n"),
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
        markdownPlugin({}),
    ],
});
