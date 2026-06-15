import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { QRCodeSVG } from 'qrcode.react'


const ROUND_TYPE_LABELS = {
  QL: 'Квалификация',
  QF: 'Четвъртфинал',
  SF: 'Полуфинал',
  FN: 'Финал',
}

const STATUS_LABELS = {
  PN: { text: 'Чакащ', cls: 'bg-zinc-100 text-zinc-700' },
  AC: { text: 'Активен', cls: 'bg-green-100 text-green-800' },
  CL: { text: 'Приключил', cls: 'bg-burgundy-100 text-burgundy-800' },
}


function AdminTournamentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [qrCategory, setQrCategory] = useState(null)

  const [tournament, setTournament] = useState(null)
  const [categories, setCategories] = useState([])
  const [judges, setJudges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showAddRound, setShowAddRound] = useState(false)
  const [judgesRoundID, setJudgesRoundID] = useState(null)

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

    loadAll()
  }, [id, navigate])

  const loadAll = () => {
    Promise.all([
      api.tournaments.getDetails(id),
      api.categories.getAll(),
      api.judges.getAll(),
    ])
      .then(([t, cats, js]) => {
        setTournament(t)
        setCategories(cats)
        setJudges(js)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  const handleFinalizeTournament = async () => {
  if (!confirm('Сигурни ли сте? Това ще приключи всички активни кръгове и ще маркира турнира като завършен. Действието не може да бъде отменено.')) return

  try {
    await api.tournaments.finalize(id)
    loadAll()
  } catch (err) {
    alert('Грешка: ' + err.message)
  }
}
const handleAssignHeats = async () => {
  if (!confirm('Това ще разпредели двойките по серии за всички квалификационни кръгове в статус "Чакащ". Продължаване?')) return

  try {
    const result = await api.tournaments.assignHeats(id)
    alert(`Сериите са разпределени за ${result.roundsAffected} кръг(а).`)
    loadAll()
  } catch (err) {
    alert('Грешка: ' + err.message)
  }
}

  const handleToggleRegistration = async () => {
    try {
      await api.tournaments.setRegistration(id, !tournament.isRegistrationOpen)
      loadAll()
    } catch (err) {
      alert('Грешка: ' + err.message)
    }
  }

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
    <div className="max-w-4xl mx-auto">
      <Link to="/admin" className="inline-flex items-center text-sm text-zinc-600 hover:text-burgundy-900 mb-6">
        ← Назад към администрация
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-zinc-900 mb-2">{tournament.tournamentName}</h1>
        <div className="flex gap-3 mb-6">
    <Link
    to={`/admin/tournaments/${id}/violations`}
    className="inline-flex items-center text-sm text-zinc-700 hover:text-burgundy-900"
    >
    Виж нарушенията
  </Link>
</div>
        <p className="text-zinc-600">{date} · {tournament.location}</p>
      </div>

      {}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-zinc-900 mb-1">Регистрация</h3>
            <p className="text-sm text-zinc-500">
              {tournament.isRegistrationOpen
                ? 'Двойките могат да се регистрират в момента.'
                : 'Регистрацията е затворена.'}
            </p>
          </div>
          <button
            onClick={handleToggleRegistration}
            disabled={tournament.isFinished}
            className={`px-4 py-2 rounded-lg font-medium ${
              tournament.isRegistrationOpen
                ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                : 'bg-burgundy-900 text-white hover:bg-burgundy-800'
            } disabled:bg-zinc-200 disabled:text-zinc-400`}
          >
            {tournament.isRegistrationOpen ? 'Затвори регистрацията' : 'Отвори регистрацията'}
          </button>
        </div>
      </div>
            {!tournament.isFinished && (
            <div className="bg-white border border-zinc-200 rounded-lg p-5 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-zinc-900 mb-1">Финализиране на турнира</h3>
                  <p className="text-sm text-zinc-500">
                    Приключва всички активни кръгове и маркира турнира като завършен.
                  </p>
                </div>
                <button
                  onClick={handleFinalizeTournament}
                  className="px-4 py-2 bg-burgundy-900 text-white rounded-lg font-medium hover:bg-burgundy-800"
                >
                  Финализирай турнира
                </button>
              </div>
            </div>
          )}
          <div className="bg-white border border-zinc-200 rounded-lg p-5 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-zinc-900 mb-1">Разпределяне на серии</h3>
                  <p className="text-sm text-zinc-500">
                  Разпределя двойките по серии (heats) за квалификационните кръгове в статус "Чакащ".
                  </p>
              </div>
                  <button
                    onClick={handleAssignHeats}
                    className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg font-medium hover:bg-zinc-50"
                  >
                    Разпредели серии
                </button>
              </div>
            </div>
      {}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Кръгове и категории
        </h2>
        <button
          onClick={() => setShowAddRound(true)}
          className="text-sm text-burgundy-900 hover:text-burgundy-700 font-medium"
        >
          + Добави кръг
        </button>
      </div>

      {Object.keys(roundsByCategory).length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-lg p-8 text-center mb-6">
          <p className="text-zinc-500 mb-2">Все още няма кръгове.</p>
          <p className="text-sm text-zinc-400">
            Натиснете "+ Добави кръг" за да започнете.
          </p>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {Object.entries(roundsByCategory).map(([category, rounds]) => (
            <div key={category} className="bg-white border border-zinc-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-zinc-900">{category}</h3>
                <button
                  onClick={() => setQrCategory({ name: category, id: rounds[0]?.categoryID })}
                  className="text-sm text-burgundy-900 hover:text-burgundy-700"
                >
                 Покажи QR код
              </button> 
            </div>
              <div className="space-y-2">
                {rounds.map(r => {
                  const status = STATUS_LABELS[r.status] || { text: r.status, cls: 'bg-zinc-100' }
                  return (
                    <div
                      key={r.roundID}
                      className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/admin/rounds/${r.roundID}`}
                          className="font-medium text-burgundy-900 hover:underline"
                        >
                          {ROUND_TYPE_LABELS[r.roundType] || r.roundType}
                        </Link>
                        <span className={`text-xs px-2 py-1 rounded ${status.cls}`}>
                          {status.text}
                        </span>
                      </div>
                      <button
                        onClick={() => setJudgesRoundID(r.roundID)}
                        disabled={r.status === 'CL'}
                        className="text-sm text-zinc-700 hover:text-burgundy-900 disabled:text-zinc-400 disabled:cursor-not-allowed"
                      >
                        Назначи съдии
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {}
      <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
        Назначени съдии ({tournament.judges.length})
      </h2>

      {tournament.judges.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-lg p-6 text-center text-sm text-zinc-500">
          Няма назначени съдии към никой кръг.
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {tournament.judges.map(j => (
              <div key={j.userID} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-burgundy-900 text-white flex items-center justify-center font-medium text-xs">
                  {j.fName.charAt(0)}{j.lName.charAt(0)}
                </div>
                <span className="text-zinc-700">{j.fName} {j.lName}</span>
                {j.isRulesJudge && (
                  <span className="text-xs text-burgundy-900">(Правила)</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {}
      {showAddRound && (
        <AddRoundModal
          tournamentID={id}
          categories={categories}
          onClose={() => setShowAddRound(false)}
          onSuccess={() => {
            setShowAddRound(false)
            loadAll()
          }}
        />
      )}

      {judgesRoundID && (
        <AssignJudgesModal
          roundID={judgesRoundID}
          judges={judges}
          rounds={tournament.rounds}
          onClose={() => setJudgesRoundID(null)}
          onSuccess={() => {
            setJudgesRoundID(null)
            loadAll()
          }}
        />
      )}
          {qrCategory && (
        <QRCodeModal
        tournamentID={id}
        category={qrCategory}
        onClose={() => setQrCategory(null)}
      />
      )}
    </div>
  )
}

function AddRoundModal({ tournamentID, categories, onClose, onSuccess }) {
  const [categoryID, setCategoryID] = useState('')
  const [roundType, setRoundType] = useState('FN')
  const [couplesToAdvance, setCouplesToAdvance] = useState(6)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await api.rounds.create({
        tournamentID: Number(tournamentID),
        categoryID: Number(categoryID),
        roundType,
        couplesToAdvance: roundType === 'FN' ? null : Number(couplesToAdvance),
      })
      onSuccess()
    } catch (err) {
      setError(err.message || 'Грешка при добавяне на кръг')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold text-zinc-900 mb-4">Добави кръг</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Категория
            </label>
            <select
              value={categoryID}
              onChange={e => setCategoryID(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:border-burgundy-900 bg-white"
              required
            >
              <option value="">Изберете категория...</option>
              {categories.map(c => (
                <option key={c.categoryID} value={c.categoryID}>
                  {c.ageGroup}{c.class ? ' ' + c.class : ''} {c.danceStyle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Тип кръг
            </label>
            <select
              value={roundType}
              onChange={e => setRoundType(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:border-burgundy-900 bg-white"
            >
              <option value="QL">Квалификационен</option>
              <option value="QF">Четвъртфинал</option>
              <option value="SF">Полуфинал</option>
              <option value="FN">Финал</option>
            </select>
          </div>

          {roundType !== 'FN' && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Двойки за продължаване
              </label>
              <input
                type="number"
                min="1"
                value={couplesToAdvance}
                onChange={e => setCouplesToAdvance(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:border-burgundy-900"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Колко двойки ще преминат в следващия кръг.
              </p>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 border border-zinc-300 text-zinc-700 rounded-lg font-medium hover:bg-zinc-50"
            >
              Откажи
            </button>
            <button
              onClick={handleSubmit}
              disabled={!categoryID || submitting}
              className="flex-1 h-10 bg-burgundy-900 text-white rounded-lg font-medium hover:bg-burgundy-800 disabled:bg-zinc-300"
            >
              {submitting ? 'Добавяне...' : 'Добави кръг'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AssignJudgesModal({ roundID, judges, rounds, onClose, onSuccess }) {
  const currentRound = rounds.find(r => r.roundID === roundID)
  const [selected, setSelected] = useState(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const toggleJudge = (userID) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(userID)) {
        next.delete(userID)
      } else {
        next.add(userID)
      }
      return next
    })
  }

  const handleSubmit = async () => {
    if (selected.size === 0) {
      setError('Изберете поне един съдия')
      return
    }
    setSubmitting(true)
    setError(null)

    try {
      await api.rounds.assignJudges(roundID, Array.from(selected))
      onSuccess()
    } catch (err) {
      setError(err.message || 'Грешка при назначаване на съдии')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] flex flex-col">
        <h3 className="text-lg font-semibold text-zinc-900 mb-2">
          Назначи съдии
        </h3>
        <p className="text-sm text-zinc-500 mb-4">
          Изберете съдиите за {currentRound ? ROUND_TYPE_LABELS[currentRound.roundType] : 'този кръг'}.
          {selected.size > 0 && ` (${selected.size} избрани)`}
        </p>

        <div className="flex-1 overflow-y-auto border border-zinc-200 rounded-lg mb-4">
          {judges.length === 0 ? (
            <p className="p-4 text-sm text-zinc-500 text-center">
              Няма съдии в системата.
            </p>
          ) : (
            judges.map(j => {
              const isSelected = selected.has(j.userID)
              return (
                <label
                  key={j.userID}
                  className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer border-b border-zinc-100 last:border-0 hover:bg-zinc-50 ${
                    isSelected ? 'bg-burgundy-50' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleJudge(j.userID)}
                    className="w-4 h-4 accent-burgundy-900"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-zinc-900">
                      {j.fName} {j.lName}
                    </div>
                    <div className="text-xs text-zinc-500">{j.judgeLicense || '—'}</div>
                  </div>
                  {j.isRulesJudge && (
                    <span className="text-xs px-2 py-0.5 bg-burgundy-50 text-burgundy-900 rounded">
                      Правила
                    </span>
                  )}
                </label>
              )
            })
          )}
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2 mb-3">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 h-10 border border-zinc-300 text-zinc-700 rounded-lg font-medium hover:bg-zinc-50"
          >
            Откажи
          </button>
          <button
            onClick={handleSubmit}
            disabled={selected.size === 0 || submitting}
            className="flex-1 h-10 bg-burgundy-900 text-white rounded-lg font-medium hover:bg-burgundy-800 disabled:bg-zinc-300"
          >
            {submitting ? 'Запазване...' : 'Запази'}
          </button>
        </div>
      </div>
    </div>
  )
}

function QRCodeModal({ tournamentID, category, onClose }) {
  const voteUrl = `${window.location.origin}/vote/${tournamentID}/${category.id}`

  const copyLink = () => {
    navigator.clipboard.writeText(voteUrl)
    alert('Линкът е копиран!')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold text-zinc-900 mb-2">
          QR код за гласуване
        </h3>
        <p className="text-sm text-zinc-500 mb-4">
          {category.name} — Награда на публиката
        </p>

        <div className="bg-white border-2 border-zinc-200 rounded-lg p-6 flex items-center justify-center mb-4">
          <QRCodeSVG value={voteUrl} size={240} level="M" />
        </div>

        <div className="bg-zinc-50 rounded-lg p-3 mb-4">
          <p className="text-xs text-zinc-500 mb-1">Линк за гласуване:</p>
          <p className="text-xs text-zinc-700 break-all">{voteUrl}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={copyLink}
            className="flex-1 h-10 border border-zinc-300 text-zinc-700 rounded-lg font-medium hover:bg-zinc-50"
          >
            Копирай линк
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-10 bg-burgundy-900 text-white rounded-lg font-medium hover:bg-burgundy-800"
          >
            Затвори
          </button>
        </div>

        <p className="text-xs text-zinc-400 text-center mt-3">
          Покажи кода на публиката.
        </p>
      </div>
    </div>
  )
}
export default AdminTournamentPage