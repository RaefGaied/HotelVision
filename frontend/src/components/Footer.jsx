export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">HôtelApp</h3>
            <p className="text-gray-400">
              Plateforme de gestion et réservation hôtelière moderne
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-secondary">Accueil</a></li>
              <li><a href="/chambres" className="hover:text-secondary">Chambres</a></li>
              <li><a href="/reservations" className="hover:text-secondary">Réservations</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Légal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-secondary">Conditions</a></li>
              <li><a href="#" className="hover:text-secondary">Confidentialité</a></li>
              <li><a href="#" className="hover:text-secondary">CGU</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <p className="text-gray-400">Email: info@hotelvision.com</p>
            <p className="text-gray-400">Tél: +33 1 23 45 67 89</p>
          </div>
        </div>
        <hr className="border-gray-700 mb-4" />
        <div className="text-center text-gray-400">
          <p>&copy; {currentYear} HotelVision. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
