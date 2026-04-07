import { Command } from '@commander-js/extra-typings';
import { withClient, outputResult } from '../../lib/command-helpers.js';
import { shouldOutputJson } from '../../lib/output.js';
import { padTable } from '../../lib/format.js';
import pc from 'picocolors';

const list = new Command('list')
  .description('List workspaces');

list.action(withClient(async ({ client, opts, spinner }) => {
  spinner.update('Fetching workspaces...');
  const data = await client.get<Record<string, unknown>>('/workspaces');
  spinner.stop();

  if (shouldOutputJson(opts)) {
    outputResult(data, opts);
  } else {
    const items = (data as any).data ?? (Array.isArray(data) ? data : []);
    if (items.length === 0) {
      console.log(pc.dim('No workspaces found.'));
      return;
    }
    const rows = [
      [pc.bold('ID'), pc.bold('Name')],
      ...items.map((w: any) => [
        String(w.id),
        w.name ?? '-',
      ]),
    ];
    console.log(padTable(rows));
  }
}));

export const workspacesCommand = new Command('workspaces')
  .description('Manage workspaces')
  .addCommand(list);
