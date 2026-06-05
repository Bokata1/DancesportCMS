import {useState} from 'react';
import { useNavigate,Link } from 'react-router-dom';
import {api} from '../api';
import {saveUserSession} from '../auth';

function LoginPage() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!email || !password) {
            setError('Моля попълнете полетата')
            return
        }
        setLoading(true)
        setError(null)

        try {
            const user = await api.auth.login(email,password)
            saveUserSession(user)
            navigate('/')

        } catch (err) {
            setError(err.message || 'Грешка при вход в системата')
        } finally {
            setLoading(false)
        }
    }

    return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 mb-2">Вход</h1>
          <p className="text-sm text-zinc-600">Влизане в системата</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Имейл
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy-900 focus:border-transparent disabled:opacity-50"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Парола
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy-900 focus:border-transparent disabled:opacity-50"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full h-11 bg-burgundy-900 text-white rounded-lg text-sm font-medium hover:bg-burgundy-800 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Влизане....' : 'Влез'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          <Link to="/" className="hover:text-burgundy-900">← Към началната страница</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage