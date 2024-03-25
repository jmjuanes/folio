const fs = require("node:fs");
const path = require("node:path");
const siteConfig = require("../site/config.js");

const readPage = pagePath => {
    return {
        name: path.basename(pagePath, ".mustache"),
        content: fs.readFileSync(pagePath, "utf8"),
        data: {},
    };
};

const build = async () => {
    const m = (await import("mikel")).default;
    const inputFolder = path.join(process.cwd(), "site");
    const outputFolder = path.join(process.cwd(), "www");
    // 1. Read layout
    const layout = fs.readFileSync(path.join(inputFolder, "_layouts", "default.mustache"), "utf8");
    // 2. Read input folder and process all .mustache files
    fs.readdirSync(inputFolder, "utf8")
        .filter(file => path.extname(file) === ".mustache")
        .map(file => path.join(inputFolder, file))
        .forEach(pagePath => {
            const page = readPage(pagePath);
            const template = (layout + "").replace("{{ content }}", page.content);
            const content = m(template, {
                site: siteConfig,
                page: page,
            });
            console.log(`[build:site] saving file to www/${page.name}.html`);
            fs.writeFileSync(path.join(outputFolder, page.name + ".html"), content, "utf8");
        });
};

build();
