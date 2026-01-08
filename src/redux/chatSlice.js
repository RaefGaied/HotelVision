import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isOpen: false,
    messages: [],
    isLoading: false,
    chatId: null,
    error: null
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        toggleChat: (state) => {
            state.isOpen = !state.isOpen;
        },
        openChat: (state) => {
            state.isOpen = true;
        },
        closeChat: (state) => {
            state.isOpen = false;
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        clearMessages: (state) => {
            state.messages = [{
                role: 'assistant',
                content: 'Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider aujourd\'hui ?'
            }];
            state.chatId = null;
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setChatId: (state, action) => {
            state.chatId = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        }
    }
});

export const {
    toggleChat,
    openChat,
    closeChat,
    addMessage,
    setMessages,
    clearMessages,
    setLoading,
    setChatId,
    setError,
    clearError
} = chatSlice.actions;

export default chatSlice.reducer;
