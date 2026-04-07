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
import { padTable, truncate, colorStatus, formatDate } from '../../lib/format.js';
import pc from 'picocolors';

function addWorkspaceOpt<T extends Command<any, any>>(cmd: T): T {
  return cmd.requiredOption('--workspace <workspaceId>', 'Workspace ID') as T;
}

const list = new Command('list')
  .description('List controls in a workspace');

addWorkspaceOpt(list);
addPaginationOpts(list);
addExpandOpt(list);

list.action(withClient(async ({ client, opts, spinner, args }) => {
  const wsId = opts.workspace as string;
  spinner.update('Fetching controls...');
  const params = { ...paginationParams(opts), ...expandParams(opts) };
  const data = await client.get<Record<string, unknown>>(`/workspaces/${wsId}/controls`, params);
  spinner.stop();

  if (shouldOutputJson(opts)) {
    outputResult(data, opts);
  } else {
    const items = (data as any).data ?? [];
    if (items.length === 0) {
      console.log(pc.dim('No controls found.'));
      return;
    }
    const rows = [
      [pc.bold('ID'), pc.bold('Code'), pc.bold('Name'), pc.bold('Ready'), pc.bold('Created')],
      ...items.map((c: any) => [
        String(c.id),
        c.code ?? '-',
        truncate(c.name ?? '-', 40),
        colorStatus(c.isReady ? 'Ready' : 'Pending'),
        formatDate(c.createdAt),
      ]),
    ];
    console.log(padTable(rows));
  }
}));

const get = new Command('get')
  .description('Get a single control')
  .argument('<controlId>', 'Control ID');

addWorkspaceOpt(get);
addExpandOpt(get);

get.action(withClient(async ({ client, opts, spinner, args }) => {
  const wsId = opts.workspace as string;
  const controlId = args[0];
  spinner.update('Fetching control...');
  const params = { ...expandParams(opts) };
  const data = await client.get<Record<string, unknown>>(`/workspaces/${wsId}/controls/${controlId}`, params);
  spinner.stop();
  outputResult(data, opts);
}));

const create = new Command('create')
  .description('Create a control')
  .requiredOption('--data <json>', 'Control data as JSON string');

addWorkspaceOpt(create);

create.action(withClient(async ({ client, opts, spinner, args }) => {
  const wsId = opts.workspace as string;
  spinner.update('Creating control...');
  const body = JSON.parse(opts.data as string);
  const data = await client.post(`/workspaces/${wsId}/controls`, body);
  spinner.stop('Control created.');
  outputResult(data, opts);
}));

const update = new Command('update')
  .description('Update a control')
  .argument('<controlId>', 'Control ID')
  .requiredOption('--data <json>', 'Control data as JSON string');

addWorkspaceOpt(update);

update.action(withClient(async ({ client, opts, spinner, args }) => {
  const wsId = opts.workspace as string;
  const controlId = args[0];
  spinner.update('Updating control...');
  const body = JSON.parse(opts.data as string);
  const data = await client.put(`/workspaces/${wsId}/controls/${controlId}`, body);
  spinner.stop('Control updated.');
  outputResult(data, opts);
}));

const requirements = new Command('requirements')
  .description('List requirements for a control')
  .argument('<controlId>', 'Control ID');

addWorkspaceOpt(requirements);
addPaginationOpts(requirements);

requirements.action(withClient(async ({ client, opts, spinner, args }) => {
  const wsId = opts.workspace as string;
  const controlId = args[0];
  spinner.update('Fetching requirements...');
  const params = { ...paginationParams(opts) };
  const data = await client.get<Record<string, unknown>>(`/workspaces/${wsId}/controls/${controlId}/requirements`, params);
  spinner.stop();
  outputResult(data, opts);
}));

const resetMappings = new Command('reset-mappings')
  .description('Reset control mappings')
  .requiredOption('--control-ids <ids>', 'Comma-separated control IDs');

addWorkspaceOpt(resetMappings);

resetMappings.action(withClient(async ({ client, opts, spinner, args }) => {
  const wsId = opts.workspace as string;
  const controlIds = (opts.controlIds as string).split(',').map(Number);
  spinner.update('Resetting mappings...');
  const data = await client.post(`/workspaces/${wsId}/controls/action-reset-mappings`, { controlIds });
  spinner.stop('Mappings reset.');
  outputResult(data, opts);
}));

const compareRequirements = new Command('compare-requirements')
  .description('Compare control requirements');

addWorkspaceOpt(compareRequirements);

compareRequirements.action(withClient(async ({ client, opts, spinner, args }) => {
  const wsId = opts.workspace as string;
  spinner.update('Comparing requirements...');
  const data = await client.get<Record<string, unknown>>(`/workspaces/${wsId}/controls-requirement-comparison`);
  spinner.stop();
  outputResult(data, opts);
}));

export const controlsCommand = new Command('controls')
  .description('Manage controls within a workspace')
  .addCommand(list)
  .addCommand(get)
  .addCommand(create)
  .addCommand(update)
  .addCommand(requirements)
  .addCommand(resetMappings)
  .addCommand(compareRequirements);
