import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../api'

const ROUND_TYPE_LABELS = {
  QL: 'Квалификация',
  QF: 'Четвъртфинал',
  SF: 'Полуфинал',
  FN: 'Финал',
}

const STATUS_LABELS = {
  PN: { text: 'Чакащ', color: 'text-zinc-500', dot: 'bg-zinc-400' },
  AC: { text: 'Активен', color: 'text-green-700', dot: 'bg-green-500' },
  CL: { text: 'Приключил', color: 'text-zinc-500', dot: 'bg-zinc-400' },
}

function AdminTournamentPage() {
  const { id: tournamentID } = useParams()
  const navigate = useNavigate()

  const [tournament, setTournament] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    
    const session = sessionStorage.getItem('userSession')
    if (!session) {
      navigate('/login')
      return
    }
    const parsed = JSON.parse(session)
    if (!parsed.isAdmin) {
      navigate('/')
      return
    }

    loadTournament()
  }, [tournamentID, navigate])

  const loadTournament = () => {
    setLoading(true)
    api.tournaments.getDetails(tournamentID)
      .then(data => setTournament(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleToggleRegistration = async () => {
    setToggling(true)
    setError(null)

    try {
      const newState = !tournament.isRegistrationOpen
      await api.tournaments.setRegistration(tournamentID, newState)
      loadTournament()
    } catch (err) {
      setError(err.message || 'Грешка')
    } finally {
      setToggling(false)
    }
  }

  if (loading) return <p className="text-zinc-500">Зареждане...</p>
  if (error && !tournament) return <p className="text-red-600">Грешка- {error}</p>
  if (!tournament) return null

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to="/admin"
        className="inline-flex items-center text-sm text-zinc-600 hover:text-burgundy-900 mb-6"
      >
        ← Назад към списъка
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-zinc-900 mb-1">
          {tournament.tournamentName}
        </h1>
        <p className="text-zinc-500">
          {formatDate(tournament.tournamentDate)} · {tournament.location}
        </p>
      </div>

      {/* Reg*/}
      <div className="bg-white border border-zinc-200 rounded-lg p-6 mb-8">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          Статус на регистрацията
        </h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              tournament.isRegistrationOpen ? 'bg-green-500' : 'bg-zinc-400'
            }`} />
            <span className="text-lg font-medium text-zinc-900">
              {tournament.isRegistrationOpen ? 'Отворена' : 'Затворена'}
            </span>
          </div>
          <button
            onClick={handleToggleRegistration}
            disabled={toggling || tournament.isFinished}
            className={`px-5 py-2 rounded-lg font-medium transition-colors ${
              tournament.isRegistrationOpen
                ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                : 'bg-burgundy-900 text-white hover:bg-burgundy-800'
            } disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed`}
          >
            {toggling
              ? 'Промяна...'
              : tournament.isRegistrationOpen
                ? 'Затвори регистрацията'
                : 'Отвори регистрацията'}
          </button>
        </div>
        {tournament.isFinished && (
          <p className="text-sm text-zinc-500 mt-3">
            Турнирът е приключил.Временот за промени е изтекло.
          </p>
        )}
        {error && (
          <p className="text-sm text-red-600 mt-3">{error}</p>
        )}
      </div>

      {/* Rounds */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
             ({tournament.rounds?.length || 0})
          </h2>
          <button
            disabled
            className="text-sm text-zinc-400 cursor-not-allowed"
            title="Достъпен скоро"
          >
            + Добави нов кръг
          </button>
        </div>

        {!tournament.rounds || tournament.rounds.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-lg p-8 text-center">
            <p className="text-zinc-500">Няма създадени кръгове за този турнир.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tournament.rounds.map(r => {
              const status = STATUS_LABELS[r.status] || STATUS_LABELS.PN
              return (
                <Link
                  key={r.roundID}
                  to={`/admin/rounds/${r.roundID}`}
                  className="block bg-white border border-zinc-200 rounded-lg p-4 hover:border-burgundy-900 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-1">
                        {r.categoryName} — {ROUND_TYPE_LABELS[r.roundType] || r.roundType}
                      </h3>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${status.dot}`} />
                          <span className={status.color}>{status.text}</span>
                        </div>
                        <span className="text-zinc-500">
                          {r.coupleCount || 0} двойки
                        </span>
                      </div>
                    </div>
                    <span className="text-sm text-burgundy-900 font-medium">
                      Управление →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Judges */}
      {tournament.judges && tournament.judges.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Назначени съдийски ({tournament.judges.length})
          </h2>
          <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
            {tournament.judges.map(j => (
              <div
                key={j.userID}
                className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-zinc-900">
                    {j.fName} {j.lName}
                  </p>
                  {j.judgeLicense && (
                    <p className="text-sm text-zinc-500">
                      Лиценз: {j.judgeLicense}
                    </p>
                  )}
                </div>
                {j.isRulesJudge && (
                  <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded">
                    По Правилник
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminTournamentPage