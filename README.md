# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template


## Prerequisites

- [Node](https://nodejs.org/en/) (version 10.10.0 or above)
- [npm](https://www.npmjs.com)
- [make](http://gnuwin32.sourceforge.net/packages/make.htm) if you are working on Windows

## Installation

Run the below command to install the required dependencies:

```bash
make install
```

## Deployment

- Run the following shell script command with environment to create the stack.

```bash
  sh ./deploy.sh "dev" 
```