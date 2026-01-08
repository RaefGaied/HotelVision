import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const VerifyEmail = () => {
  const { userId, token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Vérification en cours...');
  const { theme } = useSelector((state) => state.theme);

  useEffect(() => {
    // Call the backend to verify the email
    const verifyEmail = async () => {
      try {
        const response = await fetch(`http://localhost:5000/users/verify/${userId}/${token}`);
        
        // The backend will redirect, so we just wait and show success
        setStatus('success');
        setMessage('Email vérifié avec succès ! Redirection...');
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (error) {
        setStatus('error');
        setMessage('Erreur lors de la vérification. Veuillez réessayer.');
      }
    };

    verifyEmail();
  }, [userId, token, navigate]);

  return (
    <div data-theme={theme} className='w-full min-h-[100vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center'>
        {status === 'loading' && (
          <>
            <div className='flex justify-center mb-4'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
            </div>
            <h2 className='text-2xl font-bold text-gray-800 mb-2'>Vérification en cours...</h2>
            <p className='text-gray-600'>{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className='flex justify-center mb-4'>
              <span className='text-6xl text-green-500'>✓</span>
            </div>
            <h2 className='text-2xl font-bold text-green-600 mb-2'>Succès !</h2>
            <p className='text-gray-600 mb-4'>{message}</p>
            <p className='text-sm text-gray-500'>Vous serez redirigé vers la page de connexion...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className='flex justify-center mb-4'>
              <span className='text-6xl text-red-500'>✕</span>
            </div>
            <h2 className='text-2xl font-bold text-red-600 mb-2'>Erreur</h2>
            <p className='text-gray-600 mb-4'>{message}</p>
            <button
              onClick={() => navigate('/register')}
              className='mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition'
            >
              Retour à l'inscription
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
