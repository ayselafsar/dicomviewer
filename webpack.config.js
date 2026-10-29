const webpackConfig = require('@nextcloud/webpack-vue-config');
const webpackCopyPlugin = require('copy-webpack-plugin');
const path = require('path');

// Keep "acanio-viewer" dist in the js folder
webpackConfig.output.clean = false;

// vue-loader 15's prettify option is not valid for the Vue 3 compiler.
webpackConfig.module.rules = webpackConfig.module.rules.map((rule) => {
    if (rule.loader !== 'vue-loader') {
        return rule;
    }
    const { options, ...rest } = rule;
    return rest;
});

webpackConfig.plugins.push(
    new webpackCopyPlugin({
        patterns: [
            { from: 'src/public', to: 'public' },
            { from: 'acanio-viewer/platform/app/dist', to: 'public/viewer' },
        ],
    }),
);

webpackConfig.entry.public = path.resolve(path.join('src', 'public.js'));

webpackConfig.entry.sidebar = path.resolve(path.join('src', 'sidebar-init.js'));

module.exports = webpackConfig;
