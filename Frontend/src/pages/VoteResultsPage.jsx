import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'

function VoteResultsPage() {
  const { tournamentID, categoryID } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = () => {
      api.voting.getResults(tournamentID, categoryID)
        .then(result => setData(result))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }
    load()
    const interval = setInterval(load, 5000)  // refresh every 5 seconds
    return () => clearInterval(interval)
  }, [tournamentID, categoryID])

  if (loading) return <p className="text-zinc-500 text-center py-12">Зареждане...</p>
  if (error) return <p className="text-red-600 text-center py-12">Грешка: {error}</p>
  if (!data) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <p className="text-sm text-zinc-500 mb-1">{data.tournamentName}</p>
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">
          {data.categoryName} — Любимец на публиаката
        </h1>
        <p className="text-zinc-600">
          Общо {data.totalVotes} {data.totalVotes === 1 ? 'глас' : 'гласа'}
        </p>
      </div>

      {data.totalVotes === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-lg p-8 text-center">
          <p className="text-zinc-500">Все още няма гласове.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.results.map((r, idx) => {
            const isWinner = idx === 0 && r.voteCount > 0
            return (
              <div
                key={r.registrationID}
                className={`bg-white border rounded-lg p-4 ${
                  isWinner ? 'border-burgundy-900 shadow-md' : 'border-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    isWinner ? 'bg-burgundy-900 text-white' : 'bg-zinc-100 text-zinc-700'
                  }`}>
                    {r.startNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-zinc-900 truncate">
                      {r.coupleName}
                      {isWinner && <span className="ml-2 text-burgundy-900">★</span>}
                    </div>
                    <div className="text-xs text-zinc-500 truncate">{r.clubName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-zinc-900">{r.voteCount}</div>
                    <div className="text-xs text-zinc-500">{r.percentage}%</div>
                  </div>
                </div>
                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${isWinner ? 'bg-burgundy-900' : 'bg-zinc-400'}`}
                    style={{ width: `${r.percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}

export default VoteResultsPage