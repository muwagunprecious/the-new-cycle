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
                localStorage.setItem('gocycle_session', JSON.stringify(user))
            }
        },
        logout: (state) => {
            state.user = null
            state.isLoggedIn = false
            if (typeof window !== 'undefined') {
                localStorage.removeItem('gocycle_session')
                // Clear any other potential session markers
                localStorage.clear() 
            }
        },
        hydrateSession: (state) => {
            if (typeof window !== 'undefined') {
                try {
                    const session = localStorage.getItem('gocycle_session')
                    if (session && session !== 'undefined' && session !== 'null') {
                        const parsed = JSON.parse(session)
                        if (parsed && parsed.id) {
                            state.user = parsed
                            state.isLoggedIn = true
                        }
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
                    localStorage.setItem('gocycle_session', JSON.stringify(state.user))
                }
            }
        },
        setCredentials: (state, action) => {
            const user = action.payload
            if (!user) return
            state.user = user
            state.isLoggedIn = true
            if (typeof window !== 'undefined') {
                localStorage.setItem('gocycle_session', JSON.stringify(user))
            }
        }
    }
})

export const { login, logout, hydrateSession, updateProfile, setCredentials } = authSlice.actions
export default authSlice.reducer
