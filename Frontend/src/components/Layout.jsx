import { Outlet,NavLink } from "react-router-dom";
import { useState } from "react";

function Layout() {
    const [lang,setLang] = useState("bg")
    const labels = {
        bg: { title: 'DanceSportCMS', tournaments: 'Турнири', judges: 'Съдии'},
        en: { title: 'DanceSportCMS', tournaments: 'Tournaments', judges: 'Judges' },

    }
    const t = labels[lang]
    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white border-b boreder-zinc-200">
                <div className = "max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className = "flex items-center gap-8">
                        <h1 className = "text-xl font-semibold text-burgundy-900">{t.title}</h1>
                            <nav className = "flex gap-6"> 
                                <NavLink
                                    to="/tournaments"
                                    className={({ isActive }) =>
                                        isActive 
                                        ? 'text-burgundy-900 font-medium' 
                                        : 'text-zinc-600 hover:text-burgundy-900'
                                    }
                                >
                                    {t.tournaments}
                                </NavLink>
                                <NavLink
                                    to="/judges"
                                    className={({ isActive }) =>
                                        isActive
                                        ? 'text-burgundy-900 font-medium'
                                        : 'text-zinc-600 hover:text-burgundy-900'
                                    }
                                >
                                    {t.judges}
                                </NavLink>
                            </nav>
                    </div>
                    <div className = "flex gap-1 text-sm">
                        <button
                            onClick = {() => setLang("bg")}
                            className = {
                                lang === 'bg'
                                ? 'px-2 py-1 text-burgundy-900 font-medium'
                                : 'px-2 py-1 text-zinc-400 hover:text-zinc-700'
                            }
                            >
                            BG
                        </button>
                        <span className = "text-zinc-300">|</span>
                        <button
                            onClick = {() => setLang("en")}
                            className = {
                                lang === 'en'
                                ? 'px-2 py-1 text-burgundy-900 font-medium'
                                : 'px-2 py-1 text-zinc-400 hover:text-zinc-700'
                            }
                            >
                            EN
                        </button>
                    </div>
                </div>
            </header>
            <main className = "flex-1 max-w-7xl mx-auto w-full px-6 py-8">
                <Outlet />
            </main>
        </div>
    )
 

            
}
export default Layout