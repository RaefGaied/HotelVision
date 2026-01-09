import { LogOut, Menu, X } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { logout } from "../store/authSlice"
import { useState } from "react"

const Header = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate("/")
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center h-20">
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition">
          <span className="text-3xl">🏨</span>
          <span className="text-2xl font-extrabold text-blue-600 tracking-tight">HôtelApp</span>
        </Link>

        {/* Navigation Desktop */}
        <nav className="hidden md:flex gap-8 items-center">
          <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition">
            Accueil
          </Link>
          <Link to="/hotels" className="text-gray-600 hover:text-blue-600 font-medium transition">
            Hôtels
          </Link>
          <Link to="/chambres" className="text-gray-600 hover:text-blue-600 font-medium transition">
            Chambres
          </Link>

          <div className="h-6 w-px bg-gray-200 mx-2"></div>

          {user ? (
            <div className="flex items-center gap-4">
              {user.role === "admin" && (
                <>
                  <Link to="/admin" className="text-gray-700 hover:text-blue-600 font-medium">Admin</Link>
                  <Link to="/bi-dashboard" className="text-gray-700 hover:text-blue-600 font-medium flex items-center gap-1">
                     Dashboard BI
                  </Link>
                </>
              )}
              {user.role === "client" && (
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">Tableau de bord</Link>
                  <Link to="/reservations" className="text-gray-700 hover:text-blue-600 font-medium">Réservations</Link>
                </>
              )}
              <button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-full transition font-medium flex items-center gap-2">
                <LogOut size={18} />
                <span>Déconnexion</span>
              </button>
            </div>
          ) : (
           <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium px-2 whitespace-nowrap">
             Connexion
             </Link>
             <Link
               to="/register"
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-full transition font-bold shadow-md hover:shadow-lg whitespace-nowrap"
            >
                 Inscription
                       </Link>
                    </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-700 p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-3 shadow-lg absolute w-full">
          <Link to="/" className="block text-gray-700 hover:text-blue-600 transition font-medium py-2">
            Accueil
          </Link>
          <Link to="/hotels" className="block text-gray-700 hover:text-blue-600 transition font-medium py-2">
            Hôtels
          </Link>
          <Link to="/chambres" className="block text-gray-700 hover:text-blue-600 transition font-medium py-2">
            Chambres
          </Link>

          {user ? (
            <>
              {user.role === "admin" && (
                <>
                  <Link to="/admin" className="block text-gray-700 hover:text-blue-600 transition font-medium py-2">
                    Admin
                  </Link>
                  <Link to="/bi-dashboard" className="block text-gray-700 hover:text-blue-600 transition font-medium py-2">
                    📊 Dashboard BI
                  </Link>
                </>
              )}
              {user.role === "client" && (
                <>
                  <Link to="/dashboard" className="block text-gray-700 hover:text-blue-600 transition font-medium py-2">
                    Tableau de bord
                  </Link>
                  <Link to="/reservations" className="block text-gray-700 hover:text-blue-600 transition font-medium py-2">
                    Réservations
                  </Link>
                  <Link to="/factures" className="block text-gray-700 hover:text-blue-600 transition font-medium py-2">
                    Factures
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition font-medium flex items-center justify-center gap-2 mt-2"
              >
                <LogOut size={18} />
                <span>Déconnexion</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-gray-700 hover:text-blue-600 transition font-medium py-2">
                Connexion
              </Link>
              <Link
                to="/register"
                className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium text-center"
              >
                Inscription
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}

export default Header