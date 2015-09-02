#!/usr/bin/env node

var fs = require('fs');
var midas = require('../dist');
var read = require('read-file-stdin');
var write = require('write-file-stdout');

var opts = require('minimist')(process.argv.slice(2), {
    alias: {
        h: 'help',
        v: 'version'
    }
});

if (opts.version) {
    return console.log(require('../package.json').version);
}

var file = opts._[0];
var out  = opts._[1];

if (file === 'help' || opts.help) {
    return fs.createReadStream(__dirname + '/usage.txt')
        .pipe(process.stdout)
        .on('close', function () { process.exit(1); });
}

read(file, function (err, buf) {
    if (err) {
        throw err;
    }
    write(out, String(midas(String(buf)).content));
});