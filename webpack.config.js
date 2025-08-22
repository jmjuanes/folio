import path from "node:path";
import webpack from "webpack";
import TerserPlugin from "terser-webpack-plugin";
import pkg from "./package.json" with {type: "json"};

export default {
    mode: process.env.NODE_ENV || "development",
    target: "web",
    entry: {
        "folio-react": {
            import: path.resolve("folio-react/index.jsx"),
            filename: "folio-react/folio.js",
            layer: "folio-react",
        },
    },
    output: {
        path: path.resolve("."),
        publicPath: "./",
        clean: false,
        library: {
            type: "module",
        },
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
            }),
        ],
    },
    experiments: {
        layers: true,
        outputModule: true,
    },
    externals: {
        byLayer: {
            "folio-react": {
                "react": "react",
                "react-dom": "react-dom",
                "react-dom/server": "react-dom/server",
            },
        },
    },
    module: {
        rules: [
            {
                test: /\.(j|t)sx?$/,
                include: [
                    path.resolve("folio-react"),
                ],
                exclude: /(node_modules|www)/,
                loader: "babel-loader",
                options: {
                    presets: [
                        "@babel/preset-env", 
                        "@babel/preset-react",
                        "@babel/preset-typescript",
                    ],
                    plugins: [
                        "@babel/plugin-transform-runtime",
                        path.resolve("scripts/babel-plugin-obfuscate-classnames.js"),
                    ],
                },
            },
            {
                test: /\.(png|jpg|jpeg|svg)$/,
                type: "asset/inline",
            },
        ],
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new webpack.DefinePlugin({
            "process.env.VERSION": JSON.stringify(pkg.version),
            "process.env.URL_REPOSITORY": JSON.stringify(pkg.repository),
            "process.env.URL_ISSUES": JSON.stringify(pkg.bugs),
            "process.env.URL_HOMEPAGE": JSON.stringify(pkg.homepage),
        }),
    ],
};
