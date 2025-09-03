import React from 'react';
import CorePage from './pages/CorePage';
import StoryPage from './pages/StoryPage';
import SpellsPage from './pages/SpellsPage';

export default function CharacterSheet({ characterData, onChange, locked = false, onSaveCharacter, onDeleteCharacter }) {
  const [tab, setTab] = React.useState('core'); // 'core'|'story'|'spells'

  const TabButton = ({id, children}) => (
    <button
      onClick={() => setTab(id)}
      style={{
        padding:'8px 12px',
        marginRight:8,
        border:'1px solid #333',
        background: tab===id ? '#ddd' : '#f7f7f7',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      {children}
    </button>
  );

  return (
    <div>
      <div style={{ marginBottom: 12, borderBottom: '1px solid #ccc', paddingBottom: '8px' }}>
        <TabButton id="core">Hoja 1 - Núcleo</TabButton>
        <TabButton id="story">Hoja 2 - Historia</TabButton>
        <TabButton id="spells">Hoja 3 - Conjuros</TabButton>
      </div>

      {tab==='core'   && <CorePage data={characterData} onChange={onChange} locked={locked} onSaveCharacter={onSaveCharacter} onDeleteCharacter={onDeleteCharacter} />}
      {tab==='story'  && <StoryPage data={characterData} onChange={onChange} locked={locked} />}
      {tab==='spells' && <SpellsPage data={characterData} onChange={onChange} locked={locked} />}
    </div>
  );
}
