import { Configuration } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

const isDev = process.env.NODE_ENV === "development";

const common: Configuration = {
  mode: isDev ? "development" : "production",
  externals: ["fsevents"],
  output: {
    publicPath: "./",
    filename: "[name].js",
    assetModuleFilename: "assets/[name][ext]",
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".json"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "esbuild-loader",
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader",
        {
          loader:"postcss-loader",
          options:{
            postcssOptions:{
              plugins:[require("tailwindcss")]
            }
          }
        }],
      },
      {
        test: /\.(ico|png|svg|eot|woff?2?)$/,
        type: "asset/resource",
      },
    ],
  },
  watch: isDev,
  watchOptions:{
    ignored:"/graphics/"
  },
  devtool: isDev ? "source-map" : undefined,
};

const main: Configuration = {
  ...common,
  target: "electron-main",
  entry: {
    main: "./src/main.ts",
  },
};

const preload: Configuration = {
  ...common,
  target: "electron-preload",
  entry: {
    preload: "./src/preload.ts",
  },
};

export default [main, preload];
