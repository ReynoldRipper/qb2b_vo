  let preprocessor = 'sass';
  const {
      src,
      dest,
      parallel,
      series,
      watch
  } = require('gulp');
  const concat = require('gulp-concat');
  const uglify = require('gulp-uglify-es').default;
  const browserSync = require('browser-sync').create();
  const sass = require('gulp-sass');
  const autoprefixer = require('gulp-autoprefixer');
  const cleancss = require('gulp-clean-css');
  const imagemin = require('gulp-imagemin');
  const del = require('del');
  const newer = require('gulp-newer');
  const webp = require('gulp-webp');
  const gulp = require('gulp');
  //   const svgSprite = require('gulp-svg-sprite');
  const gcmq = require('gulp-group-css-media-queries');

  function browsersync() {
      browserSync.init({
          server: {
              baseDir: 'app/'
          },
          notify: false
      })
  }

  function scripts() {
      return src([
              'app/js/app.js',
          ])
          .pipe(concat('app.min.js'))
          .pipe(uglify())
          .pipe(dest('app/js/'))
          .pipe(dest('../assets/js/'))
          .pipe(browserSync.stream())
  }

  function styles() {
      return src('app/' + preprocessor + '/main.scss')
          .pipe(eval(preprocessor)())
          .pipe(concat('style.min.css'))
          .pipe(autoprefixer({
              overrideBrowserslist: ['last 10 versions'],
              grid: true
          }))
          .pipe(cleancss({
              level: {
                  1: {
                      specialComments: 0
                  }
              }
          }))
          .pipe(gcmq())
          .pipe(dest('../assets/css/'))
          .pipe(dest('../assets/css/'))
          .pipe(browserSync.stream())
  }

  function styles_bootstrap() {
      return src('app/' + preprocessor + '/bootstrap-build.scss')
          .pipe(eval(preprocessor)())
          .pipe(concat('bootstrap.min.css'))
          .pipe(autoprefixer({
              overrideBrowserslist: ['last 10 versions'],
              grid: true
          }))
          .pipe(cleancss({
              level: {
                  1: {
                      specialComments: 0
                  }
              }
          }))
          .pipe(dest('app/css/'))
          .pipe(dest('../assets/css/'))
          .pipe(browserSync.stream())
  }

  function img() {
      return src('app/img/src/**/*')
          .pipe(newer('app/img/dest/'))
          .pipe(imagemin())
          .pipe(dest('app/img/dest/'))
  }

  function cleanimg() {
      return del('app/img/dest/**/*', {
          force: true
      })
  }

  function buildcopy() {
      return src([
              'app/css/**/*.min.css',
              'app/js/**/*.min.js',
              'app/img/dest/**/*',
              'app/**/*.html',
          ], {
              base: 'app'
          })
          .pipe(dest('dist'))
  }

  function cleandist() {
      return del('dist/**/*', {
          force: true
      })
  }

  function startwatch() {

      watch(['app/**/*.js', '!app/**/*.min.js'], scripts);
      watch('app/**/' + preprocessor + '/**/*', styles);
      watch('app/**/*.html').on('change', browserSync.reload);
      watch('app/img/src/**/*', img);

  }

  function webpEncode() {
      return src('app/img/dest/**/*')
          .pipe(webp())
          .pipe(gulp.dest('app/img/dist'))
  }

  function spriteCopile() {
      var config = {
          shape: {
              dimension: { // Set maximum dimensions
                  maxWidth: 32,
                  maxHeight: 32
              },
              spacing: { // Add padding
                  padding: 10
              },
          },
          mode: {
              view: { // Activate the «view» mode
                  bust: false,
                  render: {
                      scss: true // Activate Sass output (with default options)
                  }
              },
              symbol: true // Activate the «symbol» mode
          }
      };
      return src('**/*.svg', {
              cwd: 'app/img'
          })
          //   .pipe(svgSprite(config))
          .pipe(gulp.dest('app/img/dest'));
  }


  gulp.task('webp', () =>
      gulp.src('app/img/dest/**/*')
      .pipe(webp())
      .pipe(gulp.dest('app/img/dist'))
  );

  exports.browsersync = browsersync;
  exports.scripts = scripts;
  exports.styles = styles;
  exports.styles_bootstrap = styles_bootstrap;
  exports.img = img;
  exports.cleanimg = cleanimg;
  exports.webpEncode = webpEncode;
  //   exports.spriteCopile = spriteCopile;
  exports.build = series(cleandist, styles, styles_bootstrap, scripts, img, buildcopy);
  exports.default = parallel(styles, styles_bootstrap, scripts, browsersync, img, startwatch, webpEncode);