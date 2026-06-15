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

  return (
    <Link to={`/tournaments/${tournament.tournamentID}`}>
      <div className="bg-white border border-zinc-200 border-l-4 border-l-zinc-400 rounded-lg p-5 hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer">
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

          <span className="text-xs text-zinc-500">Приключил</span>
        </div>
      </div>
    </Link>
  )
}

function TournamentArchivePage() {
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
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(now.getFullYear() - 1)

  const past = tournaments
    .filter(t => {
      const date = new Date(t.tournamentDate)
      const isPast = t.isFinished || date < now
      return isPast && date >= oneYearAgo
    })
    .sort((a, b) => new Date(b.tournamentDate) - new Date(a.tournamentDate))


  const grouped = past.reduce((acc, t) => {
    const d = new Date(t.tournamentDate)
    const key = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})

  return (
    <div>
      <Link to="/tournaments" className="inline-flex items-center text-sm text-zinc-600 hover:text-burgundy-900 mb-6">
        ← Назад към турнири
      </Link>

      <h1 className="text-2xl font-semibold text-zinc-900 mb-2">Завършени турнири</h1>
      <p className="text-zinc-600 mb-8">Турнири от последната една година. Кликнете за резултати.</p>

      {past.length === 0 ? (
        <p className="text-zinc-500 text-center py-12">Няма приключили турнири за последната година.</p>
      ) : (
        Object.entries(grouped).map(([monthYear, items]) => (
          <section key={monthYear} className="mb-8">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              {monthYear}
            </h2>
            <div className="space-y-3">
              {items.map(t => (
                <TournamentCard key={t.tournamentID} tournament={t} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}

export default TournamentArchivePage