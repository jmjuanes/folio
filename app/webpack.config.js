const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const package = require("./package.json");

module.exports = {
    mode: process.env.NODE_ENV || "development", // "production",
    target: "web",
    entry: path.join(__dirname, "index.jsx"),
    output: {
        path: path.join(__dirname, "www"),
        publicPath: "./",
        filename: "[contenthash:9].js",
    },
    devServer: {
        hot: false,
        static: {
            directory: path.join(__dirname, "www"),
        },
        devMiddleware: {
            writeToDisk: true,
        },
    },
    resolve: {
        alias: {
            "folio-core": path.resolve(__dirname, "../folio-core/index.jsx"),
            "folio-board": path.resolve(__dirname, "../folio-board/index.jsx"),
        },
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                include: [
                    __dirname,
                    path.resolve(__dirname, "../folio-board"),
                    path.resolve(__dirname, "../folio-core"),
                ],
                exclude: /(node_modules|bower_components)/,
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
                type: "asset/resource",
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env.VERSION": JSON.stringify(package.version),
            // "process.env.HOMEPAGE_URL": JSON.stringify(package.homepage),
        }),
        new CopyPlugin({
            patterns: [
                path.join(__dirname, "../node_modules/lowcss/dist/low.css"),
                path.resolve(__dirname, "../folio-board/assets/fonts.css"),
            ],
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: path.join(__dirname, "index.html"),
            minify: true,
        }),
    ],
};
