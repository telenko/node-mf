/**
 * rpcLoadFromBaseURI(baseURI, fileName, cb)
 */
module.exports = `
    function rpcLoadFromBaseURI(baseURI, fileName, cb) {
        var url = new URL(arguments[1], arguments[0]).toString();
        if (typeof cb !== "function") {
            throw new Error("last argument should be a function");
        }
        //TODO https support
        let request = (url.startsWith('https') ? require('https') : require('http')).get(url, function(resp) {
            if (resp.statusCode === 200) {
                let rawData = '';
                resp.setEncoding('utf8');
                resp.on('data', chunk => { rawData += chunk; });
                resp.on('end', () => {
                    cb(null, rawData);
                });
            } else {
                cb(resp);
            }
        });
        request.on('error', error => cb(error));
    }
`;
