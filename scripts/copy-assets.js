const fs = require("node:fs");
const path = require("node:path");

const rootPath = path.resolve(__dirname, "../");
const buildPath = path.join(rootPath, "www/");
const assets = [
    // {
    //     from: "public/index.html",
    //     to: "./index.html",
    // },
    // {
    //     from: "public/privacy.html",
    //     to: "./privacy.html",
    // },
    {
        from: "public/404.html",
        to: "./404.html",
    },
    {
        from: "node_modules/lowcss/low.css",
        to: "./low.css",
    },
    {
        from: "node_modules/@josemi-icons/svg/sprite.svg",
        to: "./sprite.svg",
    },
    {
        from: "public/screenshot.png",
        to: "./screenshot.png",
    },
    {
        from: "public/og.png",
        to: "./og.png",
    },
];

assets.forEach(asset => {
    if (asset) {
        const srcPath = path.resolve(rootPath, asset.from);
        const dstPath = path.resolve(buildPath, asset.to);

        console.log(`${srcPath} => ${dstPath}`);
        // Note: cpSync is still experimental
        fs.cpSync(srcPath, dstPath);
    }
});
