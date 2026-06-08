import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api'

const SEVERITY_STYLES = {
  HIGH: {
    FAVOR: 'bg-red-50 border-red-300',
    PENALTY: 'bg-orange-50 border-orange-300',
    NEUTRAL: 'bg-zinc-100 border-zinc-300',
  },
  MODERATE: {
    FAVOR: 'bg-yellow-50 border-yellow-300',
    PENALTY: 'bg-yellow-50 border-yellow-300',
    NEUTRAL: 'bg-zinc-50 border-zinc-200',
  },
  LOW: {
    FAVOR: 'bg-green-50 border-green-200',
    PENALTY: 'bg-green-50 border-green-200',
    NEUTRAL: 'bg-white border-zinc-200',
  },
  NONE: {
    FAVOR: 'bg-white border-zinc-200',
    PENALTY: 'bg-white border-zinc-200',
    NEUTRAL: 'bg-white border-zinc-200',
  },
}

const SEVERITY_LABELS = {
  HIGH: { text: 'Висок', color: 'text-red-700' },
  MODERATE: { text: 'Умерен', color: 'text-amber-700' },
  LOW: { text: 'Малък', color: 'text-green-700' },
  NONE: { text: 'Без', color: 'text-zinc-500' },
}

const DIRECTION_LABELS = {
  FAVOR: { text: 'В полза', icon: '↓' },
  PENALTY: { text: 'Срещу', icon: '↑' },
  NEUTRAL: { text: '—', icon: '' },
}

const CONFIDENCE_LABELS = {
  HIGH: { text: 'Висока', icon: '✓' },
  MEDIUM: { text: 'Средна', icon: '○' },
  LOW: { text: 'Ниска', icon: '⚠' },
}

