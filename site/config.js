const fs = require("node:fs");
const path = require("node:path");
const pkg = require("../package.json");

const buildChangelogData = () => {
    const items = [];
    fs.readFileSync(path.resolve(__dirname, "../CHANGELOG.md"), "utf8")
        .split("\n").slice(1)
        .filter(line => !!line.trim())
        .forEach(line => {
            // Check for heading 2 --> new changelog item
            if (line.startsWith("## ")) {
                const match = line.match(/##\s+(v[\d\.]+)\s+\(([\w\s,]+)\)\s+(.*)/);
                items.push({
                    version: match[1],
                    date: match[2],
                    title: match[3],
                    content: [],
                });
            }
            // Check for heading 3 --> title inside the item content
            else if (line.startsWith("###")) {
                items[items.length - 1].content.push({
                    heading: true,
                    text: line.replace("###", "").trim(),
                });
            }
            // Other case --> paragraph
            else {
                items[items.length - 1].content.push({
                    text: line.trim(),
                });
            }
        });
    return items;
};

module.exports = {
    name: "folio.",
    repository: pkg.repository,
    version: pkg.version,
    navbar: {
        links: [
            {link: "./#features", text: "Features"},
            {link: "./#pricing", text: "Pricing"},
            {link: "./changelog", text: "Changelog"},
        ],
    },
    footer: {
        links: [
            {link: "./privacy", target: "_self", text: "Privacy"},
            {link: "https://github.com/jmjuanes/folio/issues", target: "_blank", text: "Report a bug"},
        ],
    },
    data: {
        changelog: buildChangelogData(),
    },
};
