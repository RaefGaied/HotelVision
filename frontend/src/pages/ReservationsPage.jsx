import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchMesReservations, cancelReservation } from "../store/reservationSlice"
import { createPaiement } from "../store/paiementSlice"
import Loading from "../components/Loading"
import Pagination from "../components/Pagination"
import { Trash2, Eye, Download, CreditCard, Check } from "lucide-react"
import { toast } from "react-toastify"

const ReservationsPage = () => {
  const dispatch = useDispatch()
  const { reservations, loading } = useSelector((state) => state.reservations)
  const { user } = useSelector((state) => state.auth)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [paymentModal, setPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("CARTE_CREDIT")
  const [processing, setProcessing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  useEffect(() => {
    if (user) {
      dispatch(fetchMesReservations())
    }
  }, [dispatch, user])

  const handleCancel = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) {
      await dispatch(cancelReservation(id))
      setSelectedReservation(null)
    }
  }

  const handlePay = (reservation) => {
    // Calculer le montant total si le champ n'existe pas
    const days = calculateDays(reservation.datedebut || reservation.dateArrivee, reservation.datefin || reservation.dateDepart)
    const prixParNuit = reservation.chambre?.prix || 0
    const montantCalcule = (days && prixParNuit) ? days * prixParNuit : (reservation.montantTotal || (reservation.facture?.montantTotal || 0))

    // Ajouter le montant calculé au selectedReservation
    const reservationAvecMontant = {
      ...reservation,
      montantTotal: montantCalcule || reservation.montantTotal || reservation.facture?.montantTotal || 0
    }

    setSelectedReservation(reservationAvecMontant)
    setPaymentModal(true)
  }

  const processPayment = async () => {
    if (!selectedReservation || processing) return

    setProcessing(true)
    try {
      // Récupérer le montant depuis plusieurs sources possibles
      const montantAPayer = selectedReservation.montantTotal ||
        selectedReservation.facture?.montantTotal ||
        0

      if (montantAPayer <= 0) {
        toast.error("Le montant du paiement est invalide")
        setProcessing(false)
        return
      }

      const paiementData = {
        reservationId: selectedReservation._id,
        montant: montantAPayer,
        methodePaiement: paymentMethod
      }

      await dispatch(createPaiement(paiementData)).unwrap()
      toast.success("Paiement effectué avec succès!")

      // Recharger les réservations pour mettre à jour le statut
      await dispatch(fetchMesReservations())

      setPaymentModal(false)
      setSelectedReservation(null)
      setPaymentMethod("CARTE_CREDIT")
    } catch (error) {
      // Gérer les erreurs spécifiques
      if (error.msg && error.msg.includes("paiement existe")) {
        // Payment already exists - reload reservations to show the correct status
        toast.warning("Ce paiement a déjà été enregistré")
        await dispatch(fetchMesReservations())
        setPaymentModal(false)
        setSelectedReservation(null)
      } else if (error.msg) {
        toast.error(error.msg)
      } else if (typeof error === 'object' && error.message) {
        toast.error(error.message)
      } else {
        toast.error("Erreur lors du paiement: " + (error || "Erreur inconnue"))
      }
    } finally {
      setProcessing(false)
    }
  }

  const calculateDays = (arrival, departure) => {
    if (!arrival || !departure) return 0
    const start = new Date(arrival)
    const end = new Date(departure)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    return isNaN(days) || days < 0 ? 0 : days
  }

  if (loading) return <Loading fullScreen />

  // Pagination calculations
  const totalPages = Math.ceil(reservations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentReservations = reservations.slice(startIndex, endIndex)

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Mes Réservations</h1>
          <p className="text-gray-600">
            Gestion et suivi de vos réservations
            {reservations.length > 0 && totalPages > 1 && ` - Page ${currentPage} sur ${totalPages}`}
          </p>
        </div>

        {reservations.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-lg mb-4">Vous n'avez pas encore de réservations.</p>
            <a href="/chambres" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Réserver une chambre
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => {
              const days = calculateDays(reservation.datedebut || reservation.dateArrivee, reservation.datefin || reservation.dateDepart)
              const prixParNuit = reservation.chambre?.prix || 0
              const montantTotal = reservation.montantTotal || reservation.facture?.montantTotal || ((days && prixParNuit) ? days * prixParNuit : 0)
              return (
                <div
                  key={reservation._id}
                  className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition"
                >
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    {/* Chambre */}
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Chambre</p>
                      <p className="text-2xl font-bold text-blue-600">#{(reservation.chambre?.numero || reservation.chambreId?.numero) || "N/A"}</p>
                    </div>

                    {/* Dates */}
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Arrivée</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(reservation.datedebut || reservation.dateArrivee).toLocaleDateString("fr-FR")}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 text-sm mb-1">Départ</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(reservation.datefin || reservation.dateDepart).toLocaleDateString("fr-FR")}
                      </p>
                    </div>

                    {/* Durée et prix */}
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Durée</p>
                      <p className="font-semibold text-gray-900">{days} nuit{days > 1 ? "s" : ""}</p>
                    </div>

                    <div>
                      <p className="text-gray-600 text-sm mb-1">Montant</p>
                      <p className="text-xl font-bold text-gray-900">{montantTotal}€</p>
                    </div>

                    {/* Statut */}
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${reservation.statut === "VALIDEE"
                          ? "bg-green-100 text-green-700"
                          : reservation.statut === "ANNULEE"
                            ? "bg-red-100 text-red-700"
                            : reservation.statut === "TERMINEE"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {reservation.statut}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedReservation(selectedReservation?._id === reservation._id ? null : reservation)}
                      className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition text-sm font-medium"
                    >
                      <Eye size={16} />
                      <span>Détails</span>
                    </button>

                    {(reservation.statut === "VALIDEE" || reservation.statut === "EN_ATTENTE") && (
                      <React.Fragment key={`actions-${reservation._id}`}>
                        {reservation.statut === "VALIDEE" && (
                          <>
                            {reservation.facture?.estPayee ? (
                              <button
                                disabled
                                className="flex items-center space-x-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium cursor-not-allowed opacity-75"
                              >
                                <Check size={16} />
                                <span>Payé le {new Date(reservation.facture.datePaiement).toLocaleDateString("fr-FR")}</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePay(reservation)}
                                className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition text-sm font-medium"
                              >
                                <CreditCard size={16} />
                                <span>Payer</span>
                              </button>
                            )}
                          </>
                        )}
                        <button
                          onClick={() => handleCancel(reservation._id)}
                          className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition text-sm font-medium"
                        >
                          <Trash2 size={16} />
                          <span>Annuler</span>
                        </button>
                      </React.Fragment>
                    )}

                    {reservation.statut === "EN_ATTENTE" && (
                      <div className="text-sm text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
                        ⏳ En attente de validation par l'admin
                      </div>
                    )}

                    <a
                      href="/factures"
                      className="flex items-center space-x-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition text-sm font-medium"
                    >
                      <Download size={16} />
                      <span>Facture</span>
                    </a>
                  </div>

                  {/* Détails expandus */}
                  {selectedReservation?._id === reservation._id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50 rounded-lg p-4">
                      <h4 className="font-bold text-gray-900 mb-3">Détails de la réservation</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">ID Réservation</p>
                          <p className="font-semibold text-gray-900">{reservation._id}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Date de création</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(reservation.createdAt).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Nombre de nuits</p>
                          <p className="font-semibold text-gray-900">{days || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Prix chambre</p>
                          <p className="font-semibold text-gray-900">{montantTotal || 0}€</p>
                        </div>
                      </div>

                      {/* Services inclus */}
                      {reservation.services && reservation.services.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h5 className="font-bold text-gray-900 mb-2">Services inclus</h5>
                          <div className="space-y-2">
                            {reservation.services.map((service) => (
                              <div key={service._id || service} className="flex justify-between items-center bg-white p-2 rounded">
                                <div>
                                  <p className="font-medium text-gray-900">{service.nom || 'Service'}</p>
                                  {service.description && (
                                    <p className="text-xs text-gray-500">{service.description}</p>
                                  )}
                                </div>
                                <span className="font-semibold text-blue-600">{service.prix || 0}€</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Montant total final */}
                      <div className="mt-4 pt-4 border-t-2 border-gray-300">
                        <div className="flex justify-between items-center">
                          <p className="text-lg font-bold text-gray-900">Montant total</p>
                          <p className="text-2xl font-bold text-blue-600">{reservation.montantTotal || montantTotal || 0}€</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={reservations.length}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {paymentModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirmer le paiement</h2>

            <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-600">Chambre</span>
                <span className="font-semibold text-gray-900">#{selectedReservation.chambre?.numero || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Durée</span>
                <span className="font-semibold text-gray-900">
                  {calculateDays(selectedReservation.datedebut, selectedReservation.datefin) || 0} nuits
                </span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-bold text-gray-900">Montant à payer</span>
                <span className="font-bold text-blue-600">{selectedReservation.montantTotal || 0}€</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-3">Méthode de paiement</label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="CARTE_CREDIT"
                    checked={paymentMethod === "CARTE_CREDIT"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">Carte bancaire</span>
                </label>
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="VIREMENT"
                    checked={paymentMethod === "VIREMENT"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">Virement bancaire</span>
                </label>
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="ESPECES"
                    checked={paymentMethod === "ESPECES"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">Espèces</span>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setPaymentModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 rounded-lg transition"
              >
                Annuler
              </button>
              <button
                onClick={processPayment}
                disabled={processing}
                className={`flex-1 font-semibold py-2 rounded-lg transition ${processing
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
              >
                {processing ? "Traitement..." : `Payer ${selectedReservation.montantTotal || 0}€`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReservationsPage
