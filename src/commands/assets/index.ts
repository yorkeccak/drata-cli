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
import { padTable, truncate, formatDate } from '../../lib/format.js';
import pc from 'picocolors';

const list = new Command('list')
  .description('List assets');

addPaginationOpts(list);
addExpandOpt(list);

list
  .option('--asset-type <type>', 'Filter by asset type')
  .option('--asset-class-type <type>', 'Filter by asset class type')
  .option('--asset-provider <provider>', 'Filter by asset provider')
  .option('--user-id <userId>', 'Filter by user ID')
  .option('--employment-status <status>', 'Filter by employment status')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    spinner.update('Fetching assets...');
    const params: Record<string, string | string[] | undefined> = {
      ...paginationParams(opts),
      ...expandParams(opts),
      assetType: opts.assetType as string | undefined,
      assetClassType: opts.assetClassType as string | undefined,
      assetProvider: opts.assetProvider as string | undefined,
      userId: opts.userId as string | undefined,
      employmentStatus: opts.employmentStatus as string | undefined,
    };
    const data = await client.get<Record<string, unknown>>('/assets', params);
    spinner.stop();

    if (shouldOutputJson(opts)) {
      outputResult(data, opts);
    } else {
      const items = (data as any).data ?? [];
      if (items.length === 0) {
        console.log(pc.dim('No assets found.'));
        return;
      }
      const rows = [
        [pc.bold('ID'), pc.bold('Name'), pc.bold('Type'), pc.bold('Provider'), pc.bold('Created')],
        ...items.map((a: any) => [
          String(a.id),
          truncate(a.name ?? '-', 40),
          a.assetType ?? '-',
          a.assetProvider ?? '-',
          formatDate(a.createdAt),
        ]),
      ];
      console.log(padTable(rows));
    }
  }));

const get = new Command('get')
  .description('Get a single asset')
  .argument('<assetId>', 'Asset ID');

addExpandOpt(get);

get.action(withClient(async ({ client, opts, spinner, args }) => {
  const assetId = args[0];
  spinner.update('Fetching asset...');
  const params = { ...expandParams(opts) };
  const data = await client.get<Record<string, unknown>>(`/assets/${assetId}`, params);
  spinner.stop();
  outputResult(data, opts);
}));

const create = new Command('create')
  .description('Create an asset')
  .requiredOption('--data <json>', 'Asset data as JSON string')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    spinner.update('Creating asset...');
    const body = JSON.parse(opts.data as string);
    const data = await client.post('/assets', body);
    spinner.stop('Asset created.');
    outputResult(data, opts);
  }));

const update = new Command('update')
  .description('Update an asset')
  .argument('<assetId>', 'Asset ID')
  .requiredOption('--data <json>', 'Asset data as JSON string')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const assetId = args[0];
    spinner.update('Updating asset...');
    const body = JSON.parse(opts.data as string);
    const data = await client.put(`/assets/${assetId}`, body);
    spinner.stop('Asset updated.');
    outputResult(data, opts);
  }));

const remove = new Command('remove')
  .description('Delete an asset')
  .argument('<assetId>', 'Asset ID')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const assetId = args[0];
    spinner.update('Deleting asset...');
    await client.del(`/assets/${assetId}`);
    spinner.stop('Asset deleted.');
  }));

export const assetsCommand = new Command('assets')
  .description('Manage assets')
  .addCommand(list)
  .addCommand(get)
  .addCommand(create)
  .addCommand(update)
  .addCommand(remove);
