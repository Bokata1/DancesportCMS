import { BrowserRouter,Routes,Route} from 'react-router-dom'
import Layout from './components/Layout'
import TournamentsPage from './pages/TournamentsPage'
import JudgesPage from './pages/JudgesPage'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route element ={<Layout />}>
          <Route path="/" element={<TournamentsPage />} />
          <Route path="/tournaments" element={<TournamentsPage />} />
          <Route path="/judges" element={<JudgesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
 

