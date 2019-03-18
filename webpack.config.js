/*
    This file is part of Scrobbly.

    Scrobbly is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Scrobbly is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Scrobbly.  If not, see <https://www.gnu.org/licenses/>.
*/

const webextplugin = require('webpack-webextension-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    mode: process.env.NODE_ENV,
    context: path.resolve(__dirname, 'src'),
    entry: {
        daemon: './bootstrap.js',
        website: './website.js',
        popup: './pages/popup.js',
        settings: './pages/settings.js',
        anilist: './auth/anilist.js'
    },
    output: {
        filename: '[name].js',
        path: __dirname + '/dist'
    },
    module: {
        rules: [
            { test: /\.scss$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'] },
            { test: /\.css$/, use: 'css-loader' },
            // { test: /\.html$/, use: 'html-loader' },
            {
                test: /\.(woff(2)?|ttf|eot|svg|png|gif)(\?v=\d+\.\d+\.\d+)?$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'fonts/'
                    }
                }]
            }
        ]
    },
    plugins: [
        new webextplugin({
            vendor: 'chrome'
        }),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            path: __dirname + '/dist'
        }),
        new CopyPlugin([
            { from: '_locales/**', to: __dirname + '/dist/' },
            { from: 'pages/img', to: __dirname + '/dist/img' },
            { from: 'logos', to: __dirname + '/dist/logos' },
            { from: 'pages/*.html', to: __dirname + '/dist' }
        ])
    ]
}