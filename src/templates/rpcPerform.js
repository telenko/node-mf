/**
 * rpcPerform(remoteUrl)
 */
module.exports = `
    function rpcPerform(remoteUrl) {
        const moduleName = remoteUrl.split("@")[0];
        const scriptUrl = remoteUrl.split("@")[1];
        return new Promise(function (resolve, reject) {
            rpcLoad(scriptUrl, function(error, scriptContent) {
                if (error) { reject(error); }
                //TODO using vm??
                const remote = eval(scriptContent + '\\n    try{' + moduleName + '}catch(e) { null; };');
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
