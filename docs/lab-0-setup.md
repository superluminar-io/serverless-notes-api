# Lab 0 - Setup

## What you will learn

- Create an IAM User
- Setup Cloud9 Environment
- Bootstrap AWS CDK

## IAM User

To get started with the workshop you need to have **Administrator Access** to an AWS Account. Please do not use the accounts root user since this is bad practice and leads to potential security risks.

We recommend you create a dedicate IAM user following [this guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started_create-admin-group.html).

Make sure, that you are able to login into the [AWS Console](https://console.aws.amazon.com/) with your IAM user.

## Cloud9 Environment

Welcome in your AWS Console! You should see this screen:

![AWS Console Startpage](/_media/lab0/aws_console_startpage.png)

Follow these steps to create a Cloud9 environment:

1. In the input field **Find Services** search for **Cloud9** and open the service page.
2. Click on **Create environment**:

![Cloud9 First Step](/_media/lab0/cloud9_step1.png)

3. Enter a name for your environment (e.g. **Serverless Workshop**) and click on the **Next step** button.
4. In the second step, just keep everything like it is and click again on **Next step**.
5. Review your settings and click on **Create environment**.
6. Cool, now give AWS some time to boostrap your Cloud9 environmemt. After a while you should see this: 

![Cloud9 Final Step](/_media/lab0/cloud9_final_step.png)

What did we get? We got an IDE similiar to IntelliJ but hosted in the cloud and deeply connected in the AWS ecosystem. It's worth mentioning that Clou9 runs on a virtual machine (called EC2 in the AWS universe) and you pay for every hour the VM runs. Luckily, Cloud9 automatically teardowns the machine if you don't use it, so your cloud bill shouldn't explode.

Let's get to the next step and boostrap the first AWS CDK project.

## AWS CDK

What is AWS CDK? Well, that's how AWS describes it:

> The AWS Cloud Development Kit (AWS CDK) is an open source software development framework to model and provision your cloud application resources using familiar programming languages.
-- https://aws.amazon.com/cdk/

With AWS CDK we can easily describe all the infrastructure we need in so called **Infrastructure as Code**. Let's get started by bootstrapping an AWS CDK project with TypeScript:

1. First, go to the terminal of your Cloud9 environment:

![Cloud9 Terminal](/_media/lab0/aws_cdk_terminal.png)

2. Create a new folder: `mkdir serverless-notes-api`
3. Jump into the folder: `cd serverless-notes-api`
4. Init your CDK project: `cdk init --language typescript`
5. After that you might notice some new files in the explorer:

![AWS CDK After Init](/_media/lab0/aws_cdk_after_init.png)

5. Before we use the CDK for the first time, we would like to update the dependencies to make sure we run on the latest version. Run these commands:
  ```bash
  npm i @aws-cdk/core@latest --save
  npm i aws-cdk@latest @aws-cdk/assert typescript@latest --save-dev

  # Please also run this command, we need it later
  sudo yum install jq 
  ```
6. We can now deploy our CloudFormation stack: `cdk deploy`
7. Go to the [CloudFormation service page](http://console.aws.amazon.com/cloudformation) to see your stack.

This stack is pretty empty because we didn't describe any infrastructure yet, but everything is prepared now to go to the next lab.