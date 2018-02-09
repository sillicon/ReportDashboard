module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        uglify: {
            options: {
                mangle: {
                    toplevel: true
                },
                banner: "/*! <%= pkg.name %> <%= grunt.template.today(\"yyyy-mm-dd\") %> by <%= pkg.author %> */\n"
            },
            router: {
                files: {
                    "build/js/router/getTestName.js": "routes/getTestName.js",
                    "build/js/router/githubLogin.js": "routes/githubLogin.js",
                    "build/js/router/queryReports.js": "routes/queryReports.js",
                    "build/js/router/uploadReport.js": "routes/uploadReport.js",
                    "build/js/router/app.js": "app.js"
                }
            },
            frontJS: {
                files: {
                    "build/js/front/home.js": "public/js/home.js",
                    "build/js/front/readReport.js": "public/js/readReport.js",
                    "build/js/front/uploadReport.js": "public/js/uploadReport.js"
                }
            }
        },
        cssmin: {
            options: {
                mergeIntoShorthands: false,
                roundingPrecision: -1
            },
            target: {
                files: {
                    "build/css/Home.css": "public/css/Home.css",
                    "build/css/main.css": "public/css/main.css"
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-cssmin");

    // Default task(s).
    grunt.registerTask("default", ["uglify", "cssmin"]);
};