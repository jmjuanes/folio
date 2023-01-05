const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
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
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: path.join(__dirname, "index.html"),
            minify: true,
        }),
    ],
};
