import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as iam from '@aws-cdk/aws-iam';
import * as route53 from "@aws-cdk/aws-route53";
import * as route53targets from "@aws-cdk/aws-route53-targets";
import * as certificatemanager from "@aws-cdk/aws-certificatemanager";
import * as parameters from "../cdk.json";
export class AwsEcsClusterStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const defaultVpc = ec2.Vpc.fromLookup(this, 'ScoutDefaultVpc', {
      isDefault: true,
    });   
  // const EnvironmentName = new CfnParameter(this, 'EnvironmentName', {
  //     description: 'Environment Name',
  //     type: 'String',
  //     default: 'Scout-dev'
  //   });    
  // Application load balancer     
  const alb = new elbv2.ApplicationLoadBalancer( this, 'alb', {
      vpc:defaultVpc,
      vpcSubnets: { subnets: defaultVpc.publicSubnets },
      internetFacing: true,
   }
  );
  // Target group to make resources containers dicoverable by the application load balencer
  const ScoutTargetGroupHttp = new elbv2.ApplicationTargetGroup(this, "scout-target-group",
   {
    port: 80,
    vpc:defaultVpc,
    protocol: elbv2.ApplicationProtocol.HTTP,
    targetType: elbv2.TargetType.IP,
    targetGroupName: 'tg-scout-app',    
   }
  );  
  // Health check for containers to check they were deployed correctly 
  ScoutTargetGroupHttp.configureHealthCheck({
    //path: "/api/status",
    path: "/filters",
  protocol: elbv2.Protocol.HTTP,
  });
  // only allow HTTPS connections   
  const listener = alb.addListener("alb-listener", {
  open: true,
  port: 80,
  //certificates: [cert],
  });
  listener.addTargetGroups("alb-listener-scout-target-group", {
  targetGroups: [ScoutTargetGroupHttp],
  });
  
  // use a security group to provide a secure connection between the ALB and the containers 
  const ecsSG = new ec2.SecurityGroup(this, "ecs-SG", {
  vpc:defaultVpc,
  allowAllOutbound: true,
  securityGroupName:parameters.context.config.ProjectName+'-'+parameters.context.config.ProjectEnvironment+'-'+'ecs-SG', 
  });      
  ecsSG.addIngressRule(
  ec2.Peer.ipv4('71.163.18.218/32'),
  ec2.Port.tcp(80),
  "Allow https traffic"
  );
  ecsSG.addIngressRule(
  ec2.Peer.ipv4('128.229.4.0/24'),
  ec2.Port.tcp(80),
  "Allow https traffic"
  );
  ecsSG.addIngressRule(
  ec2.Peer.ipv4('108.48.153.254/32'),
  ec2.Port.tcp(80),
  "Allow https traffic"
  );  
  ecsSG.addIngressRule(
  ec2.Peer.ipv4('158.80.4.0/24'),
  ec2.Port.tcp(80),
  "Allow https traffic"
  );    
  ecsSG.addIngressRule(
  ec2.Peer.ipv4('128.229.67.14/32'),
  ec2.Port.tcp(80),
  "Allow https traffic"
  );  
  ecsSG.addIngressRule(
  ec2.Peer.ipv4('136.226.18.0/24'),
  ec2.Port.tcp(80),
  "Allow https traffic"
  );   
  const albSG = new ec2.SecurityGroup(this, "alb-SG", {
  vpc:defaultVpc,
  allowAllOutbound: true,
  securityGroupName:parameters.context.config.ProjectName+'-'+parameters.context.config.ProjectEnvironment+'-'+'alb-SG', 
  });
  
  albSG.addIngressRule(
  ec2.Peer.ipv4('71.163.18.218/32'),
  ec2.Port.tcp(443),
  "Allow https traffic"
  );
  albSG.addIngressRule(
  ec2.Peer.ipv4('71.163.18.218/32'),
  ec2.Port.tcp(80),
  "Allow https traffic"
  );
  albSG.addIngressRule(
  ec2.Peer.ipv4('128.229.4.0/24'),
  ec2.Port.tcp(80),
  "Allow https traffic"
  );
  albSG.addIngressRule(
  ec2.Peer.ipv4('128.229.4.0/24'),
  ec2.Port.tcp(443),
  "Allow https traffic"
  );
  albSG.addIngressRule(
  ec2.Peer.ipv4('108.48.153.254/32'),
  ec2.Port.tcp(80),
  "Allow https traffic"
  );  
  albSG.addIngressRule(
  ec2.Peer.ipv4('108.48.153.254/32'),
  ec2.Port.tcp(443),
  "Allow https traffic"
  );
  albSG.addIngressRule(
  ec2.Peer.ipv4('158.80.4.0/24'),
  ec2.Port.tcp(80),
  "Allow https traffic"
  );  
  albSG.addIngressRule(
  ec2.Peer.ipv4('158.80.4.0/24'),
  ec2.Port.tcp(443),
  "Allow https traffic"
  );
  albSG.addIngressRule(
  ec2.Peer.ipv4('128.229.67.14/32'),
  ec2.Port.tcp(80),
  "Allow https traffic"
  );  
  albSG.addIngressRule(
  ec2.Peer.ipv4('128.229.67.14/32'),
  ec2.Port.tcp(443),
  "Allow https traffic"
  );
  albSG.addIngressRule(
  ec2.Peer.ipv4('136.226.18.0/24'),
  ec2.Port.tcp(80),
  "Allow https traffic"
  );  
  albSG.addIngressRule(
  ec2.Peer.ipv4('136.226.18.0/24'),
  ec2.Port.tcp(443),
  "Allow https traffic"
  );
  alb.addSecurityGroup(albSG);    
  const taskExecutionRole = new iam.Role(this, 'MyAppTaskExecutionRole-', {
      roleName: 'dev-ECS-Execution-Role',
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com')
  });  
  // Create an ECS Cluster with 3 images
  const ScoutEcsCluster = new ecs.Cluster(this, "ScoutScoutEcsCluster", {
      //clusterName: EnvironmentName.valueAsString + '-scoutScoutEcsCluster',
      clusterName: parameters.context.config.ProjectName+'-'+parameters.context.config.ProjectEnvironment+'-'+parameters.context.config['cluster-name'],
      vpc: defaultVpc,
      containerInsights: true,
  });

  taskExecutionRole.attachInlinePolicy(
    new iam.Policy(this, "task-policy", {
      statements: [
      // policies to allow access to other AWS services from within the container e.g SES (Simple Email Service)
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["SES:*"],
          resources: ["*"],
        }),
      ],
    })
  );  
  //taskExecutionRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonECSTaskExecutionRolePolicy'))
  //taskExecutionRole.addManagedPolicy(iam.ManagedPolicy.fromManagedPolicyArn(this, 'managedExecPolicy', 'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy'));

  //Fargate TaskDefinitions
  const tdjukeboxapp = new ecs.FargateTaskDefinition(this, "TaskDefinition-tdjukeboxapp", {
    family: "tdjukeboxapp",
    memoryLimitMiB: 512,
    cpu: 256,
    taskRole: taskExecutionRole,      
  });
  const tdmetalapp = new ecs.FargateTaskDefinition(this, "TaskDefinition-tdmetalapp", {
    family: "tdmetalapp",
    memoryLimitMiB: 512,
    cpu: 256,
    taskRole: taskExecutionRole,      
  });
  const tdpopapp = new ecs.FargateTaskDefinition(this, "TaskDefinition-tdpopapp", {
    family: "tdpopapp",
    memoryLimitMiB: 512,
    cpu: 256,
    taskRole: taskExecutionRole,      
  });
  tdpopapp.addContainer('popapp', {
    image: ecs.ContainerImage.fromRegistry('gkoenig/popapp:latest'),
    memoryLimitMiB: 512,
    environment: {PORT: "9002"},
    //containerName: EnvironmentName.valueAsString + '-Scout-simplehttp-Fargate',
    containerName: 'popapp',
  //   //portMappings: [{ containerPort: 8000, hostPort: 8000, protocol: ecs.Protocol.TCP }],
    portMappings:[{ containerPort: 9002 }],
    
  //   //cpu: 256, 
    essential: true,            
  //   //logging: ecs.LogDriver.awsLogs({ streamPrefix: "scout-app-logs" }),    
  });
  tdmetalapp.addContainer('metalapp', {
    image: ecs.ContainerImage.fromRegistry('gkoenig/metalapp:latest'),
    memoryLimitMiB: 512,
    environment: {PORT: "9001"},
    //containerName: EnvironmentName.valueAsString + '-Scout-simplehttp-Fargate',
    containerName: 'popapp',
    //portMappings: [{ containerPort: 8000, hostPort: 8000, protocol: ecs.Protocol.TCP }],
    portMappings:[{ containerPort: 9001}],
    
    //cpu: 256, 
    essential: true,            
    //logging: ecs.LogDriver.awsLogs({ streamPrefix: "scout-app-logs" }),    
  });
  tdjukeboxapp.addContainer('jukeboxapp', {
    image: ecs.ContainerImage.fromRegistry('gkoenig/jukeboxapp:latest'),
    memoryLimitMiB: 512,
    environment: {METAL_HOST: "metalsvc.ecs.course.local", POP_HOST: "popsvc.ecs.course.local", PORT:"9000" },
    //containerName: EnvironmentName.valueAsString + '-Scout-simplehttp-Fargate',
    containerName: 'jukeboxapp',
    //portMappings: [{ containerPort: 8000, hostPort: 8000, protocol: ecs.Protocol.TCP }],
    portMappings:[{ containerPort: 9000}],
    
    //cpu: 256, 
    essential: true,            
    //logging: ecs.LogDriver.awsLogs({ streamPrefix: "scout-app-logs" }),    
  });    
  const tdscoutapp = new ecs.FargateTaskDefinition(this, "TaskDefinition-simplehttp", {
    family: "tdscoutapp",
    memoryLimitMiB: 512,
    cpu: 256,
    taskRole: taskExecutionRole,      
  });
  //The docker container including the image to use
  const tdpostgrestapi = new ecs.FargateTaskDefinition(this, "TaskDefinition-postgrest-api", {
    family: "tdpostgrestapi",
    memoryLimitMiB: 512,
    cpu: 256,
    taskRole: taskExecutionRole,
  });
  
  const tdpostgrestdb = new ecs.FargateTaskDefinition(this, "TaskDefinition-postgrest-db", {
    family: "tdpostgrestdb",
    memoryLimitMiB: 512,
    cpu: 256,
    taskRole: taskExecutionRole,
  });              
  tdscoutapp.addContainer('scoutapp', {
    image: ecs.ContainerImage.fromRegistry('gkoenig/simplehttp:latest'),
    memoryLimitMiB: 512,
    environment: {message: "Hello Scout App"},
    //containerName: EnvironmentName.valueAsString + '-Scout-simplehttp-Fargate',
    containerName: parameters.context.config.ProjectName+'-'+parameters.context.config.ProjectEnvironment+'-'+'scoutapp',
    portMappings: [{ containerPort: 8000, hostPort: 8000, protocol: ecs.Protocol.TCP }],
    //portMappings:[{ containerPort: 8000 }],    
    cpu: 256, 
    essential: true,              
    logging: ecs.LogDriver.awsLogs({ streamPrefix: "scout-app-logs" }),    
  });
  
  tdpostgrestapi.addContainer('postgrest-api', {
    image: ecs.ContainerImage.fromRegistry('gkoenig/popapp:latest'),
    memoryLimitMiB: 512,
    environment: { PORT: "9000" },
    //containerName: EnvironmentName.valueAsString + '-Scout-postgrest-Fargate',
    containerName: parameters.context.config.ProjectName+'-'+parameters.context.config.ProjectEnvironment+'-'+'postgrestapi',
    portMappings: [{ containerPort: 9000 }],
    essential: true,
    logging: ecs.LogDriver.awsLogs({ streamPrefix: "scout-postgrestapi-logs" }),
  });     
  tdpostgrestdb.addContainer('postgrest-db', {
    image: ecs.ContainerImage.fromRegistry('gkoenig/popapp'),
    memoryLimitMiB: 512,
    environment: { PORT: "9002" },
    //containerName: EnvironmentName.valueAsString + '-Scout-postgrest-Fargate',
    containerName: parameters.context.config.ProjectName+'-'+parameters.context.config.ProjectEnvironment+'-'+'postgrestdb',
    portMappings: [{ containerPort: 9002 }],
    essential: true,
    logging: ecs.LogDriver.awsLogs({ streamPrefix: "scout-postgrestapi-logs" }),
  });    
  //Security groups to allow connections from the application load balancer to the fargate containers  
  // const scoutappSG = new ec2.SecurityGroup(this, "scoutapp-SG", {
  // vpc: defaultVpc,
  // securityGroupName:parameters.context.config.ProjectName+'-'+parameters.context.config.ProjectEnvironment+'-'+'scoutapp-SG',
  // allowAllOutbound: true,                  
  // });
  // scoutappSG.connections.allowFrom(
  //   albSG,
  //   ec2.Port.tcp(8000),
    //ec2.Port.allTcp(),  
  // "Application load balancer"
  // );
  const postgrestapiSG = new ec2.SecurityGroup(this, "postgrestapi-SG", {
  vpc: defaultVpc,
  securityGroupName:parameters.context.config.ProjectName+'-'+parameters.context.config.ProjectEnvironment+'-'+'postgrestapi-SG',
  allowAllOutbound: true,
  });
  postgrestapiSG.addIngressRule(
  ec2.Peer.ipv4('128.229.4.0/24'),
  ec2.Port.tcp(9000),
  "Allow https traffic"
  );
  postgrestapiSG.addIngressRule(
  ec2.Peer.ipv4('108.48.153.254/32'),
  ec2.Port.tcp(9000),
  "Allow https traffic"
  );  
  postgrestapiSG.addIngressRule(
  ec2.Peer.ipv4('158.80.4.0/24'),
  ec2.Port.tcp(9000),
  "Allow https traffic"
  );   
  postgrestapiSG.addIngressRule(
  ec2.Peer.ipv4('128.229.67.14/32'),
  ec2.Port.tcp(9000),
  "Allow https traffic"
  );  
  postgrestapiSG.addIngressRule(
  ec2.Peer.ipv4('136.226.18.0/24'),
  ec2.Port.tcp(9000),
  "Allow https traffic"
  );         
  const postgrestdbSG = new ec2.SecurityGroup(this, "postgrestdb-SG", {
  vpc: defaultVpc,
  securityGroupName:parameters.context.config.ProjectName+'-'+parameters.context.config.ProjectEnvironment+'-'+'postgrestdb-SG',
  allowAllOutbound: true,
  });
  postgrestdbSG.addIngressRule(
  ec2.Peer.ipv4('128.229.4.0/24'),
  ec2.Port.tcp(9002),
  "Allow https traffic"
  );
  postgrestdbSG.addIngressRule(
  ec2.Peer.ipv4('108.48.153.254/32'),
  ec2.Port.tcp(9002),
  "Allow https traffic"
  );  
  postgrestdbSG.addIngressRule(
  ec2.Peer.ipv4('158.80.4.0/24'),
  ec2.Port.tcp(9002),
  "Allow https traffic"
  );   
  postgrestdbSG.addIngressRule(
  ec2.Peer.ipv4('128.229.67.14/32'),
  ec2.Port.tcp(9002),
  "Allow https traffic"
  );  
  postgrestdbSG.addIngressRule(
  ec2.Peer.ipv4('136.226.18.0/24'),
  ec2.Port.tcp(9002),
  "Allow https traffic"
  );    
  postgrestdbSG.connections.allowFrom(
    postgrestapiSG,
    ec2.Port.tcp(9002),
  );
  postgrestdbSG.connections.allowFrom(
    ecsSG,
    ec2.Port.tcp(9002),
  );  
  postgrestapiSG.connections.allowFrom(
    ecsSG, 
    ec2.Port.tcp(9000),    
  );
  postgrestapiSG.connections.allowFrom(
    postgrestdbSG, 
    ec2.Port.tcp(9000),    
  );    
  //The ECS Service used for deploying tasks 
  const service1 = new ecs.FargateService(this, "service1", {
    cluster:ScoutEcsCluster,
    desiredCount: 1,
    
    taskDefinition: tdscoutapp,
    securityGroups: [ecsSG],    
    assignPublicIp: true,
    serviceName: 'ecs-cloud-app-service',
    vpcSubnets: defaultVpc,        
  }); 
  const service2 = new ecs.FargateService(this, "service2", {
    cluster:ScoutEcsCluster,
    desiredCount: 1,
    
    taskDefinition: tdpopapp,
    securityGroups: [postgrestapiSG],
    assignPublicIp: true,
    serviceName: 'ecs-cloud-api-service',
    vpcSubnets: defaultVpc
  });
  const service3 = new ecs.FargateService(this, "service3", {
    cluster:ScoutEcsCluster,
    desiredCount: 1,    
    taskDefinition: tdmetalapp,
    securityGroups: [postgrestdbSG],
    assignPublicIp: true,
    serviceName: 'ecs-cloud-db-service',
    vpcSubnets: defaultVpc
  });  
  // add to a target group so make containers discoverable by the application load balancer

  service1.attachToApplicationTargetGroup(ScoutTargetGroupHttp);
  service1.connections.allowFrom(
    albSG,
    ec2.Port.allTcp(),
  );   
  // BONUS: Autoscaling based on memory and CPU usage
  const scalableTaget = service1.autoScaleTaskCount({
    minCapacity: 2,
    maxCapacity: 2,
  });
  scalableTaget.scaleOnMemoryUtilization("ScaleUpMem", {
    targetUtilizationPercent: 75,
  });

  scalableTaget.scaleOnCpuUtilization("ScaleUpCPU", {
    targetUtilizationPercent: 75,
  });
  new cdk.CfnOutput(this, 'dev-ScoutScoutEcsCluster', {
      value: ScoutEcsCluster.clusterName, 
      exportName: 'ScoutEcsCluster-dev'    
  })
  new cdk.CfnOutput(this, 'dev-ecsservice-ALB', {
    value: alb.loadBalancerDnsName,
    exportName: 'Scout-ecs-dev-alb',      
  })
  new cdk.CfnOutput(this, 'dev-ScoutScoutEcsCluster-vpc', {
    value: defaultVpc.vpcId, 
    exportName: 'scout-vpc'    
  })        
 }
}
