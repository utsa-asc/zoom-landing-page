var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var ssi         = require('browsersync-ssi');
//var uncss       = require('gulp-uncss');
var sass        = require('gulp-sass');
var useref      = require('gulp-useref');
var uglify      = require('gulp-uglify');
var gulpIf      = require('gulp-if');
var postcss     = require('gulp-postcss');
var sourcemaps  = require('gulp-sourcemaps');
var cssnano     = require('cssnano');
var uncss = require('postcss-uncss');
var autoprefixer = require('autoprefixer');

//var autoprefixer = require("gulp-autoprefixer");
var replace     = require('gulp-replace');
var reload      = browserSync.reload;
var Promise     = require('promise-polyfill');

var src = {
    scss: 'app/styles/**/*.scss',
    scss_top: 'app/styles/*.scss',
    scss_dir: ['app/styles/**'],
    css:  '{app/css/*.css,app/**/css/*.css}',
    html: ['app/*.html'],
    js: ['app/js/*.js']
};

// Compile sass into CSS
gulp.task('sass-compile', function () {
  return gulp.src(src.scss_top)
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({stream:true}));
});

browserSync.emitter.on("service:running", function () {
    console.log("Ready");
});

// Static Server + watching scss/html files
gulp.task('dist-serve', function() {
  browserSync.init({
      server: {
          baseDir: './dist',
          middleware: ssi({
            baseDir:  __dirname + '/dist',
            ext: '.html',
          }),
          routes : {
            '/node_modules' : './node_modules'
          }
      },
      port: 5000,
      notify: true,
      open: false,
      logLevel: "silent"
  });
});

gulp.task('serve', function(cb) {
  browserSync.init({
    server: {
      baseDir: './app',
      middleware: ssi({
        baseDir:  __dirname + '/app',
        ext: '.html',
      }),
      routes : {
        '/node_modules' : './node_modules'
      }
    },
    port: 3000,
    notify: true,
    open: false
  });

  gulp.watch(src.scss_dir).on('change', gulp.series('sass-compile', function(done) {
    done();
  }));
  gulp.watch(src.html).on('change', reload);
  gulp.watch(src.js).on('change', reload);
  gulp.watch(src.css).on('change', reload);
  gulp.watch(src.scss).on('change', reload);
});

gulp.task('useref', function() {
  var plugins = [
    autoprefixer({cascade: false}),
    uncss( {html: ['app/index.html']}),
    cssnano()
  ];

  return gulp.src([
    'app/index.html'
  ])
  .pipe(useref())
  // Minifies only if it's a JavaScript file
  //.pipe(gulpIf('*.js', uglify()))
  //.pipe(gulpIf('*.css', autoprefixer({cascade: false})))
  //.pipe(gulpIf('*.css', cssnano()))
  .pipe(gulpIf('*.css', sourcemaps.init()))
  .pipe(gulpIf('*.css', postcss(plugins)))
  .pipe(gulpIf('*.css', sourcemaps.write('.')))
  .pipe(gulp.dest('dist'))
});

gulp.task('default', gulp.series('serve', function(done) {
  done();
}));

gulp.task('build', gulp.series('sass-compile', 'useref', function(done) {
  done();
}));