function BiasDashboardPage() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterSeverity, setFilterSeverity] = useState('all')

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

    api.bias.getJudgeClubMatrix()
      .then(result => setData(result))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [navigate])

  if (loading) return <p className="text-zinc-500">Зареждане на анализа...</p>
  if (error) return <p className="text-red-600">Грешка: {error}</p>
  if (!data) return null


  const filteredRows = data.rows.filter(r => {
    if (filterSeverity === 'all') return true
    if (filterSeverity === 'signals') return r.severity !== 'NONE'
    return r.severity === filterSeverity
  })

  return (
    <div className="max-w-6xl mx-auto">
      <Link
        to="/admin"
        className="inline-flex items-center text-sm text-zinc-600 hover:text-burgundy-900 mb-6"
      >
        ← Назад към администрация
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-zinc-900 mb-2">
          Анализ на пристрастност
        </h1>
        <p className="text-zinc-600">
          Систематичен анализ чрез алгоритъм на оценките на съдиите за откриване на систематично пристрастие.
        </p>
      </div>

      {}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <StatCard label="Общо оценки" value={data.totalMarksAnalyzed} color="text-zinc-900" />
        <StatCard label="Съдии" value={data.judgesAnalyzed} color="text-zinc-900" />
        <StatCard label="Клубове" value={data.clubsAnalyzed} color="text-zinc-900" />
        <StatCard label="Висок риск" value={data.highBiasSignals} color="text-red-700" />
        <StatCard label="Умерен риск" value={data.moderateBiasSignals} color="text-amber-700" />
      </div>

      {}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterButton
          active={filterSeverity === 'signals'}
          onClick={() => setFilterSeverity('signals')}
          label="Само сигнали"
        />
        <FilterButton
          active={filterSeverity === 'HIGH'}
          onClick={() => setFilterSeverity('HIGH')}
          label="Висок"
        />
        <FilterButton
          active={filterSeverity === 'MODERATE'}
          onClick={() => setFilterSeverity('MODERATE')}
          label="Умерен"
        />
        <FilterButton
          active={filterSeverity === 'LOW'}
          onClick={() => setFilterSeverity('LOW')}
          label="Малък"
        />
        <FilterButton
          active={filterSeverity === 'all'}
          onClick={() => setFilterSeverity('all')}
          label="Всички"
        />
      </div>

      {}
            <div className="bg-white border border-zinc-200 rounded-lg p-4 mb-6 text-sm">
                <h3 className="font-semibold text-zinc-700 mb-3">Легенда и обяснение</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-zinc-600 mb-4">
                <div>
                <strong className="text-red-700">Висок риск + В полза</strong> — съдията систематично дава по-добри оценки
                </div>
                <div>
                <strong className="text-orange-700">Висок риск + Срещу</strong> — съдията систематично дава по-ниски оценки
                </div>
                <div>
                <strong className="text-amber-700">Умерен / Малък</strong> — сигнал за проверка, не е категорично доказателство за пристрастие
                </div>
                <div>
                <strong className="text-zinc-500">Без</strong> — оценките са в съответствие със съдийския панел
                </div>
            </div>

            <div className="border-t border-zinc-200 pt-3 text-xs text-zinc-600 space-y-1">
                <p>
                <strong className="text-zinc-700">Z-Score</strong> — измерва колко стандартни отклонения е дадена оценка от консенсуса на съдиите. Стойност 0 означава съгласие, по-голяма от ±1.5 означава значимо отклонение.
                </p>
                <p>
                <strong className="text-zinc-700">Отклонение (X/Y)</strong> — брой значими отклонения (X) от общия брой оценки (Y). Например 5/5 означава че всичките 5 оценки на съдията към тази двойка са се отклонявали от консенсуса.
                </p>
                <p>
                <strong className="text-zinc-700">Сигурност</strong> — надеждност на анализа според броя оценки. Ниска при малко проби, висока при 15+ оценки.
                </p>
            </div>
            </div>

      {}
      {filteredRows.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-lg p-8 text-center">
          <p className="text-zinc-500">Няма данни.</p>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-zinc-700">Съдия</th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-700">Клуб / Страба</th>
                <th className="text-center px-3 py-3 font-semibold text-zinc-700">Оценки</th>
                <th className="text-center px-3 py-3 font-semibold text-zinc-700">Отклонение</th>
                <th className="text-center px-3 py-3 font-semibold text-zinc-700">Z-Score</th>
                <th className="text-center px-3 py-3 font-semibold text-zinc-700">Вид</th>
                <th className="text-center px-3 py-3 font-semibold text-zinc-700">Риск</th>
                <th className="text-center px-3 py-3 font-semibold text-zinc-700">Сигурност</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, idx) => {
                const styles = SEVERITY_STYLES[row.severity]?.[row.biasDirection]
                  || SEVERITY_STYLES.NONE.NEUTRAL
                const severityLabel = SEVERITY_LABELS[row.severity]
                const directionLabel = DIRECTION_LABELS[row.biasDirection]
                const confidenceLabel = CONFIDENCE_LABELS[row.confidence]

                return (
                  <tr
                    key={`${row.userID}-${row.clubName}-${idx}`}
                    className={`border-b border-zinc-100 last:border-0 ${styles}`}
                  >
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {row.judgeName}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">{row.clubName}</td>
                    <td className="text-center px-3 py-3 text-zinc-600">{row.markCount}</td>
                    <td className="text-center px-3 py-3 text-zinc-600">
                      {row.significantCount}/{row.markCount}
                    </td>
                    <td className="text-center px-3 py-3 font-mono text-zinc-700">
                      {row.avgZScore.toFixed(2)}
                    </td>
                    <td className="text-center px-3 py-3">
                      {row.biasDirection !== 'NEUTRAL' && (
                        <span className="inline-flex items-center gap-1">
                          <span className="font-bold">{directionLabel.icon}</span>
                          {directionLabel.text}
                        </span>
                      )}
                      {row.biasDirection === 'NEUTRAL' && (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className={`text-center px-3 py-3 font-semibold ${severityLabel.color}`}>
                      {severityLabel.text}
                    </td>
                    <td className="text-center px-3 py-3 text-xs text-zinc-500">
                      <span title={`Базирано на ${row.markCount} оценки`}>
                        {confidenceLabel.icon} {confidenceLabel.text}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 text-xs text-zinc-500 text-center">
        Анализът се прави спрямо финалните оценки.
        Внимание! Сигналите трябват да бъдат потвърдени ръчно преди взимане на дисциплинарни мерки.
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-4">
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  )
}

function FilterButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-burgundy-900 text-white'
          : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50'
      }`}
    >
      {label}
    </button>
  )
}

export default BiasDashboardPage