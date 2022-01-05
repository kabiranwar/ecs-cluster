import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";
import { CfnOutput, CfnParameter } from '@aws-cdk/core';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as iam from '@aws-cdk/aws-iam';
import * as ssl_cert from '@aws-cdk/aws-certificatemanager';
import * as route53 from '@aws-cdk/aws-route53';
import { ApplicationLoadBalancedEc2Service, ApplicationMultipleTargetGroupsFargateService, NetworkMultipleTargetGroupsFargateService } from '@aws-cdk/aws-ecs-patterns';
import * as parameters from "../cdk.json"

export class AwsEcsBackEndClusterStack extends cdk.Stack {
  
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const defaultVpc = ec2.Vpc.fromLookup(this, 'ScoutDefaultVpc-backend', {
      isDefault: true,
    });

    const postgrestapiSG = new ec2.SecurityGroup(this, "tdpostgrestdb-SG-BackEnd", {
      vpc: defaultVpc,
      allowAllOutbound: true,
      securityGroupName: parameters.context.config.ProjectName + '-' + parameters.context.config.ProjectEnvironment + '-' + 'postgrestapi-SG',
    });

    postgrestapiSG.addIngressRule(
      ec2.Peer.ipv4('71.163.18.218/32'),
      ec2.Port.tcp(9002),
      "Allow https traffic"
    );
    postgrestapiSG.addIngressRule(
      ec2.Peer.ipv4('128.229.4.0/24'),
      ec2.Port.tcp(9002),
      "Allow https traffic"
    );
    postgrestapiSG.addIngressRule(
      ec2.Peer.ipv4('108.48.153.254/32'),
      ec2.Port.tcp(9002),
      "Allow https traffic"
    );
    postgrestapiSG.addIngressRule(
      ec2.Peer.ipv4('158.80.4.0/24'),
      ec2.Port.tcp(9002),
      "Allow https traffic"
    );
    postgrestapiSG.addIngressRule(
      ec2.Peer.ipv4('128.229.67.14/32'),
      ec2.Port.tcp(9002),
      "Allow https traffic"
    );
    postgrestapiSG.addIngressRule(
      ec2.Peer.ipv4('136.226.18.0/24'),
      ec2.Port.tcp(9002),
      "Allow https traffic"
    );
    //Create an ECS Cluster for back end
    const scoutapi_cluster = ecs.Cluster.fromClusterAttributes(this, 'Imported-Cluster', {
      clusterName: parameters.context.config.ScoutappContainername+parameters.context.config.ProjectEnvironment + parameters.context.config.clustername,
      securityGroups: [ec2.SecurityGroup.fromSecurityGroupId(this, 'IMported SG', 'scout-app-sg')],
      vpc: defaultVpc
    });

    //Task Execution role for Frond end Task Definition
    const ECS_backEnd_TD_Task_Role = iam.Role.fromRoleArn(this, 'imported-TD-Role', `arn:aws:iam::${parameters.context.config.Account_ID}:role/dev-ECS-Front-End-Task-Role`)
    
    //Creation of Execution role for Front end TD:
    const ECS_backEnd_TD_Execution_Role = iam.Role.fromRoleArn(this, 'imported-Execution-Role', `arn:aws:iam::${parameters.context.config.Account_ID}:role/dev-ECS-Front-End-Execution-Role`)
    
  //Imported Security group
  let importedSG = cdk.Fn.importValue("ecssg");

    // Fargate TaskDefinitions 
    const ecssg = ec2.SecurityGroup.fromSecurityGroupId(this, 'imported-sg', importedSG)
    postgrestapiSG.connections.allowFrom(
       ecssg,
       ec2.Port.tcp(9002),
     );
    const tdpostgrestapi = new ecs.FargateTaskDefinition(this, "tdpostgrestapi", {
      family: "tdpostgrestapi",
      memoryLimitMiB: 512,
      cpu: 256,
      taskRole: ECS_backEnd_TD_Task_Role,
      executionRole: ECS_backEnd_TD_Execution_Role
    });
    
    tdpostgrestapi.addContainer('postgrest-api', {
    image: ecs.ContainerImage.fromRegistry('gkoenig/popapp:latest'),
    memoryLimitMiB: 512,
      environment: { PORT: "9002" },    
    //containerName: EnvironmentName.valueAsString + '-Scout-postgrest-Fargate',
    containerName: parameters.context.config.ProjectName+'-'+parameters.context.config.ProjectEnvironment+'-'+'postgrestapi',
    portMappings: [{ containerPort: 9002 }],
    essential: true,
    logging: ecs.LogDriver.awsLogs({ streamPrefix: "scout-postgrestapi-logs" }),
  });       
    // The ECS Service used for deploying tasks 
    const scoutapiservice = new ecs.FargateService(this, "service1-BackEnd", {
      cluster: scoutapi_cluster,
      desiredCount: 1,
      taskDefinition: tdpostgrestapi,
      securityGroups: [postgrestapiSG],
      assignPublicIp: true,
      serviceName: 'scoutapi-service',
    });
    
    // BONUS: Autoscaling based on memory and CPU usage
    const scalableTaget = scoutapiservice.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 2,
    });
    scalableTaget.scaleOnMemoryUtilization("ScaleUpMem-BackEnd", {
      targetUtilizationPercent: 75,
    });
    scalableTaget.scaleOnCpuUtilization("ScaleUpCPU-BackEnd", {
      targetUtilizationPercent: 75,
    });

  }
}
