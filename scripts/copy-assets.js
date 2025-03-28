import * as fs from "node:fs";
import * as path from "node:path";
import picomatch from "picomatch";

// helper method to copy from one source to another
const copy = (src, dest) => {
    fs.cpSync(src, dest);
    console.log(`[COPY] ${src} => ${dest}`);
};

// method to copy assets from the provided sources to www folder
const copyAssets = (dest, assets) => {
    const destPath = path.join(process.cwd(), dest);
    (assets || []).filter(Boolean).forEach(asset => {
        // check for blob pattern
        if (asset.from.includes("*")) {
            const basePath = path.join(process.cwd(), path.dirname(asset.from));
            return fs.readdirSync(basePath).forEach(file => {
                const src = path.join(path.dirname(asset.from), file);
                if (picomatch.isMatch(src, asset.from)) {
                    const srcPath = path.resolve(process.cwd(), src);
                    const targetPath = path.resolve(destPath, asset.to || path.basename(srcPath));
                    copy(srcPath, targetPath);
                }
            });
        }
        // no blob pattern, just copy and paste the file
        else {
            const srcPath = path.resolve(process.cwd(), asset.from);
            const targetPath = path.resolve(destPath, asset.to || path.basename(asset.from));
            copy(srcPath, targetPath);
        }
    });
};

// copy stuff to www folder
copyAssets("www", [
    {
        from: "website/landing/www/*",
        to: "",
    },
    {
        from: "website/app/www/*",
        to: "",
    },
]);
