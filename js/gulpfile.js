const gulp = require('gulp');
const del = require('del');
const babel = require("gulp-babel");

gulp.task('clean', function(){
    return del('dist/**/*.*', {force:true});
});

gulp.task('build', function() {
    return gulp.src([
        '**/*.js',
        '!dist/**/*.*',
        '!node_modules/**/*.*',
        '!gulpfile.js'
    ])
        .pipe(babel())
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['clean', 'build']);
