import React, { useState } from 'react';
import DiceRoller, { MultiDiceRoller, DamageCalculator } from './DiceRoller';
import { DICE_TYPES } from '../utils/diceUtils';

const DicePanel = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [customRoll, setCustomRoll] = useState({
    dieType: 'd20',
    quantity: 1,
    modifier: 0
  });

  if (!isOpen) return null;

  const basicDiceConfig = [
    { dieType: 'd4', quantity: 1, modifier: 0, label: 'D4' },
    { dieType: 'd6', quantity: 1, modifier: 0, label: 'D6' },
    { dieType: 'd8', quantity: 1, modifier: 0, label: 'D8' },
    { dieType: 'd10', quantity: 1, modifier: 0, label: 'D10' },
    { dieType: 'd12', quantity: 1, modifier: 0, label: 'D12' },
    { dieType: 'd20', quantity: 1, modifier: 0, label: 'D20' },
    { dieType: 'd100', quantity: 1, modifier: 0, label: 'D100' }
  ];

  const commonRolls = [
    { dieType: 'd20', quantity: 1, modifier: 0, label: 'Iniciativa' },
    { dieType: 'd20', quantity: 1, modifier: 0, label: 'Ataque' },
    { dieType: 'd20', quantity: 1, modifier: 0, label: 'Salvación' },
    { dieType: 'd20', quantity: 1, modifier: 0, label: 'Habilidad' },
    { dieType: 'd8', quantity: 1, modifier: 0, label: 'Daño Espada' },
    { dieType: 'd6', quantity: 1, modifier: 0, label: 'Daño Daga' },
    { dieType: 'd10', quantity: 1, modifier: 0, label: 'Daño Hacha' },
    { dieType: 'd4', quantity: 1, modifier: 0, label: 'Daño Dardo' }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: '#2D1810',
        color: '#F5F5DC',
        padding: '20px',
        borderRadius: '10px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '2px solid #DAA520'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#DAA520' }}>🎲 Panel de Dados</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#F5F5DC',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '1px solid #DAA520' }}>
          <button
            onClick={() => setActiveTab('basic')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'basic' ? '#DAA520' : 'transparent',
              color: activeTab === 'basic' ? '#2D1810' : '#F5F5DC',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Dados Básicos
          </button>
          <button
            onClick={() => setActiveTab('common')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'common' ? '#DAA520' : 'transparent',
              color: activeTab === 'common' ? '#2D1810' : '#F5F5DC',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Tiradas Comunes
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'custom' ? '#DAA520' : 'transparent',
              color: activeTab === 'custom' ? '#2D1810' : '#F5F5DC',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Personalizado
          </button>
          <button
            onClick={() => setActiveTab('damage')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'damage' ? '#DAA520' : 'transparent',
              color: activeTab === 'damage' ? '#2D1810' : '#F5F5DC',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Calculadora de Daño
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'basic' && (
          <div>
            <h3 style={{ color: '#DAA520', marginBottom: '15px' }}>Dados Básicos</h3>
            <MultiDiceRoller diceConfig={basicDiceConfig} />
          </div>
        )}

        {activeTab === 'common' && (
          <div>
            <h3 style={{ color: '#DAA520', marginBottom: '15px' }}>Tiradas Comunes</h3>
            <MultiDiceRoller diceConfig={commonRolls} />
          </div>
        )}

        {activeTab === 'custom' && (
          <div>
            <h3 style={{ color: '#DAA520', marginBottom: '15px' }}>Tirada Personalizada</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Tipo de Dado</label>
                <select
                  value={customRoll.dieType}
                  onChange={(e) => setCustomRoll(prev => ({ ...prev, dieType: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #DAA520',
                    backgroundColor: '#2D1810',
                    color: '#F5F5DC'
                  }}
                >
                  {Object.keys(DICE_TYPES).map(die => (
                    <option key={die} value={die}>{die.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Cantidad</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={customRoll.quantity}
                  onChange={(e) => setCustomRoll(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #DAA520',
                    backgroundColor: '#2D1810',
                    color: '#F5F5DC'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Modificador</label>
                <input
                  type="number"
                  value={customRoll.modifier}
                  onChange={(e) => setCustomRoll(prev => ({ ...prev, modifier: parseInt(e.target.value) || 0 }))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #DAA520',
                    backgroundColor: '#2D1810',
                    color: '#F5F5DC'
                  }}
                />
              </div>
            </div>
            
            <DiceRoller
              dieType={customRoll.dieType}
              quantity={customRoll.quantity}
              modifier={customRoll.modifier}
              customLabel={`${customRoll.quantity}${customRoll.dieType.toUpperCase()}${customRoll.modifier >= 0 ? ` +${customRoll.modifier}` : ` ${customRoll.modifier}`}`}
            />
          </div>
        )}

        {activeTab === 'damage' && (
          <div>
            <h3 style={{ color: '#DAA520', marginBottom: '15px' }}>Calculadora de Daño</h3>
            <DamageCalculator />
          </div>
        )}
      </div>
    </div>
  );
};

export default DicePanel;
