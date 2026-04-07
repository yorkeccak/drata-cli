import { Command } from '@commander-js/extra-typings';
import { withClient, addPaginationOpts, paginationParams, outputResult } from '../../lib/command-helpers.js';
import { shouldOutputJson } from '../../lib/output.js';
import { padTable, truncate, formatDate, colorStatus } from '../../lib/format.js';
import pc from 'picocolors';

const list = new Command('list')
  .description('List custom connections');
addPaginationOpts(list);
list.action(withClient(async ({ client, opts, spinner }) => {
  spinner.update('Fetching custom connections…');
  const res = await client.get<any>('/custom-connections', paginationParams(opts));
  spinner.stop();
  outputResult(res, opts);
}));

const get = new Command('get')
  .description('Get a custom connection')
  .requiredOption('--connection-id <id>', 'Connection ID');
get.action(withClient(async ({ client, opts, spinner }) => {
  spinner.update('Fetching connection…');
  const res = await client.get<any>(`/custom-connections/${opts.connectionId}`);
  spinner.stop();
  outputResult(res, opts);
}));

const create = new Command('create')
  .description('Create a custom connection')
  .requiredOption('--name <name>', 'Connection name')
  .requiredOption('--provider-types <types...>', 'Provider types');
create.action(withClient(async ({ client, opts, spinner }) => {
  spinner.update('Creating connection…');
  const res = await client.post<any>('/custom-connections', {
    name: opts.name,
    providerTypes: opts.providerTypes,
  });
  spinner.stop();
  outputResult(res, opts);
}));

const update = new Command('update')
  .description('Update a custom connection')
  .requiredOption('--connection-id <id>', 'Connection ID')
  .option('--alias <alias>', 'Connection alias')
  .option('--description <desc>', 'Connection description');
update.action(withClient(async ({ client, opts, spinner }) => {
  spinner.update('Updating connection…');
  const body: Record<string, string> = {};
  if (opts.alias) body.alias = opts.alias;
  if (opts.description) body.description = opts.description;
  const res = await client.put<any>(`/custom-connections/${opts.connectionId}`, body);
  spinner.stop();
  outputResult(res, opts);
}));

const del = new Command('delete')
  .description('Delete a custom connection')
  .requiredOption('--connection-id <id>', 'Connection ID');
del.action(withClient(async ({ client, opts, spinner }) => {
  spinner.update('Deleting connection…');
  const res = await client.del<any>(`/custom-connections/${opts.connectionId}`);
  spinner.stop();
  outputResult(res ?? { deleted: true }, opts);
}));

export const customConnectionsCommand = new Command('custom-connections')
  .description('Manage custom connections')
  .addCommand(list)
  .addCommand(get)
  .addCommand(create)
  .addCommand(update)
  .addCommand(del);
