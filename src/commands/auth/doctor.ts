import { Command } from '@commander-js/extra-typings';
import pc from 'picocolors';
import { resolveAuth, maskKey, getBaseUrl } from '../../lib/config.js';
import { createClient } from '../../lib/client.js';
import { VERSION } from '../../lib/version.js';
import { outputResult, shouldOutputJson } from '../../lib/output.js';

export const doctorCommand = new Command('doctor')
  .description('Run diagnostics and check connectivity')
  .action(async () => {
    const globalOpts = doctorCommand.optsWithGlobals();
    const checks: { name: string; status: 'pass' | 'fail' | 'warn'; detail: string }[] = [];

    // Version
    checks.push({ name: 'CLI Version', status: 'pass', detail: VERSION });

    // Node version
    const nodeVer = process.version;
    const major = Number.parseInt(nodeVer.slice(1), 10);
    checks.push({
      name: 'Node.js',
      status: major >= 20 ? 'pass' : 'warn',
      detail: `${nodeVer}${major < 20 ? ' (>=20 recommended)' : ''}`,
    });

    // Auth
    let authOk = false;
    try {
      const auth = resolveAuth(globalOpts);
      checks.push({
        name: 'API Key',
        status: 'pass',
        detail: `${maskKey(auth.apiKey)} via ${auth.source}`,
      });

      // Connectivity
      const client = createClient(auth.apiKey, auth.region);
      const start = Date.now();
      const valid = await client.validateKey();
      const latency = Date.now() - start;

      checks.push({
        name: 'API Connectivity',
        status: valid ? 'pass' : 'fail',
        detail: valid ? `${getBaseUrl(auth.region)} (${latency}ms)` : 'Authentication failed',
      });
      authOk = valid;
    } catch (err) {
      checks.push({
        name: 'API Key',
        status: 'fail',
        detail: err instanceof Error ? err.message : 'Not configured',
      });
    }

    if (shouldOutputJson(globalOpts)) {
      outputResult({ checks, healthy: checks.every((c) => c.status !== 'fail') }, globalOpts);
    } else {
      console.log(pc.bold('\nDrata CLI Diagnostics\n'));
      for (const c of checks) {
        const icon =
          c.status === 'pass' ? pc.green('✔') : c.status === 'warn' ? pc.yellow('⚠') : pc.red('✖');
        console.log(`  ${icon} ${pc.bold(c.name)}: ${c.detail}`);
      }
      console.log();
    }
  });
