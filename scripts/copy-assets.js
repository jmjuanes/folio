import * as fs from "node:fs";
import * as path from "node:path";
import { parseArgs } from "node:util";

// const { LANDING_ONLY } = process.env;

const assets = [
    {
        from: "resources/brand.css",
        to: "brand.css",
    },
    {
        from: "node_modules/lowcss/low.css",
        to: "low.css",
    },
    {
        from: "node_modules/@josemi-icons/svg/sprite.svg",
        to: "icons.svg",
    },
].filter(Boolean);

// helper method to copy from one source to another
const copy = (src, dest) => {
    fs.cpSync(src, dest);
    console.log(`✓ Copied ${src} => ${dest}`);
};

// method to copy assets from the provided sources to www folder
const main = (dest, assets) => {
    const destPath = path.join(process.cwd(), dest);
    (assets || []).filter(Boolean).forEach(asset => {
        // check for blob pattern
        if (asset.from.includes("*")) {
            // const basePath = path.join(process.cwd(), path.dirname(asset.from));
            // return fs.readdirSync(basePath).forEach(file => {
            //     const src = path.join(path.dirname(asset.from), file);
            //     if (picomatch.isMatch(src, asset.from)) {
            //         const srcPath = path.resolve(process.cwd(), src);
            //         const targetPath = path.resolve(destPath, asset.to || path.basename(srcPath));
            //         copy(srcPath, targetPath);
            //     }
            // });
        }
        // no blob pattern, just copy and paste the file
        else {
            const srcPath = path.resolve(process.cwd(), asset.from);
            const targetPath = path.resolve(destPath, asset.to || path.basename(asset.from));
            copy(srcPath, targetPath);
        }
    });
};

// process arguments
const { values } = parseArgs({
    options: {
        output: {
            type: "string",
            short: "o",
        },
    },
    allowPositionals: false,
});

// run main script
main(values.output, assets);
