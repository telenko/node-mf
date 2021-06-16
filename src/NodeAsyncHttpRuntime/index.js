const NodeEnvironmentPlugin = require("webpack/lib/node/NodeEnvironmentPlugin");
const NodeTargetPlugin = require("webpack/lib/node/NodeTargetPlugin");
const CommonJsChunkLoadingPlugin = require("./CommonJsChunkLoadingPlugin");
const CommonJsChunkFormatPlugin = require("webpack/lib/javascript/CommonJsChunkFormatPlugin");

class NodeAsyncHttpRuntime {
  constructor(options) {
    options = options || {};
    this.baseURI = options.baseURI;
  }
  apply(compiler) {
    if (compiler.options.target) {
      console.warn(`target should be set to false while using NodeAsyncHttpRuntime plugin, actual target: ${compiler.options.target}`);
    }
    // compiler.options.output.chunkLoading = "async-node";
    new CommonJsChunkFormatPlugin().apply(compiler);
   
    // TODO options?
    new NodeEnvironmentPlugin({ infrastructureLogging: compiler.options.infrastructureLogging }).apply(compiler);
    new NodeTargetPlugin().apply(compiler);
    new CommonJsChunkLoadingPlugin({ baseURI: this.baseURI }).apply(compiler);
  }
}

module.exports = NodeAsyncHttpRuntime;
