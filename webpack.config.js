const webpackConfig = require('@nextcloud/webpack-vue-config');
const webpackCopyPlugin = require('copy-webpack-plugin');
const path = require('path');

// Keep "acanio-viewer" dist in the js folder
webpackConfig.output.clean = false;

webpackConfig.plugins.push(
    new webpackCopyPlugin({
        patterns: [
            { from: 'src/public', to: 'public' },
            { from: 'acanio-viewer/platform/app/dist', to: 'public/viewer' },
        ],
    }),
);

webpackConfig.entry.public = path.resolve(path.join('src', 'public.js'));

module.exports = webpackConfig;
