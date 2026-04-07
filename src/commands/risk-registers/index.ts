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
  .description('List risk registers');

addPaginationOpts(list);
addExpandOpt(list);

list.action(withClient(async ({ client, opts, spinner, args }) => {
  spinner.update('Fetching risk registers...');
  const params: Record<string, string | string[] | undefined> = {
    ...paginationParams(opts),
    ...expandParams(opts),
  };
  const data = await client.get<Record<string, unknown>>('/risk-registers', params);
  spinner.stop();

  if (shouldOutputJson(opts)) {
    outputResult(data, opts);
  } else {
    const items = (data as any).data ?? [];
    if (items.length === 0) {
      console.log(pc.dim('No risk registers found.'));
      return;
    }
    const rows = [
      [pc.bold('ID'), pc.bold('Name'), pc.bold('Status'), pc.bold('Created')],
      ...items.map((r: any) => [
        String(r.id),
        truncate(r.name ?? '-', 40),
        colorStatus(r.status ?? '-'),
        formatDate(r.createdAt),
      ]),
    ];
    console.log(padTable(rows));
  }
}));

const get = new Command('get')
  .description('Get a single risk register')
  .argument('<riskRegisterId>', 'Risk register ID');

addExpandOpt(get);

get.action(withClient(async ({ client, opts, spinner, args }) => {
  const riskRegisterId = args[0];
  spinner.update('Fetching risk register...');
  const params = { ...expandParams(opts) };
  const data = await client.get<Record<string, unknown>>(`/risk-registers/${riskRegisterId}`, params);
  spinner.stop();
  outputResult(data, opts);
}));

const create = new Command('create')
  .description('Create a risk register')
  .requiredOption('--data <json>', 'Risk register data as JSON string')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    spinner.update('Creating risk register...');
    const body = JSON.parse(opts.data as string);
    const data = await client.post('/risk-registers', body);
    spinner.stop('Risk register created.');
    outputResult(data, opts);
  }));

const update = new Command('update')
  .description('Update a risk register')
  .argument('<riskRegisterId>', 'Risk register ID')
  .requiredOption('--data <json>', 'Risk register data as JSON string')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const riskRegisterId = args[0];
    spinner.update('Updating risk register...');
    const body = JSON.parse(opts.data as string);
    const data = await client.put(`/risk-registers/${riskRegisterId}`, body);
    spinner.stop('Risk register updated.');
    outputResult(data, opts);
  }));

const remove = new Command('delete')
  .description('Delete a risk register')
  .argument('<riskRegisterId>', 'Risk register ID')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const riskRegisterId = args[0];
    spinner.update('Deleting risk register...');
    await client.del(`/risk-registers/${riskRegisterId}`);
    spinner.stop('Risk register deleted.');
  }));

export const riskRegistersCommand = new Command('risk-registers')
  .description('Manage risk registers')
  .addCommand(list)
  .addCommand(get)
  .addCommand(create)
  .addCommand(update)
  .addCommand(remove);
