import React, { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { chatbotAssistance, addChatMessage, clearChatHistory } from '../store/aiSlice'
import { MessageCircle, Send, Bot, User, Trash2, Minimize2, Maximize2 } from 'lucide-react'
import { toast } from 'react-toastify'

const AIChatbot = ({ userId, context = 'general' }) => {
    const dispatch = useDispatch()
    const ai = useSelector(state => state.ai)
    const { chatbotHistory, loading } = ai
    const chatbotError = ai.error?.chatbot
    const [message, setMessage] = useState('')
    const [isMinimized, setIsMinimized] = useState(false)
    const [isOpened, setIsOpened] = useState(false)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        scrollToBottom()
    }, [chatbotHistory])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!message.trim()) return

        const userMessage = {
            type: 'user',
            content: message,
            timestamp: new Date().toISOString()
        }

        // Add user message to history
        dispatch(addChatMessage(userMessage))

        // Clear input
        const messageToSend = message
        setMessage('')

        try {
            // Get AI response
            await dispatch(chatbotAssistance({
                message: messageToSend,
                userId,
                context
            })).unwrap()
        } catch (err) {
            toast.error('Erreur lors de la communication avec l\'assistant')
        }
    }

    const handleClearHistory = () => {
        dispatch(clearChatHistory())
        toast.info('Historique effacé')
    }

    const toggleChat = () => {
        setIsOpened(!isOpened)
        if (!isOpened) {
            setIsMinimized(false)
        }
    }

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized)
    }

    const getSuggestions = () => {
        const suggestions = [
            "Quelles chambres sont disponibles ?",
            "Comment faire une réservation ?",
            "Quels services sont proposés ?",
            "Comment modifier ma réservation ?",
            "Quels sont les modes de paiement ?"
        ]

        if (context === 'chambres') {
            return [
                "Quels types de chambres proposez-vous ?",
                "Comment choisir la bonne chambre ?",
                "Y a-t-il des promotions ?",
                "Les chambres sont-elles climatisées ?"
            ]
        }

        if (context === 'reservations') {
            return [
                "Comment annuler ma réservation ?",
                "Puis-je modifier les dates ?",
                "Quelle est votre politique d'annulation ?",
                "Comment ajouter des services ?"
            ]
        }

        return suggestions
    }

    const handleSuggestionClick = (suggestion) => {
        setMessage(suggestion)
    }

    if (!isOpened) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={toggleChat}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110"
                    title="Assistant IA"
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
            </div>
        )
    }

    return (
        <div className={`fixed bottom-6 right-6 z-50 ${isMinimized ? 'w-80' : 'w-96'} bg-white rounded-lg shadow-2xl border border-gray-200`}>
            {/* Header */}
            <div className="bg-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Bot className="w-5 h-5" />
                    <div>
                        <h3 className="font-semibold">Assistant HôtelApp</h3>
                        <p className="text-xs text-purple-200">IA pour vous aider</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleMinimize}
                        className="p-1 hover:bg-purple-700 rounded transition"
                        title={isMinimized ? "Agrandir" : "Réduire"}
                    >
                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={toggleChat}
                        className="p-1 hover:bg-purple-700 rounded transition"
                        title="Fermer"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div className="h-96 overflow-y-auto p-4 space-y-3">
                        {chatbotHistory.length === 0 ? (
                            <div className="text-center py-8">
                                <Bot className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                                <h4 className="font-semibold text-gray-900 mb-2">Bonjour ! 👋</h4>
                                <p className="text-gray-600 text-sm mb-4">
                                    Je suis votre assistant virtuel pour HôtelApp. Comment puis-je vous aider aujourd'hui ?
                                </p>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-700">Suggestions rapides :</p>
                                    <div className="flex flex-wrap gap-2">
                                        {getSuggestions().slice(0, 3).map((suggestion, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs rounded-full transition"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            chatbotHistory.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-xs px-4 py-2 rounded-lg ${msg.type === 'user'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            {msg.type === 'user' ? (
                                                <User className="w-3 h-3" />
                                            ) : (
                                                <Bot className="w-3 h-3" />
                                            )}
                                            <span className="text-xs opacity-75">
                                                {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-sm">{msg.response || msg.content}</p>

                                        {/* Bot suggestions */}
                                        {msg.type === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                                            <div className="mt-2 space-y-1">
                                                {msg.suggestions.map((suggestion, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleSuggestionClick(suggestion)}
                                                        className="block w-full text-left px-2 py-1 bg-white bg-opacity-50 hover:bg-opacity-75 rounded text-xs text-purple-700 transition"
                                                    >
                                                        💡 {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Loading indicator */}
                        {loading.chatbot && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Bot className="w-3 h-3" />
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Error */}
                    {chatbotError && (
                        <div className="mx-4 mb-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                            {chatbotError}
                        </div>
                    )}

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Tapez votre message..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                disabled={loading.chatbot}
                            />
                            <button
                                type="submit"
                                disabled={loading.chatbot || !message.trim()}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-center mt-2">
                            <div className="flex gap-2">
                                {getSuggestions().slice(0, 2).map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded transition"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleClearHistory}
                                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-xs transition"
                                title="Effacer l'historique"
                            >
                                <Trash2 className="w-3 h-3" />
                                Effacer
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    )
}

export default AIChatbot
