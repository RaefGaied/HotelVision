import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Link } from "react-router-dom"
import { fetchMesReservations } from "../store/reservationSlice"
import { Calendar, CreditCard, FileText, AlertCircle, ArrowRight, User } from "lucide-react"
import Loading from "../components/Loading"

const ClientDashboard = () => {
  const dispatch = useDispatch()
  const { reservations, loading } = useSelector((state) => state.reservations)
  const { user } = useSelector((state) => state.auth)
  const [stats, setStats] = useState({
    reservationsActives: 0,
    paiementsPendants: 0,
    totalDepense: 0,
    sejours: { prochains: 0, passes: 0 },
  })

  useEffect(() => {
    if (user) {
      dispatch(fetchMesReservations())
    }
  }, [dispatch, user])

  useEffect(() => {
    if (reservations.length > 0) {
      const now = new Date()
      let actives = 0
      let pendants = 0
      let totalSpent = 0
      let upcomingCount = 0
      let pastCount = 0

      reservations.forEach((res) => {
        // Réservations actives = VALIDEE ou EN_ATTENTE
        if (res.statut === "VALIDEE" || res.statut === "EN_ATTENTE") actives++
        
        // Paiements en attente = réservations avec facture non payée
        if (res.facture && !res.facture.estPayee) pendants++
        
        // Montant total dépensé = somme de toutes les réservations
        totalSpent += res.montantTotal || 0

        const arrivalDate = new Date(res.datedebut)
        const departDate = new Date(res.datefin)

        // Séjours à venir = date de début dans le futur
        if (arrivalDate > now && res.statut !== "ANNULEE") upcomingCount++
        
        // Séjours passés = date de fin dans le passé (stay is finished/completed)
        if (departDate < now) pastCount++
      })

      setStats({
        reservationsActives: actives,
        paiementsPendants: pendants,
        totalDepense: totalSpent,
        sejours: { prochains: upcomingCount, passes: pastCount },
      })
    } else {
      setStats({
        reservationsActives: 0,
        paiementsPendants: 0,
        totalDepense: 0,
        sejours: { prochains: 0, passes: 0 },
      })
    }
  }, [reservations])

  if (loading) return <Loading fullScreen />

  // Filtrer les réservations
  const upcomingReservations = reservations
    .filter((r) => new Date(r.datedebut) > new Date() && r.statut !== "ANNULEE")
    .sort((a, b) => new Date(a.datedebut) - new Date(b.datedebut))
    .slice(0, 3)

  const pendingPayments = reservations
    .filter((r) => r.facture && !r.facture.estPayee && r.statut !== "ANNULEE")
    .slice(0, 3)

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-gray-900">Tableau de bord</h1>
              <p className="text-gray-600">Bienvenue, {user?.nom || "Client"}! 👋</p>
            </div>
            <Link
              to="/profile"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-semibold"
            >
              <User size={18} />
              Mon profil
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {/* Réservations actives */}
          <div className="bg-linear-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-100 text-sm font-medium">Réservations actives</p>
              <Calendar size={24} className="opacity-20" />
            </div>
            <p className="text-4xl font-bold">{stats.reservationsActives}</p>
            <p className="text-blue-100 text-xs mt-2">{stats.sejours.prochains} séjour(s) à venir</p>
          </div>

          {/* Paiements en attente */}
          <div className="bg-linear-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-orange-100 text-sm font-medium">Paiements en attente</p>
              <CreditCard size={24} className="opacity-20" />
            </div>
            <p className="text-4xl font-bold">{stats.paiementsPendants}</p>
            <Link to="/reservations" className="text-orange-100 text-xs mt-2 hover:text-white transition">
              Payer maintenant →
            </Link>
          </div>

          {/* Dépense totale */}
          <div className="bg-linear-to-br from-green-500 to-green-600 text-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-green-100 text-sm font-medium">Montant total dépensé</p>
              <CreditCard size={24} className="opacity-20" />
            </div>
            <p className="text-4xl font-bold">{stats.totalDepense}€</p>
            <p className="text-green-100 text-xs mt-2">Sur {reservations.length} réservation(s)</p>
          </div>

          {/* Séjours */}
          <div className="bg-linear-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-purple-100 text-sm font-medium">Historique</p>
              <FileText size={24} className="opacity-20" />
            </div>
            <p className="text-4xl font-bold">{stats.sejours.passes}</p>
            <p className="text-purple-100 text-xs mt-2">Séjour(s) effectué(s)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Prochains séjours */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Mes séjours à venir</h2>
              <Link to="/reservations" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                Voir tous →
              </Link>
            </div>

            {upcomingReservations.length > 0 ? (
              <div className="space-y-4">
                {upcomingReservations.map((reservation) => {
                  const nights = Math.ceil(
                    (new Date(reservation.datefin) - new Date(reservation.datedebut)) / (1000 * 60 * 60 * 24)
                  )
                  
                  const statutColors = {
                    EN_ATTENTE: "bg-yellow-100 text-yellow-700",
                    VALIDEE: "bg-green-100 text-green-700",
                    TERMINEE: "bg-gray-100 text-gray-700",
                    ANNULEE: "bg-red-100 text-red-700"
                  }
                  
                  return (
                    <div
                      key={reservation._id}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Chambre #{reservation.chambre?.numero || "N/A"}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(reservation.datedebut).toLocaleDateString("fr-FR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}{" "}
                            -{" "}
                            {new Date(reservation.datefin).toLocaleDateString("fr-FR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${statutColors[reservation.statut] || "bg-gray-100 text-gray-700"}`}>
                          {reservation.statut}
                        </span>
                      </div>

                      <div className="bg-gray-50 rounded p-4 mb-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-gray-600 text-sm">Durée</p>
                            <p className="font-semibold text-gray-900">{nights} nuit(s)</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-600 text-sm">Montant</p>
                            <p className="font-bold text-blue-600 text-lg">{reservation.montantTotal}€</p>
                          </div>
                        </div>
                      </div>

                      <Link
                        to="/reservations"
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1"
                      >
                        Voir les détails <ArrowRight size={16} />
                      </Link>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">Aucun séjour prévu</p>
                <p className="text-gray-500 text-sm mt-1">Commencez par réserver une chambre!</p>
                <Link to="/chambres" className="text-blue-600 hover:text-blue-700 font-semibold mt-4 inline-block">
                  Voir les chambres →
                </Link>
              </div>
            )}
          </div>

          {/* Paiements en attente */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Paiements en attente</h2>

            {pendingPayments.length > 0 ? (
              <div className="space-y-4">
                {pendingPayments.map((payment) => (
                  <div key={payment._id} className="bg-white border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-orange-100 rounded-full p-2">
                        <AlertCircle size={20} className="text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Chambre #{payment.chambre?.numero || "N/A"}</p>
                        <p className="text-xs text-gray-600">En attente de paiement</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-3 mb-3">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600 text-sm">Montant dû</span>
                        <span className="font-bold text-gray-900">{payment.montantTotal || 0}€</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Avant le{" "}
                        {new Date(payment.datedebut).toLocaleDateString("fr-FR", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <Link
                      to="/reservations"
                      className="w-full block text-center bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded text-sm transition"
                    >
                      Payer
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-700 font-semibold text-sm">✓ Aucun paiement en attente</p>
              </div>
            )}

            {/* Accès rapide */}
            <div className="mt-8 space-y-2">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Accès rapide</h3>
              <Link
                to="/reservations"
                className="w-full flex items-center gap-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 transition"
              >
                <Calendar size={20} className="text-blue-600" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">Mes réservations</p>
                  <p className="text-xs text-gray-600">{reservations.length} au total</p>
                </div>
              </Link>

              <Link
                to="/factures"
                className="w-full flex items-center gap-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 transition"
              >
                <FileText size={20} className="text-green-600" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">Mes factures</p>
                  <p className="text-xs text-gray-600">Voir et télécharger</p>
                </div>
              </Link>

              <Link
                to="/profile"
                className="w-full flex items-center gap-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 transition"
              >
                <User size={20} className="text-purple-600" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">Mon profil</p>
                  <p className="text-xs text-gray-600">Gérer mon compte</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientDashboard
