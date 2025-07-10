import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

// generate obfuscated names (with prefix and at least MIN_LENGTH letters)
const getObfuscatedName = (index = 0, prefix = "", minLength = 3) => {
    let s = "", n = index;
    do {
        s = String.fromCharCode(97 + (n % 26)) + s;
        n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    // pad to MIN_LENGTH
    while (s.length < minLength) {
        s = "a" + s;
    }
    return prefix + s;
};

// find all occurrences of a pattern in a string
const findAllOccurrences = (str, pattern) => {
    return Array.from(new Set((str.matchAll(pattern) || []).map(match => match[1])));
};

const main = (input, output) => {
    const outputPath = path.resolve(output);
    const cssPath = path.resolve(input); // input is the file containing the css to obfuscate
    const outputCssPath = path.join(outputPath, "folio.css");
    const outputMapPath = path.join(outputPath, "classnames-map.json");

    // 0. make sure output directory exists
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }

    // 1. read CSS file
    let css = fs.readFileSync(cssPath, "utf8");

    // 2a. find all class selectors (including state utilities)
    // Matches .bg-gray-100, .hover:bg-gray-200, .group-focus-within:block, etc.
    const classSet = findAllOccurrences(css, /\.((?:[a-z][a-zA-Z0-9_-]+\\:)*[a-z][a-zA-Z0-9_-]+)(?=[\s,{.:#>\[])/g);

    // 2b. find all CSS variables (e.g., --color-gray-100)
    const varSet = findAllOccurrences(css, /(--[a-zA-Z0-9_-]+)/g);

    // 2c. find all keyframes definitions (e.g., @keyframes fade-in)
    const keyframesSet = findAllOccurrences(css, /@keyframes\s+([a-zA-Z0-9_-]+)/g);

    // 3a. generate obfuscated names for classes
    const classMap = Object.fromEntries(classSet.map((className, index) => {
        return [className, getObfuscatedName(index, "fl_c", 3)];
    }));

    // 3b. generate obfuscated names for variables
    const varMap = Object.fromEntries(varSet.map((varName, index) => {
        return [varName, "--" + getObfuscatedName(index, "fl-v", 2)];
    }));

    // 3c. generate obfuscated names for keyframes
    const keyframesMap = Object.fromEntries(keyframesSet.map((keyframesName, index) => {
        return [keyframesName, getObfuscatedName(index, "fl-k", 2)];
    }));

    // 4a. replace class names in CSS
    Object.keys(classMap).forEach(key => {
        const className = key.replace(/\\/g, "\\\\");
        css = css.replace(new RegExp(`\\.${className}(?=[\\s,{.:#>\\[])`, "g"), `.${classMap[key]}`);
    });

    // 4b. replace CSS variables in CSS
    Object.keys(varMap).forEach(key => {
        css = css.replace(new RegExp(key + "(?![a-zA-Z0-9_-])", "g"), varMap[key]);
    });

    // 4c. replace keyframes in CSS
    Object.keys(keyframesMap).forEach(key => {
        css = css.replace(new RegExp(`@keyframes\\s+${key}(?![a-zA-Z0-9_-])`, "g"), `@keyframes ${keyframesMap[key]}`);
        css = css.replace(new RegExp(`:\\s?${key}\\s`, "g"), `: ${keyframesMap[key]} `);
    });

    // 5. note that some classnames have a double \ separator between classname and state utility
    // we have to remove it from the classMap
    const outputClassMap = Object.fromEntries(Object.keys(classMap).map(key => {
        return [
            key.replace(/\\/g, ""), // remove the double backslash
            classMap[key],
        ];
    }));

    // 6. write outputs
    fs.writeFileSync(outputCssPath, css, "utf8");
    fs.writeFileSync(outputMapPath, JSON.stringify(outputClassMap, null, "    "), "utf8");
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
        }
    },
});

// if input and output are provided, obfuscate the CSS
if (values.input && values.output) {
    main(values.input, values.output);
}
