/*
 * File: src/App.jsx
 * Author: Raghav Anand
 * Created: 2026-11-15
 * Purpose: Recon Dashboard, version 3. Fixes from the messy-data test:
 *   1. "Need review" filter, selected by default (analysts land on exceptions).
 *   2. "Other / unknown" filter, so rows with missing or unknown statuses are reachable.
 *   3. Unique React keys, so duplicate transaction IDs don't confuse React.
 */

import { useState } from 'react'
// Data source: keep exactly ONE import active. Uncomment the one you want.
// import reconResults from './data/reconResultsMessy.json'   // messy test data
// import reconResults from './data/reconResultsBig.json'     // 5,000-row test
import reconResults from './data/reconResults.json'           // clean sample (use for commits)
import './App.css'

// Display label and CSS classes for each status the dashboard knows.
const STATUS_INFO = {
  MATCHED: { label: 'Matched', className: 'badge badge-matched' },
  AMOUNT_MISMATCH: { label: 'Amount mismatch', className: 'badge badge-mismatch' },
  MISSING_IN_BANK: { label: 'Missing in bank', className: 'badge badge-missing' },
  MISSING_IN_PROCESSOR: { label: 'Missing in processor', className: 'badge badge-missing' },
}

// The list of status codes we recognize: ['MATCHED', 'AMOUNT_MISMATCH', ...].
// Python equivalent: list(STATUS_INFO.keys())
const KNOWN_STATUSES = Object.keys(STATUS_INFO)

// Filter buttons, in display order. Each has a key (used in code) and a label (shown).
// NEED_REVIEW comes first because it's the default view.
const FILTERS = [
  { key: 'NEED_REVIEW', label: 'Need review' },
  { key: 'ALL', label: 'All' },
  { key: 'MATCHED', label: 'Matched' },
  { key: 'AMOUNT_MISMATCH', label: 'Amount mismatch' },
  { key: 'MISSING_IN_BANK', label: 'Missing in bank' },
  { key: 'MISSING_IN_PROCESSOR', label: 'Missing in processor' },
  { key: 'OTHER', label: 'Other / unknown' },
]

// One function decides whether a row belongs to a filter.
// The buttons' counts and the table both use it, so they can never disagree.
function matchesFilter(row, filterKey) {
  if (filterKey === 'ALL') return true
  if (filterKey === 'NEED_REVIEW') return row.status !== 'MATCHED'
  if (filterKey === 'OTHER') return !KNOWN_STATUSES.includes(row.status)
  return row.status === filterKey
}

// Helper: 198.5 -> "$198.50"; null/undefined -> a dash.
function formatMoney(value) {
  if (value === null || value === undefined) {
    return '—'
  }
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

// One colored label per row.
function StatusBadge({ status }) {
  // No status at all: say so plainly instead of showing "undefined".
  if (status === undefined || status === null || status === '') {
    return <span className="badge badge-unknown">Missing status</span>
  }
  const info = STATUS_INFO[status]
  // A status we don't recognize (for example PARTIAL_MATCH): show it in gray.
  if (!info) {
    return <span className="badge badge-unknown">Unknown: {status}</span>
  }
  return <span className={info.className}>{info.label}</span>
}

function App() {
  // Start on "Need review" so the analyst sees exceptions first.
  const [activeFilter, setActiveFilter] = useState('NEED_REVIEW')

  // How many rows a filter would show.
  const countFor = (filterKey) =>
    reconResults.filter((row) => matchesFilter(row, filterKey)).length

  // Hide the "Other / unknown" button when there's nothing in it, to keep the bar clean.
  const visibleFilters = FILTERS.filter(
    (f) => !(f.key === 'OTHER' && countFor('OTHER') === 0)
  )

  // The rows to show for the selected filter.
  const visibleRows = reconResults.filter((row) => matchesFilter(row, activeFilter))

  // Friendlier empty message for the default view.
  const emptyMessage =
    activeFilter === 'NEED_REVIEW'
      ? 'Nothing needs review: every transaction matched.'
      : 'No transactions with this status.'

  return (
    <main className="page">
      <h1>Recon Dashboard</h1>
      <p className="subtitle">Ledger vs processor vs bank (sample data)</p>

      <section className="summary">
        <div className="card">
          <div className="card-number">{countFor('ALL')}</div>
          <div className="card-label">Total transactions</div>
        </div>
        <div className="card">
          <div className="card-number">{countFor('MATCHED')}</div>
          <div className="card-label">Matched</div>
        </div>
        <div className="card card-alert">
          <div className="card-number">{countFor('NEED_REVIEW')}</div>
          <div className="card-label">Need review</div>
        </div>
      </section>

      <div className="filters">
        {visibleFilters.map((f) => (
          <button
            key={f.key}
            className={f.key === activeFilter ? 'filter active' : 'filter'}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label} ({countFor(f.key)})
          </button>
        ))}
      </div>

      {visibleRows.length === 0 ? (
        <p className="empty">{emptyMessage}</p>
      ) : (
        <table className="recon-table">
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Date</th>
              <th>Member</th>
              <th>Type</th>
              <th className="money">Ledger</th>
              <th className="money">Processor</th>
              <th className="money">Bank</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {/* key = id plus position, so two rows with the same ID still get unique keys.
                The duplicate itself is a data problem for the recon engine to flag. */}
            {visibleRows.map((row, index) => (
              <tr key={`${row.id}-${index}`}>
                <td>{row.id}</td>
                <td>{row.date}</td>
                <td>{row.member}</td>
                <td>{row.type}</td>
                <td className="money">{formatMoney(row.ledgerAmount)}</td>
                <td className="money">{formatMoney(row.processorAmount)}</td>
                <td className="money">{formatMoney(row.bankAmount)}</td>
                <td><StatusBadge status={row.status} /></td>
                <td>{row.reason || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}

export default App