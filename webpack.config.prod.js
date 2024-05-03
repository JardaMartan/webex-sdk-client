const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpackBundleAnalyzer = require("webpack-bundle-analyzer");
const EventHooksPlugin = require("event-hooks-webpack-plugin");
const fs = require("fs-extra");

process.env.NODE_ENV = "production";

module.exports = {
  mode: "production",
  target: "web",
  devtool: "source-map",
  entry: "./src/index",
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "/clientsdk/",
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
  plugins: [
    // Display bundle stats
    new webpackBundleAnalyzer.BundleAnalyzerPlugin({ analyzerMode: "static" }),

    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
    }),

    new webpack.DefinePlugin({
      // This global makes sure React is built in prod mode.
      "process.env.ROOT_URL": JSON.stringify("/clientsdk/"),
    }),
    new HtmlWebpackPlugin({
      template: "src/index.html",
      favicon: "src/favicon.ico",
      minify: {
        // see https://github.com/kangax/html-minifier#options-quick-reference
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    new EventHooksPlugin({
      afterPlugins: (compilation, done) => {
        console.log(
          "Copying webpackConfig.prod.json file to webpackConfig.json"
        );
        fs.copy(
          "src/api/webexConfig.prod.json",
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
