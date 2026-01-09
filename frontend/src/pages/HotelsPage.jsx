import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { MapPin, Star, Phone, Mail, Plus, Edit, Trash2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { fetchHotels, deleteHotel } from "../store/hotelSlice"
import Loading from "../components/Loading"
import Pagination from "../components/Pagination"
import { toast } from "react-toastify"

const HotelsPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { hotels, loading } = useSelector((state) => state.hotels)
  const { user } = useSelector((state) => state.auth)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  useEffect(() => {
    dispatch(fetchHotels())
  }, [dispatch])

  const handleDelete = async (hotelId, hotelName) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'hôtel "${hotelName}" ?`)) {
      try {
        await dispatch(deleteHotel(hotelId)).unwrap()
        toast.success('Hôtel supprimé avec succès')
        dispatch(fetchHotels())
      } catch (error) {
        toast.error('Erreur lors de la suppression')
      }
    }
  }

  // Pagination calculations
  const totalPages = Math.ceil(hotels.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentHotels = hotels.slice(startIndex, endIndex)

  if (loading) return <Loading fullScreen />

  const renderStars = (stars) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/*   {hotels.length > 0 && totalPages > 1 && ` - Page ${currentPage} sur ${totalPages}`}
            Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-3 text-gray-900">Nos Hôtels Partenaires</h1>
            <p className="text-lg text-gray-600">
              Découvrez nos établissements partenaires offrant les meilleures expériences de séjour
            </p>
          </div>
          
          {/* Bouton Admin */}
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/hotels/add')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <Plus size={20} />
              Ajouter un hôtel
            </button>
          )}
        </div>

        {/* Filtres */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Filtrer par note</h3>
          <div className="flex flex-wrap gap-3">
            {[5, 4, 3].map((stars) => (
              <button
                key={stars}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition flex items-center gap-2"
              >
                {renderStars(stars)}
                <span className="text-gray-700">{stars} étoiles</span>
              </button>
            ))}
            <button className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg transition font-medium">
           currentH  Tous
            </button>
          </div>
        </div>

        {/* Hôtels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hotels.map((hotel) => (
            <div
              key={hotel._id}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition duration-300"
            >
              {/* Image */}
              <div className="bg-linear-to-br from-blue-100 to-blue-50 h-40 flex items-center justify-center text-6xl overflow-hidden">
                {hotel.image ? (
                  <img 
                    src={`http://localhost:5000${hotel.image}`} 
                    alt={hotel.nom}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>🏨</span>
                )}
              </div>

              {/* Contenu */}
              <div className="p-6">
                {/* Titre et note */}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{hotel.nom}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(hotel.etoiles || 3)}
                    <span className="text-sm text-gray-600">({hotel.etoiles || 3} étoiles)</span>
                  </div>
                </div>

                {/* Localisation */}
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <MapPin size={18} className="text-blue-600" />
                  <span>{hotel.ville}, {hotel.adresse}</span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4">{hotel.description || 'Hôtel de qualité'}</p>

                {/* Infos */}
                <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-gray-700 text-sm">
                    <Phone size={16} className="text-blue-600" />
                    <a href={`tel:${hotel.telephone}`} className="hover:text-blue-600">
                      {hotel.telephone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 text-sm">
                    <Mail size={16} className="text-blue-600" />
                    <a href={`mailto:${hotel.email}`} className="hover:text-blue-600">
                      {hotel.email}
                    </a>
                  </div>
                </div>

                {/* Bouton */}
                <div className="flex gap-2">
                  <Link
                    to={`/hotels/${hotel._id}`}
                    className="flex-1 inline-block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                  >
                    Détails
                  </Link>
                  <Link
                    to={`/chambres?hotel=${hotel._id}`}
                    className="flex-1 inline-block text-center bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 rounded-lg transition"
                  >
                    Chambres
                  </Link>
                  {user?.role === 'admin' && (
                    <>
                      <button
                        onClick={() => navigate(`/hotels/edit/${hotel._id}`)}
                        className="inline-flex items-center justify-center px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 font-semibold rounded-lg transition"
                        title="Modifier l'hôtel"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(hotel._id, hotel.nom)}
                        className="inline-flex items-center justify-center px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition"
                        title="Supprimer l'hôtel"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={hotels.length}
            />
          </div>
        )}


      </div>
    </div>
  )
}

export default HotelsPage
