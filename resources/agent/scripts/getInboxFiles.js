'use strict';

const fs=require('fs');

var inboxPath = process.argv[2];
inboxPath += inboxPath.endsWith("/") ? "" : "/"
var files = fs.readdirSync(inboxPath);

var inboxFiles = [];
files.forEach(function(file) {
    let inboxFile = {
        name: file,
        filename: inboxPath + file
    };
    inboxFiles.push(inboxFile);
})

console.log(JSON.stringify(inboxFiles));