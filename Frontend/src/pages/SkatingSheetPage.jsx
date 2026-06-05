import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'

const ROUND_TYPE_LABELS = {
  QL: 'Квалификация',
  QF: 'Четвъртфинал',
  SF: 'Полуфинал',
  FN: 'Финал',
}

function SkatingSheetPage() {
  const { id } = useParams()
  const [sheet, setSheet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.rounds.getSkatingSheet(id)
      .then(data => setSheet(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p className="text-zinc-500">Зареждане...</p>
  if (error) return <p className="text-red-600">Грешка: {error}</p>
  if (!sheet) return null

  const roundLabel = ROUND_TYPE_LABELS[sheet.roundType] || sheet.roundType

  return (
    <div>
      <Link to="/tournaments" className="inline-flex items-center text-sm text-zinc-600 hover:text-burgundy-900 mb-6">
        ← Назад към турнирите
      </Link>

      <div className="mb-8">
        <p className="text-sm text-zinc-500 mb-1">{sheet.tournamentName}</p>
        <h1 className="text-3xl font-semibold text-zinc-900">
          {sheet.categoryName} — {roundLabel}
        </h1>
      </div>

      {sheet.dances.map(dance => (
        <DanceTable key={dance.danceID} dance={dance} />
      ))}

      <FinalResultsTable results={sheet.finalResults} />
    </div>
  )
}

function DanceTable({ dance }) {
  if (dance.couples.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-zinc-900 mb-3">{dance.danceName}</h2>
        <div className="bg-white border border-zinc-200 rounded-lg p-6 text-center text-zinc-500 text-sm">
          Все още няма въведени оценки за този танц.
        </div>
      </section>
    )
  }

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-zinc-900 mb-3">{dance.danceName}</h2>

      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-zinc-700 w-16">№</th>
              {dance.judges.map(j => (
                <th key={j.userID} className="px-2 py-2 font-medium text-zinc-700 text-center w-10">
                  {j.displayCode}
                </th>
              ))}
              <th className="px-3 py-2 font-medium text-zinc-700 text-center w-14">Сума</th>
              <th className="px-3 py-2 font-medium text-zinc-700 text-center w-14">Място</th>
            </tr>
          </thead>
          <tbody>
            {dance.couples.map(c => (
              <tr key={c.registrationID} className="border-b border-zinc-100 last:border-0">
                <td className="px-3 py-2 font-medium text-zinc-900">{c.startNumber}</td>
                {c.marks.map((m, i) => (
                  <td key={i} className="px-2 py-2 text-center text-zinc-700 font-mono">
                    {m}
                  </td>
                ))}
                <td className="px-3 py-2 text-center text-zinc-600 font-mono">{c.sum}</td>
                <td className="px-3 py-2 text-center font-semibold text-burgundy-900">
                  {c.dancePlacement}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function FinalResultsTable({ results }) {
  if (results.length === 0) return null

  return (
    <section className="mt-12 mb-8">
      <h2 className="text-lg font-semibold text-zinc-900 mb-3">Крайно класиране</h2>

      <div className="bg-white border border-burgundy-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-burgundy-50 border-b border-burgundy-200">
            <tr>
              <th className="text-center px-3 py-3 font-medium text-burgundy-900 w-16">Място</th>
              <th className="text-center px-3 py-3 font-medium text-burgundy-900 w-16">№</th>
              <th className="text-left px-3 py-3 font-medium text-burgundy-900">Двойка</th>
              <th className="text-center px-3 py-3 font-medium text-burgundy-900 w-20">Сума</th>
            </tr>
          </thead>
          <tbody>
            {results.map(r => (
              <tr key={r.registrationID} className="border-b border-zinc-100 last:border-0">
                <td className="px-3 py-3 text-center font-bold text-burgundy-900 text-lg">
                  {r.finalPlace}
                </td>
                <td className="px-3 py-3 text-center font-medium text-zinc-900">
                  {r.startNumber}
                </td>
                <td className="px-3 py-3 text-zinc-900">{r.partnerNames}</td>
                <td className="px-3 py-3 text-center text-zinc-600 font-mono">{r.totalSum}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default SkatingSheetPage