const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const rpcLoadTemplate = require("../templates/rpcLoad");

const rpcPerformTemplate = `
    ${rpcLoadTemplate}
    function rpcPerform(remoteUrl) {
        const scriptUrl = remoteUrl.split("@")[1];
        const moduleName = remoteUrl.split("@")[0];
        return new Promise(function (resolve, reject) {
            rpcLoad(scriptUrl, function(error, scriptContent) {
                if (error) { reject(error); }
                //TODO using vm??
                const remote = eval(scriptContent + '\\n  try{' + moduleName + '}catch(e) { null; };');
                if (!remote) {
                  reject("remote library " + moduleName + " is not found at " + scriptUrl);
                } else if (remote instanceof Promise) {
                    return remote;
                } else {
                    resolve(remote);
                }
            });
        });
    }
`;

const rpcProcessTemplate = (mfConfig) => `
    function rpcProcess(remote) {
        return {get:(request)=> remote.get(request),init:(arg)=>{try {return remote.init({
            ...arg,
            ${Object.keys(mfConfig.shared)
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

function buildRemotes(mfConf) {
  const builtinsTemplate = `
    ${rpcPerformTemplate}
    ${rpcProcessTemplate(mfConf)}
  `;
  return Object.entries(mfConf.remotes).reduce((acc, [name, config]) => {
    acc[name] = {
      external: `external (function() {
        if (!globalThis._MFRemotes) {
          globalThis._MFRemotes = {};
        }
        if (!globalThis._MFRemotes["${name}"]) {
          ${builtinsTemplate}
          globalThis._MFRemotes["${name}"] = rpcPerform("${config}").then(rpcProcess)
        }
        return globalThis._MFRemotes["${name}"];
      }())`,
    };
    return acc;
  }, {});
}

class NodeModuleFederation {
  constructor(config) {
    this._config = config;
  }
  apply(compiler) {
    new ModuleFederationPlugin({
      ...this._config,
      remotes: buildRemotes(this._config),
    }).apply(compiler);
  }
}

module.exports = NodeModuleFederation;