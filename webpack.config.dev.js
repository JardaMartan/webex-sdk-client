const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const EventHooksPlugin = require("event-hooks-webpack-plugin");
const fs = require("fs-extra");

process.env.NODE_ENV = "development";

module.exports = {
  mode: "development",
  target: "web",
  devtool: "cheap-module-source-map",
  entry: "./src/index",
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "/",
    filename: "bundle.js",
  },
  resolve: {
    fallback: {
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer"),
      crypto: require.resolve("crypto-browserify"),
      os: require.resolve("os-browserify/browser"),
      fs: require.resolve("browserify-fs"),
      path: require.resolve("path-browserify"),
      vm: require.resolve("vm-browserify"),
    },
  },
  devServer: {
    // stats: "minimal",
    // overlay: true,
    historyApiFallback: true,
    // disableHostCheck: true,
    headers: { "Access-Control-Allow-Origin": "*" },
    // static: path.resolve(__dirname, 'dist'),
    // https: false,
    port: 3000,
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
    new webpack.DefinePlugin({
      "process.env.API_URL": JSON.stringify("http://192.168.101.127:4201"),
      "process.env.ROOT_URL": JSON.stringify("/"),
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    }),
    new HtmlWebpackPlugin({
      template: "src/index.html",
      favicon: "src/favicon.ico",
    }),
    new EventHooksPlugin({
      afterPlugins: (compilation, done) => {
        console.log(
          "Copying webexConfig.localhost.json file to webexConfig.json"
        );
        fs.copy(
          "src/api/webexConfig.localhost.json",
          "src/api/webexConfig.json",
          done
        );
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader", "eslint-loader"],
      },
      {
        test: /\.eot(\?v=\d+.\d+.\d+)?$/,
        use: ["file-loader"],
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        type: "asset/resource",
        dependency: { not: ["url"] },
        // use: [
        //   {
        //     loader: "url-loader",
        //     options: {
        //       limit: 10000,
        //       mimetype: "application/font-woff",
        //     },
        //   },
        // ],
      },
      {
        test: /\.[ot]tf(\?v=\d+.\d+.\d+)?$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10000,
              mimetype: "application/octet-stream",
            },
          },
        ],
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10000,
              mimetype: "image/svg+xml",
            },
          },
        ],
      },
      {
        test: /\.(jpe?g|png|gif|ico)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
            },
          },
        ],
      },
      {
        test: /(\.css)$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /(\.s[ca]ss)$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
};
