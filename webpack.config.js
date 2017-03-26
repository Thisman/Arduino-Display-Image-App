'use strict';
const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'script.js',
        path: path.resolve('dist'),
    },
    module: {
        rules: [
            {
                test: /\.js$/, 
                exclude: /node_modules/, 
                loader: "babel-loader",
                options: {
                    "compact": false,
                    "presets": [
                        "babel-preset-react",
                        [
                            "babel-preset-env", 
                            {
                                "targets": {
                                    "chrome": 57,
                                }
                            }
                        ]
                    ],
                    "plugins": [
                        "babel-plugin-transform-object-rest-spread", // спреад оператор (...a)
                    ]
                }
            },

            {
                test: /\.s?css$/,
                loader: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    loader: [{loader: "css-loader"}]
                })
            }
        ]
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        }),
        new ExtractTextPlugin({
            filename: 'style.css',
            allChunks: true
        }),
    ]
};