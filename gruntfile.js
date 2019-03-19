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

module.exports = function(grunt) {
    var moment = require('moment');
    var cfgfile = grunt.file.readJSON('secret.json');
    const webpackcfg = require('./webpack.config');
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        buildTime: grunt.template.today('yyyy-mm-dd HH-MM-ss'),
        webpack: {
            oprions: {
                stats: !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
            },
            prod: Object.assign({ mode: 'production' }, webpackcfg),
            dev: Object.assign({ watch: true, mode: 'development'}, webpackcfg)
        },
        compress: {
            dist: {
                options: {
                    archive: 'target/<%= pkg.name %> <%= pkg.version %> <%= buildTime %>.zip'
                },
                files: [
                    {expand: true, cwd: 'dist/', src: ['**'], dest: './'} 
                ]
            }
        },
        eslint: {
            options: {
                configFile: 'src/.eslintrc.js',
                failOnError: false
            },
            target: ['src/website.js', 'src/daemon.js', 'src/bootstrap.js', 'src/libraries/*.js', 'src/websites/*.js', 'src/dataproviders/*.js', 'src/pages/popup.js', 'src/pages/settings.js', 'src/auth/anilist.js']
        },
        zip_to_crx: {
            dist: {
                options: {
                    privateKey: 'keys/signing.pem' // openssl genrsa -out keys/signing.pem 2048
                },
                src: 'target/<%= pkg.name %> <%= pkg.version %> <%= buildTime %>.zip',
                dest: 'target/'
            }
        },
        webext_builder: {
            dist: {
                targets: ['firefox-xpi', 'chrome-crx'],
                privateKey: 'keys/signing.pem',
                jwtIssuer: cfgfile.issuer,
                jwtSecret: cfgfile.secret,
                files: {
                    'target':['build']
                }
            }
        }
    });
  
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-zip-to-crx');
    grunt.loadNpmTasks('grunt-webext-builder');
    grunt.loadNpmTasks('grunt-eslint');
  
    // Default task(s).
    grunt.registerTask('default', ['webpack:prod', 'compress', 'zip_to_crx']);
    grunt.registerTask('lint', ['eslint']);
    grunt.registerTask('build', ['webpack:prod', 'compress', 'webext_builder']);
    grunt.registerTask('watch', ['webpack:dev']);
  
  };