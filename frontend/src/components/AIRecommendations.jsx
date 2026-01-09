import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getRecommendations, clearError } from '../store/aiSlice'
import { Brain, Star, MapPin, Users, DollarSign, Sparkles } from 'lucide-react'
import { toast } from 'react-toastify'

const AIRecommendations = ({ userId, onRoomSelect }) => {
    const dispatch = useDispatch()
    const ai = useSelector(state => state.ai)
    const { recommendations, userProfile, loading } = ai
    const recommendationsError = ai.error?.recommendations
    const [preferences, setPreferences] = useState({
        budget: '',
        roomType: '',
        city: '',
        duration: ''
    })
    const [showPreferences, setShowPreferences] = useState(false)

    useEffect(() => {
        if (userId && userId !== 'guest') {
            handleGetRecommendations()
        }
    }, [userId])

    const handleGetRecommendations = () => {
        dispatch(getRecommendations({ userId, preferences }))
            .unwrap()
            .catch(error => {
                toast.error(error)
            })
    }

    const handlePreferenceChange = (field, value) => {
        setPreferences(prev => ({ ...prev, [field]: value }))
    }

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-green-600 bg-green-100'
        if (score >= 80) return 'text-blue-600 bg-blue-100'
        if (score >= 70) return 'text-yellow-600 bg-yellow-100'
        return 'text-gray-600 bg-gray-100'
    }

    return (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Brain className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Recommandations IA</h2>
                        <p className="text-sm text-gray-600">
                            {userId === 'guest'
                                ? 'Connectez-vous pour des recommandations personnalisées'
                                : 'Des suggestions personnalisées pour vous'
                            }
                        </p>
                    </div>
                </div>
                {userId !== 'guest' && (
                    <button
                        onClick={() => setShowPreferences(!showPreferences)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition text-sm font-medium"
                    >
                        {showPreferences ? 'Masquer' : 'Préférences'}
                    </button>
                )}
            </div>

            {/* Preferences Form */}
            {showPreferences && userId !== 'guest' && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Affiner vos préférences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Budget (€/nuit)</label>
                            <input
                                type="number"
                                value={preferences.budget}
                                onChange={(e) => handlePreferenceChange('budget', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Ex: 100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type de chambre</label>
                            <select
                                value={preferences.roomType}
                                onChange={(e) => handlePreferenceChange('roomType', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="">Indifférent</option>
                                <option value="SIMPLE">Simple</option>
                                <option value="DOUBLE">Double</option>
                                <option value="SUITE">Suite</option>
                                <option value="DELUXE">Deluxe</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                            <input
                                type="text"
                                value={preferences.city}
                                onChange={(e) => handlePreferenceChange('city', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Ex: Paris"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Durée (nuits)</label>
                            <input
                                type="number"
                                value={preferences.duration}
                                onChange={(e) => handlePreferenceChange('duration', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Ex: 3"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleGetRecommendations}
                        disabled={loading.recommendations}
                        className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium"
                    >
                        {loading.recommendations ? 'Analyse en cours...' : 'Mettre à jour les recommandations'}
                    </button>
                </div>
            )}

            {/* User Profile Summary */}
            {userProfile && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <h3 className="font-semibold text-blue-900">Votre profil</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Réservations:</span>
                            <span className="ml-2 font-medium">{userProfile.totalReservations}</span>
                        </div>
                        {userProfile.preferences.avgBudget > 0 && (
                            <div>
                                <span className="text-gray-600">Budget moyen:</span>
                                <span className="ml-2 font-medium">{userProfile.preferences.avgBudget}€</span>
                            </div>
                        )}
                        {userProfile.preferences.preferredTypes.length > 0 && (
                            <div className="col-span-2">
                                <span className="text-gray-600">Types préférés:</span>
                                <span className="ml-2 font-medium">{userProfile.preferences.preferredTypes.join(', ')}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Error */}
            {recommendationsError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <p className="text-red-700">{recommendationsError}</p>
                        <button
                            onClick={() => dispatch(clearError('recommendations'))}
                            className="text-red-600 hover:text-red-800 text-sm"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Loading */}
            {loading.recommendations ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                    <p className="text-gray-600">L'IA analyse vos préférences...</p>
                </div>
            ) : (
                /* Recommendations */
                <div className="space-y-4">
                    {recommendations.length > 0 ? (
                        recommendations.map((rec, index) => (
                            <div
                                key={rec.roomId}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                                onClick={() => onRoomSelect && onRoomSelect(rec.roomId)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-lg">
                                            Chambre {rec.roomNumber} - {rec.hotelName}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600">{rec.hotelName}</span>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(rec.score)}`}>
                                        {rec.score}% match
                                    </div>
                                </div>

                                <p className="text-gray-700 mb-3">{rec.reason}</p>

                                <div className="flex flex-wrap gap-2 mb-3">
                                    {rec.highlights.map((highlight, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                                        >
                                            {highlight}
                                        </span>
                                    ))}
                                </div>

                                <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium">
                                    Voir cette chambre
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {userId === 'guest' ? 'Recommandations limitées' : 'Aucune recommandation'}
                            </h3>
                            <p className="text-gray-600">
                                {userId === 'guest'
                                    ? "Connectez-vous pour bénéficier des recommandations IA personnalisées"
                                    : "Définissez vos préférences pour obtenir des recommandations personnalisées"
                                }
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default AIRecommendations
