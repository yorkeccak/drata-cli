import { Command } from '@commander-js/extra-typings';
import {
  withClient,
  addPaginationOpts,
  paginationParams,
  outputResult,
} from '../../lib/command-helpers.js';
import pc from 'picocolors';

function addControlOpts<T extends Command<any, any>>(cmd: T): T {
  return cmd
    .requiredOption('--workspace <workspaceId>', 'Workspace ID')
    .requiredOption('--control-id <controlId>', 'Control ID') as T;
}

function ownersPath(opts: Record<string, unknown>): string {
  return `/workspaces/${opts.workspace}/controls/${opts.controlId}/owners`;
}

const list = new Command('list')
  .description('List owners of a control');

addControlOpts(list);
addPaginationOpts(list);

list.action(withClient(async ({ client, opts, spinner, args }) => {
  spinner.update('Fetching owners...');
  const params = { ...paginationParams(opts) };
  const data = await client.get<Record<string, unknown>>(ownersPath(opts), params);
  spinner.stop();
  outputResult(data, opts);
}));

const add = new Command('add')
  .description('Add an owner to a control')
  .requiredOption('--owner-id <ownerId>', 'Owner user ID');

addControlOpts(add);

add.action(withClient(async ({ client, opts, spinner, args }) => {
  spinner.update('Adding owner...');
  const data = await client.post(ownersPath(opts), { ownerId: Number(opts.ownerId) });
  spinner.stop('Owner added.');
  outputResult(data, opts);
}));

const modify = new Command('modify')
  .description('Set owners for a control')
  .requiredOption('--owner-ids <ids>', 'Comma-separated owner user IDs');

addControlOpts(modify);

modify.action(withClient(async ({ client, opts, spinner, args }) => {
  const ownerUserIds = (opts.ownerIds as string).split(',').map(Number);
  spinner.update('Updating owners...');
  const data = await client.put(ownersPath(opts), { ownerUserIds });
  spinner.stop('Owners updated.');
  outputResult(data, opts);
}));

const remove = new Command('remove')
  .description('Remove an owner from a control')
  .argument('<ownerId>', 'Owner ID to remove');

addControlOpts(remove);

remove.action(withClient(async ({ client, opts, spinner, args }) => {
  const ownerId = args[0];
  spinner.update('Removing owner...');
  await client.del(`${ownersPath(opts)}/${ownerId}`);
  spinner.stop('Owner removed.');
}));

export const controlOwnersCommand = new Command('control-owners')
  .description('Manage control owners')
  .addCommand(list)
  .addCommand(add)
  .addCommand(modify)
  .addCommand(remove);
