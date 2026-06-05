import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {api} from '../api';

function JudgeLoginPage() {
    const navigate = useNavigate()
    const [pin, setPin] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleDigit = digit => {
        if(pin.length < 4 && !loading) {
            setPin(pin + digit)
            setError(null)
        }
    }

    const handleBackspace = () => {
        if(!loading) {
            setPin(pin.slice(0, -1))
            setError(null)
        }
    }

    const handleSubmit = async () => {
        if  (pin.length !== 4) return
        setLoading(true)
        setError(null)  


        try {
            const session = await api.judge.authenticate(pin)
            sessionStorage.setItem('judgeSession', JSON.stringify({ ...session, pin }))
            navigate('/judge/rounds')
        } catch (err) {
            setError(err.message || 'Грешка при автентикация')
            setPin('')
        } finally {
            setLoading(false)
        }
    }
     return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 mb-2">Вход за съдии</h1>
          <p className="text-sm text-zinc-600">Моля въведете вашия 4-цифрен PIN</p>
        </div>

        <div className="flex justify-center gap-3 mb-2">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center text-2xl font-semibold ${
                pin.length > i
                  ? 'border-burgundy-900 bg-burgundy-50 text-burgundy-900'
                  : 'border-zinc-300 bg-white text-zinc-400'
              }`}
            >
              {pin.length > i ? '●' : ''}
            </div>
          ))}
        </div>

        <div className="h-6 mb-4 text-center">
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button
              key={n}
              onClick={() => handleDigit(n.toString())}
              disabled={loading}
              className="h-16 bg-white border border-zinc-200 rounded-lg text-2xl font-medium text-zinc-900 hover:bg-zinc-50 active:bg-zinc-100 disabled:opacity-50 transition-colors"
            >
              {n}
            </button>
          ))}

          <div /> {}

          <button
            onClick={() => handleDigit('0')}
            disabled={loading}
            className="h-16 bg-white border border-zinc-200 rounded-lg text-2xl font-medium text-zinc-900 hover:bg-zinc-50 active:bg-zinc-100 disabled:opacity-50 transition-colors"
          >
            0
          </button>

          <button
            onClick={handleBackspace}
            disabled={loading || pin.length === 0}
            className="h-16 bg-white border border-zinc-200 rounded-lg text-xl text-zinc-600 hover:bg-zinc-50 active:bg-zinc-100 disabled:opacity-50 transition-colors"
          >
            ⌫
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={pin.length !== 4 || loading}
          className="w-full h-14 bg-burgundy-900 text-white rounded-lg text-lg font-medium hover:bg-burgundy-800 active:bg-burgundy-950 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Проверка...' : 'Влизане'}
        </button>
      </div>
    </div>
  )
}

    export default JudgeLoginPage

