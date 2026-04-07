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
  .description('List vendor documents')
  .requiredOption('--vendor-id <vendorId>', 'Vendor ID');

addPaginationOpts(list);
addExpandOpt(list);

list.action(withClient(async ({ client, opts, spinner, args }) => {
  const vendorId = opts.vendorId as string;
  spinner.update('Fetching vendor documents...');
  const params: Record<string, string | string[] | undefined> = {
    ...paginationParams(opts),
    ...expandParams(opts),
  };
  const data = await client.get<Record<string, unknown>>(`/vendors/${vendorId}/documents`, params);
  spinner.stop();

  if (shouldOutputJson(opts)) {
    outputResult(data, opts);
  } else {
    const items = (data as any).data ?? [];
    if (items.length === 0) {
      console.log(pc.dim('No vendor documents found.'));
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
  .description('Get a single vendor document')
  .requiredOption('--vendor-id <vendorId>', 'Vendor ID')
  .argument('<documentId>', 'Document ID');

addExpandOpt(get);

get.action(withClient(async ({ client, opts, spinner, args }) => {
  const vendorId = opts.vendorId as string;
  const documentId = args[0];
  spinner.update('Fetching vendor document...');
  const params = { ...expandParams(opts) };
  const data = await client.get<Record<string, unknown>>(
    `/vendors/${vendorId}/documents/${documentId}`,
    params,
  );
  spinner.stop();
  outputResult(data, opts);
}));

const upload = new Command('upload')
  .description('Upload a vendor document')
  .requiredOption('--vendor-id <vendorId>', 'Vendor ID')
  .requiredOption('--data <json>', 'Document data as JSON string')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const vendorId = opts.vendorId as string;
    spinner.update('Uploading vendor document...');
    const body = JSON.parse(opts.data as string);
    const data = await client.post(`/vendors/${vendorId}/documents`, body);
    spinner.stop('Vendor document uploaded.');
    outputResult(data, opts);
  }));

export const vendorDocumentsCommand = new Command('vendor-documents')
  .description('Manage vendor documents')
  .addCommand(list)
  .addCommand(get)
  .addCommand(upload);
