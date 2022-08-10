const rpcLoadTemplate = require("../templates/rpcLoad");
const rpcPerformTemplate = require("../templates/rpcPerform");

const rpcProcessTemplate = (mfConfig) => `
    function rpcProcess(remote) {
        return {get:(request)=> remote.get(request),init:(arg)=>{try {return remote.init({
            ...arg,
            ${Object.keys(mfConfig.shared || {})
              .filter(
                (item) =>
                  mfConfig.shared[item].singleton &&
                  mfConfig.shared[item].requiredVersion
              )
              .map(function (item) {
                return `"${item}": {
                      ["${mfConfig.shared[item].requiredVersion}"]: {
                        get: () => Promise.resolve().then(() => () => require("${item}"))
                      }
                  }`;
              })
              .join(",")}
        })} catch(e){console.log('remote container already initialized')}}}
    }
`;

function buildRemotes(mfConf, getRemoteUri) {
  const builtinsTemplate = `
    ${rpcLoadTemplate}
    ${rpcPerformTemplate}
    ${rpcProcessTemplate(mfConf)}
  `;
  return Object.entries(mfConf.remotes || {}).reduce((acc, [name, config]) => {
    acc[name] = {
      external: `external (async function() {
        ${builtinsTemplate}
        return rpcPerform(${
          getRemoteUri
            ? `await ${getRemoteUri(config)}`
            : `"${config}"`
        }).then(rpcProcess).catch((err) => { console.error(err); })
      }())`,
    };
    return acc;
  }, {});
}

class NodeModuleFederation {
  constructor(options, context) {
    this.options = options || {};
    this.context = context || {};
  }

  apply(compiler) {
    const { getRemoteUri, ...options } = this.options;
    // When used with Next.js, context is needed to use Next.js webpack
    const { webpack } = this.context;

    new (webpack?.container.ModuleFederationPlugin ||
      require("webpack/lib/container/ModuleFederationPlugin"))({
      ...options,
      remotes: buildRemotes(options, getRemoteUri),
    }).apply(compiler);
  }
}

module.exports = NodeModuleFederation;
