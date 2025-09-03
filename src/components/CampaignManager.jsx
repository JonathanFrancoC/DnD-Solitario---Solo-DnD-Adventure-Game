// CampaignManager.jsx - Gestor de campañas
import React, { useState, useEffect } from 'react';
import gameSaveService from '../utils/gameSaveService';

const CampaignManager = ({ onCampaignSelect, onNewCampaign }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCampaignData, setNewCampaignData] = useState({
    id: '',
    name: '',
    ruleset: 'DND5E-es'
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      // Inicializar el servicio de guardado
      await gameSaveService.initialize();
      
      // Cargar campañas disponibles
      const availableCampaigns = await gameSaveService.listCampaigns();
      setCampaigns(availableCampaigns);
      setError(null);
    } catch (err) {
      setError(`Error cargando campañas: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    
    if (!newCampaignData.id || !newCampaignData.name) {
      setError('ID y nombre son requeridos');
      return;
    }

    try {
      setLoading(true);
      
      // Crear la campaña usando el servicio de guardado
      const success = await gameSaveService.createCampaign(newCampaignData.id, newCampaignData.name);
      
      if (success) {
        setNewCampaignData({ id: '', name: '', ruleset: 'DND5E-es' });
        setShowCreateForm(false);
        await loadCampaigns();
        
        if (onNewCampaign) {
          onNewCampaign(newCampaignData.id);
        }
      } else {
        setError('Error al crear la campaña');
      }
    } catch (err) {
      setError(`Error creando campaña: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCampaign = async (campaignId) => {
    try {
      // Cargar datos de la campaña
      const campaignData = await gameSaveService.loadCampaignData(campaignId);
      
      if (onCampaignSelect) {
        onCampaignSelect(campaignId, campaignData);
      }
    } catch (err) {
      setError(`Error cargando campaña: ${err.message}`);
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la campaña "${campaignId}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setLoading(true);
      // Para aplicaciones de escritorio, esto se maneja desde el componente principal
      console.log('Eliminando campaña:', campaignId);
      await loadCampaigns();
    } catch (err) {
      setError(`Error eliminando campaña: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px' 
      }}>
        <div>Cargando campañas...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h2>🎲 Gestor de Campañas</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {showCreateForm ? 'Cancelar' : '+ Nueva Campaña'}
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '15px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {showCreateForm && (
        <div style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3>Crear Nueva Campaña</h3>
          <form onSubmit={handleCreateCampaign}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                ID de Campaña:
              </label>
              <input
                type="text"
                value={newCampaignData.id}
                onChange={(e) => setNewCampaignData({...newCampaignData, id: e.target.value})}
                placeholder="ej: stormharbor"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <small style={{ color: '#6c757d' }}>
                Usa solo letras, números y guiones bajos
              </small>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Nombre de la Campaña:
              </label>
              <input
                type="text"
                value={newCampaignData.name}
                onChange={(e) => setNewCampaignData({...newCampaignData, name: e.target.value})}
                placeholder="ej: La Sombra de Stormharbor"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Sistema de Reglas:
              </label>
              <select
                value={newCampaignData.ruleset}
                onChange={(e) => setNewCampaignData({...newCampaignData, ruleset: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="DND5E-es">D&D 5e (Español)</option>
                <option value="DND5E-en">D&D 5e (English)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Creando...' : 'Crear Campaña'}
            </button>
          </form>
        </div>
      )}

      <div>
        <h3>Campañas Disponibles</h3>
        {campaigns.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6c757d',
            fontStyle: 'italic'
          }}>
            No hay campañas creadas. ¡Crea tu primera campaña!
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {campaigns.map(campaign => (
              <div
                key={campaign.id}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  padding: '15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ flex: '1' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#495057' }}>
                    {campaign.name}
                  </h4>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>
                    <div>ID: {campaign.id}</div>
                    <div>Creada: {formatDate(campaign.created_at)}</div>
                    <div>Último guardado: {formatDate(campaign.last_saved_at)}</div>
                    <div>Personajes: {campaign.character_count}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleSelectCampaign(campaign.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Cargar
                  </button>
                  <button
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignManager;
