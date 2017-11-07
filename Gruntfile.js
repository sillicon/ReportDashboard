module.exports = function(grunt) {
    
      // Project configuration.
      grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
          options: {
            mangle: {
                toplevel: true
            },
            banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
          },
          router: {
            src: 'routes/*.js',
            dest: 'build/router.min.js'
          },
          frontJS: {
            files : {
                'build/js/home.min.js': 'public/js/home.js',
                'build/js/readReport.min.js': 'public/js/readReport.js',
                'build/js/uploadReport.min.js': 'public/js/uploadReport.js'
            }
          }
        }
      });
    
      // Load the plugin that provides the "uglify" task.
      grunt.loadNpmTasks('grunt-contrib-uglify');
    
      // Default task(s).
      grunt.registerTask('default', ['uglify']);
    
    };