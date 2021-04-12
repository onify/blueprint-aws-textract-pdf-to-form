'use strict';

var fileName = process.argv[2];
var fullFileName = process.argv[3];
var bucket = process.argv[4]; 

const fs = require('fs');

const AWS = require('aws-sdk');
const AWS_Config = require(__dirname + '/aws_config.json');
AWS.config.update(AWS_Config);
var S3 = new AWS.S3();

const fileContent = fs.readFileSync(fullFileName);

const params = {
    Bucket: bucket,
    Key: fileName, 
    Body: fileContent
};

S3.upload(params, function(err, data) {
    if (err) {
        throw err;
    }

    const params = {
        Bucket: data.Bucket,
        Key: fileName, 
        Expires: 3600 // Update if needed
    };
    
    S3.getSignedUrl('getObject', params, function(err, url) {
        if (err) {
            throw err;
        }
        data.SignedUrl = url;
        console.log(JSON.stringify(data));
    });
    
});