/*
 * File: src/App.jsx
 * Author: Raghav Anand
 * Created: 2026-11-15
 * Purpose: Recon Dashboard, version 2. Adds status badges, summary cards,
 *          filter buttons, and an empty state.
 */

// useState is a React "hook": it lets a component remember a value
// (here, which filter is selected) and redraw when that value changes.
import { useState } from 'react'
import reconResults from './data/reconResults.json'
import './App.css'

// One place that maps each status code to its display label and CSS classes.
// Adding a new status later means adding one line here.
const STATUS_INFO = {
  MATCHED: { label: 'Matched', className: 'badge badge-matched' },
  AMOUNT_MISMATCH: { label: 'Amount mismatch', className: 'badge badge-mismatch' },
  MISSING_IN_BANK: { label: 'Missing in bank', className: 'badge badge-missing' },
  MISSING_IN_PROCESSOR: { label: 'Missing in processor', className: 'badge badge-missing' },
}

// The filter buttons, in the order they appear. 'ALL' means no filter.
const FILTERS = ['ALL', 'MATCHED', 'AMOUNT_MISMATCH', 'MISSING_IN_BANK', 'MISSING_IN_PROCESSOR']

// Helper: 198.5 -> "$198.50"; null/undefined -> a dash.
function formatMoney(value) {
  if (value === null || value === undefined) {
    return '—'
  }
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

// StatusBadge: a small component that draws one colored label.
// { status } pulls the "status" value out of the props React passes in.
function StatusBadge({ status }) {
  const info = STATUS_INFO[status]
  // If the status isn't one we know, show a gray badge instead of crashing.
  if (!info) {
    return <span className="badge badge-unknown">Unknown ({String(status)})</span>
  }
  return <span className={info.className}>{info.label}</span>
}

function App() {
  // activeFilter holds the selected filter; setActiveFilter changes it.
  // 'ALL' is the starting value.
  const [activeFilter, setActiveFilter] = useState('ALL')

  // Count how many rows have each status, e.g. { MATCHED: 5, AMOUNT_MISMATCH: 2, ... }.
  // Python equivalent: collections.Counter(row['status'] for row in rows)
  const counts = {}
  for (const row of reconResults) {
    counts[row.status] = (counts[row.status] || 0) + 1
  }

  // Everything that isn't MATCHED needs a human to look at it.
  const needReview = reconResults.length - (counts.MATCHED || 0)

  // The rows to show: all of them, or only those with the selected status.
  const visibleRows =
    activeFilter === 'ALL'
      ? reconResults
      : reconResults.filter((row) => row.status === activeFilter)

  return (
    <main className="page">
      <h1>Recon Dashboard</h1>
      <p className="subtitle">Ledger vs processor vs bank (sample data)</p>

      {/* Summary cards: the three numbers an analyst checks first. */}
      <section className="summary">
        <div className="card">
          <div className="card-number">{reconResults.length}</div>
          <div className="card-label">Total transactions</div>
        </div>
        <div className="card">
          <div className="card-number">{counts.MATCHED || 0}</div>
          <div className="card-label">Matched</div>
        </div>
        <div className="card card-alert">
          <div className="card-number">{needReview}</div>
          <div className="card-label">Need review</div>
        </div>
      </section>

      {/* Filter buttons. Clicking one stores its value in activeFilter,
          and React redraws the page with only the matching rows. */}
      <div className="filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={f === activeFilter ? 'filter active' : 'filter'}
            onClick={() => setActiveFilter(f)}
          >
            {f === 'ALL' ? 'All' : STATUS_INFO[f].label}{' '}
            ({f === 'ALL' ? reconResults.length : counts[f] || 0})
          </button>
        ))}
      </div>

      {/* Empty state: if a filter has no rows, say so instead of an empty table. */}
      {visibleRows.length === 0 ? (
        <p className="empty">No transactions with this status.</p>
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
            {visibleRows.map((row) => (
              <tr key={row.id}>
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
