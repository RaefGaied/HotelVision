const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const { getDashboardStats } = require('./controllers/adminController');
const auth = require('./middleware/auth');
const admin = require('./middleware/admin');


dotenv.config();
connectDB();

const app = express();


app.use(cors());
app.use(express.json());

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => res.send('API en cours d\'exécution...'));

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/hotels', require('./routes/hotelRoutes'));
app.use('/api/chambres', require('./routes/chambreRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/factures', require('./routes/factureRoutes'));
app.use('/api/paiements', require('./routes/paiementRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.get('/api/admin/stats', [auth, admin], getDashboardStats);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));