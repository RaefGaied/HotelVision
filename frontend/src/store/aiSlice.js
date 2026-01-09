import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../services/apiClient'

export const getRecommendations = createAsyncThunk(
    'ai/getRecommendations',
    async ({ userId, preferences }, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/ai/recommendations', {
                userId,
                preferences
            })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response.data.msg || 'Erreur lors de la génération des recommandations')
        }
    }
)

export const generateRoomDescription = createAsyncThunk(
    'ai/generateRoomDescription',
    async (roomId, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/ai/room-description/${roomId}`)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response.data.msg || 'Erreur lors de la génération de la description')
        }
    }
)

export const chatbotAssistance = createAsyncThunk(
    'ai/chatbotAssistance',
    async ({ message, userId, context }, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/ai/chatbot', {
                message,
                userId,
                context
            })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response.data.msg || 'Erreur lors du traitement de votre demande')
        }
    }
)

const aiSlice = createSlice({
    name: 'ai',
    initialState: {
        recommendations: [],
        roomDescription: null,
        chatbotHistory: [],
        loading: {
            recommendations: false,
            description: false,
            chatbot: false
        },
        error: {
            recommendations: null,
            description: null,
            chatbot: null
        },
        userProfile: null
    },
    reducers: {
        clearError: (state, action) => {
            const field = action.payload
            state.error[field] = null
        },
        clearRoomDescription: (state) => {
            state.roomDescription = null
        },
        addChatMessage: (state, action) => {
            state.chatbotHistory.push(action.payload)
        },
        clearChatHistory: (state) => {
            state.chatbotHistory = []
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getRecommendations.pending, (state) => {
                state.loading.recommendations = true
                state.error.recommendations = null
            })
            .addCase(getRecommendations.fulfilled, (state, action) => {
                state.loading.recommendations = false
                state.recommendations = action.payload.recommendations || []
                state.userProfile = action.payload.userProfile
            })
            .addCase(getRecommendations.rejected, (state, action) => {
                state.loading.recommendations = false
                state.error.recommendations = typeof action.payload === 'string' ? action.payload : action.payload?.msg || 'Erreur lors de la génération des recommandations'
            })

        builder
            .addCase(generateRoomDescription.pending, (state) => {
                state.loading.description = true
                state.error.description = null
            })
            .addCase(generateRoomDescription.fulfilled, (state, action) => {
                state.loading.description = false
                state.roomDescription = action.payload
            })
            .addCase(generateRoomDescription.rejected, (state, action) => {
                state.loading.description = false
                state.error.description = typeof action.payload === 'string' ? action.payload : action.payload?.msg || 'Erreur lors de la génération de la description'
            })

        builder
            .addCase(chatbotAssistance.pending, (state) => {
                state.loading.chatbot = true
                state.error.chatbot = null
            })
            .addCase(chatbotAssistance.fulfilled, (state, action) => {
                state.loading.chatbot = false
                state.chatbotHistory.push({
                    type: 'bot',
                    ...action.payload,
                    timestamp: new Date().toISOString()
                })
            })
            .addCase(chatbotAssistance.rejected, (state, action) => {
                state.loading.chatbot = false
                state.error.chatbot = typeof action.payload === 'string' ? action.payload : action.payload?.msg || 'Erreur lors du traitement de votre demande'
                state.chatbotHistory.push({
                    type: 'bot',
                    response: 'Désolé, je rencontre des difficultés techniques. Veuillez réessayer plus tard.',
                    suggestions: ['Contacter le support', 'Voir la FAQ'],
                    category: 'support',
                    timestamp: new Date().toISOString()
                })
            })
    }
})

export const { clearError, clearRoomDescription, addChatMessage, clearChatHistory } = aiSlice.actions
export default aiSlice.reducer
