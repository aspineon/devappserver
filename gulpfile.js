var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

gulp.task('server', function() {
    var server = plugins.liveServer.new('./server/app.js');
    server.start();

    //use gulp.watch to trigger server actions(notify, start or stop)
    gulp.watch(paths.html, function () {
        server.notify.apply(server, arguments);
    });

    gulp.watch(paths.js, function () {
        gulp.run('jshint');
        server.notify.apply(server, arguments);
    });

    gulp.watch('./server/app.js', server.start.bind(server)); //restart my server
});