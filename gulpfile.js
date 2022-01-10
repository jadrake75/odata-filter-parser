/**
 Copyright 2022 Jason Drake

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

var gulp = require('gulp');
var eslint = require('gulp-eslint');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var jest = require('@jest/core');
var packageJson = require('./package.json');

var DESTINATION = 'dist';

async function testSrc() {
    const testResults =  await jest.runCLI({json: false, config: 'jest-config.js'},['test'])
    const { results } = testResults
    const isTestFailed = !results.success;
    if (isTestFailed) {
        console.log('You have some failed tests')
        process.exit() // Breaks Gulp Pipe
    }
    return;
}

gulp.task('compress', function() {
    return gulp.src('src/*.js')
        .pipe(concat('odata-parser-min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(DESTINATION));
});

gulp.task('copy', function() {
    return gulp.src('src/**')
        .pipe(concat('odata-parser.js'))
        .pipe(gulp.dest(DESTINATION));
});

gulp.task('eslint', function () {
    return gulp.src('src/**')
        .pipe(eslint({
            configFile: '.eslintrc'
        }))
        .pipe(eslint.format());
});

gulp.task('test', gulp.series(testSrc));


gulp.task('default', gulp.series('eslint', 'test', 'copy', 'compress'));
