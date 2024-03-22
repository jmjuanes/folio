const fs = require("node:fs");
const path = require("node:path");
const pkg = require("../package.json");
const siteConfig = require("../config/site.json");

const build = async () => {
    const m = (await import("mikel")).default;
    const inputFolder = path.join(process.cwd(), "pages");
    const outputFolder = path.join(process.cwd(), "www");
    // 1. Read layout template
    const layoutPath = path.join(process.cwd(), "layout.mustache");
    const layout = fs.readFileSync(layoutPath, "utf8");
    // 2. Read input folder and process all .mustache files
    fs.readdirSync(inputFolder, "utf8")
        .filter(file => path.extname(file) === ".mustache")
        .forEach(file => {
            const filePath = path.join(inputFolder, file);
            const fileContent = fs.readFileSync(filePath, "utf8");
            const name = path.basename(file, ".mustache");
            console.log(`[build:site] saving file in www/${name}.html`);
            const content = m(layout, {content: fileContent});
            fs.writeFileSync(path.join(outputFolder, name + ".html"), content, "utf8");
        });
};

build();
