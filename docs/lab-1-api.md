# Lab 1 - API

## What you will learn

* Setup a fully-managed NoSQL Database with AWS
* Setup a REST API with AWS
* Use VTL to create a functionless API

## Database

Before we create the API, we need a database to persist the notes. Therefore
we use [DynamoDB](https://aws.amazon.com/dynamodb/) as a full-managed NoSQL database.

1. First, we need to install a new NPM package to create DynamoDB databases with AWS CDK. Go back to the terminal and run this command: `npm i @aws-cdk/aws-dynamodb --save`
2. Open the file `lib/serverless-notes-api.ts`. The file should look like this:
  ```typescript
  import * as cdk from '@aws-cdk/core';

  export class ServerlessNotesApiStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);

      // The code that defines your stack goes here
    }
  }
  ```
  This `ServerlessNotesApiStack` class describes the infrastructure we would like to deploy to run our simple serverless notes API.
3. Update the file to describe a DynamoDB database:
  ```diff
   import * as cdk from '@aws-cdk/core';
  +import * as dynamodb from '@aws-cdk/aws-dynamodb';
  
  export class ServerlessNotesApiStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);
  
  -    // The code that defines your stack goes here
  +    const table = new dynamodb.Table(this, 'NotesTable', {
  +      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  +      partitionKey: {
  +        name: 'id',
  +        type: dynamodb.AttributeType.STRING,
  +      },
  +      removalPolicy: cdk.RemovalPolicy.DESTROY,
  +    });
    }
  }
  ```
  With the `Table` class we create a DynamoDB database. We configure some stuff, most importantly the partition key: We describe a field `id` as the unique identifier for the items in the table. Later on we will use UUIDs to differentiate the notes.
4. Deploy the stack again: `cdk deploy`
5. Go back to the AWS console and open the [DynamoDB page](http://console.aws.amazon.com/dynamodb). Click on **Tables**:

![AWS Console DynamoDB Overview](/_media/lab1/aws_console_dynamodb.png)

6. You should see a table starting with `ServerlessNotesApiStack-NotesTable…`. We just created our first fully-managed database!

## API: List all notes

Next step is to create the API and connect it with the database to list all notes. For that, we use the service [API Gateway](https://aws.amazon.com/api-gateway/).

1. As always, we need new NPM packages:
  ```bash
  npm i @aws-cdk/aws-apigateway @aws-cdk/aws-iam --save
  ```
2. Create a new IAM role to give the API access to the database:
  ```diff
   import * as cdk from '@aws-cdk/core';
   import * as dynamodb from '@aws-cdk/aws-dynamodb';
  +import * as iam from '@aws-cdk/aws-iam';
  
   export class ServerlessNotesApiStack extends cdk.Stack {
     constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
       super(scope, id, props);

  +    const apiRole = new iam.Role(this, 'ApiRole', {
  +      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
  +    });
  +    
       const table = new dynamodb.Table(this, 'NotesTable', {
         billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
         partitionKey: {
           name: 'id',
           type: dynamodb.AttributeType.STRING,
         },
         removalPolicy: cdk.RemovalPolicy.DESTROY,
       });
  +    table.grantReadWriteData(apiRole);
     }
   }
  ```
3. Create the API Gateway with the first endpoint to get a list of notes:
  ```diff
   import * as cdk from '@aws-cdk/core';
   import * as dynamodb from '@aws-cdk/aws-dynamodb';
   import * as iam from '@aws-cdk/aws-iam';
  +import * as apigateway from '@aws-cdk/aws-apigateway';
  
   export class ServerlessNotesApiStack extends cdk.Stack {
     constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
  @@ -19,5 +20,33 @@ export class ServerlessNotesApiStack extends cdk.Stack {
         removalPolicy: cdk.RemovalPolicy.DESTROY,
       });
       table.grantReadWriteData(apiRole);
  +
  +    const api = new apigateway.RestApi(this, 'ServerlessNotesApi');
  +
  +    const notes = api.root.addResource('notes');
  +
  +    const notesListIntegration = new apigateway.AwsIntegration({
  +      service: 'dynamodb',
  +      action: 'Scan',
  +      options: {
  +        credentialsRole: apiRole,
  +        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
  +        requestTemplates: {
  +          'application/json': '',
  +        },
  +        integrationResponses: [
  +          {
  +            statusCode: '200',
  +            responseTemplates: {
  +              'application/json': '',
  +            },
  +          },
  +        ],
  +      },
  +    });
  +
  +    notes.addMethod('GET', notesListIntegration, {
  +      methodResponses: [{ statusCode: '200' }],
  +    });
     }
   }
  ```
  The interesting and probably also confusing part is the AWS integration directly with DynamoDB: So instead of spinning up a server or using a Lambda function to handle the communication with the database, we can tell the API Gateway to talk directly to the database. It acts like a fassade for the database.

  For all `GET /notes` requests we want to perform a scan operation to the database and give back the response to the requester. 

4. The next bit is to describe the mapping, so how the REST schema should be mapped to the database schema. As you can see in point 3, we defined a scan operation for the endpoint but for the **requestTemplates** as well as for the **responseTemplates** we didn't define any details - just an empty string. Let's change this by creating a new folder and a new file:
  ```bash
  mkdir templates
  touch templates/notesList.ts
  ```

  Update the `templates/notesList.ts` file:

  ```typescript
  export const request = (tableName: string): string => `
  {
    "TableName": "${tableName}"
  }
  `;

  export const response = `
  #set($inputRoot = $input.path('$'))
  {
    "notes": [
      #foreach($elem in $inputRoot.Items) {
          "id": "$elem.id.S",
          "text": "$elem.text.S"
      }#if($foreach.hasNext),#end
      #end
    ]
  }
  `;

  ```
  
  Let's use the mappings in `lib/serverless-notes-api-stack.ts`:
  ```diff
   import * as iam from '@aws-cdk/aws-iam';
   import * as apigateway from '@aws-cdk/aws-apigateway';
  
  +import * as notesList from '../templates/notesList';
  +
   export class ServerlessNotesApiStack extends cdk.Stack {
     constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
       super(scope, id, props);
  @@ -32,13 +34,13 @@ export class ServerlessNotesApiStack extends cdk.Stack {
           credentialsRole: apiRole,
           passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
           requestTemplates: {
  -          'application/json': '',
  +          'application/json': notesList.request(table.tableName),
           },
           integrationResponses: [
             {
               statusCode: '200',
               responseTemplates: {
  -              'application/json': '',
  +              'application/json': notesList.response,
               },
             },
           ],
  ~
  ```
5. Deploy the changes and see what we get: `cdk deploy` - this time you need to confirm the changes. Just hit `y`.
6. In the terminal, you should find something like this:
  ```bash
  Outputs:
ServerlessNotesApiStack.ServerlessNotesApiEndpointXXXXXX = https://xxxxxxxx.execute-api.eu-west-1.amazonaws.com/prod/
  ```

  Copy the endpoint and run the first curl command:
  ```bash
  curl https://xxxxxxxx.execute-api.eu-west-1.amazonaws.com/prod/notes | jq
  ```

  You should get this response:
  ```json
  {
    "notes": []
  }
  ```

  Awesome! We just created the first endpoint of the REST API to receive a list of notes. Plus we already communicate with the database!

## API: Create notes

After creating the first endpoint to list all notes, we would like to continue and extend the API to support the creation of new notes. The procedure is very similar to what we have done in the previous section: We are going to add a new method to the API, a new AWS integration as well as a new request/response mapping. Let's get started!

1. Create a new file in the templates folder: `touch templates/noteCreate.ts`
2. Update the `templates/noteCreate.ts` file:
  ```typescript
  export const request = (tableName: string): string => `
  { 
    "TableName": "${tableName}",
    "Item": {
      "id": {
        "S": "$context.requestId"
      },
      "text": {
        "S": "$input.path('$.text')"
      }
    }
  }
  `;

  export const response = `
  {
    "id": "$context.requestId"
  }
  `;
  ```
  The mapping here is fairly simple: We take the `text` received by the post data and use it to define a `text` attribute as part of the note. Additionally, we use the unique `requestId` from the [context](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html#context-variable-reference) as the identifier for the new note. For the response mapping, we just take the `requestId` and give it back to the requester.
3. Extend `lib/serverless-notes-api-stack.ts`:
  ```diff
  @@ -4,6 +4,7 @@ import * as iam from '@aws-cdk/aws-iam';
   import * as apigateway from '@aws-cdk/aws-apigateway';
  
   import * as notesList from '../templates/notesList';
  +import * as noteCreate from '../templates/noteCreate';
  
   export class ServerlessNotesApiStack extends cdk.Stack {
     constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
  @@ -50,5 +51,29 @@ export class ServerlessNotesApiStack extends cdk.Stack {
       notes.addMethod('GET', notesListIntegration, {
         methodResponses: [{ statusCode: '200' }],
       });
  +
  +    const notesCreateIntegration = new apigateway.AwsIntegration({
  +      service: 'dynamodb',
  +      action: 'PutItem',
  +      options: {
  +        credentialsRole: apiRole,
  +        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
  +        requestTemplates: {
  +          'application/json': noteCreate.request(table.tableName),
  +        },
  +        integrationResponses: [
  +          {
  +            statusCode: '200',
  +            responseTemplates: {
  +              'application/json': noteCreate.response,
  +            },
  +          },
  +        ],
  +      },
  +    });
  +
  +    notes.addMethod('POST', notesCreateIntegration, {
  +      methodResponses: [{ statusCode: '200' }],
  +    });
     }
   }
  ```
  The only thing that really changed here, compared to the list endpoint, is the action. Instead of running a scan operation, we run `PutItem` here.
4. Deploy the changes: `cdk deploy`
5. Run the following curl command. Don't forget to update the endpoint!
  ```bash
  curl -X POST https://xxxxxx.execute-api.eu-west-1.amazonaws.com/prod/notes --data '{ "text": "Hello World" }' -H 'Content-Type: application/json' | jq
  ```

  You should get back something like this:

  ```json
  {
    "id": "b3986b15-7a7b-4ba2-b17a-9f64b4509cc7"
  }
  ```

  Great! We just created the first note. Feel free to run `GET /notes` again to see the note.