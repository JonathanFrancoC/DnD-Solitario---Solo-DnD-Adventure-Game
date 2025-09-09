import React from 'react';
import { useTranslation } from '../../../contexts/LanguageContext';

export default function StoryPage({ data, onChange, locked = false }) {
  const { t } = useTranslation();
  
  return (
    <div className={locked ? 'locked' : ''} style={{ padding: '16px', position:'relative' }}>
      <fieldset disabled={locked} style={{ border:0, padding:0, margin:0 }}>
        
        {/* CABECERA */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '40% 60%', 
          gap: '16px', 
          marginBottom: '20px',
          padding: '16px',
          border: '2px solid #000',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}>
         {/* NOMBRE DEL PERSONAJE*/}
         <div>
           <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
             {t('character.name')}
           </label>
           <input 
             value={data.name || ''}
             onChange={e => onChange('name', e.target.value)}
             style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '2px solid #000', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#fff' }}
           />
         </div>
         
         {/* 60% DERECHA - 2 renglones con 3 recuadros cada uno */}
         <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '8px' }}>
           {/* PRIMER RENGLÓN - 3 recuadros */}
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
             <div>
               <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '2px', fontSize: '12px' }}>
                 {t('character.age', 'Edad')}
               </label>
               <input 
                 value={data.age || ''}
                 onChange={e => onChange('age', e.target.value)}
                 style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '14px', backgroundColor: '#fff' }}
               />
             </div>
             <div>
               <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '2px', fontSize: '12px' }}>
                 {t('character.height', 'Altura')}
               </label>
               <input 
                 value={data.height || ''}
                 onChange={e => onChange('height', e.target.value)}
                 style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '14px', backgroundColor: '#fff' }}
               />
             </div>
             <div>
               <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '2px', fontSize: '12px' }}>
                 {t('character.weight', 'Peso')}
               </label>
               <input 
                 value={data.weight || ''}
                 onChange={e => onChange('weight', e.target.value)}
                 style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '14px', backgroundColor: '#fff' }}
               />
             </div>
           </div>
           
           {/* SEGUNDO RENGLÓN - 3 recuadros */}
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
             <div>
               <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '2px', fontSize: '12px' }}>
                 {t('character.eyes', 'Ojos')}
               </label>
               <input 
                 value={data.eyes || ''}
                 onChange={e => onChange('eyes', e.target.value)}
                 style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '14px', backgroundColor: '#fff' }}
               />
             </div>
             <div>
               <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '2px', fontSize: '12px' }}>
                 {t('character.skin', 'Piel')}
               </label>
               <input 
                 value={data.skin || ''}
                 onChange={e => onChange('skin', e.target.value)}
                 style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '14px', backgroundColor: '#fff' }}
               />
             </div>
             <div>
               <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '2px', fontSize: '12px' }}>
                 {t('character.hair', 'Cabello')}
               </label>
               <input 
                 value={data.hair || ''}
                 onChange={e => onChange('hair', e.target.value)}
                 style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '14px', backgroundColor: '#fff' }}
               />
             </div>
           </div>
         </div>
       </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 2.5fr', 
          gap: '20px',
          marginBottom: '20px',
          minHeight: '600px'
        }}>
          
                     {/* COLUMNA IZQUIERDA - Pequeña, 2 recuadros */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             
             {/* APARIENCIA DEL PERSONAJE */}
             <div style={{ 
               padding: '20px',
               border: '2px solid #000',
               borderRadius: '8px',
               backgroundColor: '#f9f9f9',
               flex: 1
             }}>
               <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', textAlign: 'center' }}>{t('character.appearance', 'Apariencia del Personaje')}</h3>
               <textarea 
                 value={data.appearance || ''}
                 onChange={e => onChange('appearance', e.target.value)}
                 placeholder="Descripción detallada de la apariencia física del personaje..."
                 rows="20"
                 style={{ 
                   width: '100%', 
                   padding: '12px', 
                   borderRadius: '4px', 
                   border: 'none', 
                   fontSize: '14px', 
                   resize: 'none', 
                   backgroundColor: 'transparent',
                   minHeight: '280px',
                   lineHeight: '1.5'
                 }}
               />
             </div>

             {/* HISTORIA DEL PERSONAJE */}
             <div style={{ 
               padding: '20px',
               border: '2px solid #000',
               borderRadius: '8px',
               backgroundColor: '#f9f9f9',
               flex: 1
             }}>
               <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', textAlign: 'center' }}>{t('character.history', 'Historia del Personaje')}</h3>
               <textarea 
                 value={data.personalHistory || ''}
                 onChange={e => onChange('personalHistory', e.target.value)}
                 placeholder="Historia personal del personaje..."
                 rows="25"
                 style={{ 
                   width: '100%', 
                   padding: '12px', 
                   borderRadius: '4px', 
                   border: 'none', 
                   fontSize: '14px', 
                   resize: 'none', 
                   backgroundColor: 'transparent',
                   minHeight: '400px',
                   lineHeight: '1.5'
                 }}
               />
             </div>
           </div>

           {/* COLUMNA DERECHA - Grande, 3 recuadros */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             
             {/* ALIADOS Y ORGANIZACIONES */}
             <div style={{ 
               padding: '20px',
               border: '2px solid #000',
               borderRadius: '8px',
               backgroundColor: '#f9f9f9',
               position: 'relative',
               flex: 1
             }}>
               <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', textAlign: 'center' }}>{t('character.allies', 'Aliados y Organizaciones')}</h3>
               
               {/* Cuadro NOMBRE/SIMBOLO arriba a la derecha */}
               <div style={{
                 position: 'absolute',
                 top: '20px',
                 right: '20px',
                 width: '100px',
                 height: '100px',
                 border: '2px solid #000',
                 borderRadius: '4px',
                 backgroundColor: '#fff',
                 display: 'flex',
                 flexDirection: 'column',
                 alignItems: 'center',
                 justifyContent: 'center',
                 fontSize: '12px',
                 fontWeight: 'bold'
               }}>
                 <div style={{ marginBottom: '8px' }}>NOMBRE</div>
                 <div style={{ 
                   width: '50px', 
                   height: '50px', 
                   border: '1px solid #ccc',
                   backgroundColor: '#f9f9f9',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   fontSize: '10px',
                   color: '#666'
                 }}>
                   SIMBOLO
                 </div>
               </div>
               
               <textarea 
                 value={data.allies || ''}
                 onChange={e => onChange('allies', e.target.value)}
                 placeholder="Aliados, organizaciones, contactos..."
                 rows="12"
                 style={{ 
                   width: '100%', 
                   padding: '12px', 
                   borderRadius: '4px', 
                   border: 'none', 
                   fontSize: '14px', 
                   resize: 'none', 
                   backgroundColor: 'transparent',
                   minHeight: '200px',
                   lineHeight: '1.5',
                   marginRight: '120px' // Espacio para el cuadro
                 }}
               />
             </div>

             {/* RASGOS Y ATRIBUTOS ADICIONALES */}
             <div style={{ 
               padding: '20px',
               border: '2px solid #000',
               borderRadius: '8px',
               backgroundColor: '#f9f9f9',
               flex: 1
             }}>
               <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', textAlign: 'center' }}>{t('character.additionalTraits', 'Rasgos y Atributos Adicionales')}</h3>
               <textarea 
                 value={data.specialFeatures || ''}
                 onChange={e => onChange('specialFeatures', e.target.value)}
                 placeholder="Rasgos adicionales, características especiales..."
                 rows="12"
                 style={{ 
                   width: '100%', 
                   padding: '12px', 
                   borderRadius: '4px', 
                   border: 'none', 
                   fontSize: '14px', 
                   resize: 'none', 
                   backgroundColor: 'transparent',
                   minHeight: '200px',
                   lineHeight: '1.5'
                 }}
               />
             </div>

             {/* TESORO */}
             <div style={{ 
               padding: '20px',
               border: '2px solid #000',
               borderRadius: '8px',
               backgroundColor: '#f9f9f9',
               flex: 1
             }}>
               <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', textAlign: 'center' }}>{t('character.treasure', 'Tesoro')}</h3>
               <textarea 
                 value={data.treasure || ''}
                 onChange={e => onChange('treasure', e.target.value)}
                 placeholder="Objetos valiosos, tesoros especiales..."
                 rows="12"
                 style={{ 
                   width: '100%', 
                   padding: '12px', 
                   borderRadius: '4px', 
                   border: 'none', 
                   fontSize: '14px', 
                   resize: 'none', 
                   backgroundColor: 'transparent',
                   minHeight: '200px',
                   lineHeight: '1.5'
                 }}
               />
             </div>
           </div>
        </div>
      </fieldset>
    </div>
  );
}
