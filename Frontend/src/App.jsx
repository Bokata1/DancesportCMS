import { BrowserRouter,Routes,Route} from 'react-router-dom'
import Layout from './components/Layout'
import TournamentsPage from './pages/TournamentsPage'
import TournamentDetailPage from './pages/TournamentDetailPage'
import JudgesPage from './pages/JudgesPage'
import NotFoundPage from './pages/NotFoundPage'
import SkatingSheetPage from './pages/SkatingSheetPage'
import JudgeLoginPage from './pages/JudgeLoginPage'
import JudgeRoundsPage from './pages/JudgeRoundsPage'
import LoginPage from './pages/LoginPage'
import MarkEntryPage from './pages/MarkEntryPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminTournamentPage from './pages/AdminTournamentPage'
import RegisterCouplePage from './pages/RegisterCouplePage'
import AdminRoundPage from './pages/AdminRoundPage'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route element ={<Layout />}>
          <Route path="/" element={<TournamentsPage />} />
          <Route path="/tournaments" element={<TournamentsPage />} />
          <Route path="/tournaments/:id" element={<TournamentDetailPage />} />
          <Route path="/judges" element={<JudgesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/judge/login" element={<JudgeLoginPage />} />
          <Route path="/judge/rounds" element={<JudgeRoundsPage />} />
          <Route path="/rounds/:id/skating" element={<SkatingSheetPage />} />
          <Route path="/judge/rounds/:id" element={<MarkEntryPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/tournaments/:id" element={<AdminTournamentPage />} />
          <Route path="/admin/rounds/:id" element={<AdminRoundPage />} />
          <Route path="/register" element={<RegisterCouplePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
 

