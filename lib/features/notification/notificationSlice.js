import { createSlice } from '@reduxjs/toolkit'

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        list: [],
    },
    reducers: {
        addNotification: (state, action) => {
            state.list.unshift({
                id: "notif_" + Date.now(),
                status: 'unread',
                createdAt: new Date().toISOString(),
                ...action.payload
            })
        },
        markAsRead: (state, action) => {
            const { id } = action.payload
            state.list = state.list.map(n => n.id === id ? { ...n, status: 'read' } : n)
        },
        markAllAsRead: (state) => {
            state.list = state.list.map(n => ({ ...n, status: 'read' }))
        }
    }
})

export const { addNotification, markAsRead, markAllAsRead } = notificationSlice.actions
export default notificationSlice.reducer
