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
  .description('List risk library items');

addPaginationOpts(list);
addExpandOpt(list);

list.action(withClient(async ({ client, opts, spinner, args }) => {
  spinner.update('Fetching risk library...');
  const params: Record<string, string | string[] | undefined> = {
    ...paginationParams(opts),
    ...expandParams(opts),
  };
  const data = await client.get<Record<string, unknown>>('/risk-library', params);
  spinner.stop();

  if (shouldOutputJson(opts)) {
    outputResult(data, opts);
  } else {
    const items = (data as any).data ?? [];
    if (items.length === 0) {
      console.log(pc.dim('No risk library items found.'));
      return;
    }
    const rows = [
      [pc.bold('ID'), pc.bold('Name'), pc.bold('Category'), pc.bold('Created')],
      ...items.map((r: any) => [
        String(r.id),
        truncate(r.name ?? '-', 40),
        r.category ?? '-',
        formatDate(r.createdAt),
      ]),
    ];
    console.log(padTable(rows));
  }
}));

const get = new Command('get')
  .description('Get a single risk library item')
  .argument('<riskLibraryId>', 'Risk library item ID');

addExpandOpt(get);

get.action(withClient(async ({ client, opts, spinner, args }) => {
  const riskLibraryId = args[0];
  spinner.update('Fetching risk library item...');
  const params = { ...expandParams(opts) };
  const data = await client.get<Record<string, unknown>>(`/risk-library/${riskLibraryId}`, params);
  spinner.stop();
  outputResult(data, opts);
}));

const copy = new Command('copy')
  .description('Copy risk library items to a risk register')
  .requiredOption('--register-id <registerId>', 'Target risk register ID')
  .requiredOption('--item-ids <ids...>', 'Risk library item IDs to copy')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const registerId = opts.registerId as string;
    const itemIds = opts.itemIds as string[];
    spinner.update('Copying risk library items...');
    const body = {
      riskRegisterId: registerId,
      riskLibraryIds: itemIds.map(Number),
    };
    const data = await client.post('/risk-library/action-copy', body);
    spinner.stop('Risk library items copied.');
    outputResult(data, opts);
  }));

export const riskLibraryCommand = new Command('risk-library')
  .description('Browse and copy from the risk library')
  .addCommand(list)
  .addCommand(get)
  .addCommand(copy);
