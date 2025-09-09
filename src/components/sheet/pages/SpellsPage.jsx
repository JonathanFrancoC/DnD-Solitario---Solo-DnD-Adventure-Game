import React, { useState } from 'react';
import { useTranslation } from '../../../contexts/LanguageContext';
import spellsJson from '../../../data/spells.json';
import { getSpellsKnown, getCantripsKnown } from '../../../data/spellcastingData';

export default function SpellsPage({ data, onChange, locked = false }) {
  const { t } = useTranslation();
  const [expandedSpells, setExpandedSpells] = useState({});
  const [selectedSpell, setSelectedSpell] = useState(null);
  const [showSpellModal, setShowSpellModal] = useState(false);

  // Función helper para actualizar slots de conjuros
  const updateSpellSlot = (level, newUsed) => {
    const newValue = parseInt(newUsed) || 0;
    const total = data.spellSlots?.[level]?.total || 0;
    if (newValue <= total) {
      onChange('spellSlots', {
        ...data.spellSlots,
        [level]: { ...data.spellSlots?.[level], used: newValue }
      });
    }
  };

  // Función helper para obtener el límite de conjuros conocidos
  const getSpellsKnownLimit = () => {
    const className = data.class?.toLowerCase();
    const level = data.level || 1;
    
    if (!className) return 0;
    
    // Para clases preparadoras (clerigo, druida, mago, paladin), el límite es nivel + modificador de habilidad
    const preparedClasses = ['clerigo', 'druida', 'mago', 'paladin'];
    if (preparedClasses.includes(className)) {
      const ability = data.spellcasting?.ability;
      const abilityMod = data.spellcasting?.abilityMod || 0;
      return level + abilityMod;
    }
    
    // Para otras clases, usar la tabla de conjuros conocidos
    return getSpellsKnown(className, level);
  };

  // Función helper para obtener el límite de trucos conocidos
  const getCantripsKnownLimit = () => {
    const className = data.class?.toLowerCase();
    const level = data.level || 1;
    
    if (!className) return 0;
    return getCantripsKnown(className, level);
  };

  const toggleSpell = (spellKey) => {
    setExpandedSpells(prev => ({
      ...prev,
      [spellKey]: !prev[spellKey]
    }));
  };

  // Función para filtrar hechizos por nivel
  const getSpellsForLevel = (spells, level) => {
    if (!spells || !Array.isArray(spells)) return [];
    
    if (level === 0) {
      // Para trucos, devolver directamente los cantrips
      return spells;
    }
    
    // Para hechizos de nivel, filtrar por el nivel correcto
    return spells.filter(spell => {
      if (typeof spell === 'string') {
        // Si es un string (clave del hechizo), verificar si existe en el nivel correspondiente
        return spellsJson.spells[`level${level}`]?.[spell] !== undefined;
      } else if (spell.level) {
        // Si es un objeto con nivel, comparar directamente
        return spell.level === level;
      }
      return false;
    });
  };

  const renderSpellList = (spells, level) => {
    // Filtrar hechizos por nivel
    const levelSpells = getSpellsForLevel(spells, level);
    
    if (!levelSpells || levelSpells.length === 0) {
      return (
        <div style={{ 
          padding: '8px', 
          color: '#666', 
          fontStyle: 'italic',
          fontSize: '12px'
        }}>
          No hay conjuros de nivel {level}
        </div>
      );
    }

    return levelSpells.map((spell, index) => {
      const spellKey = `${level}_${index}`;
      const isExpanded = expandedSpells[spellKey];
      
      // Obtener el nombre del hechizo desde los datos
      let spellName = spell;
      let spellDetails = null;
      
      // Si es un string, buscar en los datos de hechizos
      if (typeof spell === 'string') {
        if (level === 0) {
          // Buscar en cantrips
          spellDetails = spellsJson.spells.cantrips?.[spell];
        } else {
          // Buscar en el nivel correspondiente
          spellDetails = spellsJson.spells[`level${level}`]?.[spell];
        }
        if (spellDetails) {
          spellName = spellDetails.name || spell;
        }
      } else if (spell.name) {
        spellName = spell.name;
        spellDetails = spell;
      }
      
      return (
        <div key={spellKey} style={{ marginBottom: '8px' }}>
          <div 
            onClick={() => {
              setSelectedSpell({ ...spellDetails, name: spellName, level: level === 0 ? 'Truco' : level });
              setShowSpellModal(true);
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
          >
            <span>{spellName}</span>
            <span style={{ fontSize: '16px' }}>📖</span>
          </div>
        </div>
      );
    });
  };

  return (
    <div className={locked ? 'locked' : ''} style={{ padding: '16px', position:'relative' }}>
      <fieldset disabled={locked} style={{ border:0, padding:0, margin:0 }}>
        
                 {/* INFORMACIÓN DE CONJUROS */}
         <div style={{ 
           padding: '16px',
           border: '2px solid #000',
           borderRadius: '8px',
           backgroundColor: '#f9f9f9',
           marginBottom: '20px'
         }}>
           <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', textAlign: 'center' }}>{t('spells.information', 'Información de Conjuros')}</h3>
           
           {/* Nota explicativa sobre límites */}
           <div style={{ 
             padding: '8px 12px', 
             backgroundColor: '#e3f2fd', 
             border: '1px solid #2196f3', 
             borderRadius: '4px', 
             marginBottom: '12px',
             fontSize: '12px'
           }}>
             <strong>📚 Límites de Conjuros:</strong> El "Límite Total" muestra cuántos conjuros puede conocer tu personaje en total. 
             Para clases preparadoras (Clérigo, Druida, Mago, Paladín) es Nivel + Modificador de habilidad. 
             Para otras clases (Bardo, Hechicero, Brujo, Ranger) sigue tablas específicas por nivel.
           </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}>Clase de Conjurador</label>
              <input 
                value={(data.spellcasting?.class || '').toUpperCase()}
                readOnly
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '2px solid #000', fontSize: '12px', backgroundColor: '#f0f0f0' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}>Nivel de Conjurador</label>
              <input 
                value={data.spellcasting?.casterLevel || ''}
                readOnly
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '2px solid #000', fontSize: '12px', backgroundColor: '#f0f0f0' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}>Modificador de Conjuros</label>
              <input 
                value={data.spellcasting?.ability ? `${data.spellcasting.ability.toUpperCase()} (${data.spellcasting.abilityMod >= 0 ? '+' : ''}${data.spellcasting.abilityMod})` : ''}
                readOnly
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '2px solid #000', fontSize: '12px', backgroundColor: '#f0f0f0' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}>CD de Conjuros</label>
              <input 
                value={data.spellcasting?.saveDC || ''}
                readOnly
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '2px solid #000', fontSize: '12px', backgroundColor: '#f0f0f0' }}
              />
            </div>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '20px',
          marginBottom: '20px'
        }}>
          
          {/* COLUMNA IZQUIERDA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
                         {/* CONJUROS DE NIVEL 0 */}
             <div style={{ 
               padding: '16px',
               border: '2px solid #000',
               borderRadius: '8px',
               backgroundColor: '#f9f9f9'
             }}>
               <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', textAlign: 'center' }}>{t('spells.cantrips', 'Conjuros de Nivel 0 (Trucos)')}</h3>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                 <div>
                   <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Conocidos</label>
                   <input 
                     value={getCantripsKnownLimit()}
                     readOnly
                     style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#f0f0f0' }}
                   />
                 </div>
                 <div>
                   <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Límite</label>
                   <input 
                     value={getCantripsKnownLimit()}
                     readOnly
                     style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#f0f0f0' }}
                   />
                 </div>
               </div>
               <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                 {renderSpellList(data.cantrips, 0)}
               </div>
             </div>

            {/* CONJUROS DE NIVEL 1 */}
            <div style={{ 
              padding: '16px',
              border: '2px solid #000',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', textAlign: 'center' }}>Conjuros de Nivel 1</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                 <div>
                   <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Límite Total</label>
                   <input 
                     value={getSpellsKnownLimit()}
                     readOnly
                     style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#f0f0f0' }}
                   />
                 </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Total</label>
                  <input 
                    value={data.spellSlots?.[1]?.total || 0}
                    readOnly
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#f0f0f0' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Gastados</label>
                  <input 
                    value={data.spellSlots?.[1]?.used || 0}
                    onChange={e => {
                      const newValue = parseInt(e.target.value) || 0;
                      const total = data.spellSlots?.[1]?.total || 0;
                      if (newValue <= total) {
                        onChange('spellSlots', {
                          ...data.spellSlots,
                          1: { ...data.spellSlots?.[1], used: newValue }
                        });
                      }
                    }}
                    type="number"
                    min="0"
                    max={data.spellSlots?.[1]?.total || 0}
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#fff' }}
                  />
                </div>
              </div>
              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {renderSpellList(data.spells || [], 1)}
              </div>
            </div>

            {/* CONJUROS DE NIVEL 2 */}
            <div style={{ 
              padding: '16px',
              border: '2px solid #000',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', textAlign: 'center' }}>Conjuros de Nivel 2</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <div>
                                     <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Límite Total</label>
                   <input 
                     value={getSpellsKnownLimit()}
                     readOnly
                     style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#f0f0f0' }}
                   />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Total</label>
                  <input 
                    value={data.spellSlots?.[2]?.total || 0}
                    readOnly
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#f0f0f0' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Gastados</label>
                  <input 
                    value={data.spellSlots?.[2]?.used || 0}
                    onChange={e => updateSpellSlot(2, e.target.value)}
                    type="number"
                    min="0"
                    max={data.spellSlots?.[2]?.total || 0}
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#fff' }}
                  />
                </div>
              </div>
              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {renderSpellList(data.spells || [], 2)}
              </div>
            </div>

            {/* CONJUROS DE NIVEL 3 */}
            <div style={{ 
              padding: '16px',
              border: '2px solid #000',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', textAlign: 'center' }}>Conjuros de Nivel 3</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <div>
                                     <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Límite Total</label>
                   <input 
                     value={getSpellsKnownLimit()}
                     readOnly
                     style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#f0f0f0' }}
                   />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Total</label>
                  <input 
                    value={data.spellSlots?.[3]?.total || 0}
                    readOnly
                    type="number"
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Gastados</label>
                  <input 
                    value={data.spellSlots?.[3]?.used || 0}
                    onChange={e => updateSpellSlot(3, e.target.value)}
                    type="number"
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#fff' }}
                  />
                </div>
              </div>
              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {renderSpellList(data.spells || [], 3)}
              </div>
            </div>

            {/* CONJUROS DE NIVEL 4 */}
            <div style={{ 
              padding: '16px',
              border: '2px solid #000',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', textAlign: 'center' }}>Conjuros de Nivel 4</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <div>
                                     <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Límite Total</label>
                   <input 
                     value={getSpellsKnownLimit()}
                     readOnly
                     style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#f0f0f0' }}
                   />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Total</label>
                  <input 
                    value={data.spellSlots?.[4]?.total || 0}
                    readOnly
                    type="number"
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Gastados</label>
                  <input 
                    value={data.spellSlots?.[4]?.used || 0}
                    onChange={e => updateSpellSlot(4, e.target.value)}
                    type="number"
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#fff' }}
                  />
                </div>
              </div>
              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {renderSpellList(data.spells || [], 4)}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* CONJUROS DE NIVEL 5 */}
            <div style={{ 
              padding: '16px',
              border: '2px solid #000',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', textAlign: 'center' }}>Conjuros de Nivel 5</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <div>
                                     <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Límite Total</label>
                   <input 
                     value={getSpellsKnownLimit()}
                     readOnly
                     style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#f0f0f0' }}
                   />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Total</label>
                  <input 
                    value={data.spellSlots?.[5]?.total || 0}
                    readOnly
                    type="number"
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Gastados</label>
                  <input 
                    value={data.spellSlots?.[5]?.used || 0}
                    onChange={e => updateSpellSlot(5, e.target.value)}
                    type="number"
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#fff' }}
                  />
                </div>
              </div>
              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {renderSpellList(data.spells || [], 5)}
              </div>
            </div>

            {/* CONJUROS DE NIVEL 6 */}
            <div style={{ 
              padding: '16px',
              border: '2px solid #000',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', textAlign: 'center' }}>Conjuros de Nivel 6</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <div>
                                     <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Límite Total</label>
                   <input 
                     value={getSpellsKnownLimit()}
                     readOnly
                     style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#f0f0f0' }}
                   />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Total</label>
                  <input 
                    value={data.spellSlots?.[6]?.total || 0}
                    readOnly
                    type="number"
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Gastados</label>
                  <input 
                    value={data.spellSlots?.[6]?.used || 0}
                    onChange={e => updateSpellSlot(6, e.target.value)}
                    type="number"
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#fff' }}
                  />
                </div>
              </div>
              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {renderSpellList(data.spells || [], 6)}
              </div>
            </div>

            {/* CONJUROS DE NIVEL 7 */}
            <div style={{ 
              padding: '16px',
              border: '2px solid #000',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', textAlign: 'center' }}>Conjuros de Nivel 7</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <div>
                                     <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Límite Total</label>
                   <input 
                     value={getSpellsKnownLimit()}
                     readOnly
                     style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#f0f0f0' }}
                   />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Total</label>
                  <input 
                    value={data.spellSlots?.[7]?.total || 0}
                    readOnly
                    type="number"
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Gastados</label>
                  <input 
                    value={data.spellSlots?.[7]?.used || 0}
                    onChange={e => updateSpellSlot(7, e.target.value)}
                    type="number"
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#fff' }}
                  />
                </div>
              </div>
              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {renderSpellList(data.spells || [], 7)}
              </div>
            </div>

            {/* CONJUROS DE NIVEL 8 */}
            <div style={{ 
              padding: '16px',
              border: '2px solid #000',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', textAlign: 'center' }}>Conjuros de Nivel 8</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <div>
                                     <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Límite Total</label>
                   <input 
                     value={getSpellsKnownLimit()}
                     readOnly
                     style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#f0f0f0' }}
                   />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Total</label>
                  <input 
                    value={data.spellSlots?.[8]?.total || 0}
                    readOnly
                    type="number"
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Gastados</label>
                  <input 
                    value={data.spellSlots?.[8]?.used || 0}
                    onChange={e => updateSpellSlot(8, e.target.value)}
                    type="number"
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#fff' }}
                  />
                </div>
              </div>
              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {renderSpellList(data.spells || [], 8)}
              </div>
            </div>

            {/* CONJUROS DE NIVEL 9 */}
            <div style={{ 
              padding: '16px',
              border: '2px solid #000',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', textAlign: 'center' }}>Conjuros de Nivel 9</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <div>
                                     <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Límite Total</label>
                   <input 
                     value={getSpellsKnownLimit()}
                     readOnly
                     style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#f0f0f0' }}
                   />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Total</label>
                  <input 
                    value={data.spellSlots?.[9]?.total || 0}
                    readOnly
                    type="number"
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>Gastados</label>
                  <input 
                    value={data.spellSlots?.[9]?.used || 0}
                    onChange={e => updateSpellSlot(9, e.target.value)}
                    type="number"
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '10px', backgroundColor: '#fff' }}
                  />
                </div>
              </div>
              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {renderSpellList(data.spells || [], 9)}
              </div>
            </div>
          </div>
        </div>

        {/* NOTAS DE CONJUROS */}
        <div style={{ 
          padding: '16px',
          border: '2px solid #000',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', textAlign: 'center' }}>Notas de Conjuros</h3>
          <textarea 
            value={data.spellNotes || ''}
            onChange={e => onChange('spellNotes', e.target.value)}
            placeholder="Notas adicionales sobre conjuros, componentes, etc..."
            rows="8"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '2px solid #000', fontSize: '12px', resize: 'none', backgroundColor: '#fff' }}
          />
                 </div>
       </fieldset>

       {/* Modal de detalles del hechizo */}
       {showSpellModal && selectedSpell && (
         <div style={{
           position: 'fixed',
           top: 0,
           left: 0,
           right: 0,
           bottom: 0,
           backgroundColor: 'rgba(0, 0, 0, 0.5)',
           display: 'flex',
           justifyContent: 'center',
           alignItems: 'center',
           zIndex: 1000
         }}>
           <div style={{
             backgroundColor: '#fff',
             padding: '20px',
             borderRadius: '8px',
             maxWidth: '500px',
             maxHeight: '80vh',
             overflowY: 'auto',
             border: '2px solid #000'
           }}>
             <div style={{
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center',
               marginBottom: '15px',
               borderBottom: '2px solid #000',
               paddingBottom: '10px'
             }}>
               <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                 {selectedSpell.name}
               </h3>
               <button 
                 onClick={() => setShowSpellModal(false)}
                 style={{
                   background: 'none',
                   border: 'none',
                   fontSize: '20px',
                   cursor: 'pointer',
                   fontWeight: 'bold'
                 }}
               >
                 ×
               </button>
             </div>
             
             <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
               <div style={{ marginBottom: '10px' }}>
                 <strong>Nivel:</strong> {selectedSpell.level}
               </div>
               <div style={{ marginBottom: '10px' }}>
                 <strong>Escuela:</strong> {selectedSpell.school || 'Evocación'}
               </div>
               <div style={{ marginBottom: '10px' }}>
                 <strong>Tiempo de Lanzamiento:</strong> {selectedSpell.castingTime || '1 acción'}
               </div>
               <div style={{ marginBottom: '10px' }}>
                 <strong>Alcance:</strong> {selectedSpell.range || 'Personal'}
               </div>
               <div style={{ marginBottom: '10px' }}>
                 <strong>Componentes:</strong> {selectedSpell.components || 'V, S'}
               </div>
               <div style={{ marginBottom: '10px' }}>
                 <strong>Duración:</strong> {selectedSpell.duration || 'Instantánea'}
               </div>
               {selectedSpell.damage && (
                 <div style={{ marginBottom: '10px' }}>
                   <strong>Daño:</strong> {selectedSpell.damage} {selectedSpell.damageType && `(${selectedSpell.damageType})`}
                 </div>
               )}
               <div style={{ marginTop: '15px' }}>
                 <strong>Descripción:</strong>
                 <p style={{ marginTop: '5px', textAlign: 'justify' }}>
                   {selectedSpell.description || 'Descripción detallada del conjuro...'}
                 </p>
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 }
