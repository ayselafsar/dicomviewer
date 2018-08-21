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
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: [/node_modules/, /dist/],
                query: {
                    presets: ['es2015']
                }
            }, {
                test: /public\/.\.js$/,
                loader: 'file'
            }
        ]
    },
    resolve: {
        alias: {
            handlebars: 'handlebars/dist/handlebars.min.js',
        }
    },
    stats: {
        colors: true
    },
    devtool: 'source-map',
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
        })
    ]
};
