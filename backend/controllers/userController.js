const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register
exports.register = async (req, res) => {
  const { nom, email, password, role } = req.body;
  
  console.log('📝 Données reçues pour register:', { nom, email, password: password ? '***' : undefined, role });
  
  try {
    let user = await User.findOne({ email });
    if (user) {
      console.log('Utilisateur déjà existant:', email);
      return res.status(400).json({ msg: 'Utilisateur déjà existant' });
    }

    const validRoles = ['client', 'admin'];
    const userRole = validRoles.includes(role) ? role : 'client';

    user = new User({ nom, email, password, role: userRole });
    await user.save();

    const payload = { user: { id: user.id, role: user.role } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET, 
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ 
          message: "Inscription réussie",
          token,
          user: { 
            id: user._id, 
            nom: user.nom,
            email: user.email, 
            role: user.role 
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Erreur inscription", error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Identifiants invalides' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Identifiants invalides' });

    const payload = { user: { id: user.id, role: user.role } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          message: "Connexion réussie",
          token,
          user: { 
            id: user._id, 
            nom: user.nom,
            email: user.email, 
            role: user.role 
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Erreur connexion", error: err.message });
  }
};

// Get profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération profil", error: err.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  const { nom, email } = req.body;

  try {
    // Check if email is already taken by another user
    if (email) {
      const emailTaken = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (emailTaken) {
        return res.status(400).json({ msg: 'Email déjà utilisé' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { nom, email } },
      { new: true }
    ).select('-password');

    res.json({
      message: "Profil mis à jour",
      user
    });
  } catch (err) {
    res.status(400).json({ message: "Erreur mise à jour profil", error: err.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Ancien mot de passe incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Mot de passe changé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur changement mot de passe", error: err.message });
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération utilisateurs", error: err.message });
  }
};

// Get all clients (Admin only)
exports.getAllClients = async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' }).select('-password');
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération clients", error: err.message });
  }
};

// Toggle client activation (Admin only)
exports.toggleClientActivation = async (req, res) => {
  const { clientId } = req.params;

  try {
    const client = await User.findById(clientId);
    
    if (!client) {
      return res.status(404).json({ msg: 'Client non trouvé' });
    }

    if (client.role !== 'client') {
      return res.status(400).json({ msg: 'Cet utilisateur n\'est pas un client' });
    }

    client.actif = !client.actif;
    await client.save();

    res.json({
      message: `Client ${client.actif ? 'activé' : 'désactivé'} avec succès`,
      client: client.toObject({ getters: true, virtuals: true })
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur activation/désactivation client", error: err.message });
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'Utilisateur non trouvé' });
    }

    res.json({ message: "Compte supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur suppression compte", error: err.message });
  }
};