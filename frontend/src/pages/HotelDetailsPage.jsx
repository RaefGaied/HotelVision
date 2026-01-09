import { useParams, useNavigate, Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchHotelById, fetchHotels } from "../store/hotelSlice"
import { fetchChambresByHotel } from "../store/chambreSlice"
import { MapPin, Star, Phone, Mail, ChevronLeft, Wifi, Utensils, ParkingCircle, Sparkles, Loader } from "lucide-react"
import Loading from "../components/Loading"

const HotelDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { hotels, loading: hotelsLoading } = useSelector((state) => state.hotels)
  const { chambres, loading: chambresLoading } = useSelector((state) => state.chambres)
  const [selectedChambre, setSelectedChambre] = useState(null)
  const [hotel, setHotel] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHotelData = async () => {
      setLoading(true)
      try {
        // Fetch hotel details
        await dispatch(fetchHotelById(id))
        // Fetch chambres for this hotel
        await dispatch(fetchChambresByHotel(id))
      } catch (error) {
        console.error('Erreur lors du chargement:', error)
      }
      setLoading(false)
    }
    loadHotelData()
  }, [dispatch, id])

  // Find hotel in Redux store
  useEffect(() => {
    if (hotels.length > 0) {
      const foundHotel = hotels.find((h) => h._id === id)
      if (foundHotel) {
        // Get chambres for this hotel
        const hotelChambres = chambres.filter((c) => c.hotel === id || c.hotel?._id === id)
        setHotel({
          ...foundHotel,
          chambres: hotelChambres
        })
      }
    }
  }, [hotels, chambres, id])

  if (loading || !hotel) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          {!loading ? (
            <>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Hôtel non trouvé</h1>
              <p className="text-gray-600 mb-6">L'hôtel que vous recherchez n'existe pas.</p>
              <Link to="/hotels" className="text-blue-600 hover:text-blue-700 font-semibold">
                Retour à la liste des hôtels
              </Link>
            </>
          ) : (
            <Loader className="animate-spin text-blue-600" size={48} />
          )}
        </div>
      </div>
    )
  }

  const renderStars = (stars) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={18}
            className={i < stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
    )
  }

  const chambresDisponibles = hotel.chambres.filter((c) => c.statut === "DISPONIBLE")
  const prixMin = Math.min(...hotel.chambres.map((c) => c.prix))
  const prixMax = Math.max(...hotel.chambres.map((c) => c.prix))

  return (
    <div className="bg-white min-h-screen">
      {/* Header avec bouton retour */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate("/hotels")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 transition"
          >
            <ChevronLeft size={20} />
            Retour aux hôtels
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="bg-linear-to-br from-blue-100 to-blue-50 rounded-lg h-64 flex items-center justify-center text-9xl mb-12 overflow-hidden">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">{hotel.nom}</h1>
              <div className="flex items-center gap-3 mb-4">
                {renderStars(hotel.etoiles)}
                <span className="text-lg text-gray-600">({hotel.etoiles} étoiles)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 mb-6">
                <MapPin size={20} className="text-blue-600" />
                <span className="text-lg">{hotel.adresse}, {hotel.ville}</span>
              </div>
            </div>
            <div className="mb-8">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">{hotel.description}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Infos pratiques</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Téléphone</p>
                  <p className="font-semibold text-gray-900"><a href={`tel:${hotel.telephone}`}>{hotel.telephone}</a></p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Email</p>
                  <p className="font-semibold text-blue-600"><a href={`mailto:${hotel.email}`}>{hotel.email}</a></p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Chambres disponibles</p>
                  <p className="font-semibold text-green-600">{hotel.chambres?.filter(c => c.statut === "DISPONIBLE").length || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Total de chambres</p>
                  <p className="font-semibold text-gray-900">{hotel.chambres?.length || 0}</p>
                </div>
              </div>
            </div>

            {/* Services & Équipements */}
            {hotel.services && hotel.services.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Services disponibles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hotel.services.map((service, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">{service.nom || service.name}</p>
                            {service.prix > 0 && (
                              <p className="text-sm text-gray-600">+{service.prix}€</p>
                            )}
                          </div>
                        </div>
                        {service.prix === 0 && (
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
                            Gratuit
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Colonne droite - Résumé de prix */}
          <div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Prix des chambres</h3>
              <div className="mb-6">
                {hotel.chambres && hotel.chambres.length > 0 ? (
                  <>
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {Math.min(...hotel.chambres.map(c => c.prix))}€ - {Math.max(...hotel.chambres.map(c => c.prix))}€
                    </div>
                    <p className="text-sm text-gray-600">par nuit</p>
                  </>
                ) : (
                  <p className="text-gray-600">Aucune chambre disponible</p>
                )}
              </div>

              {hotel.chambres && hotel.chambres.length > 0 && (
                <div className="border-t border-gray-200 pt-6 mb-6">
                  <h4 className="font-bold text-gray-900 mb-3">Types de chambres</h4>
                  <div className="space-y-2">
                    {[...new Set(hotel.chambres.map((c) => c.type))].map((type) => {
                      const prices = hotel.chambres
                        .filter((c) => c.type === type)
                        .map((c) => c.prix)
                      const minPrice = Math.min(...prices)
                      return (
                        <div key={type} className="flex justify-between text-sm">
                          <span className="text-gray-700">{type}</span>
                          <span className="font-semibold text-gray-900">dès {minPrice}€</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <Link
                to={`/chambres?hotel=${hotel._id}`}
                className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition mb-3"
              >
                Voir les chambres
              </Link>

              <p className="text-xs text-gray-600 text-center">
                {chambresDisponibles.length} chambre(s) disponible(s)
              </p>
            </div>
          </div>
        </div>

        {/* Chambres Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Chambres disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotel.chambres.map((chambre) => (
              <div
                key={chambre._id || chambre.numero}
                className={`rounded-lg border-2 p-4 cursor-pointer transition ${
                  selectedChambre?.numero === chambre.numero
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-blue-300"
                }`}
                onClick={() =>
                  chambre.statut === "DISPONIBLE" && setSelectedChambre(chambre)
                }
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Chambre {chambre.numero}</h4>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded mt-1">
                      {chambre.type}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-bold px-2 py-1 rounded ${
                      chambre.statut === "DISPONIBLE"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {chambre.statut === "DISPONIBLE" ? "Libre" : "Occupée"}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Capacité</span>
                    <span className="font-semibold text-gray-900">{chambre.capacite} pers.</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Prix/nuit</span>
                    <span className="font-bold text-blue-600 text-lg">{chambre.prix}€</span>
                  </div>
                </div>

                {chambre.statut === "DISPONIBLE" && (
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition text-sm">
                    Réserver
                  </button>
                )}

                {chambre.statut === "INDISPONIBLE" && (
                  <button disabled className="w-full bg-gray-300 text-gray-600 font-semibold py-2 rounded-lg text-sm cursor-not-allowed">
                    Non disponible
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HotelDetailsPage
