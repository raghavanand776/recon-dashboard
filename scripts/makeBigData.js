/*
 * File: scripts/makeBigData.js
 * Author: Raghav Anand
 * Created: 2026-11-15
 * Purpose: Generate 5,000 fake recon results to see how the dashboard handles volume.
 * Run from the project root with: node scripts/makeBigData.js
 */

// Node's built-in file module (like Python's open()/write()).
import { writeFileSync } from 'node:fs'

// Repeat MATCHED so most rows match, like real data (about 4 in 7).
const statuses = ['MATCHED', 'MATCHED', 'MATCHED', 'MATCHED', 'AMOUNT_MISMATCH', 'MISSING_IN_BANK', 'MISSING_IN_PROCESSOR']

const rows = []
for (let i = 1; i <= 5000; i++) {
  // Pick a status in rotation.
  const status = statuses[i % statuses.length]
  // Random amount between $0.00 and $500.00, rounded to cents.
  const amount = Math.round(Math.random() * 50000) / 100

  rows.push({
    id: `TXN-${100000 + i}`,               // backticks = a template string, like a Python f-string
    date: '2026-11-07',
    member: `M-${20000 + (i % 900)}`,
    type: i % 2 === 0 ? 'Disbursement' : 'Repayment',
    ledgerAmount: amount,
    processorAmount: status === 'MISSING_IN_PROCESSOR' ? null : status === 'AMOUNT_MISMATCH' ? amount - 1.5 : amount,
    bankAmount: status === 'MISSING_IN_BANK' || status === 'MISSING_IN_PROCESSOR' ? null : amount,
    status: status,
    reason: status === 'MATCHED' ? '' : 'Generated test exception',
  })
}

// Write the array as pretty-printed JSON (2-space indent).
writeFileSync('src/data/reconResultsBig.json', JSON.stringify(rows, null, 2))
console.log(`Wrote ${rows.length} rows to src/data/reconResultsBig.json`)