module.exports = function(grunt) {
    var moment = require('moment');
    var cfgfile = grunt.file.readJSON('secret.json');
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
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
                    archive: 'target/<%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %>.zip'
                },
                files: [
                    {expand: true, cwd: 'build/', src: ['**'], dest: './'} 
                ]
            }
        },
        zip_to_crx: {
            dist: {
                options: {
                    privateKey: 'keys/signing.pem' // openssl genrsa -out keys/signing.pem 2048
                },
                src: 'target/<%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %>.zip',
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
  
    // Default task(s).
    grunt.registerTask('default', ['copy', 'browserify:dist', 'compress', 'zip_to_crx']);
    grunt.registerTask('build', ['copy', 'browserify:dist', 'compress', 'webext_builder']);
  
  };