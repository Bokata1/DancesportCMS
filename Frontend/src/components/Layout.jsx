import { useEffect, useState } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { getUserSession, clearUserSession } from '../auth'

function Layout() {
  const navigate = useNavigate()
  const [lang, setLang] = useState('bg')
  const [user, setUser] = useState(getUserSession())

  useEffect(() => {
    const handleAuthChange = () => setUser(getUserSession())
    window.addEventListener('auth-changed', handleAuthChange)
    return () => window.removeEventListener('auth-changed', handleAuthChange)
  }, [])

  const handleLogout = () => {
    clearUserSession()
    navigate('/')
  }

  const labels = {
    bg: {
      title: 'DancesportCMS',
      tournaments: 'Турнири',
      register: 'Регистрация',
      judges: 'Съдии',
      admin: 'Администрация',
      judging: 'Съдийство',
      login: 'Вход',
      logout: 'Изход',
    },
    en: {
      title: 'DancesportCMS',
      tournaments: 'Tournaments',
      judges: 'Judges',
      admin: 'Admin',
      judging: 'Judging',
      login: 'Login',
      logout: 'Logout',
    },
  }

  const t = labels[lang]

  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'text-burgundy-900 font-medium'
      : 'text-zinc-600 hover:text-burgundy-900'

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-semibold text-burgundy-900">
              {t.title}
            </Link>
            <nav className="flex gap-6">
              <NavLink to="/tournaments" className={navLinkClass}>
                {t.tournaments}
              </NavLink>
              <NavLink to="/judges" className={navLinkClass}>
                {t.judges}
              </NavLink>
              <NavLink to="/register" className={navLinkClass}>
                {t.register}
              </NavLink>
              {user?.isAdmin && (
                <NavLink to="/admin" className={navLinkClass}>
                  {t.admin}
                </NavLink>
              )}
              {user?.isJudge && (
                <NavLink to="/judge/login" className={navLinkClass}>
                  {t.judging}
                </NavLink>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-1 text-sm">
              <button
                onClick={() => setLang('bg')}
                className={
                  lang === 'bg'
                    ? 'px-2 py-1 text-burgundy-900 font-medium'
                    : 'px-2 py-1 text-zinc-400 hover:text-zinc-700'
                }
              >
                BG
              </button>
              <span className="text-zinc-300">|</span>
              <button
                onClick={() => setLang('en')}
                className={
                  lang === 'en'
                    ? 'px-2 py-1 text-burgundy-900 font-medium'
                    : 'px-2 py-1 text-zinc-400 hover:text-zinc-700'
                }
              >
                EN
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-zinc-700">
                  {user.fName} {user.lName}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-zinc-500 hover:text-burgundy-900"
                  title={t.logout}
                >
                  {t.logout}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm text-burgundy-900 hover:text-burgundy-700 font-medium"
              >
                {t.login} →
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout