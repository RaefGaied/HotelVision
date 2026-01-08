import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaComments, FaTimes, FaPaperPlane } from 'react-icons/fa';
import {
    toggleChat,
    addMessage,
    setLoading,
    setChatId,
    setError,
    clearError
} from '../redux/chatSlice';

const FloatingChatbot = () => {
    const dispatch = useDispatch();
    const { isOpen, messages, isLoading, chatId, error } = useSelector((state) => state.chat);
    const { user } = useSelector((state) => state.user);
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!inputMessage.trim() || isLoading || !user?.token) return;

        const userMessage = {
            role: 'user',
            content: inputMessage.trim()
        };

        // Add user message to Redux store
        dispatch(addMessage(userMessage));
        setInputMessage('');
        dispatch(setLoading(true));
        dispatch(clearError());

        try {
            const response = await fetch('http://localhost:5000/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    chatId: chatId
                })
            });

            const data = await response.json();

            if (data.success) {
                // Save chat ID for future messages
                if (!chatId && data.data.chatId) {
                    dispatch(setChatId(data.data.chatId));
                }

                // Add AI response to Redux store
                dispatch(addMessage({
                    role: 'assistant',
                    content: data.data.response
                }));
            } else {
                // Handle error
                dispatch(addMessage({
                    role: 'assistant',
                    content: 'Désolé, une erreur est survenue. Veuillez réessayer.'
                }));
                dispatch(setError(data.message || 'Erreur inconnue'));
            }
        } catch (error) {
            console.error('Error sending message:', error);
            dispatch(addMessage({
                role: 'assistant',
                content: 'Désolé, je ne peux pas répondre pour le moment. Veuillez vérifier votre connexion.'
            }));
            dispatch(setError('Erreur de connexion'));
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const handleToggleChat = () => {
        dispatch(toggleChat());
    };

    if (!isOpen) {
        // Floating button when chat is closed
        return (
            <button
                onClick={handleToggleChat}
                className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                aria-label="Ouvrir le chat"
            >
                <FaComments className="h-6 w-6" />
            </button>
        );
    }

    // Chat window when open
    return (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg">
                <div className="flex items-center gap-3">
                    <FaComments className="h-6 w-6 text-white" />
                    <h2 className="text-lg font-semibold text-white">Assistant IA</h2>
                </div>
                <button
                    onClick={handleToggleChat}
                    className="p-1 text-white hover:bg-white/20 rounded transition-colors"
                    aria-label="Fermer le chat"
                >
                    <FaTimes className="h-5 w-5" />
                </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] px-4 py-3 rounded-2xl ${message.role === 'user'
                                ? 'bg-blue-500 text-white ml-auto'
                                : 'bg-gray-100 text-gray-800'
                                }`}
                        >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="flex justify-center">
                        <div className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm">
                            {error}
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Tapez votre message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!inputMessage.trim() || isLoading}
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <FaPaperPlane className="h-5 w-5" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FloatingChatbot;
