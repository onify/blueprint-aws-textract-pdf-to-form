![Onify Blueprints](https://files.readme.io/8ba3f14-onify-blueprints-logo.png)

[![Project Status: WIP – Initial development is in progress, but there has not yet been a stable, usable release suitable for the public.](https://www.repostatus.org/badges/latest/wip.svg)](https://www.repostatus.org/#wip)

# Onify Blueprint: Amazon AWS Textract - PDF to form example

Example how to 1) upload files to AWS S3 and 2) process the PDF file via AWS Textract and 3) send link to form to validate data from PDF. What you need to do is decide where the data from the form should go. But that is a different story and a different Blueprint :-)

**Amazon Textract**
 
Amazon Textract is a machine learning service that automatically extracts text, handwriting and data from scanned documents that goes beyond simple optical character recognition (OCR) to identify, understand, and extract data from forms and tables. Read more: https://aws.amazon.com/textract/.


## Screenshots

### Onify Flow

![alt text](/screenshots/flow.png "Onify Flow")

### PDF

Here is a example of the PDF files that are in the "inbox".

![alt text](/screenshots/pdf.png "PDF")

### AWS Textract

Here is how Amazon Textract sees the PDF as a form.

![alt text](/screenshots/textract.png "AWS Textract")

### Form

Here is how the data ends up in the form in Onify.

![alt text](/screenshots/form.png "Form")

## Requirements

* Onify Hub v2
* Mail configured in Onify Hub
* Onify Agent (tagged `agent`)
* Onify Flow license
* Node.js installed (on agent)
* Camunda Modeler 4.4 or later 
* Amazon AWS services: S3 Bucket, SNS and SQS

## Included

* 1 x Flow
* 3 x Scripts (nodejs)

## Setup

### Amazon AWS

In order for this to work you need the following setup:

1. Amazon S3 Bucket
2. AWS user with [permissions](https://docs.aws.amazon.com/textract/latest/dg/api-async-roles.html)
3. Document access key (`accessKeyId`) and Secure Access Key for AWS user (`secretAccessKey`)

> NOTE: For more information, please read [Configuring Amazon Textract for Asynchronous Operations](https://docs.aws.amazon.com/textract/latest/dg/api-async-roles.html)

> NOTE: Amazon Textract is not available in all regions. Also make sure S3 bucket and Textract are in same region.

### Onify Agent 

* Copy files from `.\resources\agent\scripts` to `.\scripts` folder on Onify Agent.
* Run `npm install` from the `.\scripts` folder
* Update `aws_config.json` with AWS credentials and region.

### Onify Flow

Update flow (`aws-textract-pdf-to-form.bpmn`) with your own variables:

* `inboxPath` - Path to the PDF files
* `bucket` - S3 bucket to upload files
* `mailTo` - Where to send the link to the form
* `onifyUrl` - URL to Onify APP (default is http://localhost:3000)
* `roleArn` - The Amazon Resource Name (ARN) of an IAM role that gives Amazon Textract publishing permissions to the Amazon SNS topic
* `snsTopicArn` - The Amazon SNS topic that Amazon Textract posts the completion status to
* `sqsQueueUrl` - Amazon SQS url that is subscribed to the SNS topic

## Run 

1. Open `aws-textract-pdf-to-form.bpmn` in Camunda Modeler
2. Click `Start current diagram`

## Support

* Community/forum: https://support.onify.co/discuss
* Documentation: https://support.onify.co/docs
* Support and SLA: https://support.onify.co/docs/get-support

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
