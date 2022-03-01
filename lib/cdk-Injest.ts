import * as cdk from '@aws-cdk/core';
import * as kms from '@aws-cdk/aws-kms';
//import * as iam from '@aws-cdk/aws-iam';
import { PolicyStatement, PolicyDocument, Effect, ArnPrincipal, ServicePrincipal } from '@aws-cdk/aws-iam';
import * as parameters from "../cdk.json";
import * as sqs from '@aws-cdk/aws-sqs';


export class Injest extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const sqsMessageKeyPolicy = new PolicyStatement({
            actions: ["kms:CancelKeyDeletion",
                "kms:CreateAlias",
                "kms:CreateGrant",
                "kms:CreateKey",
                "kms:Decrypt",
                "kms:DeleteAlias",
                "kms:DescribeKey",
                "kms:DisableKey",
                "kms:DisableKeyRotation",
                "kms:EnableKey",
                "kms:EnableKeyRotation",
                "kms:Encrypt",
                "kms:GenerateDataKey",
                "kms:GetKeyPolicy",
                "kms:GetKeyRotationStatus",
                "kms:GetparametersForImport",
                "kms:GetPublicKey",
                "kms:ImportKeyMaterial",
                "kms:ListAliases",
                "kms:ListGrants",
                "kms:ListKeyPolicies",
                "kms:ListKeys",
                "kms:ListResourceTags",
                "kms:ListRetirableGrants",
                "kms:PutKeyPolicy",
                "kms:ReEncryptFrom",
                "kms:ReEncryptTo",
                "kms:Retire",
                "kms:RevokeGrant",
                "kms:ScheduleKeyDeletion",
                "kms:Sign",
                "kms:TagResource",
                "kms:UntagResource",
                "kms:UpdateAlias",
                "kms:Verify",
            ],
            effect: Effect.ALLOW,
            resources: ["*"],
            principals: [new ArnPrincipal(parameters.context.config.Principals)]

        })

        const enableAdministration = new PolicyStatement({
            actions: ["kms:CancelKeyDeletion",
                "kms:CreateAlias",
                "kms:CreateGrant",
                "kms:CreateKey",
                "kms:DeleteAlias",
                "kms:DescribeKey",
                "kms:DisableKey",
                "kms:DisableKeyRotation",
                "kms:EnableKey",
                "kms:EnableKeyRotation",
                "kms:GetKeyPolicy",
                "kms:GetKeyRotationStatus",
                "kms:GetparametersForImport",
                "kms:GetPublicKey",
                "kms:ListAliases",
                "kms:ListGrants",
                "kms:ListKeyPolicies",
                "kms:ListKeys",
                "kms:ListResourceTags",
                "kms:ListRetirableGrants",
                "kms:PutKeyPolicy",
                "kms:RevokeGrant",
                "kms:ScheduleKeyDeletion",
                "kms:TagResource",
                "kms:UntagResource",
                "kms:UpdateAlias",
            ],
            effect: Effect.ALLOW,
            resources: ["*"],
            principals: [new ArnPrincipal(parameters.context.config.administrationPrincipals)]

        })


        const accessForServicePrincipals = new PolicyStatement({
            actions: ["kms:Decrypt",
                "kms:GenerateDataKey",
                "kms:GenerateDataKeyPair"
            ],
            effect: Effect.ALLOW,
            resources: ["*"],
            principals: [new ServicePrincipal("sns.amazonaws.com"), new ServicePrincipal("s3.amazonaws.com")]

        })

        const encryptionViaSQS = new PolicyStatement({
            actions: ["kms:Encrypt",
                "kms:Decrypt",
                "kms:DescribeKey",
                "kms:GenerateDataKey",
                "kms:GenerateDataKeyPair",
                "kms:ReEncryptFrom",
                "kms:ReEncryptTo",
            ],
            effect: Effect.ALLOW,
            resources: ["*"],
            principals: [new ArnPrincipal("*")],
            conditions: {
                "kms:ViaService": parameters.context.config.conditions, "kms:CallerAccount": parameters.context.config.CallerAccount
            }

        })

        const SQSMessageKey = new kms.Key(this, 'SQSMessageKey', {
            enableKeyRotation: true,
            enabled: true,
            description: "Customer key for encrypting SQS messages",
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            //policy: [encryptionViaSQS, accessForServicePrincipals, enableAdministration, sqsMessageKeyPolicy],
            policy: new PolicyDocument({
                statements: [encryptionViaSQS, accessForServicePrincipals, enableAdministration, sqsMessageKeyPolicy]
            })
        });



    }
}


