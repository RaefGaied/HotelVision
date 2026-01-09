import React, { useState } from 'react';
import './PowerBIDashboard.css';

const PowerBIDashboard = () => {
  // URL Power BI Embed - Dashboard publié le 2 janvier 2026
  const POWER_BI_EMBED_URL = 'https://app.powerbi.com/view?r=eyJrIjoiZjA1NTA0MGEtYTliOS00MmFlLWJkY2EtMGU5ZjYzYTYxMGI0IiwidCI6ImI3YmQ0NzE1LTQyMTctNDhjNy05MTllLTJlYTk3ZjU5MmZhNyJ9';
  
  const [isLoading, setIsLoading] = useState(true);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="powerbi-dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1> Dashboard Business Intelligence</h1>
        <p className="dashboard-subtitle">
          Analyse de Performance - Gestion Hôtelière 2025
        </p>
      </div>

      {}
      {POWER_BI_EMBED_URL.includes('VOTRE_CODE_ICI') && (
        <div className="setup-instructions">
          <h3>⚠️ Configuration requise</h3>
          <ol>
            <li>Ouvrez Power BI Desktop</li>
            <li>Cliquez sur <strong>Home → Publish</strong></li>
            <li>Connectez-vous avec votre compte Microsoft</li>
            <li>Une fois publié, allez sur Power BI Service (web)</li>
            <li>File → Embed report → Publish to web</li>
            <li>Copiez l'URL et remplacez dans <code>PowerBIDashboard.jsx</code></li>
          </ol>
        </div>
      )}
      {isLoading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement du dashboard Power BI...</p>
        </div>
      )}

      {/* Power BI iframe */}
      <div className="dashboard-wrapper">
        <iframe
          title="Gestion Hoteliere Dashboard"
          width="100%"
          height="100%"
          src={POWER_BI_EMBED_URL}
          frameBorder="0"
          allowFullScreen={true}
          onLoad={handleIframeLoad}
          className={isLoading ? 'iframe-loading' : 'iframe-loaded'}
        ></iframe>
      </div>

      {/* Footer with info */}
      <div className="dashboard-footer">
        <div className="footer-stats">
          <div className="stat-item">
            <span className="stat-icon">💰</span>
            <span className="stat-label">CA Total</span>
            <span className="stat-value">256K €</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📅</span>
            <span className="stat-label">Réservations</span>
            <span className="stat-value">142</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🏆</span>
            <span className="stat-label">Ville Leader</span>
            <span className="stat-value">Lyon</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⭐</span>
            <span className="stat-label">Produit Star</span>
            <span className="stat-value">DOUBLE</span>
          </div>
        </div>
        <p className="footer-note">
          Données mises à jour quotidiennement depuis PostgreSQL Data Warehouse
        </p>
      </div>
    </div>
  );
};

export default PowerBIDashboard;
