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
  .description('List vendor types');

addPaginationOpts(list);

list.action(withClient(async ({ client, opts, spinner, args }) => {
  spinner.update('Fetching vendor types...');
  const params: Record<string, string | string[] | undefined> = {
    ...paginationParams(opts),
  };
  const data = await client.get<Record<string, unknown>>('/vendor-types', params);
  spinner.stop();

  if (shouldOutputJson(opts)) {
    outputResult(data, opts);
  } else {
    const items = (data as any).data ?? [];
    if (items.length === 0) {
      console.log(pc.dim('No vendor types found.'));
      return;
    }
    const rows = [
      [pc.bold('ID'), pc.bold('Name'), pc.bold('Created')],
      ...items.map((t: any) => [
        String(t.id),
        truncate(t.name ?? '-', 40),
        formatDate(t.createdAt),
      ]),
    ];
    console.log(padTable(rows));
  }
}));

const create = new Command('create')
  .description('Create a vendor type')
  .requiredOption('--data <json>', 'Vendor type data as JSON string')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    spinner.update('Creating vendor type...');
    const body = JSON.parse(opts.data as string);
    const data = await client.post('/vendor-types', body);
    spinner.stop('Vendor type created.');
    outputResult(data, opts);
  }));

const update = new Command('update')
  .description('Update a vendor type')
  .argument('<vendorTypeId>', 'Vendor type ID')
  .requiredOption('--data <json>', 'Vendor type data as JSON string')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const vendorTypeId = args[0];
    spinner.update('Updating vendor type...');
    const body = JSON.parse(opts.data as string);
    const data = await client.put(`/vendor-types/${vendorTypeId}`, body);
    spinner.stop('Vendor type updated.');
    outputResult(data, opts);
  }));

const remove = new Command('delete')
  .description('Delete a vendor type')
  .argument('<vendorTypeId>', 'Vendor type ID')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const vendorTypeId = args[0];
    spinner.update('Deleting vendor type...');
    await client.del(`/vendor-types/${vendorTypeId}`);
    spinner.stop('Vendor type deleted.');
  }));

export const vendorTypesCommand = new Command('vendor-types')
  .description('Manage vendor types')
  .addCommand(list)
  .addCommand(create)
  .addCommand(update)
  .addCommand(remove);
