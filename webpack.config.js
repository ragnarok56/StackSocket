var path = require("path");
var webpack = require('webpack');

var bundlePath = './build';

module.exports = {
    context: __dirname,
    entry: {
        app: './src/test.js'
    },
    output: {
        path: path.resolve(bundlePath),
        filename: "[name]-[hash].js"
    },

    plugins: [
        new webpack.ProvidePlugin({
            jQuery: 'jquery',
            $: 'jquery'
        })
    ],

    module: {
        loaders: [
            {test: /\.css$/, loader: "style-loader!css-loader"},
            {test: /\.scss$/, loader: "style-loader!css-loader!sass-loader"},
            {test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel', // 'babel-loader' is also a valid name to reference
                query: {
                    presets: ['es2015', 'react']
                }
            }
        ]
    },
    
    watchOptions: {
        poll: true
    }
};