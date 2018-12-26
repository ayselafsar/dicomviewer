const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
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
                test: /public\/.\.js$/,
                loader: 'file'
            }
        ]
    },
    resolve: {
        modules: [path.resolve(__dirname), 'node_modules'],
        alias: {
            handlebars: 'handlebars/runtime.js'
        }
    },
    stats: {
        colors: true
    },
    mode: 'development',
    devtool: '#source-map',
    plugins: [
        new CleanWebpackPlugin(['dist']),
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
