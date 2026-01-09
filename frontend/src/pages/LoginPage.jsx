"use client"

import { useDispatch, useSelector } from "react-redux"
import { useState } from "react"
import { login } from "../store/authSlice"
import { useNavigate, Link } from "react-router-dom"
import Loading from "../components/Loading"
import { Lock, Mail } from "lucide-react"

export const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(login(formData))
    if (result.payload && result.payload.user) {
      navigate(result.payload.user.role === "admin" ? "/admin" : "/")
    }
  }

  if (loading) return <Loading fullScreen />

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-border/50">
          <div className="text-center mb-8">
            <div className="bg-primary w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Lock size={32} className="text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-primary">Connexion</h1>
            <p className="text-muted-foreground text-sm mt-2">Accédez à votre compte HôtelApp</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {typeof error === "string" ? error : error.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="flex items-center space-x-2 text-foreground font-semibold mb-2 text-sm">
                <Mail size={16} className="text-primary" />
                <span>Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-background"
                placeholder="vous@exemple.com"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-foreground font-semibold mb-2 text-sm">
                <Lock size={16} className="text-primary" />
                <span>Mot de passe</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-background"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition duration-200 transform hover:scale-105"
            >
              Se connecter
            </button>
          </form>

          <p className="text-center mt-6 text-foreground text-sm">
            Pas encore inscrit ?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
