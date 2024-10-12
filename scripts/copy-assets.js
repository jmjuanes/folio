const fs = require("node:fs");
const path = require("node:path");
const {globSync} = require("glob");

// const rootPath = path.resolve(__dirname, "../");
const buildPath = path.join(process.cwd(), "www/");
const assets = [
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
    {
        from: "public/illustration-*.png",
    },
];

assets.forEach(asset => {
    if (asset && asset?.from) {
        return globSync(asset.from).forEach(file => {
            const src = path.resolve(process.cwd(), file);
            const dest = path.resolve(buildPath, asset.to || path.basename(file));
            console.log(`[COPY] ${src} => ${dest}`);
            fs.cpSync(src, dest);
        });
    }
});
