import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

const MONTH_NAMES = ['Ян', 'Фев', 'Мар', 'Апр', 'Май', 'Юни', 'Юли', 'Авг', 'Спт', 'Окт', 'Ное', 'Дек']

function formatDate(dateString) {
  const d = new Date(dateString)
  return {
    day: d.getDate(),
    month: MONTH_NAMES[d.getMonth()],
    year: d.getFullYear(),
  }
}

function TournamentCard({ tournament }) {
  const { day, month, year } = formatDate(tournament.tournamentDate)

  let borderColor = 'border-l-zinc-300'
  let badge = null

  if (tournament.isFinished) {
    borderColor = 'border-l-zinc-400'
    badge = <span className="text-xs text-zinc-500">Приключил</span>
  } else if (tournament.isRegistrationOpen) {
    borderColor = 'border-l-green-600'
    badge = <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">Отворен за регистрация</span>
  } else {
    borderColor = 'border-l-burgundy-900'
    badge = <span className="text-xs text-burgundy-900">Предстоящ</span>
  }

  return (
    <Link to={`/tournaments/${tournament.tournamentID}`}>
      <div className={`bg-white border border-zinc-200 ${borderColor} border-l-4 rounded-lg p-5 hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer`}>
        <div className="flex items-center gap-6">
          <div className="text-center min-w-[60px]">
            <div className="text-2xl font-semibold text-zinc-900 leading-none">{day}</div>
            <div className="text-xs text-zinc-500 mt-1">{month}</div>
            <div className="text-xs text-zinc-400">{year}</div>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-zinc-900 mb-1">{tournament.tournamentName}</h3>
            <div className="text-sm text-zinc-600">{tournament.location}</div>
          </div>

          <div>{badge}</div>
        </div>
      </div>
    </Link>
  )
}

function Section({ title, tournaments, emptyText }) {
  if (tournaments.length === 0) return null

  return (
    <section className="mb-10">
      <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
        {title}
      </h2>
      <div className="space-y-3">
        {tournaments.map(t => (
          <TournamentCard key={t.tournamentID} tournament={t} />
        ))}
      </div>
    </section>
  )
}

function TournamentsPage() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.tournaments.getAll()
      .then(data => setTournaments(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-zinc-500">Зареждане...</p>
  if (error) return <p className="text-red-600">Грешка: {error}</p>

  const now = new Date()
  const openForRegistration = tournaments.filter(t => t.isRegistrationOpen && !t.isFinished)
  const upcoming = tournaments
    .filter(t => !t.isRegistrationOpen && !t.isFinished && new Date(t.tournamentDate) >= now)
    .sort((a, b) => new Date(a.tournamentDate) - new Date(b.tournamentDate))
    .slice(0, 5)
  const recentlyFinished = tournaments
    .filter(t => t.isFinished)
    .sort((a, b) => new Date(b.tournamentDate) - new Date(a.tournamentDate))
    .slice(0, 5)

  const hasMoreUpcoming = tournaments.filter(t => !t.isRegistrationOpen && !t.isFinished && new Date(t.tournamentDate) >= now).length > 5
  const hasMoreFinished = tournaments.filter(t => t.isFinished).length > 5

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900">Турнири</h1>
        <Link to="/tournaments/archive" className="text-sm text-burgundy-900 hover:text-burgundy-700">
          Виж отминали →
        </Link>
      </div>

      <Section title="Отворени за регистрация" tournaments={openForRegistration} />

      {upcoming.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Предстоящи
          </h2>
          <div className="space-y-3">
            {upcoming.map(t => (
              <TournamentCard key={t.tournamentID} tournament={t} />
            ))}
          </div>
          {hasMoreUpcoming && (
            <div className="text-center mt-4">
              <Link to="/tournaments/archive" className="text-sm text-burgundy-900 hover:text-burgundy-700">
                Предстоящи →
              </Link>
            </div>
          )}
        </section>
      )}

      {recentlyFinished.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Последни резултати
          </h2>
          <div className="space-y-3">
            {recentlyFinished.map(t => (
              <TournamentCard key={t.tournamentID} tournament={t} />
            ))}
          </div>
          {hasMoreFinished && (
            <div className="text-center mt-4">
              <Link to="/tournaments/archive" className="text-sm text-burgundy-900 hover:text-burgundy-700">
                Виж всички →
              </Link>
            </div>
          )}
        </section>
      )}

      {openForRegistration.length === 0 && upcoming.length === 0 && recentlyFinished.length === 0 && (
        <p className="text-zinc-500 text-center py-12">Няма турнири.</p>
      )}
    </div>
  )
}

export default TournamentsPage