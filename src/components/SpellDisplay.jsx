import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { getTranslatedSpell, getTranslatedDamageInfo, getTranslatedRangeInfo, getTranslatedDurationInfo, getTranslatedCastingTimeInfo } from '../utils/translationService';

// Componente para mostrar información de hechizos con traducciones / Component to display spell information with translations
const SpellDisplay = ({ spellKey, level, className = '' }) => {
  const { t, language } = useTranslation();
  
  // Obtener el hechizo traducido / Get translated spell
  const spell = getTranslatedSpell(spellKey, level, language);
  
  if (!spell) {
    return (
      <div className={`spell-display ${className}`}>
        <p>{t('spells.notFound', 'Hechizo no encontrado')}</p>
      </div>
    );
  }
  
  // Obtener información traducida / Get translated information
  const damageInfo = getTranslatedDamageInfo(spell, language);
  const rangeInfo = getTranslatedRangeInfo(spell, language);
  const durationInfo = getTranslatedDurationInfo(spell, language);
  const castingTimeInfo = getTranslatedCastingTimeInfo(spell, language);
  
  return (
    <div className={`spell-display ${className}`} style={{
      backgroundColor: '#2c3e50',
      border: '1px solid #34495e',
      borderRadius: '8px',
      padding: '16px',
      margin: '8px 0',
      color: '#ecf0f1'
    }}>
      {/* Nombre del hechizo / Spell name */}
      <h3 style={{ 
        margin: '0 0 8px 0', 
        color: '#3498db',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        {spell.name}
      </h3>
      
      {/* Nivel del hechizo / Spell level */}
      <div style={{ 
        marginBottom: '8px',
        fontSize: '12px',
        color: '#bdc3c7'
      }}>
        {t(`spells.${level}`, level)}
      </div>
      
      {/* Descripción / Description */}
      <p style={{ 
        margin: '0 0 12px 0',
        lineHeight: '1.4',
        fontSize: '14px'
      }}>
        {spell.description}
      </p>
      
      {/* Información técnica / Technical information */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        fontSize: '12px'
      }}>
        {/* Tiempo de lanzamiento / Casting time */}
        <div>
          <strong>{t('spells.castingTime')}:</strong> {castingTimeInfo}
        </div>
        
        {/* Alcance / Range */}
        <div>
          <strong>{t('spells.range')}:</strong> {rangeInfo}
        </div>
        
        {/* Duración / Duration */}
        <div>
          <strong>{t('spells.duration')}:</strong> {durationInfo}
        </div>
        
        {/* Escuela / School */}
        <div>
          <strong>{t('spells.school', 'Escuela')}:</strong> {t(`spells.schools.${spell.school.toLowerCase()}`, spell.school)}
        </div>
      </div>
      
      {/* Información de daño si aplica / Damage information if applicable */}
      {damageInfo && (
        <div style={{ 
          marginTop: '12px',
          padding: '8px',
          backgroundColor: '#34495e',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <strong>{t('spells.damage')}:</strong> {damageInfo.damage}
          {damageInfo.damageType && (
            <span> ({damageInfo.damageType})</span>
          )}
        </div>
      )}
    </div>
  );
};

export default SpellDisplay;
