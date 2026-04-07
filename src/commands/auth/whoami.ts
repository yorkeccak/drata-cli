import { Command } from '@commander-js/extra-typings';
import pc from 'picocolors';
import { resolveAuth, maskKey, listProfiles } from '../../lib/config.js';
import { createClient } from '../../lib/client.js';
import { outputResult, outputError, shouldOutputJson } from '../../lib/output.js';
import { createSpinner } from '../../lib/spinner.js';

export const whoamiCommand = new Command('whoami')
  .description('Show current authentication status and company info')
  .action(async () => {
    const globalOpts = whoamiCommand.optsWithGlobals();
    try {
      const auth = resolveAuth(globalOpts);
      const spinner = createSpinner('Fetching account info...');
      const client = createClient(auth.apiKey, auth.region);

      const company = await client.get<Record<string, unknown>>('/company');
      spinner.stop('Account info retrieved');

      if (shouldOutputJson(globalOpts)) {
        outputResult({
          profile: auth.profile,
          source: auth.source,
          region: auth.region,
          key: maskKey(auth.apiKey),
          company,
        }, globalOpts);
      } else {
        console.log(`${pc.bold('Profile:')}  ${auth.profile}`);
        console.log(`${pc.bold('Source:')}   ${auth.source}`);
        console.log(`${pc.bold('Region:')}   ${auth.region.toUpperCase()}`);
        console.log(`${pc.bold('API Key:')}  ${maskKey(auth.apiKey)}`);
        console.log(`${pc.bold('Company:')}  ${(company as any).name ?? 'Unknown'}`);
        console.log(`${pc.bold('Domain:')}   ${(company as any).domain ?? '-'}`);

        const profiles = listProfiles();
        if (profiles.length > 1) {
          console.log(`\n${pc.bold('Profiles:')}`);
          for (const p of profiles) {
            const marker = p.active ? pc.green('▸') : ' ';
            console.log(`  ${marker} ${p.name} (${p.region.toUpperCase()})`);
          }
        }
      }
    } catch (err) {
      outputError(err, globalOpts);
    }
  });
