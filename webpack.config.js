import fs from "node:fs";
import path from "node:path";
import webpack from "webpack";
import CopyWebpackPlugin from "copy-webpack-plugin";
import MikelWebpackPlugin from "mikel-webpack-plugin";
import {getChangelogData} from "./scripts/changelog.js";
import {getPages} from "./scripts/pages.js";
import env from "./server/utils/environment.js";

// read package.json
const pkg = JSON.parse(fs.readFileSync("./package.json"));

// available clients for folio
const CLIENTS = {
    LOCAL: path.join(process.cwd(), "app/clients/local.js"),
    REMOTE: path.join(process.cwd(), "app/clients/remote.js"),
};

// @description global data configuration
// @field site: site configuration
// @field page: current page configuration
const globalData = {
    site: {
        title: "Folio",
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
    },
    pages: getPages(path.join(process.cwd(), "pages"), ".html"),
    page: null,
    data: {
        changelog: getChangelogData(path.join(process.cwd(), "CHANGELOG.md")),
    },
};

export default {
    mode: process.env.NODE_ENV || "development", // "production",
    target: "web",
    entry: path.join(process.cwd(), "app", "index.jsx"),
    output: {
        path: path.join(process.cwd(), "www"),
        publicPath: "./",
        filename: "[name].[contenthash].js",
        chunkFilename: "[name].[contenthash].chunk.js",
        assetModuleFilename: "assets/[hash][ext][query]",
    },
    resolve:{
        alias: {
            "@folio/client": CLIENTS[(env?.CLIENT || "LOCAL").toUpperCase()],
        },
    },
    optimization: {
        splitChunks: {
            chunks: "all",
        },
    },
    devServer: {
        hot: false,
        static: {
            directory: path.join(process.cwd(), "www"),
            staticOptions: {
                extensions: ["html"],
            },
        },
        historyApiFallback: {
            rewrites: [
                {from: /^\/$/, to: "app.html"},
                {from: /^\/index.html$/, to: "app.html"},
            ],
        },
        devMiddleware: {
            writeToDisk: true,
        },
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                include: [
                    path.join(process.cwd(), "app"),
                    path.join(process.cwd(), "pkgs"),
                ],
                exclude: /(node_modules|www)/,
                loader: "babel-loader",
                options: {
                    presets: [
                        "@babel/preset-react",
                    ],
                },
            },
            {
                test: /\.(png|jpg|jpeg|svg)$/,
                type: "asset/resource",
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                type: "asset/resource",
            },
            {
                test: /resources\/stickers\/([\w-]+)\.svg$/,
                type: "asset/inline",
            },
        ],
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new webpack.DefinePlugin({
            // Global values
            "process.env.VERSION": JSON.stringify(pkg.version),
            "process.env.URL_REPOSITORY": JSON.stringify(pkg.repository),
            "process.env.URL_ISSUES": JSON.stringify(pkg.bugs),
            "process.env.URL_HOMEPAGE": JSON.stringify(pkg.homepage),
            // ENV values
            "process.env.APP": JSON.stringify(env.APP || "LITE"),
            "process.env.CLIENT": JSON.stringify(env.CLIENT || "LOCAL"),
        }),
        new CopyWebpackPlugin({
            patterns: [
                path.join(process.cwd(), "node_modules/lowcss/low.css"),
            ],
        }),
        // new HtmlWebpackPlugin({
        //     template: path.join(process.cwd(), "app", "template.html"),
        //     filename: "app.html",
        //     minify: true,
        // }),
        ...globalData.pages.map(page => {
            return new MikelWebpackPlugin({
                template: path.join(process.cwd(), "layout.html"),
                filename: page.url,
                chunks: page.data.chunks || [],
                templateData: Object.assign({}, globalData, {
                    page: page,
                }),
                templateOptions: {
                    partials: {
                        content: page.content,
                    },
                    functions: {
                        icon: ({opt}) => {
                            return `<svg class="size-${opt.size || "4"}"><use xlink:href="sprite.svg#${opt.icon}"></use></svg>`;
                        },
                    },
                },
            });
        }),
    ],
};
