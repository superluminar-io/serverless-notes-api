#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ServerlessNotesApiStack } from '../lib/serverless-notes-api-stack';

const app = new cdk.App();
new ServerlessNotesApiStack(app, 'ServerlessNotesApiStack');
