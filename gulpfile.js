/**
 * gulp demo
 *
 * by kele527
 */

//var gulp = require('gulp');
//加载gulp-load-plugins插件，并马上运行它
//var plugins = require('gulp-load-plugins')();

var del=require('del');
var gulp=require('gulp');
var uglify=require('gulp-uglify');
var mincss=require('gulp-clean-css');//css压缩
var inline=require('gulp-inline-source'); //资源内联 （主要是js，css，图片）
var include=require('gulp-include'); //资源内联（主要是html片段）
var sequence=require('gulp-sequence');
var useref=require('gulp-useref'); //合并文件
var gulpif=require('gulp-if');
var print=require('gulp-print'); //打印命中的文件
var connect=require('gulp-connect'); //本地服务器

var livereload=require('gulp-livereload'); //页面刷新
var concat = require('gulp-concat');//文件合并
var rename = require('gulp-rename');//文件更名
var imagemin=require('gulp-imagemin');//图片压缩
var jshint=require('gulp-jshint');//js代码校验
var spriter=require('gulp-css-spriter');//雪碧图生成


//清理构建目录
gulp.task('clean',function (cb) {
    del(['dist']).then(function () {
        cb()
    })
});

//压缩css
gulp.task('mincss',function () {
    return gulp.src('./src/css/*.css')
        .pipe(mincss())
        .pipe(gulp.dest('dist/css'))
});

//压缩js
gulp.task('minjs',function () {
    return gulp.src('./src/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
});

//检查js
gulp.task('jshint', function() {
    return gulp.src('src/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

//压缩图片
gulp.task('minimage',function(){
	return gulp.src('./src/images/*.png')
	.pipe(imagemin())
	.pipe(gulp.dest('dist/img'))
});


gulp.task('spriter', function() {
    return gulp.src('./src/css/img.css')
        .pipe(spriter({
            'spriteSheet': './dist/img/sprite.png',
            'pathToSpriteSheetFromCSS': '../img/sprite.png'
        }))
        .pipe(gulp.dest('./dist/css')); 
});



gulp.task('html', function () {
    return gulp.src('./src/asset/*.html')
        .pipe(inline())//把js内联到html中
        .pipe(include())//把html片段内联到html主文件中
        .pipe(useref())//根据标记的块  合并js或者css
        .pipe(gulpif('*.js',uglify()))
        .pipe(gulpif('*.css',mincss()))
        .pipe(connect.reload()) //重新构建后自动刷新页面
        .pipe(gulp.dest('dist'));
});

//本地服务器  支持自动刷新页面
gulp.task('connect', function() {
    connect.server({
        root: './dist', //本地服务器的根目录路径
        port:8080,
        livereload: true
    });
});

gulp.task('watchlist',function (cb) {
    sequence('clean',['spriter','jshint','minimage','mincss','minjs','html'])(cb)
});

gulp.task('watch',function () {
    gulp.watch(['./src/**'],['watchlist']);
});

//中括号外面的是串行执行， 中括号里面的任务是并行执行。
gulp.task('default',function (cb) {
    sequence('clean',['jshint','mincss','minjs','minimage','spriter','html','connect'],'watch')(cb)
});



