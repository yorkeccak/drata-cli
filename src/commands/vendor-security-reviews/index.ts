import { Command } from '@commander-js/extra-typings';
import { withClient, outputResult } from '../../lib/command-helpers.js';

const create = new Command('create')
  .description('Create a security review for a vendor')
  .requiredOption('--vendor-id <vendorId>', 'Vendor ID')
  .requiredOption('--data <json>', 'Security review data as JSON string')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const vendorId = opts.vendorId as string;
    spinner.update('Creating security review...');
    const body = JSON.parse(opts.data as string);
    const data = await client.post(`/vendors/${vendorId}/security-reviews`, body);
    spinner.stop('Security review created.');
    outputResult(data, opts);
  }));

const createWithFile = new Command('create-with-file')
  .description('Create a security review with file upload')
  .requiredOption('--vendor-id <vendorId>', 'Vendor ID')
  .requiredOption('--data <json>', 'Security review data as JSON string')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const vendorId = opts.vendorId as string;
    spinner.update('Creating security review with file...');
    const body = JSON.parse(opts.data as string);
    const data = await client.post(`/vendors/${vendorId}/security-reviews/with-file`, body);
    spinner.stop('Security review created with file.');
    outputResult(data, opts);
  }));

const get = new Command('get')
  .description('Get a security review')
  .requiredOption('--vendor-id <vendorId>', 'Vendor ID')
  .argument('<securityReviewId>', 'Security review ID')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const vendorId = opts.vendorId as string;
    const securityReviewId = args[0];
    spinner.update('Fetching security review...');
    const data = await client.get<Record<string, unknown>>(`/vendors/${vendorId}/security-reviews/${securityReviewId}`);
    spinner.stop();
    outputResult(data, opts);
  }));

const uploadQuestionnaire = new Command('upload-questionnaire')
  .description('Upload a security questionnaire for a vendor')
  .requiredOption('--vendor-id <vendorId>', 'Vendor ID')
  .requiredOption('--data <json>', 'Questionnaire data as JSON string')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const vendorId = opts.vendorId as string;
    spinner.update('Uploading questionnaire...');
    const body = JSON.parse(opts.data as string);
    const data = await client.post(`/vendors/${vendorId}/security-questionnaires`, body);
    spinner.stop('Questionnaire uploaded.');
    outputResult(data, opts);
  }));

const uploadQuestionnaireToReview = new Command('upload-questionnaire-to-review')
  .description('Upload a security questionnaire to a specific review')
  .requiredOption('--vendor-id <vendorId>', 'Vendor ID')
  .argument('<securityReviewId>', 'Security review ID')
  .requiredOption('--data <json>', 'Questionnaire data as JSON string')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const vendorId = opts.vendorId as string;
    const securityReviewId = args[0];
    spinner.update('Uploading questionnaire to review...');
    const body = JSON.parse(opts.data as string);
    const data = await client.post(`/vendors/${vendorId}/security-reviews/${securityReviewId}/security-questionnaires`, body);
    spinner.stop('Questionnaire uploaded to review.');
    outputResult(data, opts);
  }));

export const vendorSecurityReviewsCommand = new Command('vendor-security-reviews')
  .description('Manage vendor security reviews and questionnaires')
  .addCommand(create)
  .addCommand(createWithFile)
  .addCommand(get)
  .addCommand(uploadQuestionnaire)
  .addCommand(uploadQuestionnaireToReview);
