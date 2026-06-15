import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'

const ROUND_TYPE_LABELS = {
  QL: 'Квалификация',
  QF: 'Четвъртфинал',
  SF: 'Полуфинал',
  FN: 'Финал',
}

const MEDAL_STYLES = {
  1: 'bg-amber-100 text-amber-800 ring-2 ring-amber-300',
  2: 'bg-zinc-200 text-zinc-700 ring-2 ring-zinc-300',
  3: 'bg-orange-100 text-orange-800 ring-2 ring-orange-300',
}

function TournamentResultsPage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.tournaments.getResults(id)
      .then(result => setData(result))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p className="text-zinc-500 text-center py-12">Зареждане...</p>
  if (error) return <p className="text-red-600 text-center py-12">Грешка: {error}</p>
  if (!data) return null

  const date = new Date(data.tournamentDate).toLocaleDateString('bg-BG', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link to={`/tournaments/${id}`} className="inline-flex items-center text-sm text-zinc-600 hover:text-burgundy-900 mb-6">
        ← Назад към турнира
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-zinc-900 mb-2">
          Резултати — {data.tournamentName}
        </h1>
        <p className="text-zinc-600">{date} · {data.location}</p>
      </div>

      {!data.categories || data.categories.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-lg p-8 text-center">
          <p className="text-zinc-500">Все още няма приключили категории в този турнир.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {data.categories.map(category => (
            <div key={category.categoryID} className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
              <div className="px-5 py-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-lg font-semibold text-zinc-900">
                  {category.categoryName}
                </h2>
                <div className="flex gap-3 text-sm">
                  {category.rounds.map(r => (
                    <Link
                      key={r.roundID}
                      to={r.roundType === 'FN'
                        ? `/rounds/${r.roundID}/skating`
                        : `/rounds/${r.roundID}/qualifying-sheet`}
                      className="text-burgundy-900 hover:underline"
                    >
                      {ROUND_TYPE_LABELS[r.roundType] || r.roundType}
                    </Link>
                  ))}
                </div>
              </div>

              {category.placements && category.placements.length > 0 ? (
                <div className="divide-y divide-zinc-100">
                  {category.placements.map(p => (
                    <div key={p.finalPlace} className="px-5 py-3 flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${
                        MEDAL_STYLES[p.finalPlace] || 'bg-zinc-100 text-zinc-600'
                      }`}>
                        {p.finalPlace}
                      </div>
                      <div className="w-10 text-center">
                        <span className="text-sm font-semibold text-zinc-400">
                          №{p.startNumber}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-zinc-900 truncate">
                          {p.coupleName}
                        </div>
                        <div className="text-xs text-zinc-500 truncate">{p.clubName}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-4 text-sm text-zinc-500">
                  Финалът все още не е приключил.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TournamentResultsPage