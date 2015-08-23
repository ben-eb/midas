'use strict';

// Load PostCSS 4.x until postcss-map supports 5.x.
var postcss = require('postcss-map/node_modules/postcss');
var map = require('postcss-map');
var fs = require('fs');
var path = require('path');
var yml = require('js-yaml').safeLoad;

function error (err) {
    if (err) { throw err; }
}

function config (file, template, callback) {
    var conf = [ map({basePath: 'themes', maps: [file]} )];
    return postcss(conf).process(template).then(callback);
}

function base () {
    var args = Array.prototype.slice.call(arguments);
    return path.join.apply(null, [__dirname].concat(args));
}

fs.readdir(path.join(__dirname, 'themes'), function (err, files) {
    var light = fs.readFileSync(base('templates', 'template-light.css'));
    var dark = fs.readFileSync(base('templates', 'template-dark.css'));
    fs.mkdir(base('dist', 'themes'), function () {
        files.forEach(function (file) {
            var cfg = yml(fs.readFileSync(base('themes', file)));
            var banner = '/**\n * Base 16 ' + cfg.scheme + ', by ' + cfg.author +
                       '\n * Midas template by Ben Briggs (http://beneb.info)' +
                       '\n * Original scheme by Chris Kempson (https://github.com/chriskempson/base16)' +
                       '\n */\n\n';
            var name = path.basename(file, '.yml');
            config(file, light, function (result) {
                var output = base('dist', 'themes', name  + '-light.css');
                fs.writeFile(output, banner + result.css, error);
            });
            config(file, dark, function (result) {
                var output = base('dist', 'themes', name + '-dark.css');
                fs.writeFile(output, banner + result.css, error);
            });
        });
    });
});
