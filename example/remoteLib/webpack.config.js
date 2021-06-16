const { ModuleFederationPlugin } = require("webpack").container;
const HtmlWebpackPlugin = require("html-webpack-plugin");

const { NodeAsyncHttpRuntime } = require("@telenko/node-mf");
const path = require("path");
const packageJson = require("./package.json");

const commonConfig = (remoteEntryName, distFolder, port) => ({
    entry: "./src/index.js",
  mode: "development",
  devtool: "hidden-source-map",
  output: {
    path: path.resolve(__dirname, distFolder),
    publicPath: `http://localhost:${port}/`,
    clean: true,
  },
  devServer: {
    compress: true,
    port: port,
  },
  resolve: {
    extensions: [
      ".jsx",
      ".js",
      ".json",
      ".css",
      ".scss",
      ".jpg",
      "jpeg",
      "png",
    ],
  },
  module: {
    rules: [
      {
        test: /bootstrap\.js$/,
        loader: "bundle-loader",
        options: {
          lazy: true,
        },
      },
      {
        test: /\.(jpg|png|gif|jpeg)$/,
        loader: "url-loader",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          presets: ["@babel/preset-react"],
        },
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "remoteLib",
      filename: remoteEntryName,
      exposes: {
        "./SmartButton": "./src/SmartButton.jsx"
      },
      shared: {
          react: {
              singleton: true,
              requiredVersion: packageJson.dependencies['react']
          },
          ['react-dom']: {
              singleton: true,
              requiredVersion: packageJson.dependencies['react-dom']
          }
      }
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
});

const webConfig = commonConfig('remoteEntry.js', "dist/web", 3001);
let nodeConfig = commonConfig('remoteEntry.node.js', "dist/node", 3002);
nodeConfig = {
    ...nodeConfig,
    plugins: [
        ...nodeConfig.plugins,
        new NodeAsyncHttpRuntime({ baseURI: 'http://localhost:3002' })
    ],
    target: false
};

module.exports = [
    webConfig,
    nodeConfig
];
