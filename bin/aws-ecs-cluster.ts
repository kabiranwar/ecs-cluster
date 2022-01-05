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
const myaws = { account: '321325872726', region: 'us-east-1' };
new ScoutFrontEnd(app, 'Scout-A-ECS-APP-stack', { env: myaws, tags: { 'project': 'app-scout' }, });
new ScoutDBStack(app, 'Scout-B-ECS-DB-stack', { env: myaws, tags: { 'project': 'app-scout' }, });

