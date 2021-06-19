# Library is a set of webpack plugins which gives support of Module Federation into NodeJS

## Usage example with NextJS https://github.com/telenko/node-mf-example

## Purpose of creating
Release of [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/) really have made a shift in modern architecture of web applications. But what about NodeJS and such frameworks like [Next](https://nextjs.org/)? What about SSR? I see for now a gap in webpack, so pure ModuleFederation plugin can not be used inside NodeJS environment. Muliple examples of NextJS+MF here https://github.com/module-federation/module-federation-examples with NextJS using only client-side rendering or not using remote deployed build at all.

## What I can propose
I have implemented 2 plugins for webpack:
1) **NodeAsyncHttpRuntime** - Plugin which should be used on a remote side to build remote scripts for NodeJS. But the main key of plugin is resolution of modules - it is done via http requests, so NodeJS can dynamically resolve child modules, load them and perform.
2) **NodeModuleFederation** - Plugin is wrapper around origin WebpackModuleFederation plugin and adds NodeJS specific resolution of remote modules (same thing: resolution is done via http requests)

## Getting started
### 1) On remote library:

  1.1) Install package (remote can be either pure JS application or NodeJS application - doesn't matter)
    ```
    npm i --save-dev @telenko/node-mf
    ```

  1.2. Customize webpack configuration, so it should now build 2 targets: for web (if you want legacy browser build) and for node (webpack for now doesn't support universal targets)

  1.3) For node build add **NodeAsyncHttpRuntime** plugin and set webpack's 'target' flag to false

```js
    //pseudocode
    module.exports = [
        {
            target: "web",
            ...webOptionsWebpack
        },
        {
            target: false,
            plugins: [
                new NodeAsyncHttpRuntime() //this is instead of target to make it work
            ],
            ...nodeOptionsWebpack
        }
    ];
```

  1.4) Serve both builds

Full example is here https://github.com/telenko/node-mf-example/blob/master/remoteLib/webpack.config.js

### 2) On NodeJS application:

  2.1) Install library 
    ```
    npm i --save-dev @telenko/node-mf
    ```

  2.2) Add **NodeModuleFederation** plugin to the webpack config (api parameters schema is same)
  **!Note, remote script url should point to 'node' build (which should be built with NodeAsyncHttpRuntime)**

  ```js
    module.exports = {
        plugins: [
            new NodeModuleFederation({
                remotes: {
                    someLib: "someLib@http://some-url/remoteEntry.node.js"
                },
                shared: {
                    lodash: {
                        eager: true,
                        singleton: true,
                        requiredVersion: "1.1.2"
                    }
                }
            })
        ],
        ...otherWebpackOptions
    };
  ```

Full example of setuping NextJS with SSR here https://github.com/telenko/node-mf-example/blob/master/host/next.config.js

## Aren't 2 build makes build-time 2 times longer?
Yes, if we speak about NextJS and SSR - we need both builds: for web and for node, and we have to start entire build separately without sharing built chunks. That will increase build time 2 times.
## Security
Since NodeJS out of the box doesn't support remote scripts execution (like in browser we can add <script> tag) it looks like a hack calling http request then 'eval'-ing it. I'm not sure if it is safe to add remote script execution on server side, but it is the only one possible way to make it on server.