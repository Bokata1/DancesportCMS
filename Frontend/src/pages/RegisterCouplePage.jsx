import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

function RegisterCouplePage() {
  const [tournaments, setTournaments] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const [tournamentID, setTournamentID] = useState('')
  const [categoryID, setCategoryID] = useState('')
  const [partner1, setPartner1] = useState('')
  const [partner2, setPartner2] = useState('')
  const [clubName, setClubName] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    Promise.all([
      api.tournaments.getOpenForRegistration(),
      api.categories.getAll(),
    ])
      .then(([tourns, cats]) => {
        setTournaments(tourns)
        setCategories(cats)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await api.tournaments.registerCouple({
        tournamentID: Number(tournamentID),
        categoryID: Number(categoryID),
        partner1Name: partner1,
        partner2Name: partner2,
        clubName: clubName,
      })

      const tournament = tournaments.find(t => t.tournamentID === Number(tournamentID))
      setSuccess({
        tournamentName: tournament?.tournamentName || '',
        partner1: partner1,
        partner2: partner2,
        registrationID: result.registrationID,
      })

      setPartner1('')
      setPartner2('')
      setClubName('')
    } catch (err) {
      setError(err.message || 'Грешка при регистрация')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="text-zinc-500">Зареждане...</p>


  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-6xl mb-4">✓</div>
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">
          Регистрацията е успешна
        </h1>
        <p className="text-zinc-600 mb-2">
          Двойката <strong>{success.partner1} / {success.partner2}</strong>
        </p>
        <p className="text-zinc-600 mb-8">
          е регистрирана в <strong>{success.tournamentName}</strong>
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setSuccess(null)}
            className="px-5 py-2 bg-burgundy-900 text-white rounded-lg font-medium hover:bg-burgundy-800"
          >
            Регистрирайте нова двойка
          </button>
          <Link
            to="/"
            className="px-5 py-2 border border-zinc-300 text-zinc-700 rounded-lg font-medium hover:bg-zinc-50"
          >
            Към началото
          </Link>
        </div>
      </div>
    )
  }

  
  if (tournaments.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold text-zinc-900 mb-2">
          Регистрация на двойка
        </h1>
        <p className="text-zinc-600 mb-8">
          Регистрирайте двойката.
        </p>

        <div className="bg-white border border-zinc-200 rounded-lg p-8 text-center">
          <p className="text-zinc-500 mb-2">
            Няма активни турнири.
          </p>
          <p className="text-sm text-zinc-400">
            Моля проверете  отново по-късно или се свържете с организатора за повече информация.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-semibold text-zinc-900 mb-2">
        Регистрация на двойка
      </h1>
      <p className="text-zinc-600 mb-8">
        Регистрирайте двойката.
      </p>

      <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-lg p-6">
        <div className="space-y-5">
          {}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Турнир
            </label>
            <select
              value={tournamentID}
              onChange={e => setTournamentID(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:border-burgundy-900 bg-white"
              required
            >
              <option value="">Изберете турнир...</option>
              {tournaments.map(t => (
                <option key={t.tournamentID} value={t.tournamentID}>
                  {t.tournamentName} ({formatDate(t.tournamentDate)})
                </option>
              ))}
            </select>
          </div>

          {}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Категории
            </label>
            <select
              value={categoryID}
              onChange={e => setCategoryID(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:border-burgundy-900 bg-white"
              required
            >
              <option value="">Изберете категории...</option>
              {categories.map(c => (
                <option key={c.categoryID} value={c.categoryID}>
                  {c.ageGroup} {c.danceStyle}
                  {c.class ? ` ${c.class}` : ''}
                </option>
              ))}
            </select>
          </div>

          {}
          <div className="pt-2 border-t border-zinc-100">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Информация за двойката
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Партньор
                </label>
                <input
                  type="text"
                  value={partner1}
                  onChange={e => setPartner1(e.target.value)}
                  placeholder="Име"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:border-burgundy-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Партньорка
                </label>
                <input
                  type="text"
                  value={partner2}
                  onChange={e => setPartner2(e.target.value)}
                  placeholder="Име"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:border-burgundy-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Клуб
                </label>
                <input
                  type="text"
                  value={clubName}
                  onChange={e => setClubName(e.target.value)}
                  placeholder="Клуб по спортни танци"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:border-burgundy-900"
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!tournamentID || !categoryID || !partner1 || !partner2 || !clubName || submitting}
            className="w-full h-11 bg-burgundy-900 text-white rounded-lg font-medium hover:bg-burgundy-800 disabled:bg-zinc-300 disabled:cursor-not-allowed"
          >
            {submitting ? 'Регистация...' : 'Регистрирай двойката'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default RegisterCouplePage