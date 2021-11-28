const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const { VueLoaderPlugin } = require("vue-loader");

module.exports = {
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, '../js'),
        filename: 'app.bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: [/node_modules/, /dist/],
                query: {
                    presets: ['es2015']
                }
            }, {
                test: /\.html/,
                loader: 'handlebars-loader',
                query: {
                    extensions: '.html',
                    helperDirs: path.resolve(__dirname, 'components/helpers'),
                    precompileOptions: {
                        knownHelpersOnly: false,
                    },
                }
            }, {
                test: /\.vue$/,
                loader: 'vue-loader'
            }, {
                test: /public\/.\.js$/,
                loader: 'file'
            }
        ]
    },
    resolve: {
        modules: [path.resolve(__dirname), 'node_modules'],
        alias: {
            handlebars: 'handlebars/runtime.js',
            vue$: 'vue/dist/vue.runtime.esm.js',
        },
        extensions: ["*", ".js", ".vue", ".json"],
    },
    stats: {
        colors: true
    },
    mode: 'development',
    devtool: '#source-map',
    plugins: [
        new VueLoaderPlugin(),
        new CleanWebpackPlugin([path.resolve(__dirname, '../js')]),
        new CopyWebpackPlugin([
            {
                from: 'public',
                to: 'public'
            }
        ]),
        new webpack.DefinePlugin({
            __CLIENT__: true,
            __SERVER__: false,
            __DEVELOPMENT__: false,
            __DEVTOOLS__: false
        }),
        new webpack.ProvidePlugin({
            jQuery: 'jquery',
            $: 'jquery'
        })
    ]
};
