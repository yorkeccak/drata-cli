import { Command } from '@commander-js/extra-typings';
import {
  withClient,
  addPaginationOpts,
  addExpandOpt,
  paginationParams,
  expandParams,
  outputResult,
} from '../../lib/command-helpers.js';
import { shouldOutputJson } from '../../lib/output.js';
import { padTable, truncate, formatDate, colorStatus } from '../../lib/format.js';
import pc from 'picocolors';

const list = new Command('list')
  .description('List vendors');

addPaginationOpts(list);
addExpandOpt(list);

list.action(withClient(async ({ client, opts, spinner, args }) => {
  spinner.update('Fetching vendors...');
  const params: Record<string, string | string[] | undefined> = {
    ...paginationParams(opts),
    ...expandParams(opts),
  };
  const data = await client.get<Record<string, unknown>>('/vendors', params);
  spinner.stop();

  if (shouldOutputJson(opts)) {
    outputResult(data, opts);
  } else {
    const items = (data as any).data ?? [];
    if (items.length === 0) {
      console.log(pc.dim('No vendors found.'));
      return;
    }
    const rows = [
      [pc.bold('ID'), pc.bold('Name'), pc.bold('Status'), pc.bold('Risk Level'), pc.bold('Created')],
      ...items.map((v: any) => [
        String(v.id),
        truncate(v.name ?? '-', 40),
        colorStatus(v.status ?? '-'),
        v.riskLevel ?? '-',
        formatDate(v.createdAt),
      ]),
    ];
    console.log(padTable(rows));
  }
}));

const get = new Command('get')
  .description('Get a single vendor')
  .argument('<vendorId>', 'Vendor ID');

addExpandOpt(get);

get.action(withClient(async ({ client, opts, spinner, args }) => {
  const vendorId = args[0];
  spinner.update('Fetching vendor...');
  const params = { ...expandParams(opts) };
  const data = await client.get<Record<string, unknown>>(`/vendors/${vendorId}`, params);
  spinner.stop();
  outputResult(data, opts);
}));

const create = new Command('create')
  .description('Create a vendor')
  .requiredOption('--data <json>', 'Vendor data as JSON string')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    spinner.update('Creating vendor...');
    const body = JSON.parse(opts.data as string);
    const data = await client.post('/vendors', body);
    spinner.stop('Vendor created.');
    outputResult(data, opts);
  }));

const update = new Command('update')
  .description('Update a vendor')
  .argument('<vendorId>', 'Vendor ID')
  .requiredOption('--data <json>', 'Vendor data as JSON string')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const vendorId = args[0];
    spinner.update('Updating vendor...');
    const body = JSON.parse(opts.data as string);
    const data = await client.put(`/vendors/${vendorId}`, body);
    spinner.stop('Vendor updated.');
    outputResult(data, opts);
  }));

const remove = new Command('remove')
  .description('Delete a vendor')
  .argument('<vendorId>', 'Vendor ID')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const vendorId = args[0];
    spinner.update('Deleting vendor...');
    await client.del(`/vendors/${vendorId}`);
    spinner.stop('Vendor deleted.');
  }));

const stats = new Command('stats')
  .description('Get vendor statistics')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    spinner.update('Fetching vendor stats...');
    const data = await client.get<Record<string, unknown>>('/vendors-stats');
    spinner.stop();
    outputResult(data, opts);
  }));

const listQuestionnaires = new Command('questionnaires')
  .description('List questionnaires for a vendor')
  .argument('<vendorId>', 'Vendor ID');

addPaginationOpts(listQuestionnaires);

listQuestionnaires.action(withClient(async ({ client, opts, spinner, args }) => {
  const vendorId = args[0];
  spinner.update('Fetching questionnaires...');
  const params: Record<string, string | string[] | undefined> = {
    ...paginationParams(opts),
  };
  const data = await client.get<Record<string, unknown>>(`/vendors/${vendorId}/questionnaires`, params);
  spinner.stop();

  if (shouldOutputJson(opts)) {
    outputResult(data, opts);
  } else {
    const items = (data as any).data ?? [];
    if (items.length === 0) {
      console.log(pc.dim('No questionnaires found.'));
      return;
    }
    const rows = [
      [pc.bold('ID'), pc.bold('Status'), pc.bold('Sent'), pc.bold('Completed')],
      ...items.map((q: any) => [
        String(q.id),
        colorStatus(q.status ?? '-'),
        formatDate(q.sentAt),
        formatDate(q.completedAt),
      ]),
    ];
    console.log(padTable(rows));
  }
}));

const sendQuestionnaire = new Command('send-questionnaire')
  .description('Send a questionnaire to a vendor')
  .argument('<vendorId>', 'Vendor ID')
  .requiredOption('--data <json>', 'Questionnaire data as JSON string')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const vendorId = args[0];
    spinner.update('Sending questionnaire...');
    const body = JSON.parse(opts.data as string);
    const data = await client.post(`/vendors/${vendorId}/questionnaires`, body);
    spinner.stop('Questionnaire sent.');
    outputResult(data, opts);
  }));

const getQuestionnaire = new Command('get-questionnaire')
  .description('Get a specific vendor questionnaire')
  .argument('<vendorId>', 'Vendor ID')
  .argument('<questionnaireId>', 'Questionnaire ID')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const vendorId = args[0];
    const questionnaireId = args[1];
    spinner.update('Fetching questionnaire...');
    const data = await client.get<Record<string, unknown>>(
      `/vendors/${vendorId}/questionnaires/${questionnaireId}`,
    );
    spinner.stop();
    outputResult(data, opts);
  }));

export const vendorsCommand = new Command('vendors')
  .description('Manage vendors')
  .addCommand(list)
  .addCommand(get)
  .addCommand(create)
  .addCommand(update)
  .addCommand(remove)
  .addCommand(stats)
  .addCommand(listQuestionnaires)
  .addCommand(sendQuestionnaire)
  .addCommand(getQuestionnaire);
