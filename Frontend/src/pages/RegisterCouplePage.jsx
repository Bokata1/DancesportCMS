import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

function RegisterCouplePage() {
  const [tournaments, setTournaments] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const [tournamentID, setTournamentID] = useState('')
  const [selectedCategories, setSelectedCategories] = useState(new Set())
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

  const toggleCategory = (categoryID) => {
    setSelectedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryID)) {
        next.delete(categoryID)
      } else {
        next.add(categoryID)
      }
      return next
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
        categoryIDs: Array.from(selectedCategories),
        partner1Name: partner1,
        partner2Name: partner2,
        clubName: clubName,
      })

      const tournament = tournaments.find(t => t.tournamentID === Number(tournamentID))
      const selectedCategoryNames = categories
        .filter(c => selectedCategories.has(c.categoryID))
        .map(c => `${c.ageGroup}${c.class ? ' ' + c.class : ''} ${c.danceStyle}`)

      setSuccess({
        tournamentName: tournament?.tournamentName || '',
        partner1: partner1,
        partner2: partner2,
        categoryCount: selectedCategoryNames.length,
        categoryNames: selectedCategoryNames,
        registrationIDs: result.registrationIDs,
      })

      setPartner1('')
      setPartner2('')
      setClubName('')
      setSelectedCategories(new Set())
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
        <p className="text-zinc-600 mb-2">
          е регистрирана в <strong>{success.tournamentName}</strong>
        </p>
        <p className="text-zinc-600 mb-6">
          в <strong>{success.categoryCount}</strong>{' '}
          {success.categoryCount === 1 ? 'категория' : 'категории'}:{' '}
          {success.categoryNames.join(', ')}
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setSuccess(null)}
            className="px-5 py-2 bg-burgundy-900 text-white rounded-lg font-medium hover:bg-burgundy-800"
          >
            Регистрирай друга двойка
          </button>
          <Link
            to="/"
            className="px-5 py-2 border border-zinc-300 text-zinc-700 rounded-lg font-medium hover:bg-zinc-50"
          >
            Към началната страница
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
          Регистрация за двойки за предстоящи състезания
        </p>

        <div className="bg-white border border-zinc-200 rounded-lg p-8 text-center">
          <p className="text-zinc-500 mb-2">
            В момента няма турнири с отворена регистрация.
          </p>
          <p className="text-sm text-zinc-400">
            Проверете отново по-късно или се свържете с организатор.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-semibold text-zinc-900 mb-2">
        Регистрация
      </h1>
      <p className="text-zinc-600 mb-8">
       Регистрация за двойки за предстоящи състезания.
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
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Категории{' '}
              {selectedCategories.size > 0 && (
                <span className="text-zinc-500 font-normal">
                  ({selectedCategories.size} избрани)
                </span>
              )}
            </label>
            <div className="border border-zinc-300 rounded-lg max-h-64 overflow-y-auto">
              {categories.map(c => {
                const categoryLabel = `${c.ageGroup}${c.class ? ' ' + c.class : ''} ${c.danceStyle}`
                const isSelected = selectedCategories.has(c.categoryID)
                return (
                  <label
                    key={c.categoryID}
                    className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors ${
                      isSelected ? 'bg-burgundy-50' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCategory(c.categoryID)}
                      className="w-4 h-4 accent-burgundy-900"
                    />
                    <span className={`text-sm ${isSelected ? 'font-medium text-zinc-900' : 'text-zinc-700'}`}>
                      {categoryLabel}
                    </span>
                  </label>
                )
              })}
            </div>
            {selectedCategories.size === 0 && (
              <p className="text-xs text-zinc-500 mt-1">
                Изберете категориите в който ще се състезава двойката .
              </p>
            )}
          </div>

          {}
          <div className="pt-2 border-t border-zinc-100">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Данни на двойката
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Партньор 1
                </label>
                <input
                  type="text"
                  value={partner1}
                  onChange={e => setPartner1(e.target.value)}
                  placeholder="Име на партньор 1"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:border-burgundy-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Партньор 2 
                </label>
                <input
                  type="text"
                  value={partner2}
                  onChange={e => setPartner2(e.target.value)}
                  placeholder="Име на партньор 2"
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
                  placeholder="Клуб Олимпия"
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
            disabled={
              !tournamentID ||
              selectedCategories.size === 0 ||
              !partner1 ||
              !partner2 ||
              !clubName ||
              submitting
            }
            className="w-full h-11 bg-burgundy-900 text-white rounded-lg font-medium hover:bg-burgundy-800 disabled:bg-zinc-300 disabled:cursor-not-allowed"
          >
            {submitting
              ? 'Регистриране...'
              : selectedCategories.size > 1
                ? `Регистрирай в ${selectedCategories.size} категории`
                : 'Регистрирай двойката'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default RegisterCouplePage