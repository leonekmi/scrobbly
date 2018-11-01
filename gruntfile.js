module.exports = function(grunt) {
    var moment = require('moment');
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            dist: {
                files: {
                    'build/bootstrap.bundle.js': 'src/bootstrap.js',
                    'build/website.bundle.js': 'src/website.js',
                    'build/pages/popup.bundle.js': 'src/pages/popup.js'
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
        }
    });
  
    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-zip-to-crx');
  
    // Default task(s).
    grunt.registerTask('default', ['copy', 'browserify', 'compress', 'zip_to_crx']);
  
  };