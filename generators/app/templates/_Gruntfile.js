'use strict';

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-env');

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: true,
                ignores: ['node_modules/**/*']
            },
            all: ['./**/*.js']
        },

        jscs: {
            src: './**/*.js',
            options: {
                config: '.jscsrc',
                excludeFiles: ['node_modules/**/*']
            }
        },

        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                }
            },
            src: ['./**/*Test.js']
        },

        env: {
            test: {
                NODE_ENV: 'test'
            }
        }
    });

    grunt.registerTask('lint', ['jshint', 'jscs']);
    grunt.registerTask('test', ['env:test', 'mochaTest']);
};
