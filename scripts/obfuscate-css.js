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
    // 1. read CSS file
    let css = fs.readFileSync(path.resolve(input), "utf8");
    const prefixes = {
        classNames: "fl-c",
        variables: "fl-v",
        keyframes: "fl-k",
    };

    // 2a. find all class selectors (including state utilities)
    // Matches .bg-gray-100, .hover:bg-gray-200, .group-focus-within:block, etc.
    const classSet = findAllOccurrences(css, /\.((?:[a-z][a-zA-Z0-9_-]+\\:)*[a-z][a-zA-Z0-9_-]+)(?=[\s,{.:#>\[])/g);

    // 2b. find all CSS variables (e.g., --color-gray-100)
    const varSet = findAllOccurrences(css, /(--[a-zA-Z0-9_-]+)/g);

    // 2c. find all keyframes definitions (e.g., @keyframes fade-in)
    const keyframesSet = findAllOccurrences(css, /@keyframes\s+([a-zA-Z0-9_-]+)/g);

    // 3. generate output data
    const data = {
        input: input,
        prefixes: prefixes,
        classNames: Object.fromEntries(classSet.map((className, index) => {
            return [
                className.replace(/\\/g, ""),
                getObfuscatedName(index, prefixes.classNames, 3),
            ];
        })),
        variables: Object.fromEntries(varSet.map((varName, index) => {
            return [
                varName,
                "--" + getObfuscatedName(index, prefixes.variables, 2),
            ];
        })),
        keyframes: Object.fromEntries(keyframesSet.map((keyframesName, index) => {
            return [
                keyframesName,
                getObfuscatedName(index, prefixes.keyframes, 2),
            ];
        })),
    };

    // 4. write output file
    fs.writeFileSync(path.resolve(output), JSON.stringify(data, null, "    "), "utf8");
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
