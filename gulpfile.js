/* ------------------------------------------------------------------------ *
 * Gulp Packages
 * ------------------------------------------------------------------------ */

var gulp            = require('gulp'); 

var autoprefixer    = require('gulp-autoprefixer');
var concat          = require('gulp-concat');
var del             = require('del');
var minifyCSS       = require('gulp-minify-css');
var runSequence     = require('run-sequence');
var sass            = require('gulp-ruby-sass');
var uglify          = require('gulp-uglify');

/*
https://github.com/sindresorhus/gulp-autoprefixer
https://www.npmjs.com/package/gulp-autoprefixer
Browser List for Autoprefixer https://github.com/ai/browserslist
https://github.com/wearefractal/gulp-concat
https://www.npmjs.com/package/gulp-concat
https://www.npmjs.com/package/del
https://github.com/sindresorhus/del
https://www.npmjs.com/package/gulp-minify-css
https://github.com/jonathanepollack/gulp-minify-css
https://github.com/OverZealous/run-sequence
https://www.npmjs.com/package/run-sequence
https://github.com/sindresorhus/gulp-ruby-sass/tree/rw/1.0
https://www.npmjs.com/package/gulp-ruby-sass
https://github.com/terinjokes/gulp-uglify
https://www.npmjs.com/package/gulp-uglify
https://github.com/terinjokes/gulp-uglify/issues/56
*/


/* ------------------------------------------------------------------------ *
 * Local
 * 
 * gulp
 *
 * Compile SASS.
 * ------------------------------------------------------------------------ */

/**
 * Compile our SASS, autoprefix.
 * Doesn't support globs hence the return sass rather than gulp.src.
 */
gulp.task('styles', function() {
    return sass('sass', { style: 'expanded' })
    .on('error', function (err) {console.error('SASS Error - ', err.message);})
    .pipe(autoprefixer({browsers: ['last 5 versions']}))
    .pipe(gulp.dest('css'));
});


/**
 * Watch files for changes.
 */
gulp.task('watch', function() {
    gulp.watch('sass/*.scss', ['styles']);
});


/**
 * Set up default (local) task.
 */
gulp.task('default', function() {
    runSequence('styles', 
                'watch'
    );
})


/* ------------------------------------------------------------------------ *
 * Dist
 * 
 * gulp dist
 *
 * Move all applicable files and folders.
 * Minify CSS, Autoprefix.
 * Minify JS.
 * ------------------------------------------------------------------------ */

/**
 * Delete all contents of dist folder.
 */
gulp.task('dist-clean', function (cb) {
    del('dist/*', cb);
});


/**
  * Move root .php files.
  */
gulp.task('dist-move-files', function() {
    return gulp.src('*.php')
        .pipe(gulp.dest('dist'));
});


/**
  * Move root directories and their contents.
  * Move img only.
  * No sourcemaps used so no need to move css and js folders.
  */
gulp.task('dist-move-dir', function() {
    return gulp.src('img/**', { base: './'} )
        .pipe(gulp.dest('dist'));
});


/**
 * Compile our SASS, autoprefix.
 * Doesn't support globs hence the return sass rather than gulp.src.
 */
gulp.task('dist-styles', function() {
    return sass('sass', { style: 'compressed' })
    .on('error', function (err) {console.error('SASS Error - ', err.message);})
    .pipe(autoprefixer({browsers: ['last 5 versions']}))
    .pipe(gulp.dest('dist/css'));
});


/**
 * Minify JS.
 */
gulp.task('dist-scripts', function() {
    return gulp.src(['js/*.js', 'bower_components/flickity/dist/flickity.pkgd.js'])
    .pipe(concat('scripts.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});


/**
 * Set up dist task.
 */
gulp.task('dist', function() {
    runSequence('dist-clean', 
                'dist-move-files', 
                'dist-move-dir', 
                'dist-styles', 
                'dist-scripts'
            );
})
