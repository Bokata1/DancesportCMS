const API_BASE = 'https://localhost:7223/api'

async function get(path) {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || `API error: ${res.status}`)
  }
  return res.json()
}

export const api = {
  tournaments: {
    getAll: () => get('/tournaments'),
    getById: (id) => get(`/tournaments/${id}`),
    getDetails: (id) => get(`/tournaments/${id}/details`),
    create: (data) => post('/tournaments', data),
    setRegistration: (id, isOpen) => post(`/tournaments/${id}/registration`, { isOpen }),
    getOpenForRegistration: () => get ('/tournaments/open-for-registration'),
    registerCouple: (data) => post('/tournaments/register-couple', data),
    getResults: (id) => get(`/tournaments/${id}/results`),
    finalize: (id) => post(`/tournaments/${id}/finalize`, {}),
    assignHeats: (id) => post(`/tournaments/${id}/assign-heats`, {}),
    
  },
  rounds: {
    getSkatingSheet: (id) => get(`/rounds/${id}/skating`),
    getQualifyingSheet: (id) => get(`/rounds/${id}/qualifying-sheet`),
    getForJudging: (id) => get(`/rounds/${id}/for-judging`),
    submitMarks: (data) => post('/rounds/submit-marks', data),
    getProgress: (id) => get(`/rounds/${id}/progress`),
    setStatus: (id, status) => post(`/rounds/${id}/status`, { status }),
    finalize: (id) => post(`/rounds/${id}/finalize`, {}),
    create: (data) => post ('/rounds', data),
    assignJudges: (id, judgeUserIDs) => post(`/rounds/${id}/assign-judges`, { judgeUserIDs }),

  },
  categories: {
    getAll: () => get('/categories'),
  },
  dances: {
    getAll: () => get('/dances'),
  },
  judges: {
    getAll: () => get('/users/judges'),
  },
  judge: {
    authenticate: (pin) => post('/judge/authenticate', { pin }),
    getActiveRounds: (userID) => get(`/judge/${userID}/active-rounds`),
  },
  auth: {
    login: (email, password) => post('/auth/login', { email, password }),
  },
  bias: {
  getJudgeClubMatrix: () => get('/bias/judge-club-matrix'),
},
voting: {
  getCouples: (tournamentID, categoryID) => get(`/voting/${tournamentID}/${categoryID}/couples`),
  cast: (data) => post('/voting/cast', data),
  getResults: (tournamentID, categoryID) => get(`/voting/${tournamentID}/${categoryID}/results`),
},
rulesViolations: {
    toggle: (data) => post('/rulesViolations/toggle', data),
    getRoundView: (roundID) => get(`/rulesViolations/round/${roundID}`),
    getTournamentView: (tournamentID) => get(`/rulesViolations/tournament/${tournamentID}`),

  },
}