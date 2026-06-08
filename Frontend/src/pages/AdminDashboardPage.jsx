import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'

function AdminDashboardPage() {
  const navigate = useNavigate()
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

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

    loadTournaments()
  }, [navigate])

  const loadTournaments = () => {
    setLoading(true)
    api.tournaments.getAll()
      .then(data => setTournaments(data))
      .catch(err => console.error(err))
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

  const getStatusBadge = (t) => {
    if (t.isFinished) {
      return <span className="text-xs px-2 py-1 bg-zinc-100 text-zinc-600 rounded">Приключил</span>
    }
    if (t.isRegistrationOpen) {
      return <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">Регистрацията е отворен</span>
    }
    return <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded">Предстоящ</span>
  }

  if (loading) return <p className="text-zinc-500">Зареждане...</p>

  return (
    <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-zinc-900 mb-1">Администрация</h1>
              <p className="text-zinc-500">Управление на турнири</p>
            </div>
            <div className="flex gap-2">
              <Link
                to="/admin/bias"
                className="px-5 py-2.5 bg-white border border-zinc-300 text-zinc-700 rounded-lg font-medium hover:bg-zinc-50"
              >
                Анализ на пристрастност
              </Link>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-5 py-2.5 bg-burgundy-900 text-white rounded-lg font-medium hover:bg-burgundy-800"
              >
                {showCreateForm ? 'Откажи' : '+ Нов турнир'}
              </button>
            </div>
          </div>
      {showCreateForm && (
        <CreateTournamentForm
          onSuccess={() => {
            setShowCreateForm(false)
            loadTournaments()
          }}
        />
      )}

      <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
        Всички турнири
      </h2>

      {tournaments.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-lg p-8 text-center">
          <p className="text-zinc-500">Няма създадени турнири.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tournaments.map(t => (
            <Link
              key={t.tournamentID}
              to={`/admin/tournaments/${t.tournamentID}`}
              className="block bg-white border border-zinc-200 rounded-lg p-4 hover:border-burgundy-900 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-zinc-900 mb-1">{t.tournamentName}</h3>
                  <p className="text-sm text-zinc-500">
                    {formatDate(t.tournamentDate)} · {t.location}
                  </p>
                </div>
                {getStatusBadge(t)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function CreateTournamentForm({ onSuccess }) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await api.tournaments.create({
        tournamentName: name,
        tournamentDate: date,
        location: location,
      })
      setName('')
      setDate('')
      setLocation('')
      onSuccess()
    } catch (err) {
      setError(err.message || 'Грешка при създаването на турнира.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-6 mb-6">
      <h3 className="font-semibold text-zinc-900 mb-4">Създаване на  нов турнир</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Име на турнира
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Открит турнир по спортни таниц XXXXXX"
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:border-burgundy-900"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Дата
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:border-burgundy-900"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Локация
          </label>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Град"
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:border-burgundy-900"
            required
          />
        </div>

        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!name || !date || !location || submitting}
          className="w-full h-11 bg-burgundy-900 text-white rounded-lg font-medium hover:bg-burgundy-800 disabled:bg-zinc-300 disabled:cursor-not-allowed"
        >
          {submitting ? 'Създаване...' : 'Създай нов турнир'}
        </button>
      </div>
    </div>
  )
}

export default AdminDashboardPage