import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { updateProfile, changePassword } from "../store/authSlice"
import { User, Mail, Lock, Phone, Calendar, MapPin, Edit2, Save, X } from "lucide-react"

const UserProfile = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, loading } = useSelector((state) => state.auth)
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const [formData, setFormData] = useState({
    nom: user?.nom || "",
    email: user?.email || "",
    telephone: user?.telephone || "",
    adresse: user?.adresse || "",
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    await dispatch(updateProfile(formData))
    setIsEditing(false)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Les mots de passe ne correspondent pas!")
      return
    }
    const result = await dispatch(changePassword({
      ancienMotDePasse: passwordForm.currentPassword,
      nouveauMotDePasse: passwordForm.newPassword
    }))
    if (!result.error) {
      setShowPasswordForm(false)
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
      alert("Mot de passe changé avec succès!")
    }
  }

  const handleCancel = () => {
    setFormData({
      nom: user?.nom || "",
      email: user?.email || "",
      telephone: user?.telephone || "",
      adresse: user?.adresse || "",
    })
    setIsEditing(false)
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-700 font-semibold mb-6 flex items-center gap-2"
          >
            ← Retour
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mon Profil</h1>
          <p className="text-gray-600">Gérez vos informations personnelles et vos préférences</p>
        </div>

        <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-8 mb-8 border border-blue-200">
          <div className="flex items-center gap-6">
            <div className="bg-blue-600 text-white rounded-full w-20 h-20 flex items-center justify-center">
              <User size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{formData.nom}</h2>
              <p className="text-gray-600 mb-3">{formData.email}</p>
              <div className="flex gap-4 text-sm">
                <span className="px-3 py-1 bg-white rounded-full text-gray-700 font-medium">
                  Client depuis {user?.createdAt ? new Date(user.createdAt).getFullYear() : "-"}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 font-medium rounded-full">Actif</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Informations Personnelles */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Informations personnelles</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    <Edit2 size={18} />
                    Modifier
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm">Nom complet</label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm">Téléphone</label>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      placeholder="+33 1 23 45 67 89"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm">Adresse</label>
                    <textarea
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleInputChange}
                      placeholder="123 Rue de la Paix, 75000 Paris"
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                    >
                      <Save size={18} />
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 rounded-lg transition"
                    >
                      <X size={18} />
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-gray-600 text-sm mb-1">Nom complet</p>
                    <p className="text-lg font-semibold text-gray-900">{formData.nom || "-"}</p>
                  </div>

                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-gray-600 text-sm mb-1">Email</p>
                    <p className="text-lg font-semibold text-gray-900">{formData.email || "-"}</p>
                  </div>

                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-gray-600 text-sm mb-1">Téléphone</p>
                    <p className="text-lg font-semibold text-gray-900">{formData.telephone || "Non renseigné"}</p>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm mb-1">Adresse</p>
                    <p className="text-lg font-semibold text-gray-900">{formData.adresse || "Non renseignée"}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sécurité */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Sécurité</h3>

              {!showPasswordForm ? (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="flex items-center gap-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-600 font-semibold px-4 py-3 rounded-lg transition w-full justify-center"
                >
                  <Lock size={18} />
                  Changer mon mot de passe
                </button>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm">Mot de passe actuel</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm">Nouveau mot de passe</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm">Confirmer le nouveau mot de passe</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                    <p className="text-blue-700">
                      <strong>Critères du mot de passe:</strong>
                    </p>
                    <ul className="text-blue-600 mt-2 space-y-1">
                      <li>✓ Au moins 8 caractères</li>
                      <li>✓ Au moins une lettre majuscule</li>
                      <li>✓ Au moins un chiffre</li>
                      <li>✓ Au moins un caractère spécial (@, #, $, etc.)</li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                    >
                      Changer le mot de passe
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 rounded-lg transition"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistiques */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Votre compte</h3>

              <div className="space-y-4">
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-gray-600 text-xs font-medium mb-1">Créé le</p>
                  <p className="font-semibold text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "-"}
                  </p>
                </div>

                <div className="pb-4 border-b border-gray-200">
                  <p className="text-gray-600 text-xs font-medium mb-1">Rôle</p>
                  <p className="font-semibold text-gray-900 capitalize">{user?.role || "Client"}</p>
                </div>

                <div>
                  <p className="text-gray-600 text-xs font-medium mb-1">Statut</p>
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-700 font-semibold text-xs rounded">
                    Actif
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>

              <div className="space-y-2">
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-900 font-medium transition text-sm">
                  📋 Télécharger mes données
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-900 font-medium transition text-sm">
                  🔔 Gérer les notifications
                </button>
                <button className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 font-medium transition text-sm">
                  🗑️ Supprimer mon compte
                </button>
              </div>
            </div>

            {/* Aide */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-900 text-sm">
                <strong>Besoin d'aide?</strong> Consultez notre <span className="underline cursor-pointer">centre d'aide</span> ou contactez notre support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
