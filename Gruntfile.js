/** Gruntfile for [@creatartis/randomness](http://github.com/LeonardoVal/randomness.js).
*/
module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
	});

	require('@creatartis/creatartis-grunt').config(grunt, {
		globalName: 'randomness',
		sourceNames: ['__prologue__',
				'Randomness',
				'generators/LinearCongruential', 
				'generators/MersenneTwister',
			'__epilogue__'],
		deps: [],
		jshint: { loopfunc: true, boss: true, evil: true, proto: true },
		karma: ['Firefox', 'Chrome']
	});

	grunt.registerTask('full-test', ['test', 'karma:test_chrome']);
	grunt.registerTask('default', ['build']);
};
