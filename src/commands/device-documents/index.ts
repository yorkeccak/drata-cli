import { Command } from '@commander-js/extra-typings';
import { withClient, addPaginationOpts, paginationParams, outputResult } from '../../lib/command-helpers.js';
import { shouldOutputJson } from '../../lib/output.js';
import { padTable, truncate, formatDate } from '../../lib/format.js';
import pc from 'picocolors';

const list = new Command('list')
  .description('List documents for a device')
  .requiredOption('--device-id <id>', 'Device ID');
addPaginationOpts(list);
list.action(withClient(async ({ client, opts, spinner, args }) => {
  const deviceId = opts.deviceId as string;
  spinner.update('Fetching device documents...');
  const params = paginationParams(opts);
  const res = await client.get<any>(`/devices/${deviceId}/documents`, params);
  spinner.stop('Documents fetched');

  if (shouldOutputJson(opts)) {
    outputResult(res, opts);
  } else {
    const items = res.data ?? res;
    if (!Array.isArray(items) || items.length === 0) {
      console.log(pc.dim('No documents found.'));
      return;
    }
    const rows = [
      [pc.bold('ID'), pc.bold('Name'), pc.bold('Type'), pc.bold('Created')],
      ...items.map((d: any) => [
        String(d.id ?? ''),
        truncate(d.name ?? d.fileName ?? '-', 40),
        d.type ?? d.documentType ?? '-',
        formatDate(d.createdAt),
      ]),
    ];
    console.log(padTable(rows));
  }
}));

const get = new Command('get')
  .description('Get a single device document')
  .requiredOption('--device-id <id>', 'Device ID')
  .argument('<documentId>', 'Document ID');
get.action(withClient(async ({ client, opts, spinner, args }) => {
  const deviceId = opts.deviceId as string;
  const documentId = args[0];
  spinner.update('Fetching document...');
  const res = await client.get<any>(`/devices/${deviceId}/documents/${documentId}`);
  spinner.stop('Document fetched');
  outputResult(res, opts);
}));

const upload = new Command('upload')
  .description('Upload a document to a device')
  .requiredOption('--device-id <id>', 'Device ID')
  .requiredOption('--type <type>', 'Document type')
  .requiredOption('--data <json>', 'Document data as JSON');
upload.action(withClient(async ({ client, opts, spinner, args }) => {
  const deviceId = opts.deviceId as string;
  const body = {
    ...JSON.parse(opts.data as string),
    type: opts.type as string,
  };
  spinner.update('Uploading document...');
  const res = await client.post<any>(`/devices/${deviceId}/documents`, body);
  spinner.stop('Document uploaded');
  outputResult(res, opts);
}));

const del = new Command('delete')
  .description('Delete a device document')
  .requiredOption('--device-id <id>', 'Device ID')
  .argument('<documentId>', 'Document ID');
del.action(withClient(async ({ client, opts, spinner, args }) => {
  const deviceId = opts.deviceId as string;
  const documentId = args[0];
  spinner.update('Deleting document...');
  await client.del(`/devices/${deviceId}/documents/${documentId}`);
  spinner.stop('Document deleted');
  if (shouldOutputJson(opts)) {
    outputResult({ success: true }, opts);
  } else {
    console.log(pc.green('Document deleted successfully.'));
  }
}));

export const deviceDocumentsCommand = new Command('device-documents')
  .description('Manage device documents')
  .addCommand(list)
  .addCommand(get)
  .addCommand(upload)
  .addCommand(del);
