import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null, 
        isLoggedIn: false,
        isHydrated: false,
    },
    reducers: {
        login: (state, action) => {
            const user = action.payload
            state.user = user
            state.isLoggedIn = true
            if (typeof window !== 'undefined') {
                try {
                    localStorage.setItem('gocycle_session', JSON.stringify(user))
                } catch (e) {
                    console.error("[AUTH] Failed to save session to localStorage:", e)
                }
            }
        },
        logout: (state) => {
            state.user = null
            state.isLoggedIn = false
            if (typeof window !== 'undefined') {
                localStorage.removeItem('gocycle_session')
            }
        },
        hydrateSession: (state) => {
            if (typeof window !== 'undefined') {
                try {
                    const session = localStorage.getItem('gocycle_session')
                    if (session && session !== 'undefined' && session !== 'null') {
                        const parsed = JSON.parse(session)
                        if (parsed && parsed.id) {
                            console.log("[AUTH] Hydrating session for user:", parsed.id)
                            state.user = parsed
                            state.isLoggedIn = true
                        } else {
                            console.warn("[AUTH] Session found but invalid (no ID)", parsed)
                        }
                    } else {
                        console.log("[AUTH] No session found in localStorage")
                    }
                } catch (e) {
                    console.error("Auth Hydration Error:", e)
                    localStorage.removeItem('gocycle_session')
                } finally {
                    state.isHydrated = true
                }
            }
        },
        updateProfile: (state, action) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload }
                if (typeof window !== 'undefined') {
                    try {
                        localStorage.setItem('gocycle_session', JSON.stringify(state.user))
                    } catch (e) {
                        console.error("[AUTH] Failed to update session in localStorage:", e)
                    }
                }
            }
        },
        setCredentials: (state, action) => {
            const user = action.payload
            if (!user) return
            state.user = user
            state.isLoggedIn = true
            if (typeof window !== 'undefined') {
                try {
                    localStorage.setItem('gocycle_session', JSON.stringify(user))
                } catch (e) {
                    console.error("[AUTH] Failed to set credentials in localStorage:", e)
                }
            }
        }
    }
})

export const { login, logout, hydrateSession, updateProfile, setCredentials } = authSlice.actions
export default authSlice.reducer
