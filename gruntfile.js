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
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        buildTime: grunt.template.today('yyyy-mm-dd HH-MM-ss'),
        browserify: {
            dist: {
                files: {
                    'build/bootstrap.bundle.js': 'src/bootstrap.js',
                    'build/website.bundle.js': 'src/website.js',
                    'build/pages/popup.bundle.js': 'src/pages/popup.js',
                    'build/pages/settings.bundle.js': 'src/pages/settings.js',
                    'build/auth/anilist.bundle.js': 'src/auth/anilist.js'
                }
            },
            dev: {
                files: {
                    'src/bootstrap.bundle.js': 'src/bootstrap.js',
                    'src/website.bundle.js': 'src/website.js',
                    'src/pages/popup.bundle.js': 'src/pages/popup.js',
                    'src/pages/settings.bundle.js': 'src/pages/settings.js',
                    'src/auth/anilist.bundle.js': 'src/auth/anilist.js'
                }
            }
        },
        copy: {
            dist: {
                files: [
                    {expand: true, cwd: 'src/', src: ['**'], dest: 'build/', filter: function(filepath) {
                        return !/bundle\.js/.test(filepath);
                    }}
                ]
            }
        },
        compress: {
            dist: {
                options: {
                    archive: 'target/<%= pkg.name %> <%= pkg.version %> <%= buildTime %>.zip'
                },
                files: [
                    {expand: true, cwd: 'build/', src: ['**'], dest: './'} 
                ]
            }
        },
        eslint: {
            options: {
                configFile: 'src/.eslintrc.js',
                failOnError: false
            },
            target: ['src/website.js', 'src/daemon.js', 'src/bootstrap.js', 'src/libraries/*.js', 'src/websites/*.js', 'src/pages/popup.js', 'src/pages/settings.js', 'src/auth/anilist.js']
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
        watch: {
            js: {
                files: ['src/*.js', 'src/websites/*.js', 'src/libraries/*.js', 'src/pages/settings.js'],
                tasks: ['browserify:dev']
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
  
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-zip-to-crx');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-webext-builder');
    grunt.loadNpmTasks('grunt-eslint');
  
    // Default task(s).
    grunt.registerTask('default', ['copy', 'browserify:dist', 'compress', 'zip_to_crx']);
    grunt.registerTask('lint', ['eslint']);
    grunt.registerTask('build', ['copy', 'browserify:dist', 'compress', 'webext_builder']);
  
  };