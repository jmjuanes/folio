import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { PurgeCSS } from "purgecss";

// main script
const main = async (inputConfig, inputJs, output) => {
    const config = JSON.parse(fs.readFileSync(path.resolve(inputConfig), "utf8"));
    let css = fs.readFileSync(path.resolve(config.input), "utf8"); // read original CSS file

    // a. replace class names in CSS
    Object.keys(config.classNames).forEach(key => {
        const className = key.replace(/:/g, "\\\\:");
        css = css.replace(new RegExp(`\\.${className}(?=[\\s,{.:#>\\[])`, "g"), `.${config.classNames[key]}`);
    });

    // b. replace CSS variables in CSS
    Object.keys(config.variables).forEach(key => {
        css = css.replace(new RegExp(key + "(?![a-zA-Z0-9_-])", "g"), config.variables[key]);
    });

    // c. replace keyframes in CSS
    Object.keys(config.keyframes).forEach(key => {
        css = css.replace(new RegExp(`@keyframes\\s+${key}(?![a-zA-Z0-9_-])`, "g"), `@keyframes ${config.keyframes[key]}`);
        css = css.replace(new RegExp(`:\\s?${key}\\s`, "g"), `: ${config.keyframes[key]} `);
    });

    // const usedClassNames = extractUsedClassNames(js, config);
    // const usedVariables = extractUsedVariables(css, usedClassNames);
    const results = await new PurgeCSS().purge({
        content: [{
            raw: fs.readFileSync(path.resolve(inputJs), "utf8"),
            extension: "js",
        }],
        css: [{
            raw: css,
        }],
        defaultExtractor: content => {
            return content.match(/[\w-:./]+(?<!:)/g) || [];
        },
        variables: true,
    });

    // const purgedCss = purgeAndRenameCss(css, usedClassNames, usedVariables, config);
    fs.writeFileSync(path.resolve(output), results[0].css, "utf8");
};

// get the arguments from the command line
const { values } = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: false,
    options: {
        input: {
            type: "string",
        },
        output: {
            type: "string",
        },
        config: {
            type: "string",
            default: "obfuscate.map.json",
        },
    },
});

if (values.input && values.output && values.config) {
    main(values.config, values.input, values.output);
}
