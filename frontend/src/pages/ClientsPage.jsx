import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchAllClients, toggleClientActivation } from "../store/clientSlice"
import Loading from "../components/Loading"
import Pagination from "../components/Pagination"
import { Users, Power, Mail, Calendar, CheckCircle, XCircle } from "lucide-react"
import { toast } from "react-toastify"

const ClientsPage = () => {
  const dispatch = useDispatch()
  const { clients, loading } = useSelector((state) => state.clients)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    dispatch(fetchAllClients())
  }, [dispatch])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const handleToggleActivation = async (clientId) => {
    try {
      await dispatch(toggleClientActivation(clientId)).unwrap()
      toast.success("Statut du client mis à jour")
    } catch (error) {
      toast.error(error.message || "Erreur lors de la modification")
    }
  }

  const filteredClients = clients.filter(
    (client) =>
      client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination calculations
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentClients = filteredClients.slice(startIndex, endIndex)

  if (loading) return <Loading fullScreen />

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users size={32} className="text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Gestion des Clients</h1>
          </div>
          <p className="text-gray-600">
            Gérez les clients et contrôlez leur accès à la plateforme
            {filteredClients.length > 0 && totalPages > 1 && ` - Page ${currentPage} sur ${totalPages}`}
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Chercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-600 text-sm font-medium">Total des clients</p>
            <p className="text-3xl font-bold text-blue-900">{clients.length}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-600 text-sm font-medium">Clients actifs</p>
            <p className="text-3xl font-bold text-green-900">{clients.filter((c) => c.actif).length}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm font-medium">Clients inactifs</p>
            <p className="text-3xl font-bold text-red-900">{clients.filter((c) => !c.actif).length}</p>
          </div>
        </div>

        {/* Table */}
        {filteredClients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nom</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date d'inscription</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Statut</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{client.nom}</td>
                    <td className="px-6 py-4 text-gray-600 flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      {client.email}
                    </td>
                    <td className="px-6 py-4 text-gray-600 flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      {new Date(client.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${client.actif
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                          }`}
                      >
                        {client.actif ? (
                          <>
                            <CheckCircle size={12} />
                            Actif
                          </>
                        ) : (
                          <>
                            <XCircle size={12} />
                            Inactif
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActivation(client._id)}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition ${client.actif
                          ? "bg-red-100 hover:bg-red-200 text-red-700"
                          : "bg-green-100 hover:bg-green-200 text-green-700"
                          }`}
                      >
                        <Power size={18} />
                        {client.actif ? "Désactiver" : "Activer"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium mb-2">Aucun client trouvé</p>
            <p className="text-gray-500 text-sm">Aucun client ne correspond à votre recherche</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredClients.length}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ClientsPage
