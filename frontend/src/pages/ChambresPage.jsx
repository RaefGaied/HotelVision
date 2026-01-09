import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { fetchChambres } from "../store/chambreSlice"
import { fetchServicesByHotel } from "../store/serviceSlice"
import { createReservation } from "../store/reservationSlice"
import { toast } from "react-toastify"
import Loading from "../components/Loading"
import Pagination from "../components/Pagination"
import AIRecommendations from "../components/AIRecommendations"
import AIChatbot from "../components/AIChatbot"
import { Search, MapPin } from "lucide-react"

const ChambresPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { chambres, loading } = useSelector((state) => state.chambres)
  const { services } = useSelector((state) => state.services)
  const { user } = useSelector((state) => state.auth)

  // Debug pour vérifier l'utilisateur
  console.log('User dans ChambresPage:', user)
  console.log('User ID:', user?._id || user?.id || user?.email || 'guest')
  console.log('Token:', localStorage.getItem('token'))
  const [filtered, setFiltered] = useState([])
  const [selectedServices, setSelectedServices] = useState([])
  const [showingServicesFor, setShowingServicesFor] = useState(null)
  const [filters, setFilters] = useState({
    type: "",
    maxPrice: 1000,
    minCapacite: 1,
    search: "",
    dateArrivee: "",
    dateDepart: "",
  })
  const [nights, setNights] = useState(0)
  const [reserving, setReserving] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9 // 3x3 grid

  // Calculer le nombre de nuits
  const calculateNights = (arrival, departure) => {
    if (arrival && departure) {
      const start = new Date(arrival)
      const end = new Date(departure)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 0 ? diffDays : 0
    }
    return 0
  }

  useEffect(() => {
    const calculatedNights = calculateNights(filters.dateArrivee, filters.dateDepart)
    setNights(calculatedNights)
  }, [filters.dateArrivee, filters.dateDepart])

  useEffect(() => {
    dispatch(fetchChambres())

    // Vérifier l'authentification au chargement
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    console.log('Token:', token)
    console.log('UserData:', userData)
    console.log('Current user from Redux:', user)
  }, [dispatch])

  useEffect(() => {
    let result = chambres

    if (filters.search) {
      result = result.filter((c) =>
        c.numero.toString().includes(filters.search) ||
        c.type.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    if (filters.type) {
      result = result.filter((c) => c.type === filters.type)
    }

    setCurrentPage(1) // Reset à la page 1 quand les filtres changent
    result = result.filter((c) => c.prix <= filters.maxPrice)
    result = result.filter((c) => c.capacite >= filters.minCapacite)

    setFiltered(result)
  }, [chambres, filters])

  const handleReserver = async (chambre) => {
    if (!user) {
      toast.warning("Veuillez vous connecter pour réserver")
      navigate("/login")
      return
    }

    // Vérifier que les dates sont sélectionnées
    if (!filters.dateArrivee || !filters.dateDepart) {
      toast.error("Veuillez sélectionner les dates d'arrivée et de départ")
      return
    }

    // Vérifier que la date de départ est après la date d'arrivée
    if (new Date(filters.dateDepart) <= new Date(filters.dateArrivee)) {
      toast.error("La date de départ doit être après la date d'arrivée")
      return
    }

    setReserving(true)
    try {
      const reservationData = {
        chambre: chambre._id,
        dateArrivee: filters.dateArrivee,
        dateDepart: filters.dateDepart,
        nombrePersonnes: chambre.capacite,
        services: selectedServices // Ajouter les services sélectionnés
      }

      await dispatch(createReservation(reservationData)).unwrap()

      toast.success(`Réservation créée avec succès pour la chambre ${chambre.numero}`)
      setSelectedServices([]) // Réinitialiser les services
      setShowingServicesFor(null)

      // Rediriger vers la page des réservations
      setTimeout(() => {
        navigate("/reservations")
      }, 1500)
    } catch (error) {
      toast.error(error.message || "Erreur lors de la réservation")
    } finally {
      setReserving(false)
    }
  }

  // Charger les services de l'hôtel quand on affiche les services pour une chambre
  const handleShowServices = async (chambre) => {
    if (showingServicesFor === chambre._id) {
      setShowingServicesFor(null)
    } else {
      setShowingServicesFor(chambre._id)
      if (chambre.hotel?._id) {
        await dispatch(fetchServicesByHotel(chambre.hotel._id))
      }
    }
  }

  // Toggle service selection
  const toggleService = (serviceId) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  // Calculer le montant total avec services
  const calculateTotal = (chambre) => {
    const prixChambre = chambre.prix * nights
    const prixServices = services
      .filter(s => selectedServices.includes(s._id))
      .reduce((total, s) => total + s.prix, 0)
    return prixChambre + prixServices
  }
  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentChambres = filtered.slice(startIndex, endIndex)


  if (loading) return <Loading fullScreen />

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3 text-gray-900">Nos Chambres</h1>
          <p className="text-lg text-gray-600">Découvrez notre sélection de chambres luxueuses et confortables</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Rechercher et filtrer</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Recherche par numéro ou type */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">Recherche</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Numéro ou type..."
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>

            {/* Type de chambre */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="">Tous les types</option>
                <option value="SIMPLE">Simple</option>
                <option value="DOUBLE">Double</option>
                <option value="SUITE">Suite</option>
              </select>
            </div>

            {/* Capacité minimum */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">Capacité min</label>
              <select
                value={filters.minCapacite}
                onChange={(e) => setFilters((prev) => ({ ...prev, minCapacite: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="1">1 personne</option>
                <option value="2">2 personnes</option>
                <option value="3">3 personnes</option>
                <option value="4">4+ personnes</option>
              </select>
            </div>

            {/* Prix max */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">Prix max: {filters.maxPrice}€</label>
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={filters.maxPrice}
                onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))}
                className="w-full"
              />
            </div>

            {/* Bouton réinitialiser */}
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ type: "", maxPrice: 1000, minCapacite: 1, search: "", dateArrivee: "", dateDepart: "" })}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 rounded-lg transition"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Dates de séjour */}
          <div className="border-t border-gray-300 pt-4 mt-4">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Dates de séjour</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Date d'arrivée</label>
                <input
                  type="date"
                  value={filters.dateArrivee}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateArrivee: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Date de départ</label>
                <input
                  type="date"
                  value={filters.dateDepart}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateDepart: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  min={filters.dateArrivee || new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="flex items-end">
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 w-full">
                  <p className="text-sm text-gray-600">Durée du séjour</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {nights > 0 ? `${nights} nuit${nights > 1 ? "s" : ""}` : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Results summary */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600 font-medium">
              {filtered.length} chambre{filtered.length > 1 ? "s" : ""} trouvée{filtered.length > 1 ? "s" : ""}
            </p>
            {filtered.length > itemsPerPage && (
              <p className="text-sm text-gray-500">
                Page {currentPage} sur {totalPages}
              </p>
            )}
          </div>

          {/* Chambres list */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
              <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg font-medium">Aucune chambre ne correspond à votre recherche</p>
              <p className="text-gray-500 mt-2">Essayez de modifier vos filtres</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentChambres.map((chambre) => (
                <div
                  key={chambre._id}
                  data-room-id={chambre._id}
                  className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition duration-300"
                >
                  {/* Image placeholder */}
                  <div className="bg-linear-to-br from-blue-100 to-blue-50 h-48 flex items-center justify-center text-blue-300">
                    <span className="text-6xl">🏨</span>
                  </div>

                  {/* Contenu */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">Chambre {chambre.numero}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {chambre.type}
                        </div>
                      </div>
                      {/* Hôtel info */}
                      {chambre.hotel && (
                        <div className="flex items-start gap-2 mt-2 text-sm text-gray-600">
                          <MapPin size={14} className="mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-gray-900">{chambre.hotel.nom}</p>
                            {chambre.hotel.ville && (
                              <p className="text-xs">{chambre.hotel.ville}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Capacité</span>
                        <span className="font-semibold text-gray-900">
                          {chambre.capacite} {chambre.capacite > 1 ? "personnes" : "personne"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Prix par nuit</span>
                        <span className="text-2xl font-bold text-blue-600">{chambre.prix}€</span>
                      </div>
                      {nights > 0 && (
                        <div className="flex justify-between items-center text-sm bg-blue-50 p-2 rounded">
                          <span className="text-gray-600">Total ({nights} nuit{nights > 1 ? "s" : ""})</span>
                          <span className="font-bold text-blue-700">{chambre.prix * nights}€</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                        <span className="text-gray-600 text-sm">Disponibilité</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${chambre.statut === "DISPONIBLE"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                        >
                          {chambre.statut === "DISPONIBLE" ? "✓ Disponible" : "✗ Indisponible"}
                        </span>
                      </div>
                    </div>

                    {/* Services disponibles */}
                    {chambre.hotel && (
                      <div className="mb-4">
                        <button
                          onClick={() => handleShowServices(chambre)}
                          className="w-full text-left px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition text-sm font-medium text-purple-700"
                        >
                          {showingServicesFor === chambre._id ? "▼" : "▶"} Services disponibles
                        </button>

                        {showingServicesFor === chambre._id && services.length > 0 && (
                          <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border border-purple-200 rounded-lg p-2">
                            {services.filter(s => s.actif).map((service) => (
                              <label
                                key={service._id}
                                className="flex items-center justify-between p-2 hover:bg-purple-50 rounded cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedServices.includes(service._id)}
                                    onChange={() => toggleService(service._id)}
                                    className="rounded text-purple-600 focus:ring-purple-500"
                                  />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{service.nom}</p>
                                    {service.description && (
                                      <p className="text-xs text-gray-500">{service.description}</p>
                                    )}
                                  </div>
                                </div>
                                <span className="text-sm font-semibold text-purple-600">+{service.prix}€</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {showingServicesFor === chambre._id && selectedServices.length > 0 && (
                          <div className="mt-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
                            <p className="text-xs text-gray-600 mb-1">Services sélectionnés:</p>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-900">
                                {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''}
                              </span>
                              <span className="text-sm font-bold text-purple-600">
                                +{services.filter(s => selectedServices.includes(s._id)).reduce((sum, s) => sum + s.prix, 0)}€
                              </span>
                            </div>
                          </div>
                        )}

                        {showingServicesFor === chambre._id && nights > 0 && selectedServices.length > 0 && (
                          <div className="mt-2 p-3 bg-blue-100 rounded-lg border-2 border-blue-300">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-bold text-gray-900">TOTAL FINAL</span>
                              <span className="text-xl font-bold text-blue-700">{calculateTotal(chambre)}€</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => handleReserver(chambre)}
                      disabled={chambre.statut !== "DISPONIBLE" || reserving || !filters.dateArrivee || !filters.dateDepart}
                      className={`w-full font-semibold py-2 rounded-lg transition ${chambre.statut === "DISPONIBLE" && filters.dateArrivee && filters.dateDepart && !reserving
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                      {reserving
                        ? "Réservation..."
                        : chambre.statut === "DISPONIBLE"
                          ? (!filters.dateArrivee || !filters.dateDepart ? "Sélectionnez les dates" : "Réserver")
                          : "Non disponible"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filtered.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filtered.length}
            />
          )}
        </div>
      </div>

      {/* AI Components */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Recommendations */}
          <AIRecommendations
            userId={user?._id || user?.id || user?.email || 'guest'}
            onRoomSelect={(roomId) => {
              // Scroll to room and highlight it
              const roomElement = document.querySelector(`[data-room-id="${roomId}"]`)
              if (roomElement) {
                roomElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                roomElement.classList.add('ring-4', 'ring-purple-400', 'ring-opacity-50')
                setTimeout(() => {
                  roomElement.classList.remove('ring-4', 'ring-purple-400', 'ring-opacity-50')
                }, 3000)
              }
            }}
          />

          {/* Additional AI Features */}
          <div className="space-y-6">
            {/* AI Tips */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                💡 Conseils IA
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• Les chambres avec vue sont généralement 15% plus appréciées</p>
                <p>• Réserver 2 semaines à l'avance offre les meilleurs prix</p>
                <p>• Les suites incluent souvent le petit-déjeuner</p>
                <p>• Les chambres Deluxe ont un espace de travail optimisé</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">En temps réel</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {filtered.filter(c => c.statut === 'DISPONIBLE').length}
                  </div>
                  <div className="text-sm text-gray-600">Disponibles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {filtered.filter(c => c.statut === 'OCCUPEE').length}
                  </div>
                  <div className="text-sm text-gray-600">Occupées</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chatbot */}
      <AIChatbot userId={user?._id || 'guest'} context="chambres" />
    </div>
  )
}

export default ChambresPage
