import { Command } from '@commander-js/extra-typings';
import { withClient, addPaginationOpts, paginationParams, outputResult } from '../../lib/command-helpers.js';
import { shouldOutputJson } from '../../lib/output.js';
import { padTable, truncate } from '../../lib/format.js';
import pc from 'picocolors';

const list = new Command('list')
  .description('List all personnel');
addPaginationOpts(list);
list.action(withClient(async ({ client, opts, spinner, args }) => {
  spinner.update('Fetching personnel...');
  const params = paginationParams(opts);
  const res = await client.get<any>('/personnel', params);
  spinner.stop('Personnel fetched');

  if (shouldOutputJson(opts)) {
    outputResult(res, opts);
  } else {
    const items = res.data ?? res;
    if (!Array.isArray(items) || items.length === 0) {
      console.log(pc.dim('No personnel found.'));
      return;
    }
    const rows = [
      [pc.bold('ID'), pc.bold('Email'), pc.bold('First Name'), pc.bold('Last Name'), pc.bold('Status')],
      ...items.map((p: any) => [
        String(p.id ?? ''),
        truncate(p.email ?? '-', 36),
        truncate(p.firstName ?? '-', 20),
        truncate(p.lastName ?? '-', 20),
        p.status ?? '-',
      ]),
    ];
    console.log(padTable(rows));
  }
}));

const get = new Command('get')
  .description('Get a single personnel member')
  .argument('<personnelId>', 'Personnel ID');
get.action(withClient(async ({ client, opts, spinner, args }) => {
  const personnelId = args[0];
  spinner.update('Fetching personnel...');
  const res = await client.get<any>(`/personnel/${personnelId}`);
  spinner.stop('Personnel fetched');
  outputResult(res, opts);
}));

const update = new Command('update')
  .description('Update a personnel member')
  .argument('<personnelId>', 'Personnel ID')
  .requiredOption('--data <json>', 'Personnel data as JSON');
update.action(withClient(async ({ client, opts, spinner, args }) => {
  const personnelId = args[0];
  const body = JSON.parse(opts.data as string);
  spinner.update('Updating personnel...');
  const res = await client.put<any>(`/personnel/${personnelId}`, body);
  spinner.stop('Personnel updated');
  outputResult(res, opts);
}));

const resetSync = new Command('reset-sync')
  .description('Reset personnel sync');
resetSync.action(withClient(async ({ client, opts, spinner, args }) => {
  spinner.update('Resetting personnel sync...');
  const res = await client.post<any>('/personnel/actions');
  spinner.stop('Personnel sync reset');
  if (shouldOutputJson(opts)) {
    outputResult(res ?? { success: true }, opts);
  } else {
    console.log(pc.green('Personnel sync reset successfully.'));
  }
}));

export const personnelCommand = new Command('personnel')
  .description('Manage personnel')
  .addCommand(list)
  .addCommand(get)
  .addCommand(update)
  .addCommand(resetSync);
