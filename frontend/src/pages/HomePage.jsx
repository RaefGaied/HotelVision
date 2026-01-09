import { Link } from 'react-router-dom';
import { Building2, Lock, Clock, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section - FIXED SIZES */}
      {/* Reduced padding and font sizes for better visibility */}
      <section className="bg-linear-to-r from-blue-600 to-blue-700 text-white pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            {/* Changed from text-8xl to text-5xl/6xl */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 drop-shadow-lg">
              Trouvez votre chambre d'hôtel idéale
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
              Découvrez des centaines de chambres d'hôtel de qualité. Réservez en quelques clics, simplement et en toute sécurité.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/chambres"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-full font-bold text-base shadow-xl hover:bg-blue-50 hover:scale-105 transition transform duration-200"
              >
                Voir les chambres <ArrowRight size={20} />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-transparent text-white px-8 py-3 rounded-full font-bold text-base border-2 border-white hover:bg-white/20 transition"
              >
                S'inscrire gratuitement
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - FIXED SPACING */}
      {/* Changed py-40 to py-20 */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir HôtelApp ?
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-gray-100">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                <Building2 size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Large Sélection</h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Plus de 1000 chambres disponibles dans différentes catégories et à tous les prix.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-gray-100">
              <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-6 text-green-600">
                <Lock size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sécurisé & Fiable</h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Vos données et paiements sont protégés avec les meilleures normes de sécurité SSL.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-gray-100">
              <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center mb-6 text-purple-600">
                <Clock size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Support 24/7</h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Notre équipe est toujours disponible pour vous aider à toute heure, jour et nuit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - FIXED SIZES */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto border-t border-gray-200 pt-16">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              {/* Reduced from text-8xl to text-5xl */}
              <div className="text-5xl sm:text-6xl font-extrabold text-blue-600 mb-2">1000+</div>
              <p className="text-gray-600 font-semibold text-base uppercase tracking-wider">Chambres disponibles</p>
            </div>
            <div>
              <div className="text-5xl sm:text-6xl font-extrabold text-green-600 mb-2">10K+</div>
              <p className="text-gray-600 font-semibold text-base uppercase tracking-wider">Clients satisfaits</p>
            </div>
            <div>
              <div className="text-5xl sm:text-6xl font-extrabold text-purple-600 mb-2">50+</div>
              <p className="text-gray-600 font-semibold text-base uppercase tracking-wider">Partenaires hôteliers</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-linear-to-r from-blue-50 to-indigo-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Prêt à réserver ?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Créez votre compte en quelques secondes et trouvez votre chambre idéale dès aujourd'hui.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-xl hover:bg-blue-700 transition hover:-translate-y-1"
            >
              S'inscrire maintenant <ArrowRight size={20} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-full font-bold text-lg shadow-md hover:shadow-lg hover:text-blue-700 transition border-2 border-blue-600"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}