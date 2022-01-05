import { App, Construct } from "@aws-cdk/core";
import * as budgets from '@aws-cdk/aws-budgets';
import * as cdk from '@aws-cdk/core';

declare const costFilters: any;
declare const plannedBudgetLimits: any;
// interface BudgetProps {

// }
export class Budget extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        // export class Budget extends Construct {
        //     constructor(scope: Construct, id: string, props: BudgetProps) {
        //         super(scope, id);
        new budgets.CfnBudget(this, 'MyCfnBudget', {
            budget: {
                budgetType: 'COST',
                timeUnit: 'MONTHLY ',

                // the properties below are optional
                budgetLimit: {
                    amount: 5,
                    unit: 'USD',
                },
                budgetName: 'Monthly Budget',

            },
            notificationsWithSubscribers: [{
                notification: {
                    comparisonOperator: 'GREATER_THAN ',
                    notificationType: 'ACTUAL ',
                    threshold: 80,
                    thresholdType: 'PERCENTAGE',
                },
                subscribers: [{
                    address: 'anwarkabir2011@gmail.com',
                    subscriptionType: 'EMAIL',
                }]
            }],
        });
    }
}