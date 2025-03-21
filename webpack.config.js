import path from "node:path";
import webpack from "webpack";
import TerserPlugin from "terser-webpack-plugin";
// import MiniCssExtractPlugin from "mini-css-extract-plugin";
import pkg from "./package.json" with {type: "json"};

export default {
    mode: process.env.NODE_ENV || "development",
    target: "web",
    entry: {
        "folio-react": {
            import: path.resolve("folio-react/index.jsx"),
            filename: "folio-react/folio-react.js",
            layer: "folio-react",
        },
    },
    output: {
        path: path.resolve("dist"),
        publicPath: "./",
        clean: false,
        library: {
            type: "module",
        },
        // filename: "[name].[contenthash].js",
        // chunkFilename: "[name].[contenthash].chunk.js",
        // assetModuleFilename: "assets/[hash][ext][query]",
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
                "react": "React",
                "react-dom": "ReactDOM",
            },
        },
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                include: [
                    path.resolve("folio-react"),
                ],
                exclude: /(node_modules|www)/,
                loader: "babel-loader",
                options: {
                    presets: [
                        "@babel/preset-env", 
                        "@babel/preset-react",
                    ],
                    plugins: [
                        "@babel/plugin-transform-react-jsx",
                        "@babel/plugin-transform-runtime",
                    ],
                },
            },
            {
                test: /\.(png|jpg|jpeg|svg)$/,
                type: "asset/inline",
            },
            // {
            //     test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
            //     type: "asset/inline",
            // },
            {
                test: /resources\/stickers\/([\w-]+)\.svg$/,
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
