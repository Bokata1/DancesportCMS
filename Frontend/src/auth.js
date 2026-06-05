const STORAGE_KEY = 'userSession';

export function saveUserSession(user) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    window.dispatchEvent(new Event('auth-changed'))
}

export function getUserSession() {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
}

export function clearUserSession() {
    sessionStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new Event('auth-changed'))
}