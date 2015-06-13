var gulp = require('gulp');
var concat = require('gulp-concat');
var del = require('del');
var uglify = require('gulp-uglify');
var jasmine = require('gulp-jasmine');
var cover = require('gulp-coverage');
var lazypipe = require('lazypipe');

gulp.task('clean', function() {
    del(['dist/*', 'reports', 'debug', '.coverdata']);
});

gulp.task('build', ['clean'], function() {
    gulp.src(['src/logging-enhancer.js', 'src/angular-logger.js'])
        .pipe(uglify())
        .pipe(concat("logger.min.js"))
        .pipe(gulp.dest('dist'));
});

var testAndGather = lazypipe()
    .pipe(cover.instrument, {
        pattern: ['src/**/*.js'],
        debugDirectory: 'debug'
    })
    .pipe(jasmine, {includeStackTrace: true})
    .pipe(cover.gather);

gulp.task('test', ['build'], function () {
    gulp.src('spec/**/*spec.js')
        .pipe(testAndGather())
        .pipe(cover.format(['html']))
        .pipe(gulp.dest('reports'));
});

gulp.task('default', ['build'], function() {
    // place code for your default task here
});