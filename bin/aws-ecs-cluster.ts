#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ScoutFrontEnd } from '../lib/aws-ecs-frontend';
import { ScoutDBStack } from '../lib/scout-db';
import { AwsEcsStartStopLambdaStack } from '../lib/aws-lambda-start-stop-ecs';
import { ScoutConfigRules } from '../lib/scout-config-rules'
import { Stack, Tags } from '@aws-cdk/core';
import { Budget } from '../lib/budget';

const app = new cdk.App();
const scoutFrontEndStack = new Stack(app, 'scoutFrontEndStack');
Tags.of(scoutFrontEndStack).add('env', 'dev');
//const envUS = { account: '321325872726', region: 'us-east-1' };
//const envScout = { account: '295892210512', region: 'us-gov-east-1' };
const myaws = { account: '321325872726', region: 'us-east-1' };
new ScoutFrontEnd(app, 'Scout-A-ECS-APP-stack', { env: myaws, tags: { 'project': 'app-scout' }, });
new ScoutDBStack(app, 'Scout-B-ECS-DB-stack', { env: myaws, tags: { 'project': 'app-scout' }, });
new ScoutConfigRules(app, 'config-rules', { env: myaws, tags: { 'project': 'app-scout' }, });
new Budget(app, 'My-Budget', { env: myaws, tags: { 'project': 'app-scout' }, });
new AwsEcsStartStopLambdaStack(app, 'ECS-Start-Stop-Lambda-stack', { env: myaws, tags: { 'project': 'app-scout' }, });

//new ScoutConfigRules(app, 'config-rules', { env: envScout });
// new ScoutFrontEnd(app, 'Scout-A-ECS-APP-stack', {
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT,
//     region: process.env.CDK_DEFAULT_REGION
//   }
// });

// new ScoutDBStack(app, 'Scout-B-ECS-DB-stack', {
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT,
//     region: process.env.CDK_DEFAULT_REGION
//   }
// });

// new AwsEcsStartStopLambdaStack(app, 'ECS-Start-Stop-Lambda-stack', {
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT,
//     region: process.env.CDK_DEFAULT_REGION
//   }
// });
// new ScoutConfigRules(app, 'config-rules', {
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT,
//     region: process.env.CDK_DEFAULT_REGION
//   }
// });

//const app = new cdk.App();

//new ScoutDBStack(app, 'Scout-B-ECS-DB-stack', { env: envUS });
//new appstack(app, 'app-stack', { env: envUS });

//new AwsEcsClusterStack(app, 'AwsEcsClusterStack', {

//new AwsEcsClusterStack(app, 'AwsEcsClusterStack', { env: envUS });
//  new ScoutFrontEnd(app, 'Scout-A-ECS-APP-stack', {
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT,
//     region: process.env.CDK_DEFAULT_REGION
//   }
//  });

 // new AwsEcsClusterStack(app, 'AwsEcsClusterStack', {
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT,
//     region: process.env.CDK_DEFAULT_REGION
//   }
// });
//new AwsEcsClusterStack(app, 'AwsEcsClusterStack', { env: envUS });
// new AwsEcsBackEndClusterStack(app, 'Scout-B-ECS-API-stack', {
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT,
//     region: process.env.CDK_DEFAULT_REGION
//   }
// });
//new AwsEcsClusterStack(app, 'AwsEcsClusterStack', { env: envUS });
// new ScoutDBStack(app, 'Scout-C-ECS-DB-stack', {
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT,
//     region: process.env.CDK_DEFAULT_REGION
//   }
// });


