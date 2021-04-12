//Please see https://docs.aws.amazon.com/textract/latest/dg/api-async-roles.html on how to "Configuring Amazon Textract for Asynchronous Operations".

'use strict';

var key = process.argv[2];
var bucket = process.argv[3];
var roleArn = process.argv[4];
var snsTopicArn = process.argv[5];
var sqsQueueUrl = process.argv[6];

const fs = require('fs');
const _ = require("lodash");

const AWS = require('aws-sdk');
const AWS_Config = require(__dirname + '/aws_config.json');
AWS.config.update(AWS_Config);

var textract = new AWS.Textract();
const sqs = new AWS.SQS();

const getText = (result, blocksMap) => {
    let text = "";
  
    if (_.has(result, "Relationships")) {
      result.Relationships.forEach(relationship => {
        if (relationship.Type === "CHILD") {
          relationship.Ids.forEach(childId => {
            const word = blocksMap[childId];
            if (word.BlockType === "WORD") {
              text += `${word.Text} `;
            }

            if (word.BlockType === "SELECTION_ELEMENT") {
              if (word.SelectionStatus === "SELECTED") {
                text += `X `;
              }
            }
          });
        }
      });
    }
  
    return text.trim();
  };
  
  const findValueBlock = (keyBlock, valueMap) => {
    let valueBlock;
    keyBlock.Relationships.forEach(relationship => {
      if (relationship.Type === "VALUE") {
        // eslint-disable-next-line array-callback-return
        relationship.Ids.every(valueId => {
          if (_.has(valueMap, valueId)) {
            valueBlock = valueMap[valueId];
            return false;
          }
        });
      }
    });
  
    return valueBlock;
  };
  
  const getKeyValueRelationship = (keyMap, valueMap, blockMap) => {
    const keyValues = {};
  
    const keyMapValues = _.values(keyMap);
  
    keyMapValues.forEach(keyMapValue => {
      const valueBlock = findValueBlock(keyMapValue, valueMap);
      const key = getText(keyMapValue, blockMap);
      const value = getText(valueBlock, blockMap);
      keyValues[key] = value;
    });
  
    return keyValues;
  };
  
  const getKeyValueMap = blocks => {
    const keyMap = {};
    const valueMap = {};
    const blockMap = {};
  
    let blockId;
    blocks.forEach(block => {
      blockId = block.Id;
      blockMap[blockId] = block;
  
      if (block.BlockType === "KEY_VALUE_SET") {
        if (_.includes(block.EntityTypes, "KEY")) {
          keyMap[blockId] = block;
        } else {
          valueMap[blockId] = block;
        }
      }
    });
  
    return { keyMap, valueMap, blockMap };
  };


var params = {
    DocumentLocation: { 
        S3Object: {
            Bucket: bucket,
            Name: key,
        }
    },
    FeatureTypes: [ "FORMS" ],
    NotificationChannel: { 
      RoleArn: roleArn,
      SNSTopicArn: snsTopicArn
   }    
};

textract.startDocumentAnalysis(params, async function(err, data) {
    if (err) {
        throw err;
    }

    var params = {
        JobId: data.JobId
    };

    await waitForDocumentAnalysis(data.JobId);

    textract.getDocumentAnalysis(params, function(err, data) {
        if (err) {
            throw err;
        }
        if (data && data.Blocks) {
            const { keyMap, valueMap, blockMap } = getKeyValueMap(data.Blocks);
            const keyValues = getKeyValueRelationship(keyMap, valueMap, blockMap);
            console.log(JSON.stringify(keyValues));
        } else {
            console.log(JSON.stringify(data));
        }
    });
});

async function waitForDocumentAnalysis(jobId) {
  const response = await sqs.receiveMessage({
    QueueUrl: sqsQueueUrl,
    WaitTimeSeconds: 10,
    MaxNumberOfMessages: 5 
  }).promise();
  if (!response.Messages) return waitForDocumentAnalysis(jobId);

  let foundMessage;
  for (const message of response.Messages) {
    const messageBody = JSON.parse(message.Body);
    const {JobId} = JSON.parse(messageBody.Message);
    if (JobId === jobId) {
      foundMessage = message;
    }
  }
  if (!foundMessage) return waitForDocumentAnalysis(jobId);
  return sqs.deleteMessage({
    QueueUrl: sqsQueueUrl,
    ReceiptHandle: foundMessage.ReceiptHandle
  })
}