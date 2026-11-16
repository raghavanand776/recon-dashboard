/*
 * File: src/App.jsx
 * Author: Raghav Anand
 * Created: 2026-11-15
 * Purpose: Recon Dashboard, version 1. Shows reconciliation results in a table.
 */

// Import the sample results. Vite lets us import a .json file directly;
// it arrives as a normal JavaScript array of objects.
import reconResults from './data/reconResults.json'

// Import this component's styles.
import './App.css'

// Helper: turn a number like 198.5 into "$198.50".
// If the value is missing (null or undefined), show a dash instead.
function formatMoney(value) {
  if (value === null || value === undefined) {
    return '—'
  }
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

// App is a React component: a function that returns what to draw on screen.
// The HTML-looking code inside return(...) is JSX; Vite turns it into JavaScript.
function App() {
  return (
    <main className="page">
      <h1>Recon Dashboard</h1>
      <p className="subtitle">Ledger vs processor vs bank (sample data)</p>

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
          {/* map() runs once per row and returns one <tr> for each transaction. */}
          {/* key tells React which row is which; it must be unique. */}
          {reconResults.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.date}</td>
              <td>{row.member}</td>
              <td>{row.type}</td>
              <td className="money">{formatMoney(row.ledgerAmount)}</td>
              <td className="money">{formatMoney(row.processorAmount)}</td>
              <td className="money">{formatMoney(row.bankAmount)}</td>
              <td>{row.status}</td>
              <td>{row.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
// Export App so main.jsx (Vite's entry file) can put it on the page.
export default App