import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    isGlobalLoading: false,
    loadingMessage: '',
    loadingSteps: [], // For multi-step loaders
    currentStepIndex: 0,
}

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        showLoader: (state, action) => {
            state.isGlobalLoading = true
            state.loadingMessage = action.payload || ''
        },
        hideLoader: (state) => {
            state.isGlobalLoading = false
            state.loadingMessage = ''
            state.loadingSteps = []
            state.currentStepIndex = 0
        },
        setLoadingSteps: (state, action) => {
            state.loadingSteps = action.payload
            state.currentStepIndex = 0
            state.isGlobalLoading = true
        },
        nextLoadingStep: (state) => {
            if (state.currentStepIndex < state.loadingSteps.length - 1) {
                state.currentStepIndex += 1
                state.loadingMessage = state.loadingSteps[state.currentStepIndex]
            }
        },
        setLoadingMessage: (state, action) => {
            state.loadingMessage = action.payload
        }
    }
})

export const { showLoader, hideLoader, setLoadingSteps, nextLoadingStep, setLoadingMessage } = uiSlice.actions
export default uiSlice.reducer
