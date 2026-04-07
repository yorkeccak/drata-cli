import { Command } from '@commander-js/extra-typings';
import {
  withClient,
  addPaginationOpts,
  paginationParams,
  outputResult,
} from '../../lib/command-helpers.js';
import { shouldOutputJson } from '../../lib/output.js';
import { padTable, truncate, formatDate } from '../../lib/format.js';
import pc from 'picocolors';

const list = new Command('list')
  .description('List documents for a user')
  .argument('<userId>', 'User ID');

addPaginationOpts(list);

list.action(withClient(async ({ client, opts, spinner, args }) => {
  const userId = args[0];
  spinner.update('Fetching user documents...');
  const params = { ...paginationParams(opts) };
  const data = await client.get<Record<string, unknown>>(`/users/${userId}/documents`, params);
  spinner.stop();

  if (shouldOutputJson(opts)) {
    outputResult(data, opts);
  } else {
    const items = (data as any).data ?? [];
    if (items.length === 0) {
      console.log(pc.dim('No documents found.'));
      return;
    }
    const rows = [
      [pc.bold('ID'), pc.bold('Name'), pc.bold('Type'), pc.bold('Created')],
      ...items.map((d: any) => [
        String(d.id),
        truncate(d.name ?? '-', 40),
        d.type ?? '-',
        formatDate(d.createdAt),
      ]),
    ];
    console.log(padTable(rows));
  }
}));

const get = new Command('get')
  .description('Get a single user document')
  .argument('<userId>', 'User ID')
  .argument('<documentId>', 'Document ID')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const userId = args[0];
    const documentId = args[1];
    spinner.update('Fetching document...');
    const data = await client.get<Record<string, unknown>>(`/users/${userId}/documents/${documentId}`);
    spinner.stop();
    outputResult(data, opts);
  }));

const upload = new Command('upload')
  .description('Upload a document for a user')
  .argument('<userId>', 'User ID')
  .requiredOption('--data <json>', 'Document data as JSON string')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const userId = args[0];
    spinner.update('Uploading document...');
    const body = JSON.parse(opts.data as string);
    const data = await client.post(`/users/${userId}/documents`, body);
    spinner.stop('Document uploaded.');
    outputResult(data, opts);
  }));

const remove = new Command('delete')
  .description('Delete a user document')
  .argument('<userId>', 'User ID')
  .argument('<documentId>', 'Document ID')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const userId = args[0];
    const documentId = args[1];
    spinner.update('Deleting document...');
    await client.del(`/users/${userId}/documents/${documentId}`);
    spinner.stop('Document deleted.');
  }));

export const userDocumentsCommand = new Command('user-documents')
  .description('Manage user documents')
  .addCommand(list)
  .addCommand(get)
  .addCommand(upload)
  .addCommand(remove);
