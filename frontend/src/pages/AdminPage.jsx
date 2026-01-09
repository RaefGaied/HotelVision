import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { fetchChambres, createChambre, updateChambre, deleteChambre } from "../store/chambreSlice"
import { fetchAllReservations, validateReservation, cancelReservation } from "../store/reservationSlice"
import { fetchHotels, createHotel, updateHotel, deleteHotel } from "../store/hotelSlice"
import { fetchServices, createService, updateService, toggleService, deleteService } from "../store/serviceSlice"
import Loading from "../components/Loading"
import { Plus, Edit2, Trash2, Check, X, Download, Users, Home, Utensils, FileText, Hotel, Package } from "lucide-react"
import { toast } from "react-toastify"

const AdminPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { chambres, loading: chambresLoading } = useSelector((state) => state.chambres)
  const { reservations, loading: reservationsLoading } = useSelector((state) => state.reservations)
  const { hotels, loading: hotelsLoading } = useSelector((state) => state.hotels)
  const { services, loading: servicesLoading } = useSelector((state) => state.services)
  const { user } = useSelector((state) => state.auth)

  const [activeTab, setActiveTab] = useState("dashboard")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchChambres, setSearchChambres] = useState("")
  const [formData, setFormData] = useState({
    numero: "",
    type: "SIMPLE",
    capacite: 1,
    prix: 0,
    statut: "DISPONIBLE",
    hotel: "",
  })

  // Hotel form state
  const [showHotelForm, setShowHotelForm] = useState(false)
  const [editingHotelId, setEditingHotelId] = useState(null)
  const [hotelForm, setHotelForm] = useState({
    nom: "",
    adresse: "",
    ville: "",
    telephone: "",
    email: "",
    description: "",
    etoiles: 3,
  })

  useEffect(() => {
    dispatch(fetchChambres())
    dispatch(fetchAllReservations())
    dispatch(fetchHotels())
    dispatch(fetchServices())
  }, [dispatch])

  // Gestion des chambres
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "capacite" || name === "prix" ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editingId) {
      await dispatch(updateChambre({ id: editingId, data: formData }))
      setEditingId(null)
    } else {
      await dispatch(createChambre(formData))
    }
    setFormData({ numero: "", type: "SIMPLE", capacite: 1, prix: 0, statut: "DISPONIBLE", hotel: "" })
    setShowForm(false)
  }

  const handleEdit = (chambre) => {
    setFormData({
      numero: chambre.numero,
      type: chambre.type,
      capacite: chambre.capacite,
      prix: chambre.prix,
      statut: chambre.statut,
      hotel: chambre.hotel?._id || chambre.hotel || "",
    })
    setEditingId(chambre._id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette chambre ?")) {
      await dispatch(deleteChambre(id))
    }
  }

  // Gestion des hotels
  const handleHotelInputChange = (e) => {
    const { name, value } = e.target
    setHotelForm((prev) => ({
      ...prev,
      [name]: name === "etoiles" ? Number(value) : value,
    }))
  }

  const handleHotelSubmit = async (e) => {
    e.preventDefault()
    if (editingHotelId) {
      await dispatch(updateHotel({ id: editingHotelId, data: hotelForm }))
      setEditingHotelId(null)
    } else {
      await dispatch(createHotel(hotelForm))
    }
    setHotelForm({ nom: "", adresse: "", ville: "", telephone: "", email: "", description: "", etoiles: 3 })
    setShowHotelForm(false)
  }

  const handleHotelEdit = (hotel) => {
    setHotelForm({
      nom: hotel.nom,
      adresse: hotel.adresse,
      ville: hotel.ville,
      telephone: hotel.telephone,
      email: hotel.email,
      description: hotel.description || "",
      etoiles: hotel.etoiles || 3,
    })
    setEditingHotelId(hotel._id)
    setShowHotelForm(true)
  }

  const handleHotelDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet hôtel ?")) {
      await dispatch(deleteHotel(id))
    }
  }

  // Gestion des réservations
  const handleValidateReservation = async (id) => {
    if (window.confirm("Voulez-vous valider cette réservation ?")) {
      try {
        await dispatch(validateReservation(id)).unwrap()
        toast.success("Réservation validée avec succès")
        dispatch(fetchAllReservations())
      } catch (error) {
        toast.error("Erreur lors de la validation: " + (error.message || error))
      }
    }
  }

  const handleRejectReservation = async (id) => {
    if (window.confirm("Voulez-vous rejeter/annuler cette réservation ?")) {
      try {
        await dispatch(cancelReservation(id)).unwrap()
        toast.success("Réservation annulée avec succès")
        dispatch(fetchAllReservations())
      } catch (error) {
        toast.error("Erreur lors de l'annulation: " + (error.message || error))
      }
    }
  }

  const handleGenerateInvoice = (id) => {
    alert(`Facture générée pour la réservation ${id}`)
  }

  // Stats calculations
  const stats = {
    totalHotels: hotels.length,
    totalChambres: chambres.length,
    chambresDisponibles: chambres.filter((c) => c.statut === "DISPONIBLE").length,
    chambreOccupees: chambres.filter((c) => c.statut === "OCCUPEE").length,
    tauxOccupation: chambres.length > 0 ? Math.round((chambres.filter((c) => c.statut === "OCCUPEE").length / chambres.length) * 100) : 0,
    reservationsEnCours: reservations.filter((r) => r.statut === "VALIDEE" || r.statut === "EN_ATTENTE").length,
    reservationsEnAttente: reservations.filter((r) => r.statut === "EN_ATTENTE").length,
    reservationsValidees: reservations.filter((r) => r.statut === "VALIDEE").length,
    reservationsAnnulees: reservations.filter((r) => r.statut === "ANNULEE").length,
    reservationsTerminees: reservations.filter((r) => r.statut === "TERMINEE").length,
    totalServices: services.filter((s) => s.actif).length,
    revenuTotal: reservations.reduce((sum, r) => sum + (r.montantTotal || 0), 0),
    revenuMoyen: reservations.length > 0 ? Math.round(reservations.reduce((sum, r) => sum + (r.montantTotal || 0), 0) / reservations.length) : 0,
    reservationsPayes: reservations.filter((r) => r.facture && r.facture.estPayee).length,
  }

  if (chambresLoading || reservationsLoading || hotelsLoading || servicesLoading) return <Loading fullScreen />

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Panneau d'Administration</h1>
          <p className="text-gray-600">Gestion complète de votre hôtel</p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-linear-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Chambres disponibles</p>
                <p className="text-3xl font-bold">{stats.chambresDisponibles}/{stats.totalChambres}</p>
              </div>
              <Home size={32} className="opacity-20" />
            </div>
          </div>

          <div className="bg-linear-to-br from-green-500 to-green-600 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Réservations actives</p>
                <p className="text-3xl font-bold">{stats.reservationsEnCours}</p>
              </div>
              <FileText size={32} className="opacity-20" />
            </div>
          </div>

          <div className="bg-linear-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Services actifs</p>
                <p className="text-3xl font-bold">{services.filter((s) => s.actif).length}</p>
              </div>
              <Utensils size={32} className="opacity-20" />
            </div>
          </div>

          <div className="bg-linear-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Clients actifs</p>
                <p className="text-3xl font-bold">{stats.totalClients}</p>
              </div>
              <Users size={32} className="opacity-20" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
          {[
            { id: "dashboard", label: "Tableau de bord", icon: "📊" },
            { id: "chambres", label: "Chambres", icon: "🛏️" },
            { id: "services", label: "Services", icon: "🍽️" },
            { id: "reservations", label: "Réservations", icon: "📅" },
            { id: "facturation", label: "Facturation", icon: "💳" },
            { id: "clients", label: "Clients", icon: "👥" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Résumé d'activité</h2>
              
              {/* Top Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <p className="text-gray-600 text-sm mb-2">Taux d'occupation</p>
                  <div className="flex items-end gap-2 mb-4">
                    <p className="text-4xl font-bold text-blue-600">{stats.tauxOccupation}%</p>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600" style={{ width: `${stats.tauxOccupation}%` }}></div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{stats.chambreOccupees} occupées / {stats.totalChambres}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <p className="text-gray-600 text-sm mb-2">Réservations en cours</p>
                  <p className="text-4xl font-bold text-green-600 mb-2">{stats.reservationsEnCours}</p>
                  <p className="text-xs text-gray-600">{stats.reservationsPayes} payées</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <p className="text-gray-600 text-sm mb-2">Revenu total</p>
                  <p className="text-4xl font-bold text-purple-600 mb-2">{stats.revenuTotal}€</p>
                  <p className="text-xs text-gray-600">Moyenne: {stats.revenuMoyen}€</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <p className="text-gray-600 text-sm mb-2">Services actifs</p>
                  <p className="text-4xl font-bold text-orange-600 mb-2">{stats.totalServices}</p>
                  <p className="text-xs text-gray-600">{services.length} total</p>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Gestion des chambres</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Disponibles</span>
                      <span className="font-bold text-green-600">{stats.chambresDisponibles}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Occupées</span>
                      <span className="font-bold text-red-600">{stats.chambreOccupees}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-700 font-semibold">Total</span>
                      <span className="font-bold">{stats.totalChambres}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Réservations</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">En cours</span>
                      <span className="font-bold text-yellow-600">{stats.reservationsEnCours}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payées</span>
                      <span className="font-bold text-green-600">{stats.reservationsPayes}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-700 font-semibold">Total</span>
                      <span className="font-bold">{reservations.length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Clients</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total unique</span>
                      <span className="font-bold text-blue-600">{stats.totalClients}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-700 font-semibold">Réservations totales</span>
                      <span className="font-bold">{reservations.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CHAMBRES TAB */}
        {activeTab === "chambres" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Gestion des Chambres</h2>
              <button
                onClick={() => {
                  setShowForm(!showForm)
                  setEditingId(null)
                  setFormData({ numero: "", type: "SIMPLE", capacite: 1, prix: 0, statut: "DISPONIBLE" })
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center space-x-2 font-medium"
              >
                <Plus size={20} />
                <span>Ajouter une chambre</span>
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Rechercher par numéro..."
                value={searchChambres}
                onChange={(e) => setSearchChambres(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {showForm && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  {editingId ? "Modifier" : "Ajouter"} une chambre
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      name="numero"
                      placeholder="Numéro"
                      value={formData.numero}
                      onChange={handleInputChange}
                      required
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="SIMPLE">Simple</option>
                      <option value="DOUBLE">Double</option>
                      <option value="SUITE">Suite</option>
                    </select>
                    <input
                      type="number"
                      name="capacite"
                      placeholder="Capacité"
                      value={formData.capacite}
                      onChange={handleInputChange}
                      min="1"
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      name="prix"
                      placeholder="Prix/nuit"
                      value={formData.prix}
                      onChange={handleInputChange}
                      min="0"
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      name="statut"
                      value={formData.statut}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="DISPONIBLE">Disponible</option>
                      <option value="INDISPONIBLE">Indisponible</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition font-medium"
                    >
                      {editingId ? "Mettre à jour" : "Créer"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-2 rounded-lg transition font-medium"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chambres
                .filter((c) => c.numero.toString().includes(searchChambres))
                .map((chambre) => (
                <div
                  key={chambre._id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
                >
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900">Chambre {chambre.numero}</h3>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded mt-1">
                      {chambre.type}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacité</span>
                      <span className="font-semibold">{chambre.capacite} pers.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prix/nuit</span>
                      <span className="font-semibold text-blue-600">{chambre.prix}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Statut</span>
                      <span
                        className={`font-semibold ${
                          chambre.statut === "DISPONIBLE" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {chambre.statut === "DISPONIBLE" ? "✓ Disponible" : "✗ Indisponible"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(chambre)}
                      className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition text-sm font-medium"
                    >
                      <Edit2 size={16} />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(chambre._id)}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition text-sm font-medium"
                    >
                      <Trash2 size={16} />
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SERVICES TAB */}
        {activeTab === "services" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Gestion des Services</h2>
              <button
                onClick={() => navigate('/services')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition flex items-center gap-2 font-semibold"
              >
                <Package size={20} />
                <span>Gérer les services</span>
              </button>
            </div>

            {/* Quick View */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-center py-8">
                Cliquez sur "Gérer les services" pour accéder à la page de gestion complète des services hôteliers.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{services.filter(s => s.actif).length}</p>
                  <p className="text-gray-600 text-sm">Services actifs</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-600">{services.filter(s => !s.actif).length}</p>
                  <p className="text-gray-600 text-sm">Services inactifs</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{services.length}</p>
                  <p className="text-gray-600 text-sm">Total services</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RESERVATIONS TAB */}
        {activeTab === "reservations" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestion des Réservations</h2>
            <div className="space-y-3">
              {reservations.map((reservation) => {
                const calculateDays = (start, end) => {
                  const d1 = new Date(start)
                  const d2 = new Date(end)
                  return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24))
                }
                const days = calculateDays(reservation.datedebut || reservation.dateArrivee, reservation.datefin || reservation.dateDepart)
                const montantTotal = days * (reservation.chambre?.prix || 0)
                return (
                <div
                  key={reservation._id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600 text-sm">Réservation ID</p>
                      <p className="font-bold text-gray-900">{reservation._id?.slice(-8)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Chambre</p>
                      <p className="font-bold text-gray-900">#{(reservation.chambre?.numero || reservation.chambreId?.numero) || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Dates</p>
                      <p className="font-bold text-gray-900">
                        {new Date(reservation.datedebut || reservation.dateArrivee).toLocaleDateString("fr-FR")} à{" "}
                        {new Date(reservation.datefin || reservation.dateDepart).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Montant</p>
                      <p className="font-bold text-blue-600">{montantTotal}€</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Statut</p>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                          reservation.statut === "VALIDEE"
                            ? "bg-green-100 text-green-700"
                            : reservation.statut === "EN_ATTENTE"
                            ? "bg-yellow-100 text-yellow-700"
                            : reservation.statut === "ANNULEE"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {reservation.statut}
                      </span>
                    </div>
                  </div>
                  {reservation.statut === "EN_ATTENTE" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleValidateReservation(reservation._id)}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition text-sm font-medium"
                      >
                        <Check size={16} />
                        Valider
                      </button>
                      <button
                        onClick={() => handleRejectReservation(reservation._id)}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition text-sm font-medium"
                      >
                        <X size={16} />
                        Rejeter
                      </button>
                    </div>
                  )}
                </div>
                )
              })}
            </div>
          </div>
        )}

        {/* FACTURATION TAB */}
        {activeTab === "facturation" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestion de la Facturation</h2>
              
              {/* Facturation Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <p className="text-gray-600 text-sm mb-2">Revenu total</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.revenuTotal}€</p>
                  <p className="text-xs text-gray-600 mt-2">À partir de {reservations.length} réservations</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <p className="text-gray-600 text-sm mb-2">Factures payées</p>
                  <p className="text-3xl font-bold text-green-600">{stats.reservationsPayes}</p>
                  <p className="text-xs text-gray-600 mt-2">{Math.round((stats.reservationsPayes / reservations.length) * 100) || 0}% des réservations</p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <p className="text-gray-600 text-sm mb-2">Factures en attente</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.reservationsEnCours}</p>
                  <p className="text-xs text-gray-600 mt-2">À payer</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <p className="text-gray-600 text-sm mb-2">Revenu moyen</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.revenuMoyen}€</p>
                  <p className="text-xs text-gray-600 mt-2">Par réservation</p>
                </div>
              </div>
            </div>

            {/* Facturation List */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Liste des factures</h3>
              {reservations.map((reservation) => (
                <div
                  key={reservation._id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-gray-600 text-xs font-semibold mb-1">N° Facture</p>
                      <p className="font-bold text-gray-900">FAC-{reservation._id?.slice(-6) || "000000"}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs font-semibold mb-1">Chambre</p>
                      <p className="font-bold text-gray-900">#{reservation.chambre?.numero || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs font-semibold mb-1">Dates</p>
                      <p className="font-bold text-gray-900 text-sm">
                        {new Date(reservation.datedebut).toLocaleDateString("fr-FR", { month: "short", day: "numeric" })} -{" "}
                        {new Date(reservation.datefin).toLocaleDateString("fr-FR", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs font-semibold mb-1">Montant</p>
                      <p className="font-bold text-blue-600 text-lg">{reservation.montantTotal || 0}€</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                          reservation.facture?.estPayee
                            ? "bg-green-100 text-green-700"
                            : reservation.statut === "VALIDEE"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {reservation.facture?.estPayee ? "PAYEE" : reservation.statut}
                      </span>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold transition">
                        Détails
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CLIENTS TAB - Redirect to clients page */}
        {activeTab === "clients" && (
          <div>
            <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg mb-4">Accédez à la gestion complète des clients</p>
              <button
                onClick={() => navigate('/admin/clients')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition"
              >
                Gérer les clients
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPage
