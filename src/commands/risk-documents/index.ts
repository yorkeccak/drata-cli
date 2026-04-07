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
  .description('List risk documents')
  .requiredOption('--register-id <registerId>', 'Risk register ID')
  .requiredOption('--risk-id <riskId>', 'Risk ID');

addPaginationOpts(list);
addExpandOpt(list);

list.action(withClient(async ({ client, opts, spinner, args }) => {
  const registerId = opts.registerId as string;
  const riskId = opts.riskId as string;
  spinner.update('Fetching risk documents...');
  const params: Record<string, string | string[] | undefined> = {
    ...paginationParams(opts),
    ...expandParams(opts),
  };
  const data = await client.get<Record<string, unknown>>(
    `/risk-registers/${registerId}/risks/${riskId}/documents`,
    params,
  );
  spinner.stop();

  if (shouldOutputJson(opts)) {
    outputResult(data, opts);
  } else {
    const items = (data as any).data ?? [];
    if (items.length === 0) {
      console.log(pc.dim('No risk documents found.'));
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
  .description('Get a single risk document')
  .requiredOption('--register-id <registerId>', 'Risk register ID')
  .requiredOption('--risk-id <riskId>', 'Risk ID')
  .argument('<documentId>', 'Document ID');

addExpandOpt(get);

get.action(withClient(async ({ client, opts, spinner, args }) => {
  const registerId = opts.registerId as string;
  const riskId = opts.riskId as string;
  const documentId = args[0];
  spinner.update('Fetching risk document...');
  const params = { ...expandParams(opts) };
  const data = await client.get<Record<string, unknown>>(
    `/risk-registers/${registerId}/risks/${riskId}/documents/${documentId}`,
    params,
  );
  spinner.stop();
  outputResult(data, opts);
}));

const upload = new Command('upload')
  .description('Upload a risk document')
  .requiredOption('--register-id <registerId>', 'Risk register ID')
  .requiredOption('--risk-id <riskId>', 'Risk ID')
  .requiredOption('--data <json>', 'Document data as JSON string')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const registerId = opts.registerId as string;
    const riskId = opts.riskId as string;
    spinner.update('Uploading risk document...');
    const body = JSON.parse(opts.data as string);
    const data = await client.post(
      `/risk-registers/${registerId}/risks/${riskId}/documents`,
      body,
    );
    spinner.stop('Risk document uploaded.');
    outputResult(data, opts);
  }));

const remove = new Command('delete')
  .description('Delete a risk document')
  .requiredOption('--register-id <registerId>', 'Risk register ID')
  .requiredOption('--risk-id <riskId>', 'Risk ID')
  .argument('<documentId>', 'Document ID')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const registerId = opts.registerId as string;
    const riskId = opts.riskId as string;
    const documentId = args[0];
    spinner.update('Deleting risk document...');
    await client.del(
      `/risk-registers/${registerId}/risks/${riskId}/documents/${documentId}`,
    );
    spinner.stop('Risk document deleted.');
  }));

export const riskDocumentsCommand = new Command('risk-documents')
  .description('Manage risk documents')
  .addCommand(list)
  .addCommand(get)
  .addCommand(upload)
  .addCommand(remove);
