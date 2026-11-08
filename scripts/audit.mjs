// npm audit for production dependencies, failing on high or critical
// advisories — except those in audit-allowlist.json, each with a reason
// and an expiry date (after which it fails again, to be looked at anew).
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const allow = JSON.parse(readFileSync(new URL('../audit-allowlist.json', import.meta.url), 'utf8'))
let report
try {
  report = JSON.parse(execSync('npm audit --omit=dev --json', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }))
} catch (e) {
  report = JSON.parse(e.stdout)
}
const today = new Date().toISOString().slice(0, 10)
const allowed = new Set(allow.filter((a) => a.until >= today).map((a) => a.advisory))
const bad = []
for (const [name, v] of Object.entries(report.vulnerabilities ?? {})) {
  if (!['high', 'critical'].includes(v.severity)) continue
  const advisories = v.via.filter((x) => typeof x === 'object').map((x) => x.url?.split('/').pop())
  // A package flagged only through another package is judged by that one.
  if (advisories.length === 0) continue
  const open = advisories.filter((id) => !allowed.has(id))
  if (open.length) bad.push(`${name} (${v.severity}): ${open.join(', ')}`)
}
for (const a of allow) console.log(`allowed until ${a.until}: ${a.advisory} — ${a.why}`)
if (bad.length) {
  console.error(`High/critical advisories:\n  ${bad.join('\n  ')}`)
  process.exit(1)
}
console.log('No high or critical advisories outside the allowlist.')
