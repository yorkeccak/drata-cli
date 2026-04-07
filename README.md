# Drata CLI

A command-line interface for the [Drata](https://drata.com) compliance platform.

Built for AI agents and humans alike.

```
  ██████╗ ██████╗  █████╗ ████████╗ █████╗
  ██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗
  ██║  ██║██████╔╝███████║   ██║   ███████║
  ██║  ██║██╔══██╗██╔══██║   ██║   ██╔══██║
  ██████╔╝██║  ██║██║  ██║   ██║   ██║  ██║
  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝
```

Covers **all 125 endpoints** of the Drata API v2 across 29 resource types - controls, risks, assets, vendors, personnel, policies, monitoring, evidence, and more.

## Install

```bash
git clone https://github.com/yorkeccak/drata-cli.git
cd drata-cli
pnpm install
pnpm build
```

Then authenticate:

```bash
node dist/cli.cjs login
```

Get your API key from [Drata](https://help.drata.com/en/articles/6695964).

```bash
node dist/cli.cjs company
node dist/cli.cjs controls list --workspace 1
node dist/cli.cjs assets list --json | jq '.data[].name'
node dist/cli.cjs doctor
```

For development:

```bash
pnpm dev -- <command>
```

---

## Commands

### `drata company`

Get your company's compliance profile.

```bash
node dist/cli.cjs company
node dist/cli.cjs company --json
```

### `drata controls`

Manage compliance controls within workspaces.

```bash
node dist/cli.cjs controls list --workspace 1
node dist/cli.cjs controls get --workspace 1 42 --expand owners
node dist/cli.cjs controls create --workspace 1 --data '{"name": "MFA Required", "description": "All users must have MFA enabled"}'
node dist/cli.cjs controls requirements --workspace 1 42
node dist/cli.cjs controls compare-requirements --workspace 1
```

### `drata assets`

Track infrastructure, applications, and other assets.

```bash
node dist/cli.cjs assets list
node dist/cli.cjs assets list --asset-type VIRTUAL --asset-provider AWS
node dist/cli.cjs assets get 815 --expand owner
node dist/cli.cjs assets create --data '{"name": "Production DB", "description": "Primary PostgreSQL", "assetType": "VIRTUAL", "assetClassTypes": ["DATABASE"], "ownerId": 1}'
```

### `drata monitoring-tests`

Check automated compliance test results.

```bash
node dist/cli.cjs monitoring-tests list --workspace 1
node dist/cli.cjs monitoring-tests failures --workspace 1 --test-id 5
node dist/cli.cjs monitoring-tests exclusions --workspace 1 --test-id 5
```

### `drata risks`

Manage risk registers, individual risks, and supporting documents.

```bash
node dist/cli.cjs risk-registers list
node dist/cli.cjs risks list --register-id 1
node dist/cli.cjs risks create --register-id 1 --data '{"name": "Data Breach", "description": "Unauthorized access to customer data"}'
node dist/cli.cjs risks insights --register-id 1
node dist/cli.cjs risk-library list
node dist/cli.cjs risk-library copy --register-id 1 --item-ids 10,20,30
```

### `drata vendors`

Track vendors, security reviews, and questionnaires.

```bash
node dist/cli.cjs vendors list
node dist/cli.cjs vendors stats
node dist/cli.cjs vendors create --data '{"name": "Acme Corp", "description": "Cloud provider"}'
node dist/cli.cjs vendor-security-reviews create --vendor-id 1 --data '{"type": "SOC2", "status": "APPROVED"}'
node dist/cli.cjs vendors questionnaires 1
```

### `drata policies`

Manage policies and track version history.

```bash
node dist/cli.cjs policies list
node dist/cli.cjs policies get 25
node dist/cli.cjs policies versions 25
```

### `drata evidence-library`

Manage evidence items attached to controls.

```bash
node dist/cli.cjs evidence-library list --workspace 1
node dist/cli.cjs evidence-library create --workspace 1 --data '{"name": "SOC2 Evidence", "type": "DOCUMENT"}'
node dist/cli.cjs evidence-library get-version --workspace 1 10 --version-id 1
```

### `drata personnel` / `drata users`

Manage people, devices, and user documents.

```bash
node dist/cli.cjs personnel list
node dist/cli.cjs users list
node dist/cli.cjs devices list
node dist/cli.cjs devices apps 42
node dist/cli.cjs user-policies get 1
node dist/cli.cjs user-policies acknowledge 1 --policy-id 25
```

### Other commands

```bash
node dist/cli.cjs workspaces list           # list workspaces
node dist/cli.cjs frameworks list -w 1      # list frameworks
node dist/cli.cjs events list               # audit log
node dist/cli.cjs roles list                # available roles
node dist/cli.cjs custom-connections list   # integrations
node dist/cli.cjs background-checks create --user-id 1 --url https://example.com --filed-at 2025-01-01
```

### Auth & diagnostics

```bash
node dist/cli.cjs login                     # interactive login
node dist/cli.cjs login --key <key> --region eu --profile prod
node dist/cli.cjs logout
node dist/cli.cjs whoami                    # show auth status
node dist/cli.cjs doctor                    # connectivity check
```

---

## All resource commands

| Command | Subcommands |
|---------|-------------|
| `company` | *(shows company info)* |
| `workspaces` | `list` |
| `assets` | `list` `get` `create` `update` `remove` |
| `controls` | `list` `get` `create` `update` `requirements` `reset-mappings` `compare-requirements` |
| `control-notes` | `list` `get` `create` `update` `delete` |
| `control-owners` | `list` `add` `modify` `remove` |
| `monitoring-tests` | `list` `get` `exclusions` `failures` |
| `evidence-library` | `list` `get` `create` `update` `delete` `get-version` |
| `frameworks` | `list` `requirements` |
| `personnel` | `list` `get` `update` `reset-sync` |
| `users` | `list` `get` |
| `roles` | `list` `get` `users` |
| `user-documents` | `list` `get` `upload` `delete` |
| `user-policies` | `get` `acknowledge` |
| `devices` | `list` `get` `list-for-personnel` `list-for-connection` `apps` `create` `remove` |
| `device-documents` | `list` `get` `upload` `delete` |
| `policies` | `list` `get` `versions` `version` |
| `events` | `list` `get` `download` `download-status` |
| `risks` | `list` `get` `create` `update` `insights` |
| `risk-registers` | `list` `get` `create` `update` `delete` |
| `risk-documents` | `list` `get` `upload` `delete` |
| `risk-library` | `list` `get` `copy` |
| `risk-notes` | `list` `get` `create` `update` `delete` |
| `vendors` | `list` `get` `create` `update` `remove` `stats` `questionnaires` `send-questionnaire` `get-questionnaire` |
| `vendor-types` | `list` `create` `update` `delete` |
| `vendor-documents` | `list` `get` `upload` |
| `vendor-security-reviews` | `create` `create-with-file` `get` `upload-questionnaire` `upload-questionnaire-to-review` |
| `custom-connections` | `list` `get` `create` `update` `delete` |
| `hris-identities` | `list` `get` `batch-upsert` `update` `delete` |
| `background-checks` | `create` |

---

## Flags

| Flag | Description |
|------|-------------|
| `--api-key <key>` | Override stored key for one request |
| `--region <region>` | API region: `us`, `eu`, or `apac` |
| `--profile <name>` | Use a named credential profile |
| `--json` | Force JSON output |
| `-q, --quiet` | Suppress spinners and formatting (implies `--json`) |
| `--workspace <id>` | Workspace ID (required for controls, evidence, frameworks, monitoring) |

List commands also support:

| Flag | Description |
|------|-------------|
| `--cursor <cursor>` | Pagination cursor from previous response |
| `--size <n>` | Results per page (default: 25) |
| `--sort <field>` | Sort field |
| `--sort-dir <dir>` | `asc` or `desc` |
| `--expand <fields>` | Expand sub-objects (e.g. `owner`, `customFields`) |

---

## Regions

| Region | Endpoint |
|--------|----------|
| `us` | `public-api.drata.com` |
| `eu` | `public-api.eu.drata.com` |
| `apac` | `public-api.apac.drata.com` |

Select during `login`, override with `--region`, or set `DRATA_REGION` env var.

---

## For AI agents and scripts

Every command outputs clean JSON when piped or with `--json`. Designed for agentic compliance workflows.

```bash
# Environment-based auth (no interactive login needed)
export DRATA_API_KEY=your-key
export DRATA_REGION=eu

# Find failing compliance tests
node dist/cli.cjs monitoring-tests list --workspace 1 -q \
  | jq '.data[] | select(.checkResultStatus == "FAILED") | {id, name}'

# Export all controls
node dist/cli.cjs controls list --workspace 1 -q --size 100 \
  | jq '.data[] | {code, name, description}'

# Paginate through assets
CURSOR=""
while true; do
  RESP=$(node dist/cli.cjs assets list -q --size 100 ${CURSOR:+--cursor $CURSOR})
  echo "$RESP" | jq '.data[]'
  CURSOR=$(echo "$RESP" | jq -r '.pagination.cursor // empty')
  [ -z "$CURSOR" ] && break
done

# Create a risk from agent analysis
node dist/cli.cjs risks create --register-id 1 \
  --data '{"name": "Unpatched CVE-2025-1234", "description": "Critical vulnerability found in dependency audit"}'

# Check overall compliance posture
node dist/cli.cjs frameworks list --workspace 1 -q \
  | jq '.data[] | {name, isReady, numReadyInScopeRequirements, numInScopeRequirements}'
```

### Multiple profiles

```bash
node dist/cli.cjs login --key <key> --region eu --profile production
node dist/cli.cjs login --key <key> --region us --profile staging
node dist/cli.cjs controls list --workspace 1 --profile staging
```

---

## CI/CD integration

Run compliance checks as part of your deployment pipeline. The CLI exits with code 1 on errors, making it easy to gate deployments on compliance status.

### GitHub Actions

```yaml
name: Compliance Gate
on: [push]
jobs:
  compliance-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Drata CLI
        run: |
          git clone https://github.com/yorkeccak/drata-cli.git /tmp/drata-cli
          cd /tmp/drata-cli && pnpm install && pnpm build

      - name: Check for failing compliance tests
        env:
          DRATA_API_KEY: ${{ secrets.DRATA_API_KEY }}
          DRATA_REGION: eu
        run: |
          FAILURES=$(node /tmp/drata-cli/dist/cli.cjs monitoring-tests list --workspace 1 -q \
            | jq '[.data[] | select(.checkResultStatus == "FAILED")] | length')
          echo "Failing tests: $FAILURES"
          if [ "$FAILURES" -gt 0 ]; then
            echo "::error::$FAILURES compliance tests are failing"
            node /tmp/drata-cli/dist/cli.cjs monitoring-tests list --workspace 1 -q \
              | jq '.data[] | select(.checkResultStatus == "FAILED") | "FAIL: \(.name)"' -r
            exit 1
          fi

      - name: Verify controls are ready
        env:
          DRATA_API_KEY: ${{ secrets.DRATA_API_KEY }}
          DRATA_REGION: eu
        run: |
          NOT_READY=$(node /tmp/drata-cli/dist/cli.cjs controls list --workspace 1 -q --size 200 \
            | jq '[.data[] | select(.archivedAt == null)] | length')
          echo "Active controls: $NOT_READY"
```

### Automated risk creation from code scanning

```bash
# After running a vulnerability scanner, create risks in Drata
for cve in $(cat scan-results.json | jq -r '.vulnerabilities[].cve'); do
  node dist/cli.cjs risks create --register-id 1 \
    --data "{\"name\": \"$cve\", \"description\": \"Found by automated scan on $(date -I)\"}"
done
```

### Scheduled compliance reports

```bash
# Cron job: export compliance snapshot daily
#!/bin/bash
export DRATA_API_KEY=your-key
export DRATA_REGION=eu
DATE=$(date -I)

# Frameworks readiness
node dist/cli.cjs frameworks list --workspace 1 -q > "reports/$DATE-frameworks.json"

# Failing tests
node dist/cli.cjs monitoring-tests list --workspace 1 -q \
  | jq '.data[] | select(.checkResultStatus == "FAILED")' > "reports/$DATE-failures.json"

# Asset inventory
node dist/cli.cjs assets list -q --size 500 > "reports/$DATE-assets.json"
```

---

## AI agent patterns

### Compliance monitoring agent

An AI agent can continuously monitor your compliance posture and take action:

```python
import subprocess
import json

def run_drata(cmd):
    result = subprocess.run(
        ["node", "dist/cli.cjs"] + cmd.split() + ["-q"],
        capture_output=True, text=True, env={**os.environ, "DRATA_API_KEY": key}
    )
    return json.loads(result.stdout)

# 1. Check framework readiness
frameworks = run_drata("frameworks list --workspace 1")
for fw in frameworks["data"]:
    if not fw["isReady"]:
        print(f"Framework {fw['name']} is not ready: "
              f"{fw['numReadyInScopeRequirements']}/{fw['numInScopeRequirements']} requirements met")

# 2. Find failing tests and analyze
tests = run_drata("monitoring-tests list --workspace 1")
failing = [t for t in tests["data"] if t["checkResultStatus"] == "FAILED"]

# 3. Check vendor compliance
vendors = run_drata("vendors list")
# Review vendor security posture, flag overdue reviews

# 4. Create risks from findings
for finding in agent_findings:
    run_drata(f'risks create --register-id 1 --data \'{json.dumps(finding)}\'')
```

### Codebase compliance checker

An AI agent that analyses your codebase and maps findings to Drata controls:

```bash
# Agent workflow:
# 1. Scan codebase for compliance-relevant patterns
# 2. Query Drata for current control status
# 3. Create/update evidence based on findings
# 4. Flag gaps as risks

# Get all controls
CONTROLS=$(node dist/cli.cjs controls list --workspace 1 -q --size 200)

# Get monitoring test results
TESTS=$(node dist/cli.cjs monitoring-tests list --workspace 1 -q --size 200)

# Feed to AI agent for analysis
echo "$CONTROLS" | agent-analyze --with-codebase ./src --with-tests "$TESTS"
```

### Multi-environment compliance diff

```bash
# Compare compliance posture across environments
PROD=$(node dist/cli.cjs controls list --workspace 1 --profile prod -q --size 200)
STAGING=$(node dist/cli.cjs controls list --workspace 1 --profile staging -q --size 200)

# Diff control readiness
diff <(echo "$PROD" | jq -S '.data[] | {code, name}') \
     <(echo "$STAGING" | jq -S '.data[] | {code, name}')
```

---

## Tech stack

- TypeScript with strict mode
- [Commander.js](https://github.com/tj/commander.js) for command parsing
- [@clack/prompts](https://github.com/bombshell-dev/clack) for interactive flows
- [esbuild](https://esbuild.github.io/) for single-file bundling
- [picocolors](https://github.com/alexeyraspopov/picocolors) for terminal colors

## API reference

This CLI implements the [Drata API v2](https://developers.drata.com). See the official docs for detailed schema information and field descriptions.

## License

MIT
