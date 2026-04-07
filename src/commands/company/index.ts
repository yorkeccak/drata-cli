import { Command } from '@commander-js/extra-typings';
import { withClient, outputResult } from '../../lib/command-helpers.js';
import { shouldOutputJson } from '../../lib/output.js';
import pc from 'picocolors';

export const companyCommand = new Command('company')
  .description('Get company information');

companyCommand.action(withClient(async ({ client, opts, spinner }) => {
  spinner.update('Fetching company info...');
  const data = await client.get<Record<string, unknown>>('/company');
  spinner.stop();

  if (shouldOutputJson(opts)) {
    outputResult(data, opts);
  } else {
    console.log(`${pc.bold('Name:')}        ${data.name ?? '-'}`);
    console.log(`${pc.bold('Domain:')}      ${data.domain ?? '-'}`);
    console.log(`${pc.bold('Description:')} ${data.description ?? '-'}`);
    if (data.settings) {
      console.log(`${pc.bold('Settings:')}    ${JSON.stringify(data.settings, null, 2)}`);
    }
  }
}));
