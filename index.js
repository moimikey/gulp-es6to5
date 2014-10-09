var gutil = require('gulp-util');
var through = require('through2');
var applySourceMap = require('vinyl-sourcemaps-apply');
var es6to5 = require('6to5');

module.exports = function(options) {
    options = options || {};

    return through.obj(function (file, enc, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }

        if (file.isStream()) {
            return callback(new gutil.PluginError('gulp-es6to5', 'Streaming not supported', {fileName: file.relative}));
        }

        try {
            var fileOptions = {};
            Object.keys(options).forEach(function(key) {
                fileOptions[key] = options[key];
            });
            fileOptions.filename = file.relative;
            fileOptions.sourceMap = !!file.sourceMap;

            var res = es6to5.transform(file.contents.toString(), fileOptions);

            if (file.sourceMap && res.map) {
                applySourceMap(file, res.map);
            }

            file.contents = new Buffer(res.code);
            this.push(file);
        } catch(err) {
            this.emit('error', new gutil.PluginError('gulp-es6to5', err, {fileName: file.relative}));
        }

        callback();
    });
};
