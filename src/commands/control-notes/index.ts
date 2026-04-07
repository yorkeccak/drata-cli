import { Command } from '@commander-js/extra-typings';
import {
  withClient,
  addPaginationOpts,
  paginationParams,
  outputResult,
} from '../../lib/command-helpers.js';
import { shouldOutputJson } from '../../lib/output.js';
import pc from 'picocolors';

function addControlOpts<T extends Command<any, any>>(cmd: T): T {
  return cmd
    .requiredOption('--workspace <workspaceId>', 'Workspace ID')
    .requiredOption('--control-id <controlId>', 'Control ID') as T;
}

function notesPath(opts: Record<string, unknown>): string {
  return `/workspaces/${opts.workspace}/controls/${opts.controlId}/notes`;
}

const list = new Command('list')
  .description('List notes for a control');

addControlOpts(list);
addPaginationOpts(list);

list.action(withClient(async ({ client, opts, spinner, args }) => {
  spinner.update('Fetching notes...');
  const params = { ...paginationParams(opts) };
  const data = await client.get<Record<string, unknown>>(notesPath(opts), params);
  spinner.stop();
  outputResult(data, opts);
}));

const get = new Command('get')
  .description('Get a single note')
  .argument('<noteId>', 'Note ID');

addControlOpts(get);

get.action(withClient(async ({ client, opts, spinner, args }) => {
  const noteId = args[0];
  spinner.update('Fetching note...');
  const data = await client.get<Record<string, unknown>>(`${notesPath(opts)}/${noteId}`);
  spinner.stop();
  outputResult(data, opts);
}));

const create = new Command('create')
  .description('Create a note on a control')
  .requiredOption('--comment <text>', 'Note comment text');

addControlOpts(create);

create.action(withClient(async ({ client, opts, spinner, args }) => {
  spinner.update('Creating note...');
  const data = await client.post(notesPath(opts), { comment: opts.comment as string });
  spinner.stop('Note created.');
  outputResult(data, opts);
}));

const update = new Command('update')
  .description('Update a note')
  .argument('<noteId>', 'Note ID')
  .requiredOption('--comment <text>', 'Updated comment text');

addControlOpts(update);

update.action(withClient(async ({ client, opts, spinner, args }) => {
  const noteId = args[0];
  spinner.update('Updating note...');
  const data = await client.put(`${notesPath(opts)}/${noteId}`, { comment: opts.comment as string });
  spinner.stop('Note updated.');
  outputResult(data, opts);
}));

const del = new Command('delete')
  .description('Delete a note')
  .argument('<noteId>', 'Note ID');

addControlOpts(del);

del.action(withClient(async ({ client, opts, spinner, args }) => {
  const noteId = args[0];
  spinner.update('Deleting note...');
  await client.del(`${notesPath(opts)}/${noteId}`);
  spinner.stop('Note deleted.');
}));

export const controlNotesCommand = new Command('control-notes')
  .description('Manage notes on controls')
  .addCommand(list)
  .addCommand(get)
  .addCommand(create)
  .addCommand(update)
  .addCommand(del);
