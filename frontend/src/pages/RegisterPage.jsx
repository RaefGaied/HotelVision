"use client"

import { useDispatch, useSelector } from "react-redux"
import { useState } from "react"
import { register } from "../store/authSlice"
import { useNavigate, Link } from "react-router-dom"
import Loading from "../components/Loading"

export const RegisterPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas")
      return
    }

    const result = await dispatch(
      register({
        nom: formData.nom,
        email: formData.email,
        password: formData.password,
      }),
    )

    if (!result.payload.error) {
      navigate("/login")
    }
  }

  if (loading) return <Loading fullScreen />

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border border-border/50">
        <h1 className="text-3xl font-bold text-center mb-2 text-primary">Créer un compte</h1>
        <p className="text-center text-muted-foreground text-sm mb-6">Rejoignez HôtelApp en quelques secondes</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {typeof error === "string" ? error : error.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-foreground font-semibold mb-2 text-sm">Nom Complet</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-background"
              placeholder="Jean Dupont"
            />
          </div>

          <div>
            <label className="block text-foreground font-semibold mb-2 text-sm">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-background"
              placeholder="vous@exemple.com"
            />
          </div>

          <div>
            <label className="block text-foreground font-semibold mb-2 text-sm">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-background"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-foreground font-semibold mb-2 text-sm">Confirmer le mot de passe</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-background"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition duration-200"
          >
            S'inscrire
          </button>
        </form>

        <p className="text-center mt-6 text-foreground text-sm">
          Déjà inscrit ?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
