import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Plus, Edit2, Trash2, Power, PowerOff, Package, ArrowLeft } from "lucide-react"
import { fetchServices, createService, updateService, deleteService, toggleService } from "../store/serviceSlice"
import { fetchHotels } from "../store/hotelSlice"
import Loading from "../components/Loading"
import Pagination from "../components/Pagination"
import { toast } from "react-toastify"

const ServicesPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { services, loading } = useSelector((state) => state.services)
  const { hotels } = useSelector((state) => state.hotels)
  const { user } = useSelector((state) => state.auth)

  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [formData, setFormData] = useState({
    hotel: "",
    nom: "",
    description: "",
    prix: 0
  })
  const [selectedHotel, setSelectedHotel] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  useEffect(() => {
    dispatch(fetchHotels())
    dispatch(fetchServices())
  }, [dispatch])

  useEffect(() => {
    if (editingService) {
      setFormData({
        hotel: editingService.hotel?._id || editingService.hotel,
        nom: editingService.nom,
        description: editingService.description || "",
        prix: editingService.prix
      })
    }
  }, [editingService])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === "prix" ? Number(value) : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.hotel || !formData.nom || formData.prix <= 0) {
      toast.error("Veuillez remplir tous les champs requis")
      return
    }

    try {
      if (editingService) {
        await dispatch(updateService({ id: editingService._id, data: formData })).unwrap()
        toast.success("Service modifié avec succès")
      } else {
        await dispatch(createService(formData)).unwrap()
        toast.success("Service créé avec succès")
      }

      setShowModal(false)
      setEditingService(null)
      setFormData({ hotel: "", nom: "", description: "", prix: 0 })
      dispatch(fetchServices())
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'opération")
    }
  }

  const handleEdit = (service) => {
    setEditingService(service)
    setShowModal(true)
  }

  const handleDelete = async (id, nom) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le service "${nom}" ?`)) {
      try {
        await dispatch(deleteService(id)).unwrap()
        toast.success("Service supprimé avec succès")
        dispatch(fetchServices())
      } catch (error) {
        toast.error("Erreur lors de la suppression")
      }
    }
  }

  const handleToggle = async (id, currentStatus) => {
    try {
      await dispatch(toggleService(id)).unwrap()
      toast.success(currentStatus ? "Service désactivé" : "Service activé")
      dispatch(fetchServices())
    } catch (error) {
      toast.error("Erreur lors du changement de statut")
    }
  }

  const openAddModal = () => {
    setEditingService(null)
    setFormData({ hotel: "", nom: "", description: "", prix: 0 })
    setShowModal(true)
  }

  const filteredServices = selectedHotel
    ? services.filter(s => (s.hotel?._id || s.hotel) === selectedHotel)
    : services

  // Pagination calculations
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentServices = filteredServices.slice(startIndex, endIndex)

  if (loading) return <Loading fullScreen />

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          {user?.role === "admin" && (
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft size={20} />
              <span>Retour à l'admin</span>
            </button>
          )}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Package size={32} className="text-blue-600" />
                Services Hôteliers
              </h1>
              <p className="text-gray-600 mt-2">
                Gérez les services et équipements proposés par vos hôtels
                {filteredServices.length > 0 && totalPages > 1 && ` - Page ${currentPage} sur ${totalPages}`}
              </p>
            </div>
            {user?.role === "admin" && (
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                <Plus size={20} />
                Ajouter un service
              </button>
            )}
          </div>
        </div>

        {/* Filter by Hotel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrer par hôtel
          </label>
          <select
            value={selectedHotel}
            onChange={(e) => setSelectedHotel(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les hôtels</option>
            {hotels.map((hotel) => (
              <option key={hotel._id} value={hotel._id}>
                {hotel.nom}
              </option>
            ))}
          </select>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentServices.map((service) => (
            <div
              key={service._id}
              className={`bg-white rounded-lg shadow-md border-2 overflow-hidden transition ${service.actif ? 'border-green-200' : 'border-gray-200 opacity-60'
                }`}
            >
              <div className="p-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${service.actif
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                      }`}
                  >
                    {service.actif ? 'Actif' : 'Inactif'}
                  </span>
                  <span className="text-2xl font-bold text-blue-600">{service.prix}€</span>
                </div>

                {/* Service Info */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.nom}</h3>
                <p className="text-gray-600 text-sm mb-3">
                  {service.description || "Aucune description"}
                </p>

                {/* Hotel */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Hôtel:</span>{" "}
                    {service.hotel?.nom || "N/A"}
                  </p>
                </div>

                {/* Actions */}
                {user?.role === "admin" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggle(service._id, service.actif)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold transition ${service.actif
                        ? 'bg-orange-100 hover:bg-orange-200 text-orange-700'
                        : 'bg-green-100 hover:bg-green-200 text-green-700'
                        }`}
                      title={service.actif ? "Désactiver" : "Activer"}
                    >
                      {service.actif ? <PowerOff size={16} /> : <Power size={16} />}
                      {service.actif ? "Désactiver" : "Activer"}
                    </button>
                    <button
                      onClick={() => handleEdit(service)}
                      className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition"
                      title="Modifier"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(service._id, service.nom)}
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredServices.length}
            />
          </div>
        )}

        {filteredServices.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun service trouvé</h3>
            <p className="text-gray-600">
              {selectedHotel
                ? "Cet hôtel n'a pas encore de services"
                : "Commencez par ajouter des services"}
            </p>
          </div>
        )}
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingService ? "Modifier le service" : "Ajouter un service"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hôtel *
                </label>
                <select
                  name="hotel"
                  value={formData.hotel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionnez un hôtel</option>
                  {hotels.map((hotel) => (
                    <option key={hotel._id} value={hotel._id}>
                      {hotel.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du service *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Petit-déjeuner, Spa, Parking..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Description du service..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix (€) *
                </label>
                <input
                  type="number"
                  name="prix"
                  value={formData.prix}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingService(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
                >
                  {editingService ? "Mettre à jour" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServicesPage
