import * as config from '@aws-cdk/aws-config';
import * as cdk from '@aws-cdk/core';

export class ScoutConfigRules extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        //Define a KMS-encrypted bucket:

        // https://docs.aws.amazon.com/config/latest/developerguide/access-keys-rotated.html
        new config.ManagedRule(this, 'AccessKeysRotated', {
            identifier: config.ManagedRuleIdentifiers.ACCESS_KEYS_ROTATED,
            configRuleName: 'ConfigRuleForAccessKeysRotated',
            description: 'Checks whether the active access keys are rotated within the number of days specified in maxAccessKeyAge.The rule is non- compliant if the access keys have not been rotated for more than maxAccessKeyAge number of days',
            inputParameters: {
                maxAccessKeyAge: 60 // default is 90 days
            },
            maximumExecutionFrequency: config.MaximumExecutionFrequency.TWELVE_HOURS // default is 24 hours

        });

        new config.ManagedRule(this, 'Config Rule ForRequired Tags', {
            identifier: config.ManagedRuleIdentifiers.REQUIRED_TAGS,
            configRuleName: 'ConfigRuleForRequiredTags',
            description: 'Checks whether all EIP addresses allocated to a VPC are attached to EC2 instances or in-use ENIs.',
            inputParameters: {
                tag1Key: 'bscout'
            },
            ruleScope: {
                resourceTypes: [config.ResourceType.EC2_INSTANCE, config.ResourceType.EC2_SECURITY_GROUP]
            }

        });
        new config.ManagedRule(this, 'Ec2ManagedInstanceApplicationsBlacklisted', {
            identifier: config.ManagedRuleIdentifiers.EC2_MANAGED_INSTANCE_APPLICATIONS_BLOCKED,
            configRuleName: 'ec2-managedinstance-applications-blacklisted',
            description: 'Checks that none of the specified applications are installed on the instance.Optionally, specify the version.Newer versions will not be blacklisted.Optionally, specify the platform to apply the rule only to instances running that platform.',
            inputParameters: {
                applicationNames: ' java-1.7.0-openjdk'
            },
            ruleScope: {
                resourceTypes: [config.ResourceType.SYSTEMS_MANAGER_MANAGED_INSTANCE_INVENTORY]
            }

        });
        new config.ManagedRule(this, 'ConfigRuleForVPCFlowLogsEnabled', {
            identifier: config.ManagedRuleIdentifiers.VPC_FLOW_LOGS_ENABLED,
            configRuleName: 'ConfigRuleForVPCFlowLogsEnabled',
            description: 'Checks whether Amazon Virtual Private Cloud flow logs are found and enabled for Amazon VPC.',
            inputParameters: {},
            ruleScope: {}

        });

        new config.ManagedRule(this, 'ConfigRuleForS3VersioningEnabled', {
            identifier: config.ManagedRuleIdentifiers.S3_BUCKET_VERSIONING_ENABLED,
            configRuleName: 's3-bucket-versioning-enabled',
            description: 'Checks whether versioning is enabled for your S3 buckets',
            inputParameters: {},
            ruleScope: {
                resourceTypes: [config.ResourceType.S3_BUCKET]
            }

        });
        new config.ManagedRule(this, 'ConfigRuleForIncominghSSHDisabled', {
            identifier: config.ManagedRuleIdentifiers.EC2_SECURITY_GROUPS_INCOMING_SSH_DISABLED,
            configRuleName: 'restricted-ssh',
            description: 'Checks whether security groups that are in use disallow unrestricted',
            inputParameters: {},
            ruleScope: {
                resourceTypes: [config.ResourceType.EC2_SECURITY_GROUP]
            }

        });

        new config.ManagedRule(this, 'ConfigRuleForServerSideEncryption', {
            identifier: config.ManagedRuleIdentifiers.EC2_SECURITY_GROUPS_INCOMING_SSH_DISABLED,
            configRuleName: 's3-bucket-server-side-encryption-enabled',
            description: 'Checks that your Amazon S3 bucket either has S3 default encryption enabled or that the S3 bucket policy explicitly denies put- object requests without server side encryption.',
            inputParameters: {},
            ruleScope: {
                resourceTypes: [config.ResourceType.S3_BUCKET]
            }

        });
    }
}