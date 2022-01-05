const CommonJsChunkLoadingPlugin = require("./CommonJsChunkLoadingPlugin");

class NodeAsyncHttpRuntime {
  constructor(options, context) {
    this.options = options || {};
    this.context = context || {};
  }

  apply(compiler) {
    if (compiler.options.target) {
      console.warn(
        `target should be set to false while using NodeAsyncHttpRuntime plugin, actual target: ${compiler.options.target}`
      );
    }

    // When used with Next.js, context is needed to use Next.js webpack
    const { webpack } = this.context;

    // This will enable CommonJsChunkFormatPlugin
    compiler.options.output.chunkFormat = "commonjs";
    // This will force async chunk loading
    compiler.options.output.chunkLoading = "async-node";
    // Disable default config
    compiler.options.output.enabledChunkLoadingTypes = false;

    new (webpack?.node.NodeEnvironmentPlugin ||
      require("webpack/lib/node/NodeEnvironmentPlugin"))({
      infrastructureLogging: compiler.options.infrastructureLogging,
    }).apply(compiler);
    new (webpack?.node.NodeTargetPlugin ||
      require("webpack/lib/node/NodeTargetPlugin"))().apply(compiler);
    new CommonJsChunkLoadingPlugin(
      {
        asyncChunkLoading: true,
        baseURI: compiler.options.output.publicPath,
        promiseBaseURI: this.options.promiseBaseURI,
      },
      this.context
    ).apply(compiler);
  }
}

module.exports = NodeAsyncHttpRuntime;
