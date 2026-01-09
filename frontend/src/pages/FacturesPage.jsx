import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchMesFactures } from "../store/factureSlice"
import Loading from "../components/Loading"
import Pagination from "../components/Pagination"
import { Download, Eye, Printer } from "lucide-react"

const FacturesPage = () => {
  const dispatch = useDispatch()
  const { factures, loading } = useSelector((state) => state.factures)
  const { user } = useSelector((state) => state.auth)
  const [selectedFacture, setSelectedFacture] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    if (user) {
      dispatch(fetchMesFactures())
    }
  }, [dispatch, user])

  const handleDownload = (facture) => {
    // Créer le contenu HTML de la facture
    const factureNumber = `FAC-${facture._id?.slice(-6).toUpperCase()}`
    const factureDate = new Date(facture.dateEmission || facture.dateFacture || facture.createdAt).toLocaleDateString("fr-FR")
    const days = calculateDays(facture.reservation?.datedebut, facture.reservation?.datefin)
    const taxAmount = Math.round(facture.montantTotal * 0.2 * 100) / 100
    const sousTotal = Math.round((facture.montantTotal / 1.2) * 100) / 100

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Facture ${factureNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
    .header { text-align: center; margin-bottom: 40px; }
    .header h1 { color: #2563eb; margin-bottom: 10px; }
    .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .info-box { flex: 1; }
    .info-box h3 { color: #2563eb; margin-bottom: 10px; font-size: 14px; }
    .info-box p { margin: 5px 0; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f3f4f6; font-weight: bold; }
    .totaux { text-align: right; margin-top: 20px; }
    .totaux div { margin: 8px 0; }
    .total-final { font-size: 18px; font-weight: bold; color: #2563eb; padding-top: 10px; border-top: 2px solid #2563eb; }
    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏨 HôtelApp</h1>
    <p>Facture N° ${factureNumber}</p>
    <p>Date: ${factureDate}</p>
  </div>

  <div class="info-section">
    <div class="info-box">
      <h3>INFORMATIONS CLIENT</h3>
      <p><strong>${user?.nom || 'Client'}</strong></p>
      <p>${user?.email || ''}</p>
    </div>
    <div class="info-box">
      <h3>DÉTAILS DU SÉJOUR</h3>
      <p>Chambre: ${facture.reservation?.chambre?.numero || 'N/A'}</p>
      <p>Type: ${facture.reservation?.chambre?.type || 'N/A'}</p>
      <p>Du ${facture.reservation?.datedebut ? new Date(facture.reservation.datedebut).toLocaleDateString("fr-FR") : 'N/A'}</p>
      <p>Au ${facture.reservation?.datefin ? new Date(facture.reservation.datefin).toLocaleDateString("fr-FR") : 'N/A'}</p>
      <p>Durée: ${days || 0} nuit(s)</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Quantité</th>
        <th>Prix unitaire</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Chambre ${facture.reservation?.chambre?.type || ''} - ${facture.reservation?.chambre?.numero || ''}</td>
        <td>${days || 0} nuit(s)</td>
        <td>${days > 0 ? Math.round((facture.montantTotal / 1.2 / days) * 100) / 100 : 0}€</td>
        <td>${sousTotal}€</td>
      </tr>
    </tbody>
  </table>

  <div class="totaux">
    <div>Sous-total HT: ${sousTotal}€</div>
    <div>TVA (20%): ${taxAmount}€</div>
    <div class="total-final">TOTAL TTC: ${facture.montantTotal}€</div>
  </div>

  <div class="footer">
    <p>Merci pour votre confiance - HotelVision</p>
    <p>support@hotelvision.fr | www.hotelvision.fr</p>
  </div>
</body>
</html>
    `

    // Créer un Blob et télécharger
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Facture_${factureNumber}_${factureDate.replace(/\//g, '-')}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handlePrint = (facture) => {
    const factureNumber = `FAC-${facture._id?.slice(-6).toUpperCase()}`
    const factureDate = new Date(facture.dateEmission || facture.dateFacture || facture.createdAt).toLocaleDateString("fr-FR")
    const days = calculateDays(facture.reservation?.datedebut, facture.reservation?.datefin)
    const taxAmount = Math.round(facture.montantTotal * 0.2 * 100) / 100
    const sousTotal = Math.round((facture.montantTotal / 1.2) * 100) / 100

    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Facture ${factureNumber}</title>
  <style>
    @media print {
      @page { margin: 1cm; }
    }
    body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #2563eb; margin-bottom: 10px; }
    .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .info-box { flex: 1; }
    .info-box h3 { color: #2563eb; margin-bottom: 10px; font-size: 14px; }
    .info-box p { margin: 5px 0; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f3f4f6; font-weight: bold; }
    .totaux { text-align: right; margin-top: 20px; }
    .totaux div { margin: 8px 0; }
    .total-final { font-size: 18px; font-weight: bold; color: #2563eb; padding-top: 10px; border-top: 2px solid #2563eb; }
    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏨 HôtelApp</h1>
    <p>Facture N° ${factureNumber}</p>
    <p>Date: ${factureDate}</p>
  </div>

  <div class="info-section">
    <div class="info-box">
      <h3>INFORMATIONS CLIENT</h3>
      <p><strong>${user?.nom || 'Client'}</strong></p>
      <p>${user?.email || ''}</p>
    </div>
    <div class="info-box">
      <h3>DÉTAILS DU SÉJOUR</h3>
      <p>Chambre: ${facture.reservation?.chambre?.numero || 'N/A'}</p>
      <p>Type: ${facture.reservation?.chambre?.type || 'N/A'}</p>
      <p>Du ${facture.reservation?.datedebut ? new Date(facture.reservation.datedebut).toLocaleDateString("fr-FR") : 'N/A'}</p>
      <p>Au ${facture.reservation?.datefin ? new Date(facture.reservation.datefin).toLocaleDateString("fr-FR") : 'N/A'}</p>
      <p>Durée: ${days || 0} nuit(s)</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Quantité</th>
        <th>Prix unitaire</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Chambre ${facture.reservation?.chambre?.type || ''} - ${facture.reservation?.chambre?.numero || ''}</td>
        <td>${days || 0} nuit(s)</td>
        <td>${days > 0 ? Math.round((facture.montantTotal / 1.2 / days) * 100) / 100 : 0}€</td>
        <td>${sousTotal}€</td>
      </tr>
    </tbody>
  </table>

  <div class="totaux">
    <div>Sous-total HT: ${sousTotal}€</div>
    <div>TVA (20%): ${taxAmount}€</div>
    <div class="total-final">TOTAL TTC: ${facture.montantTotal}€</div>
  </div>

  <div class="footer">
    <p>Merci pour votre confiance - HotelVision</p>
    <p>support@hotelvision.fr | www.hotelvision.fr</p>
  </div>
</body>
</html>
    `

    // Ouvrir dans une nouvelle fenêtre et imprimer
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const calculateDays = (arrival, departure) => {
    if (!arrival || !departure) return 0
    const start = new Date(arrival)
    const end = new Date(departure)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    return isNaN(days) || days < 0 ? 0 : days
  }

  // Pagination calculations
  const totalPages = Math.ceil(factures.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentFactures = factures.slice(startIndex, endIndex)

  if (loading) return <Loading fullScreen />

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Mes Factures</h1>
          <p className="text-gray-600">
            Consultation et téléchargement de vos factures
            {factures.length > 0 && totalPages > 1 && ` - Page ${currentPage} sur ${totalPages}`}
          </p>
        </div>

        {factures.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-lg mb-4">Vous n'avez pas encore de factures.</p>
            <a href="/chambres" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Réserver une chambre
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {currentFactures.map((facture) => {
              // Logging pour debug
              console.log("Facture:", facture);

              const days = calculateDays(facture.reservation?.datedebut, facture.reservation?.datefin)
              const factureNumber = `FAC-${facture._id?.slice(-6).toUpperCase()}`
              const factureDate = new Date(facture.dateEmission || facture.dateFacture || facture.createdAt).toLocaleDateString("fr-FR")
              const taxAmount = Math.round(facture.montantTotal * 0.2 * 100) / 100

              // Gestion des cas où reservation est null
              const hasValidReservation = facture.reservation && facture.reservation.datedebut && facture.reservation.datefin
              const startDate = hasValidReservation ? new Date(facture.reservation.datedebut).toLocaleDateString("fr-FR") : "N/A"
              const endDate = hasValidReservation ? new Date(facture.reservation.datefin).toLocaleDateString("fr-FR") : "N/A"
              const chambreNum = facture.reservation?.chambre?.numero || "N/A"
              const montant = facture.montantTotal || "0"

              return (
                <div
                  key={facture._id}
                  className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition"
                >
                  {/* Header de la facture */}
                  <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-blue-100 text-sm mb-1">Numéro de facture</p>
                        <p className="text-2xl font-bold">{factureNumber}</p>
                      </div>
                      <div>
                        <p className="text-blue-100 text-sm mb-1">Dates du séjour</p>
                        <p className="text-lg font-semibold">{startDate} - {endDate}</p>
                      </div>
                      <div>
                        <p className="text-blue-100 text-sm mb-1">Chambre</p>
                        <p className="text-lg font-semibold">#{chambreNum}</p>
                      </div>
                      <div>
                        <p className="text-blue-100 text-sm mb-1">Montant total</p>
                        <p className="text-xl font-bold">{montant}€</p>
                      </div>
                    </div>
                  </div>

                  {/* Corps de la facture */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                      {/* Détails du séjour */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3">Détails du séjour</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="text-gray-600">Arrivée</p>
                            <p className="font-semibold text-gray-900">
                              {startDate}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Départ</p>
                            <p className="font-semibold text-gray-900">
                              {endDate}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Nombre de nuits</p>
                            <p className="font-semibold text-gray-900">{days || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Chambre</p>
                            <p className="font-semibold text-gray-900">#{facture.reservation?.chambre?.numero || "N/A"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Détails client */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3">Client</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="text-gray-600">Nom</p>
                            <p className="font-semibold text-gray-900">{facture.reservation?.client?.nom || user?.nom || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Email</p>
                            <p className="font-semibold text-gray-900">{facture.reservation?.client?.email || user?.email || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">ID Client</p>
                            <p className="font-semibold text-gray-900">{facture.reservation?.client?._id?.slice(-6) || user?._id?.slice(-6) || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Totaux */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-bold text-gray-900 mb-3">Résumé du paiement</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Sous-total</span>
                            <span className="font-semibold text-gray-900">
                              {Math.round((facture.montantTotal / 1.2) * 100) / 100}€
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">TVA (20%)</span>
                            <span className="font-semibold text-gray-900">{taxAmount}€</span>
                          </div>
                          <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                            <span className="font-bold text-gray-900">Total TTC</span>
                            <span className="text-xl font-bold text-blue-600">{facture.montantTotal}€</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Conditions */}
                    <div className="border-t border-gray-200 pt-4 mb-6">
                      <p className="text-xs text-gray-500">
                        Merci pour votre réservation. Cette facture est établie conformément aux conditions générales. En cas de
                        question, contactez-nous à support@hotelvision.fr
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          setSelectedFacture(selectedFacture?._id === facture._id ? null : facture)
                        }
                        className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
                      >
                        <Eye size={16} />
                        <span>Aperçu</span>
                      </button>
                      <button
                        onClick={() => handleDownload(facture)}
                        className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
                      >
                        <Download size={16} />
                        <span>PDF</span>
                      </button>
                      <button
                        onClick={() => handlePrint(facture)}
                        className="flex items-center space-x-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
                      >
                        <Printer size={16} />
                        <span>Imprimer</span>
                      </button>
                    </div>
                  </div>

                  {/* Aperçu détaillé */}
                  {selectedFacture?._id === facture._id && (
                    <div className="bg-gray-50 border-t border-gray-200 p-6">
                      <h4 className="font-bold text-gray-900 mb-4">Détails complets</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-gray-600">Type de chambre</p>
                          <p className="font-semibold text-gray-900">{facture.reservation?.chambre?.type || "N/A"}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-gray-600">Capacité</p>
                          <p className="font-semibold text-gray-900">
                            {facture.reservation?.chambre?.capacite || 0} pers.
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-gray-600">Prix/nuit</p>
                          <p className="font-semibold text-gray-900">
                            {days > 0 ? Math.round((facture.montantTotal / days) * 100) / 100 : 0}€
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-gray-600">Identifiant</p>
                          <p className="font-semibold text-gray-900 text-xs">{facture._id?.slice(-8)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
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
              totalItems={factures.length}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default FacturesPage
