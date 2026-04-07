import { Command } from '@commander-js/extra-typings';
import { withClient, addPaginationOpts, paginationParams, outputResult } from '../../lib/command-helpers.js';
import { shouldOutputJson } from '../../lib/output.js';
import { padTable, truncate, formatDate, colorStatus } from '../../lib/format.js';
import pc from 'picocolors';

const list = new Command('list')
  .description('List evidence library items')
  .requiredOption('--workspace <id>', 'Workspace ID');
addPaginationOpts(list);
list.action(withClient(async ({ client, opts, spinner }) => {
  spinner.update('Fetching evidence library…');
  const res = await client.get<any>(
    `/workspaces/${opts.workspace}/evidence-library`,
    paginationParams(opts),
  );
  spinner.stop();
  outputResult(res, opts);
}));

const get = new Command('get')
  .description('Get an evidence library item')
  .requiredOption('--workspace <id>', 'Workspace ID')
  .requiredOption('--evidence-library-id <id>', 'Evidence library item ID');
get.action(withClient(async ({ client, opts, spinner }) => {
  spinner.update('Fetching evidence…');
  const res = await client.get<any>(
    `/workspaces/${opts.workspace}/evidence-library/${opts.evidenceLibraryId}`,
  );
  spinner.stop();
  outputResult(res, opts);
}));

const create = new Command('create')
  .description('Create an evidence library item')
  .requiredOption('--workspace <id>', 'Workspace ID')
  .requiredOption('--data <json>', 'JSON body for creation');
create.action(withClient(async ({ client, opts, spinner }) => {
  spinner.update('Creating evidence…');
  const body = JSON.parse(opts.data);
  const res = await client.post<any>(
    `/workspaces/${opts.workspace}/evidence-library`,
    body,
  );
  spinner.stop();
  outputResult(res, opts);
}));

const update = new Command('update')
  .description('Update an evidence library item')
  .requiredOption('--workspace <id>', 'Workspace ID')
  .requiredOption('--evidence-library-id <id>', 'Evidence library item ID')
  .requiredOption('--data <json>', 'JSON body for update');
update.action(withClient(async ({ client, opts, spinner }) => {
  spinner.update('Updating evidence…');
  const body = JSON.parse(opts.data);
  const res = await client.put<any>(
    `/workspaces/${opts.workspace}/evidence-library/${opts.evidenceLibraryId}`,
    body,
  );
  spinner.stop();
  outputResult(res, opts);
}));

const del = new Command('delete')
  .description('Delete an evidence library item')
  .requiredOption('--workspace <id>', 'Workspace ID')
  .requiredOption('--evidence-library-id <id>', 'Evidence library item ID');
del.action(withClient(async ({ client, opts, spinner }) => {
  spinner.update('Deleting evidence…');
  const res = await client.del<any>(
    `/workspaces/${opts.workspace}/evidence-library/${opts.evidenceLibraryId}`,
  );
  spinner.stop();
  outputResult(res ?? { deleted: true }, opts);
}));

const getVersion = new Command('get-version')
  .description('Get a specific version of an evidence library item')
  .requiredOption('--workspace <id>', 'Workspace ID')
  .requiredOption('--evidence-library-id <id>', 'Evidence library item ID')
  .requiredOption('--version-id <id>', 'Version ID');
getVersion.action(withClient(async ({ client, opts, spinner }) => {
  spinner.update('Fetching version…');
  const res = await client.get<any>(
    `/workspaces/${opts.workspace}/evidence-library/${opts.evidenceLibraryId}/versions/${opts.versionId}`,
  );
  spinner.stop();
  outputResult(res, opts);
}));

export const evidenceLibraryCommand = new Command('evidence-library')
  .description('Manage evidence library')
  .addCommand(list)
  .addCommand(get)
  .addCommand(create)
  .addCommand(update)
  .addCommand(del)
  .addCommand(getVersion);
