import { Command } from '@commander-js/extra-typings';
import {
  withClient,
  addPaginationOpts,
  paginationParams,
  outputResult,
} from '../../lib/command-helpers.js';
import { shouldOutputJson } from '../../lib/output.js';
import { padTable, truncate, formatDate } from '../../lib/format.js';
import pc from 'picocolors';

const list = new Command('list')
  .description('List HRIS user identities')
  .requiredOption('--connection-id <connectionId>', 'Custom connection ID');

addPaginationOpts(list);

list.action(withClient(async ({ client, opts, spinner, args }) => {
  const connectionId = opts.connectionId as string;
  spinner.update('Fetching HRIS identities...');
  const params = { ...paginationParams(opts) };
  const data = await client.get<Record<string, unknown>>(`/custom-connections/${connectionId}/hris-user-identities`, params);
  spinner.stop();

  if (shouldOutputJson(opts)) {
    outputResult(data, opts);
  } else {
    const items = (data as any).data ?? [];
    if (items.length === 0) {
      console.log(pc.dim('No HRIS identities found.'));
      return;
    }
    const rows = [
      [pc.bold('ID'), pc.bold('Name'), pc.bold('Email'), pc.bold('Created')],
      ...items.map((i: any) => [
        String(i.id),
        truncate(i.name ?? '-', 40),
        i.email ?? '-',
        formatDate(i.createdAt),
      ]),
    ];
    console.log(padTable(rows));
  }
}));

const get = new Command('get')
  .description('Get a single HRIS user identity')
  .requiredOption('--connection-id <connectionId>', 'Custom connection ID')
  .argument('<userIdentityId>', 'User identity ID')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const connectionId = opts.connectionId as string;
    const userIdentityId = args[0];
    spinner.update('Fetching HRIS identity...');
    const data = await client.get<Record<string, unknown>>(`/custom-connections/${connectionId}/hris-user-identities/${userIdentityId}`);
    spinner.stop();
    outputResult(data, opts);
  }));

const batchUpsert = new Command('batch-upsert')
  .description('Batch upsert HRIS user identities')
  .requiredOption('--connection-id <connectionId>', 'Custom connection ID')
  .requiredOption('--data <json>', 'Array of identity objects as JSON string')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const connectionId = opts.connectionId as string;
    spinner.update('Upserting HRIS identities...');
    const body = JSON.parse(opts.data as string);
    const data = await client.post(`/custom-connections/${connectionId}/hris-user-identities`, body);
    spinner.stop('HRIS identities upserted.');
    outputResult(data, opts);
  }));

const update = new Command('update')
  .description('Update a HRIS user identity')
  .requiredOption('--connection-id <connectionId>', 'Custom connection ID')
  .argument('<userIdentityId>', 'User identity ID')
  .requiredOption('--data <json>', 'Identity data as JSON string')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const connectionId = opts.connectionId as string;
    const userIdentityId = args[0];
    spinner.update('Updating HRIS identity...');
    const body = JSON.parse(opts.data as string);
    const data = await client.put(`/custom-connections/${connectionId}/hris-user-identities/${userIdentityId}`, body);
    spinner.stop('HRIS identity updated.');
    outputResult(data, opts);
  }));

const remove = new Command('delete')
  .description('Delete a HRIS user identity')
  .requiredOption('--connection-id <connectionId>', 'Custom connection ID')
  .argument('<userIdentityId>', 'User identity ID')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const connectionId = opts.connectionId as string;
    const userIdentityId = args[0];
    spinner.update('Deleting HRIS identity...');
    await client.del(`/custom-connections/${connectionId}/hris-user-identities/${userIdentityId}`);
    spinner.stop('HRIS identity deleted.');
  }));

export const hrisIdentitiesCommand = new Command('hris-identities')
  .description('Manage HRIS user identities for custom connections')
  .addCommand(list)
  .addCommand(get)
  .addCommand(batchUpsert)
  .addCommand(update)
  .addCommand(remove);
