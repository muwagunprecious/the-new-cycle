import { createSlice } from '@reduxjs/toolkit'
import { dummyUsers } from '@/assets/assets'

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null, // User object
        isLoggedIn: false,
        users: dummyUsers, // Mock user database
    },
    reducers: {
        login: (state, action) => {
            const { email, password } = action.payload
            // Simple mock find
            const user = state.users.find(u => u.email === email)
            if (user) {
                state.user = user
                state.isLoggedIn = true
                if (typeof window !== 'undefined') {
                    localStorage.setItem('gocycle_session', JSON.stringify(user))
                }
            } else {
                throw new Error("Invalid credentials")
            }
        },
        signup: (state, action) => {
            const newUser = {
                id: "user_" + Math.random().toString(36).substr(2, 9),
                ...action.payload,
                status: 'active',
                createdAt: new Date().toISOString()
            }
            state.users.push(newUser)
            state.user = newUser
            state.isLoggedIn = true
            if (typeof window !== 'undefined') {
                localStorage.setItem('gocycle_session', JSON.stringify(newUser))
                localStorage.setItem('gocycle_users', JSON.stringify(state.users))
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
                    const storedUsers = localStorage.getItem('gocycle_users')
                    if (session && session !== 'undefined') {
                        state.user = JSON.parse(session)
                        state.isLoggedIn = !!state.user
                    }
                    if (storedUsers && storedUsers !== 'undefined') {
                        state.users = JSON.parse(storedUsers)
                    }
                } catch (e) {
                    console.error("Auth Hydration Error:", e)
                    localStorage.removeItem('gocycle_session')
                }
            }
        },
        updateProfile: (state, action) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload }
                state.users = state.users.map(u => u.id === state.user.id ? state.user : u)
                if (typeof window !== 'undefined') {
                    localStorage.setItem('gocycle_session', JSON.stringify(state.user))
                    localStorage.setItem('gocycle_users', JSON.stringify(state.users))
                }
            }
        },
        toggleUserStatus: (state, action) => {
            const { userId } = action.payload
            state.users = state.users.map(u => {
                if (u.id === userId) {
                    return { ...u, status: u.status === 'active' ? 'banned' : 'active' }
                }
                return u
            })
            if (typeof window !== 'undefined') {
                localStorage.setItem('gocycle_users', JSON.stringify(state.users))
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

export const { login, signup, logout, hydrateSession, updateProfile, toggleUserStatus, setCredentials } = authSlice.actions
export default authSlice.reducer
