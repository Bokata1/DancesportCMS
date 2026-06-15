import { BrowserRouter,Routes,Route} from 'react-router-dom'
import Layout from './components/Layout'
import TournamentArchivePage from './pages/TournamentArchivePage'
import TournamentsPage from './pages/TournamentsPage'
import TournamentDetailPage from './pages/TournamentDetailPage'
import JudgesPage from './pages/JudgesPage'
import NotFoundPage from './pages/NotFoundPage'
import SkatingSheetPage from './pages/SkatingSheetPage'
import QualifyingSheetPage from './pages/QualifyingSheetPage'
import JudgeLoginPage from './pages/JudgeLoginPage'
import JudgeRoundsPage from './pages/JudgeRoundsPage'
import LoginPage from './pages/LoginPage'
import MarkEntryPage from './pages/MarkEntryPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminTournamentPage from './pages/AdminTournamentPage'
import RegisterCouplePage from './pages/RegisterCouplePage'
import AdminRoundPage from './pages/AdminRoundPage'
import BiasDashboardPage from './pages/BiasDashboard'
import VotePage from './pages/VotePage'
import VoteResultsPage from './pages/VoteResultsPage'
import RulesJudgePage from './pages/RulesJudgePage'
import AdminViolationsPage from './pages/AdminViolationsPage'
import TournamentResultsPage from './pages/TournamentResultsPage'


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route element ={<Layout />}>
          <Route path="/" element={<TournamentsPage />} />
          <Route path="/tournaments" element={<TournamentsPage />} />
          <Route path="/tournaments/archive" element={<TournamentArchivePage />} />
          <Route path="/tournaments/:id" element={<TournamentDetailPage />} />
          <Route path="/judges" element={<JudgesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/judge/login" element={<JudgeLoginPage />} />
          <Route path="/judge/rounds" element={<JudgeRoundsPage />} />
          <Route path="/rounds/:id/skating" element={<SkatingSheetPage />} />
          <Route path="/rounds/:id/qualifying-sheet" element={<QualifyingSheetPage />} />
          <Route path="/judge/rounds/:id" element={<MarkEntryPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/tournaments/:id" element={<AdminTournamentPage />} />
          <Route path="/admin/rounds/:id" element={<AdminRoundPage />} />
          <Route path="/admin/bias" element={<BiasDashboardPage />} />
          <Route path="/register" element={<RegisterCouplePage />} />
          <Route path="/vote/:tournamentID/:categoryID" element={<VotePage />} />
          <Route path="/vote-results/:tournamentID/:categoryID" element={<VoteResultsPage />} />
          <Route path="/judge/rules/:roundID" element={<RulesJudgePage />} />
          <Route path="/admin/tournaments/:id/violations" element={<AdminViolationsPage />} />
          <Route path="/tournaments/:id/results" element={<TournamentResultsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
 

