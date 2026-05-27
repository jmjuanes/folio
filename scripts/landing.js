import { readdirSync, readFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { build, createInput } from "mikel-cli";
import mikel from "mikel";
import frontmatterPlugin from "mikel-frontmatter";

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
        frontmatterPlugin(),
    ],
});
