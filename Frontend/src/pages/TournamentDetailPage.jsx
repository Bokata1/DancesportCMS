import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'

const ROUND_TYPE_LABELS = {
  QL: 'Квалификационен',
  QF: 'Четвъртфинал',
  SF: 'Полуфинал',
  FN: 'Финал',
}

const STATUS_LABELS = {
  PN: { text: 'Предстоящ', cls: 'bg-zinc-100 text-zinc-800' },
  AC: { text: 'Активен',   cls: 'bg-green-100 text-green-800' },
  CL: { text: 'Завършен',  cls: 'bg-burgundy-100 text-burgundy-800' },
}

function getInitials(fName, lName) {
  return `${fName.charAt(0)}${lName.charAt(0)}`.toUpperCase()
}

function TournamentDetailPage() {
  const { id } = useParams()
  const [tournament, setTournament] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.tournaments.getDetails(id)
      .then(data => setTournament(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p className="text-zinc-500">Зареждане...</p>
  if (error) return <p className="text-red-600">Грешка: {error}</p>
  if (!tournament) return null

  const date = new Date(tournament.tournamentDate).toLocaleDateString('bg-BG', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  const roundsByCategory = tournament.rounds.reduce((acc, r) => {
    if (!acc[r.categoryName]) acc[r.categoryName] = []
    acc[r.categoryName].push(r)
    return acc
  }, {})

  return (
    <div>
      <Link to="/tournaments" className="inline-flex items-center text-sm text-zinc-600 hover:text-burgundy-900 mb-6">
        ← Назад към турнирите
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-zinc-900 mb-2">{tournament.tournamentName}</h1>
        <p className="text-zinc-600">{date} • {tournament.location}</p>
      </div>

      <section className="mb-10">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          Кръгове и категории
          
        </h2>
          <Link
          to={`/tournaments/${id}/results`}
          className="inline-flex items-center px-4 py-2 bg-burgundy-900 text-white rounded-lg font-medium hover:bg-burgundy-800 text-sm"
          >
           Виж резултатите
        </Link>

        {Object.keys(roundsByCategory).length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-lg p-8 text-center text-zinc-500">
            Все още няма активни кръгове.
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
            {Object.entries(roundsByCategory).map(([category, rounds]) => (
              <div key={category} className="border-b border-zinc-100 last:border-0 px-5 py-4">
                <h3 className="font-medium text-zinc-900 mb-2">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {rounds.map(r => {
                    const status = STATUS_LABELS[r.status] || { text: r.status, cls: 'bg-zinc-100' }
                    return (
                      <Link
                        key={r.roundID}
                        to={`/rounds/${r.roundID}/skating`}
                        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 rounded-lg text-sm transition-colors"
                        >
                        <span className="font-medium text-zinc-700">
                        {ROUND_TYPE_LABELS[r.roundType] || r.roundType}
                        </span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-zinc-600">{r.coupleCount} двойки</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${status.cls}`}>
                        {status.text}
                        </span>
                    </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          Съдии ({tournament.judges.length})
        </h2>


        {tournament.judges.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-lg p-8 text-center text-zinc-500">
            Няма назначени съдии.
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-lg p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tournament.judges.map(j => (
                <div key={j.userID} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-burgundy-900 text-white flex items-center justify-center font-medium text-sm shrink-0">
                    {getInitials(j.fName, j.lName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-900 truncate">
                        {j.fName} {j.lName}
                      </span>
                      {j.isRulesJudge && (
                        <span className="text-xs px-1.5 py-0.5 bg-burgundy-50 text-burgundy-900 rounded shrink-0">
                          Правила
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-500">{j.judgeLicense || '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default TournamentDetailPage