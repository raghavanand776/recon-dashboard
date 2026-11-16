# Recon Dashboard

Author: Raghav Anand · Created: 2026-11-15

A React web dashboard for reviewing 3-way reconciliation results: ledger vs payment processor vs bank. It is the front end for the 3-Way Recon project and runs on sample data until the matching engine is built.

## Features

- Summary cards: total transactions, matched, need review
- Status filters, opening on "Need review" so analysts land on exceptions
- Color-coded status badges: green matched, amber amount mismatch, red missing
- Rows with unknown or missing statuses stay reachable through an "Other / unknown" filter

## Tech stack

React, Vite, plain CSS, and a Node.js script for test data.

## Run it locally

    npm install
    npm run dev

Then open http://localhost:5173 in a browser.

## Data contract

Each row the recon engine returns should have these fields:

| Field | Meaning |
| --- | --- |
| id | Ledger transaction ID |
| date | Transaction date (YYYY-MM-DD) |
| member | Customer ID |
| type | Disbursement (money out) or Repayment (money in) |
| ledgerAmount | Amount in our books |
| processorAmount | Amount reported by the processor; null if missing |
| bankAmount | Amount in the bank settlement file; null if missing |
| status | MATCHED, AMOUNT_MISMATCH, MISSING_IN_BANK, or MISSING_IN_PROCESSOR |
| reason | Plain-English explanation; empty when matched |

## Test data

- `src/data/reconResults.json`: 10 clean sample rows
- `src/data/reconResultsMessy.json`: 7 rows with bad data on purpose
- `scripts/makeBigData.js`: generates 5,000 rows (not committed). Run it with:

      node scripts/makeBigData.js

To switch data, change which import line is active at the top of `src/App.jsx`.

## Known issues

- Duplicate transaction IDs are counted twice
- Text amounts (for example "100") are not rejected
- The test-data script can produce negative amounts
- The "Missing in processor" badge doesn't show that the bank is also missing
- No fee field yet, so fee-driven mismatches can't be classified automatically

## Roadmap (v2)

1. Pagination and a row count
2. Search by transaction ID
3. Export to CSV
4. Column sorting and a date-range filter
5. Drill-down detail page with breadcrumbs
