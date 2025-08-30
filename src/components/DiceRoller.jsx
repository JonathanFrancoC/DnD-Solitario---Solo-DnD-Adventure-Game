import React, { useState, useEffect } from 'react';
import { 
  rollDie, 
  rollMultipleDice, 
  rollDieWithModifier, 
  rollMultipleDiceWithModifier,
  rollWithAdvantage,
  rollWithDisadvantage,
  DICE_TYPES,
  getDieColor,
  formatRollResult
} from '../utils/diceUtils';

const DiceRoller = ({ 
  onRoll, 
  dieType = 'd20', 
  quantity = 1, 
  modifier = 0, 
  showHistory = true,
  customLabel = null,
  className = ''
}) => {
  const [isRolling, setIsRolling] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [rollHistory, setRollHistory] = useState([]);
  const [showAdvantage, setShowAdvantage] = useState(false);
  const [showDisadvantage, setShowDisadvantage] = useState(false);

  const handleRoll = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    
    // Simular tiempo de lanzamiento
    setTimeout(() => {
      let result;
      
      if (showAdvantage && dieType === 'd20') {
        result = rollWithAdvantage();
      } else if (showDisadvantage && dieType === 'd20') {
        result = rollWithDisadvantage();
      } else if (quantity > 1) {
        result = rollMultipleDiceWithModifier(dieType, quantity, modifier);
      } else {
        result = rollDieWithModifier(dieType, modifier);
      }
      
      setLastResult(result);
      
      if (showHistory) {
        setRollHistory(prev => [result, ...prev.slice(0, 9)]); // Mantener solo los últimos 10
      }
      
      if (onRoll) {
        onRoll(result);
      }
      
      setIsRolling(false);
    }, 300);
  };

  const handleAdvantageRoll = () => {
    setShowAdvantage(true);
    setShowDisadvantage(false);
  };

  const handleDisadvantageRoll = () => {
    setShowDisadvantage(true);
    setShowAdvantage(false);
  };

  const handleNormalRoll = () => {
    setShowAdvantage(false);
    setShowDisadvantage(false);
  };

  const getDieDisplay = () => {
    const dieNumber = parseInt(dieType.replace('d', ''));
    return (
      <div 
        className={`die-display ${isRolling ? 'rolling' : ''}`}
        style={{
          backgroundColor: getDieColor(dieType),
          color: 'white',
          width: '60px',
          height: '60px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          transform: isRolling ? 'rotate(360deg)' : 'rotate(0deg)'
        }}
        onClick={handleRoll}
      >
        {dieNumber}
      </div>
    );
  };

  const getResultDisplay = () => {
    if (!lastResult) return null;

    let displayText = '';
    let resultValue = 0;

    if (lastResult.rolls) {
      // Múltiples dados o ventaja/desventaja
      if (lastResult.advantage) {
        displayText = `Ventaja: [${lastResult.rolls.join(', ')}] = ${lastResult.result}`;
        resultValue = lastResult.result;
      } else if (lastResult.disadvantage) {
        displayText = `Desventaja: [${lastResult.rolls.join(', ')}] = ${lastResult.result}`;
        resultValue = lastResult.result;
      } else {
        displayText = formatRollResult(lastResult);
        resultValue = lastResult.total;
      }
    } else {
      // Un solo dado
      displayText = formatRollResult(lastResult);
      resultValue = lastResult.total;
    }

    return (
      <div style={{ 
        textAlign: 'center', 
        marginTop: '10px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '2px solid #dee2e6'
      }}>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
          {customLabel || 'Resultado'}
        </div>
        <div style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: resultValue >= 20 ? '#28a745' : resultValue <= 5 ? '#dc3545' : '#007bff'
        }}>
          {resultValue}
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          {displayText}
        </div>
      </div>
    );
  };

  return (
    <div className={`dice-roller ${className}`} style={{ textAlign: 'center', padding: '15px' }}>
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
          {customLabel || `${dieType.toUpperCase()}${quantity > 1 ? ` (x${quantity})` : ''}`}
        </h4>
        
        {dieType === 'd20' && (
          <div style={{ marginBottom: '10px' }}>
            <button
              onClick={handleNormalRoll}
              style={{
                padding: '5px 10px',
                margin: '0 5px',
                border: '1px solid #ccc',
                background: !showAdvantage && !showDisadvantage ? '#007bff' : '#f8f9fa',
                color: !showAdvantage && !showDisadvantage ? 'white' : '#333',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Normal
            </button>
            <button
              onClick={handleAdvantageRoll}
              style={{
                padding: '5px 10px',
                margin: '0 5px',
                border: '1px solid #ccc',
                background: showAdvantage ? '#28a745' : '#f8f9fa',
                color: showAdvantage ? 'white' : '#333',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Ventaja
            </button>
            <button
              onClick={handleDisadvantageRoll}
              style={{
                padding: '5px 10px',
                margin: '0 5px',
                border: '1px solid #ccc',
                background: showDisadvantage ? '#dc3545' : '#f8f9fa',
                color: showDisadvantage ? 'white' : '#333',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Desventaja
            </button>
          </div>
        )}
        
        {modifier !== 0 && (
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
            Modificador: {modifier >= 0 ? `+${modifier}` : modifier}
          </div>
        )}
      </div>

      {getDieDisplay()}
      
      {getResultDisplay()}

      {showHistory && rollHistory.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <h5 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
            Historial
          </h5>
          <div style={{ 
            maxHeight: '150px', 
            overflowY: 'auto',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            padding: '10px'
          }}>
            {rollHistory.map((roll, index) => (
              <div key={index} style={{ 
                fontSize: '12px', 
                marginBottom: '5px',
                padding: '5px',
                backgroundColor: 'white',
                borderRadius: '3px',
                border: '1px solid #dee2e6'
              }}>
                {formatRollResult(roll)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para múltiples dados
export const MultiDiceRoller = ({ diceConfig = [], onRoll, showHistory = true }) => {
  const [results, setResults] = useState({});

  const handleDiceRoll = (dieType, result) => {
    setResults(prev => ({
      ...prev,
      [dieType]: result
    }));
    
    if (onRoll) {
      onRoll({ ...results, [dieType]: result });
    }
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
      {diceConfig.map((config, index) => (
        <DiceRoller
          key={index}
          dieType={config.dieType}
          quantity={config.quantity}
          modifier={config.modifier}
          onRoll={(result) => handleDiceRoll(config.dieType, result)}
          showHistory={showHistory}
          customLabel={config.label}
        />
      ))}
    </div>
  );
};

// Componente para calculadora de daño
export const DamageCalculator = ({ onDamageRoll }) => {
  const [damageConfig, setDamageConfig] = useState({
    dieType: 'd8',
    quantity: 1,
    modifier: 0,
    isCrit: false
  });

  const handleDamageRoll = () => {
    const { rollDamageWithCrit } = require('../utils/diceUtils');
    const result = rollDamageWithCrit(
      damageConfig.dieType,
      damageConfig.quantity,
      damageConfig.modifier,
      damageConfig.isCrit
    );
    
    if (onDamageRoll) {
      onDamageRoll(result);
    }
  };

  return (
    <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
      <h4 style={{ margin: '0 0 15px 0', textAlign: 'center' }}>Calculadora de Daño</h4>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '15px' }}>
        <div>
          <label style={{ fontSize: '12px', color: '#666' }}>Dado</label>
          <select
            value={damageConfig.dieType}
            onChange={(e) => setDamageConfig(prev => ({ ...prev, dieType: e.target.value }))}
            style={{ width: '100%', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            {Object.keys(DICE_TYPES).map(die => (
              <option key={die} value={die}>{die.toUpperCase()}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ fontSize: '12px', color: '#666' }}>Cantidad</label>
          <input
            type="number"
            min="1"
            max="10"
            value={damageConfig.quantity}
            onChange={(e) => setDamageConfig(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
            style={{ width: '100%', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        
        <div>
          <label style={{ fontSize: '12px', color: '#666' }}>Modificador</label>
          <input
            type="number"
            value={damageConfig.modifier}
            onChange={(e) => setDamageConfig(prev => ({ ...prev, modifier: parseInt(e.target.value) || 0 }))}
            style={{ width: '100%', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'end' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={damageConfig.isCrit}
              onChange={(e) => setDamageConfig(prev => ({ ...prev, isCrit: e.target.checked }))}
              style={{ marginRight: '5px' }}
            />
            Crítico
          </label>
        </div>
      </div>
      
      <button
        onClick={handleDamageRoll}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        🎲 Lanzar Daño
      </button>
    </div>
  );
};

export default DiceRoller;
