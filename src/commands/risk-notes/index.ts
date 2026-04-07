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
  .description('List risk notes')
  .requiredOption('--register-id <registerId>', 'Risk register ID')
  .requiredOption('--risk-id <riskId>', 'Risk ID');

addPaginationOpts(list);
addExpandOpt(list);

list.action(withClient(async ({ client, opts, spinner, args }) => {
  const registerId = opts.registerId as string;
  const riskId = opts.riskId as string;
  spinner.update('Fetching risk notes...');
  const params: Record<string, string | string[] | undefined> = {
    ...paginationParams(opts),
    ...expandParams(opts),
  };
  const data = await client.get<Record<string, unknown>>(
    `/risk-registers/${registerId}/risks/${riskId}/notes`,
    params,
  );
  spinner.stop();

  if (shouldOutputJson(opts)) {
    outputResult(data, opts);
  } else {
    const items = (data as any).data ?? [];
    if (items.length === 0) {
      console.log(pc.dim('No risk notes found.'));
      return;
    }
    const rows = [
      [pc.bold('ID'), pc.bold('Comment'), pc.bold('Author'), pc.bold('Created')],
      ...items.map((n: any) => [
        String(n.id),
        truncate(n.comment ?? '-', 50),
        n.author?.name ?? n.authorId ?? '-',
        formatDate(n.createdAt),
      ]),
    ];
    console.log(padTable(rows));
  }
}));

const get = new Command('get')
  .description('Get a single risk note')
  .requiredOption('--register-id <registerId>', 'Risk register ID')
  .requiredOption('--risk-id <riskId>', 'Risk ID')
  .argument('<noteId>', 'Note ID');

addExpandOpt(get);

get.action(withClient(async ({ client, opts, spinner, args }) => {
  const registerId = opts.registerId as string;
  const riskId = opts.riskId as string;
  const noteId = args[0];
  spinner.update('Fetching risk note...');
  const params = { ...expandParams(opts) };
  const data = await client.get<Record<string, unknown>>(
    `/risk-registers/${registerId}/risks/${riskId}/notes/${noteId}`,
    params,
  );
  spinner.stop();
  outputResult(data, opts);
}));

const create = new Command('create')
  .description('Create a risk note')
  .requiredOption('--register-id <registerId>', 'Risk register ID')
  .requiredOption('--risk-id <riskId>', 'Risk ID')
  .requiredOption('--comment <comment>', 'Note comment text')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const registerId = opts.registerId as string;
    const riskId = opts.riskId as string;
    spinner.update('Creating risk note...');
    const body = { comment: opts.comment as string };
    const data = await client.post(
      `/risk-registers/${registerId}/risks/${riskId}/notes`,
      body,
    );
    spinner.stop('Risk note created.');
    outputResult(data, opts);
  }));

const update = new Command('update')
  .description('Update a risk note')
  .requiredOption('--register-id <registerId>', 'Risk register ID')
  .requiredOption('--risk-id <riskId>', 'Risk ID')
  .argument('<noteId>', 'Note ID')
  .requiredOption('--comment <comment>', 'Updated comment text')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const registerId = opts.registerId as string;
    const riskId = opts.riskId as string;
    const noteId = args[0];
    spinner.update('Updating risk note...');
    const body = { comment: opts.comment as string };
    const data = await client.put(
      `/risk-registers/${registerId}/risks/${riskId}/notes/${noteId}`,
      body,
    );
    spinner.stop('Risk note updated.');
    outputResult(data, opts);
  }));

const remove = new Command('delete')
  .description('Delete a risk note')
  .requiredOption('--register-id <registerId>', 'Risk register ID')
  .requiredOption('--risk-id <riskId>', 'Risk ID')
  .argument('<noteId>', 'Note ID')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const registerId = opts.registerId as string;
    const riskId = opts.riskId as string;
    const noteId = args[0];
    spinner.update('Deleting risk note...');
    await client.del(
      `/risk-registers/${registerId}/risks/${riskId}/notes/${noteId}`,
    );
    spinner.stop('Risk note deleted.');
  }));

export const riskNotesCommand = new Command('risk-notes')
  .description('Manage risk notes')
  .addCommand(list)
  .addCommand(get)
  .addCommand(create)
  .addCommand(update)
  .addCommand(remove);
