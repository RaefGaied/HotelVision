import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Chatbot from '../components/Chatbot';

const ChatbotPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <FaArrowLeft className="h-5 w-5 text-gray-600" />
                            </button>
                            <h1 className="text-xl font-semibold text-gray-900">
                                Assistant IA Connecty
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Bienvenue dans votre assistant personnel
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Je suis là pour vous aider avec vos questions, vous donner des idées de contenu,
                        analyser des textes et bien plus encore. N'hésitez pas à me parler !
                    </p>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                            <h3 className="font-semibold text-blue-900 mb-2">💡 Idées de contenu</h3>
                            <p className="text-sm text-blue-700">
                                Demandez-moi des idées pour vos publications sur les réseaux sociaux
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                            <h3 className="font-semibold text-green-900 mb-2">📊 Analyse de sentiment</h3>
                            <p className="text-sm text-green-700">
                                Faites-moi analyser le sentiment de vos textes
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                            <h3 className="font-semibold text-purple-900 mb-2">💬 Conversation</h3>
                            <p className="text-sm text-purple-700">
                                Discutez librement de vos projets et idées
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chatbot Component */}
                <div className="h-[600px]">
                    <Chatbot className="h-full" />
                </div>
            </div>
        </div>
    );
};

export default ChatbotPage;
