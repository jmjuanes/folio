const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const package = require("./package.json");

module.exports = {
    mode: process.env.NODE_ENV || "development", // "production",
    target: "web",
    entry: path.join(__dirname, "index.jsx"),
    output: {
        path: path.join(__dirname, "www"),
        publicPath: "./",
        filename: "[contenthash].js",
        assetModuleFilename: "assets/[hash][ext][query]",
    },
    optimization: {
        splitChunks: {
            chunks: "all",
        },
    },
    devServer: {
        hot: false,
        static: {
            directory: path.join(__dirname, "www"),
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
                    __dirname,
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
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
            {
                test: /\.(png|jpg|jpeg|svg)$/,
                type: "asset/resource",
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                type: "asset/resource",
                // generator: {
                //     filename: "fonts/[hash][ext][query]",
                // },
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[contenthash].css",
            chunkFilename: "[id].css",
        }),
        new webpack.DefinePlugin({
            "process.env.VERSION": JSON.stringify(package.version),
            "process.env.URL_REPOSITORY": JSON.stringify(package.repository),
            "process.env.URL_ISSUES": JSON.stringify(package.bugs),
            "process.env.URL_HOMEPAGE": JSON.stringify(package.homepage),
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "index.html"),
            filename: "app.html",
            inject: true,
        }),
        new CopyWebpackPlugin({
            patterns: [
                path.join(__dirname, "node_modules", "lowcss", "dist/low.css"),
            ],
        }),
    ],
};
