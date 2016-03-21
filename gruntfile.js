module.exports = function (grunt) {
    grunt.initConfig({
        uglify: {
            options: {},
            dist: {
                files: {
                    'build/responsive.classes.js': [
                        'src/index.js',
                        'src/responsive.js',
                        'src/attribute.monitor.js'
                    ]
                }
            }
        }
    });

    // Load the modules
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Create the tasks
    grunt.registerTask('build', ['uglify:dist']);
    grunt.registerTask('default', ['build']);
};
