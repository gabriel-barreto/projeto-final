const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const copy = require('gulp-copy');
const csscomments = require('gulp-strip-css-comments');
const cssmin = require('gulp-cssmin');
const eventStream = require('event-stream');
const gulp = require('gulp');
const htmlMin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const jshint = require('gulp-jshint');
const notify = require('gulp-notify');
const minify = require('gulp-minify');
const runSequence = require('run-sequence');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const stylish = require('jshint-stylish');
const uglify = require('gulp-uglify');
const uglifyCss = require('gulp-uglifycss');
const watch = require('gulp-watch');

//=============================================
//             >>> VARIABLES <<<
//=============================================

let vendorStylesheets = [];

let vendorScripts = [
    'node_modules/jquery/dist/jquery.min.js'
];

let fonts = [
    'src/stylesheets/fonts/Roboto/**'
];

let icons = [];

let appScripts = ['src/scripts/app.js'];

let myScripts = [];

//=================================================


//=================================================
//             >>> CLEAN FUNCTIONS <<<
//=================================================

gulp.task('clean:libjs', function() {
    return gulp.src('./dist/scritps/libAll.min.js').pipe(clean());
});

gulp.task('clean:appjs', function() {
    return gulp.src('./dist/scripts/appAll.min.js').pipe(clean());
});

gulp.task('clean:css', function() {
    return gulp.src('./dist/stylesheets/css/main.min.css').pipe(clean());
});

gulp.task('clean:index', function() {
    return gulp.src('./dist/index.html').pipe(clean());
});

gulp.task('clean:images', function() {
    return gulp.src('./dist/images/').pipe(clean());
});

gulp.task('clean:icons', function() {
    return gulp.src('./dist/icons/').pipe(clean());
});

gulp.task('clean:views', function() {
    return gulp.src('./dist/views/**/*.html').pipe(clean());
});

gulp.task('clean:dist', function() {
    return gulp.src('./dist').pipe(clean());
});

//=================================================

//=================================================
//             >>> TEST FUNCTIONS <<<
//=================================================

gulp.task('verify:app', function() {
    return gulp.src('./src/scripts/app/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

//=================================================


// =================================================
//      >>> COMPILE AND COMPRESS FUNCTIONS <<<
// =================================================
gulp.task('sass', ['clean:css'], function() {
    return eventStream.merge([
            gulp.src(vendorStylesheets),
            gulp.src('./src/stylesheets/scss/main.scss')
            .pipe(sass({ outputStyle: 'compressed' })
                .on('error',
                    notify.onError({ title: "Sass error", message: "<%= error.message %>" })
                )
            )
            .pipe(autoprefixer({ browsers: ['last 3 version'], cascade: false }))
        ])
        .pipe(sourcemaps.init())
        .pipe(concat('main.min.css'))
        .pipe(uglifyCss({ "maxLineLen": 80, "uglyComments": true }))
        .pipe(cssmin())
        .pipe(csscomments({ all: true }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/stylesheets/css/'))
        .pipe(browserSync.stream());
});

gulp.task('uglify:app', ['clean:appjs'], function() {
    return gulp.src(appScripts)
        .pipe(concat('appAll.min.js'))
        .pipe(uglify({ mangle: false }))
        .pipe(minify({ ext: '.js', mangle: false }))
        .pipe(gulp.dest('./dist/scripts'))
        .pipe(browserSync.stream());
});

gulp.task('uglify:lib', ['clean:libjs'], function() {
    return gulp.src(vendorScripts)
        .pipe(concat('libAll.min.js'))
        .pipe(uglify({ mangle: false }))
        .pipe(minify({ ext: '.js', mangle: false }))
        .pipe(gulp.dest('./dist/scripts'))
        .pipe(browserSync.stream());
});

gulp.task('compress:index', ['clean:index'], function() {
    return gulp.src('./src/index.html')
        .pipe(htmlMin({
            collapseWhitespace: true,
            minifyCSS: true,
            removeTagWhitespace: true
        })).pipe(gulp.dest('./dist'))
        .pipe(browserSync.stream());
});

gulp.task('compress:images', ['clean:images'], function() {
    return gulp.src('./src/images/**/*.*')
        .pipe(imagemin({
            interlaced: true,
            progressive: true,
            optimizationLevel: 5,
            svgoPlugins: [{ removeViewBox: true }]
        })).pipe(copy('./dist/', { prefix: 1 }))
        .pipe(browserSync.stream());
});

gulp.task('compress:views', ['clean:views'], function() {
    return gulp.src('./src/views/**/*.html')
        .pipe(htmlMin({
            collapseWhitespace: true,
            minifyCSS: true,
            removeTagWhitespace: true
        })).pipe(gulp.dest('./dist/views/'))
        .pipe(browserSync.stream());
});

// =================================================


//=================================================
//             >>> SERVER FUNCTIONS <<<
//=================================================

gulp.task('server', function() {
    browserSync.init({ injectChanges: true, server: "./dist" });
});

// =================================================


//=================================================
//             >>> COPY FUNCTIONS <<<
//=================================================

gulp.task('copy:fonts', function() {
    gulp.src(fonts).pipe(copy('./dist', { prefix: 1 }));
    //gulp.src('node_modules/font-awesome/fonts/*.*').pipe(copy('./dist/stylesheets/fonts', { prefix: 3 }));
    gulp.src('src/assets/font-awesome/fonts/**').pipe(copy('./dist/stylesheets', { prefix: 3 }));
});

gulp.task('copy:icons', function() {
    gulp.src(icons).pipe(copy('./dist', { prefix: 1 }));
});

gulp.task('copy:images', function() {
    gulp.src('./src/images/**').pipe(copy('./dist', { prefix: 1 }));
});

// ================================================= 

gulp.task('default', ['copy:fonts', 'copy:images', 'copy:icons', 'uglify:lib', 'compress:index', 'compress:views', 'sass', 'uglify:app'], function() {
    gulp.watch('./src/index.html', ['compress:index']);
    gulp.watch('./src/views/**/*.html', ['compress:views']);
    gulp.watch('./src/stylesheets/scss/**/*.*', ['sass']);
    gulp.watch('./src/scripts/**/*.js', ['uglify:app']);
    gulp.watch('./src/images/**/*.*', ['copy:images']);
    gulp.watch('./src/icons/**/*.*', ['copy:icons']);
});