const fs = require("node:fs");
const path = require("node:path");
const frontMatter = require("front-matter");
const marked = require("marked");
const pkg = require("../package.json");

// @description this method formats a date object and returns an string with the format 'YYYY-MM-DD'
// Source: https://stackoverflow.com/a/29774197
const formatDate = date => {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60 * 1000)).toISOString().split("T")[0];
};

const buildChangelogData = () => {
    const items = [];
    let lastItem = null;
    fs.readFileSync(path.join(process.cwd(), "CHANGELOG.md"), "utf8")
        .split("\n") // .slice(1)
        .filter(line => !!line.trim())
        .forEach(line => {
            // Check for heading 2 --> new changelog item
            if (line.startsWith("# ")) {
                const match = line.match(/#\s+(v[\d\.]+)\s+\(([\w\s,]+)\)\s+(.*)/);
                items.push({
                    version: match[1],
                    date: match[2],
                    url: formatDate(new Date(match[2])) + "-" + match[3].toLowerCase().trim().replaceAll(" ", "-"),
                    title: match[3].trim(),
                    content: [],
                });
                lastItem = items[items.length - 1];
            }
            // Check for item description
            else if (line.startsWith("> ") && lastItem.content.length === 0) {
                lastItem.description = line.slice(1).trim();
            }
            // Other case
            else {
                lastItem.content.push(line.trim());
            }
        });
    // Fix the content field of all items
    items.forEach(item => {
        item.content = marked.parse(item.content.join("\n"));
    });
    return items;
};

const getSiteConfiguration = () => ({
    name: "folio.",
    repository: pkg.repository,
    version: pkg.version,
    navbar: {
        links: [
            {link: "/#features", text: "Features"},
            {link: "/#pricing", text: "Pricing"},
            {link: "/changelog", text: "Changelog"},
        ],
    },
    footer: {
        links: [
            {link: "/privacy", target: "_self", text: "Privacy"},
            {link: "https://github.com/jmjuanes/folio/issues", target: "_blank", text: "Report a bug"},
        ],
    },
    pages: [],
    data: {
        changelog: buildChangelogData(),
    },
});

// Read and parse the provided page content
const readPage = pagePath => {
    const page = frontMatter(fs.readFileSync(pagePath, "utf8"));
    return {
        name: path.basename(pagePath, ".html"),
        content: page.body || "",
        data: page.attributes || {},
    };
};

const build = async () => {
    const m = (await import("mikel")).default;
    const inputFolder = path.join(process.cwd(), "pages");
    const outputFolder = path.join(process.cwd(), "www");
    const layout = readPage(path.join(process.cwd(), "layout.html"));
    const data = {
        site: getSiteConfiguration(),
        layout: layout.data || {},
        page: null,
    };
    // 1. Read input folder and process all .html files
    fs.readdirSync(inputFolder, "utf8")
        .filter(file => path.extname(file) === ".html")
        .forEach(file => {
            const page = readPage(path.join(inputFolder, file));
            data.site.pages.push(page);
        });
    // Build each page
    data.site.pages.forEach(page => {
        const content = m(layout.content, {...data, page}, {
            helpers: {
                firstItems: ({value, fn}) => {
                    const items = Object.entries(value || {}).slice(0, 2).map((item, index) => {
                        return fn(item[1], {index: index, first: index === 0});
                    });
                    return items.join("");
                },
            },
            partials: {
                content: page.content,
            },
        });
        console.log(`[build:site] saving file to www/${page.name}.html`);
        fs.writeFileSync(path.join(outputFolder, page.name + ".html"), content, "utf8");
    });
};

build();
