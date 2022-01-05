import * as cdk from "@aws-cdk/core";
import * as parameters from "../cdk.json";
import * as lambda from "@aws-cdk/aws-lambda";
import * as events from '@aws-cdk/aws-events';
import * as iam from '@aws-cdk/aws-iam';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';


import {
    ManagedPolicy,
    Role,
    ServicePrincipal,
    PolicyStatement,
    Effect,
    Policy,
} from "@aws-cdk/aws-iam";

export class AwsEcsStartStopLambdaStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        //Creating ECS Start Lambda role to start ECS task:
        // const ECS_Start_Stop_Lambda_Role = new Role(
        //     this,
        //     "AWS-ECS-Start-Stop-Lambda-Role",
        //     {
        //         assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
        //         roleName: `ECS-Start-Stop-Lambda-Role`,
        //     }
        // );

        //Adding required AWS manages policy
        // ECS_Start_Stop_Lambda_Role.addManagedPolicy(
        //     ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaRole")
        // );

        // ECS_Start_Stop_Lambda_Role.addToPolicy(
        //     new PolicyStatement({
        //         effect: Effect.ALLOW,
        //         resources: ["*"],
        //         actions: [
        //             "ecs:UpdateService",
        //             "logs:CreateLogGroup",
        //             "logs:CreateLogStream",
        //             "logs:PutLogEvents",
        //         ],
        //     })
        // );

        // ECS_Start_Stop_Lambda_Role.addToPolicy(
        //     new PolicyStatement({
        //         effect: Effect.ALLOW,
        //         resources: ["*"],
        //         actions: ["s3:GetObject", "s3:PutObject"],
        //     })
        // );
        const ECS_Start_Stop_Lambda_Role = iam.Role.fromRoleArn(this, 'Imported-Lambda-Execution-Role', `arn:aws:iam::${parameters.context.config.Account_ID}:role/ECS-Start-Stop-Lambda-Role-New`)


        //Defining ECS Start Lambda function
        var ECS_Start_Lambda_Name = `app-scout-lambda-start-ecs-task`;
        let Lambda_Code_Path = `./lambda/ecs-start-lambda`;
        const ECS_Start_Lambda = new lambda.Function(this, `ECS-Start-Lambda`, {
            functionName: ECS_Start_Lambda_Name,
            description: 'starts ecs tasks',
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: "ecs-start.handler",
            role: ECS_Start_Stop_Lambda_Role,
            code: lambda.Code.fromAsset(Lambda_Code_Path),
            timeout: cdk.Duration.seconds(20),
            memorySize: 128,
            environment: {
                app_service: parameters.context.config.AppService,
                db_service: parameters.context.config.DbService,
                cluster: parameters.context.config.cluster
            }
        });

        //Defining ECS Stop Lambda function
        var ECS_Stop_Lambda_Name = `app-scout-lambda-stop-ecs-task`;
        let ECS_Stop_Lambda_Code_Path = `./lambda/ecs-stop-lambda`;
        const ECS_Stop_Lambda = new lambda.Function(this, `ECS-Stop-Lambda`, {
            functionName: ECS_Stop_Lambda_Name,
            description: 'stops ecs tasks',
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: "ecs-stop.handler",
            role: ECS_Start_Stop_Lambda_Role,
            code: lambda.Code.fromAsset(ECS_Stop_Lambda_Code_Path),
            timeout: cdk.Duration.seconds(20),
            memorySize: 128,
            environment: {
                app_service: parameters.context.config.AppService,
                db_service: parameters.context.config.DbService,
                cluster: parameters.context.config.cluster
            }
        });

        // Rule for triggering ECS start lambda function 
        const ECS_Start_Lambda_EventRule = new events.Rule(this, 'ECS Start Lambda Event Rule', {
            ruleName: 'ECS-Start-Lambda-Event-Rule',
            schedule: events.Schedule.expression(`cron(0 10 ? * MON-FRI *)`),
            enabled: false
        });
        cdk.Tags.of(ECS_Start_Lambda_EventRule).add('proj', 'app-scout');

        ECS_Start_Lambda_EventRule.addTarget(new LambdaFunction(ECS_Start_Lambda));

        // Rule for triggering ECS stop lambda function 
        const ECS_Stop_Lambda_EventRule = new events.Rule(this, 'ECS Stop Lambda Event Rule', {
            ruleName: 'ECS-Stop-Lambda-Event-Rule',
            schedule: events.Schedule.expression(`cron(0 17:00 ? * MON-FRI *)`),
            enabled: true
        });
        cdk.Tags.of(ECS_Stop_Lambda_EventRule).add('proj', 'app-scout');

        ECS_Stop_Lambda_EventRule.addTarget(new LambdaFunction(ECS_Stop_Lambda));
    }
}
