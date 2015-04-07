/**
 * Created by Tim on 6/13/14.
 */

module.exports = function(grunt){
    // Configuration here
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        cssmin: {
            minify: {
                expand: true,
                cwd: 'resources/css/',
                src: ['*.css', '!*.min.css'],
                dest: 'public/stylesheets/',
                ext: '.min.css'
            }
        },
        jshint: {
            options: {
                strict: false
            },
            all: ['GruntFile.js', 'resources/js/<%= pkg.name %>.js']
        },
        uglify: {
			my_target: {
			  files: [{
				  expand: true,
				  cwd: 'resources/js/',
				  src: '*.js',
				  dest: 'public/javascripts/',
				  ext: '.min.js'
			  }]
			}
        },
        smushit: {
            path: {
				expand: true,
				cwd: 'resources/img/',
                src: '*.png',
				dest: 'public/images/'
            }
        }
		/*
		copy: {
			main: {
				src: 'Dev/index.html',
				dest: 'Production/index.html'
			},
		}
		*/
    });

    // Plugins here
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
	//grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-smushit');

    // Tasks here -- can have more than one task
    //grunt.registerTask('default', ['cssmin', 'jshint', 'uglify', 'smushit', 'copy']);
	grunt.registerTask('default', ['cssmin', 'jshint', 'uglify', 'smushit']);
};
