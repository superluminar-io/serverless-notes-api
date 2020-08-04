import * as cdk from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as iam from '@aws-cdk/aws-iam';

import * as notesList from '../templates/notesList';
import * as noteCreate from '../templates/noteCreate';
import * as noteGet from '../templates/noteGet';
import * as noteEdit from '../templates/noteEdit';
import * as noteDelete from '../templates/noteDelete';

export class ServerlessNotesApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const apiRole = new iam.Role(this, 'ApiRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    });

    const table = new dynamodb.Table(this, 'NotesTable', {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    table.grantReadWriteData(apiRole);

    const api = new apigateway.RestApi(this, 'ServerlessNotesApi', {
      deployOptions: { tracingEnabled: true },
    });

    const notes = api.root.addResource('notes');

    // List notes
    const notesListIntegration = new apigateway.AwsIntegration({
      service: 'dynamodb',
      action: 'Scan',
      options: {
        credentialsRole: apiRole,
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        requestTemplates: {
          'application/json': notesList.request(table.tableName),
        },
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': notesList.response,
            },
          },
        ],
      },
    });

    notes.addMethod('GET', notesListIntegration, {
      methodResponses: [{ statusCode: '200' }],
    });

    // Create note
    const notesCreateIntegration = new apigateway.AwsIntegration({
      service: 'dynamodb',
      action: 'PutItem',
      options: {
        credentialsRole: apiRole,
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        requestTemplates: {
          'application/json': noteCreate.request(table.tableName),
        },
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': noteCreate.response,
            },
          },
        ],
      },
    });

    notes.addMethod('POST', notesCreateIntegration, {
      methodResponses: [{ statusCode: '200' }],
    });

    const note = notes.addResource('{id}');

    // Get note
    const noteGetIntegration = new apigateway.AwsIntegration({
      service: 'dynamodb',
      action: 'GetItem',
      options: {
        credentialsRole: apiRole,
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        requestTemplates: {
          'application/json': noteGet.request(table.tableName),
        },
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': noteGet.response,
            },
          },
        ],
      },
    });

    note.addMethod('GET', noteGetIntegration, {
      methodResponses: [{ statusCode: '200' }],
    });

    // Edit note
    const noteEditIntegration = new apigateway.AwsIntegration({
      service: 'dynamodb',
      action: 'UpdateItem',
      options: {
        credentialsRole: apiRole,
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        requestTemplates: {
          'application/json': noteEdit.request(table.tableName),
        },
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': noteEdit.response,
            },
          },
        ],
      },
    });

    note.addMethod('PUT', noteEditIntegration, {
      methodResponses: [{ statusCode: '200' }],
    });

    // Delete note
    const noteDeleteIntegration = new apigateway.AwsIntegration({
      service: 'dynamodb',
      action: 'DeleteItem',
      options: {
        credentialsRole: apiRole,
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        requestTemplates: {
          'application/json': noteDelete.request(table.tableName),
        },
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': noteDelete.response,
            },
          },
        ],
      },
    });

    note.addMethod('DELETE', noteDeleteIntegration, {
      methodResponses: [{ statusCode: '200' }],
    });
  }
}
