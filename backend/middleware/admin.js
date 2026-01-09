module.exports = function (req, res, next) {
  // Le middleware 'auth' a déjà placé l'utilisateur dans req.user
  if (req.user && req.user.role === 'admin') {
    next(); // L'utilisateur est admin, on continue
  } else {
    return res.status(403).json({ msg: 'Accès refusé : privilèges administrateur requis' });
  }
};