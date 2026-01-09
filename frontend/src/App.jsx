import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import store from './store/store';
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './routes/PrivateRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChambresPage from './pages/ChambresPage';
import HotelsPage from './pages/HotelsPage';
import AddHotelPage from './pages/AddHotelPage';
import HotelDetailsPage from './pages/HotelDetailsPage';
import ReservationsPage from './pages/ReservationsPage';
import FacturesPage from './pages/FacturesPage';
import ClientDashboard from './pages/ClientDashboard';
import UserProfile from './pages/UserProfile';
import AdminPage from './pages/AdminPage';
import ServicesPage from './pages/ServicesPage';
import ClientsPage from './pages/ClientsPage';
import PowerBIDashboard from './components/Dashboard/PowerBIDashboard';

import './index.css';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ToastContainer 
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="grow pt-20">
            <Routes>
              {/* Routes publiques - Visiteurs */}
              <Route path="/" element={<HomePage />} />
              <Route path="/hotels" element={<HotelsPage />} />
              <Route path="/hotels/:id" element={<HotelDetailsPage />} />
              <Route path="/chambres" element={<ChambresPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Routes protégées - Client */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute requiredRole="client">
                    <ClientDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute requiredRole="client">
                    <UserProfile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/reservations"
                element={
                  <PrivateRoute requiredRole="client">
                    <ReservationsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/factures"
                element={
                  <PrivateRoute requiredRole="client">
                    <FacturesPage />
                  </PrivateRoute>
                }
              />

              {/* Routes protégées - Admin */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute requiredRole="admin">
                    <AdminPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/services"
                element={
                  <PrivateRoute requiredRole="admin">
                    <ServicesPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/clients"
                element={
                  <PrivateRoute requiredRole="admin">
                    <ClientsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/hotels/add"
                element={
                  <PrivateRoute requiredRole="admin">
                    <AddHotelPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/hotels/edit/:id"
                element={
                  <PrivateRoute requiredRole="admin">
                    <AddHotelPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/bi-dashboard"
                element={
                  <PrivateRoute requiredRole="admin">
                    <PowerBIDashboard />
                  </PrivateRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
