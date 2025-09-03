// Utilidades para normalizar y validar el esquema de clases

/**
 * Normaliza el esquema de clases para usar la estructura featuresByLevel
 * y detecta duplicados en el proceso
 */
export function normalizeClassesSchema(db) {
  const out = JSON.parse(JSON.stringify(db));
  const duplicates = [];
  
  for (const clsId of Object.keys(out.classes)) {
    const C = out.classes[clsId];

    // Si no tiene subclassLevel, intenta inferir por clase (PHB)
    if (C.subclassLevel == null) {
      const infer = { 
        bardo: 3, guerrero: 3, picaro: 3, mago: 2, druida: 2, 
        brujo: 1, clerigo: 1, hechicero: 1, paladin: 3, monje: 3, explorador: 3 
      };
      if (infer[clsId] != null) C.subclassLevel = infer[clsId];
    }

    if (!C.subclasses) continue;
    
    for (const scId of Object.keys(C.subclasses)) {
      const SC = C.subclasses[scId];
      if (SC.featuresByLevel) continue; // Ya está normalizado

      const lvlMap = {};
      const seen = new Set();
      const levelDuplicates = [];

      // Tu formato viejo: { "2": {...}, "2": {...}, "6": {...} }
      const old = SC.features || {};
      for (const [lvl, val] of Object.entries(old)) {
        // Convierte cada valor en array (aunque sea 1)
        if (!lvlMap[lvl]) lvlMap[lvl] = [];
        
        // Genera un id estable si no viene
        const item = Array.isArray(val) ? val : [val];
        item.forEach((feat, idx) => {
          const id = feat.id || `${scId}_${lvl}_${idx}`;
          if (seen.has(id)) {
            levelDuplicates.push(`${clsId}/${scId} nivel ${lvl}: ${feat.name || 'sin nombre'}`);
            return;
          }
          seen.add(id);
          lvlMap[lvl].push({ id, ...feat });
        });
      }
      
      if (levelDuplicates.length > 0) {
        duplicates.push(...levelDuplicates);
      }
      
      delete SC.features;
      SC.featuresByLevel = lvlMap;
    }
  }
  
  return { normalized: out, duplicates };
}

/**
 * Valida el esquema de clases y reporta problemas
 */
export function validateClasses(db) {
  const problems = [];
  
  for (const [cid, C] of Object.entries(db.classes || {})) {
    if (C.subclasses) {
      for (const [sid, S] of Object.entries(C.subclasses)) {
        const map = S.featuresByLevel || S.features || {};
        const levels = Object.keys(map);
        const dup = levels.filter((x, i, arr) => arr.indexOf(x) !== i);
        
        if (dup.length) {
          problems.push(`[${cid}/${sid}] niveles duplicados: ${dup.join(', ')}`);
        }
        
        // Comprobar arrays
        for (const [lvl, v] of Object.entries(map)) {
          if (!Array.isArray(v)) {
            problems.push(`[${cid}/${sid}] nivel ${lvl} no es array.`);
          }
        }
      }
    }
    
    if (C.subclassLevel == null) {
      problems.push(`[${cid}] falta subclassLevel`);
    }
  }
  
  return problems;
}

/**
 * Obtiene el nivel en que se elige subclase para una clase
 */
export function getSubclassLevel(classes, classId) {
  return classes[classId]?.subclassLevel ?? null;
}

/**
 * Obtiene rasgos nuevos de subclase al subir de nivel
 */
export function getSubclassFeaturesAt(classes, classId, subclassId, atLevel) {
  const fl = classes[classId]?.subclasses?.[subclassId]?.featuresByLevel || {};
  return Object.entries(fl)
    .filter(([lvl]) => Number(lvl) === Number(atLevel))
    .flatMap(([, arr]) => arr);
}

/**
 * Convierte un array de características en un objeto indexado por ID
 */
export function indexFeaturesById(features) {
  const indexed = {};
  features.forEach(feat => {
    if (feat.id) {
      indexed[feat.id] = feat;
    }
  });
  return indexed;
}

/**
 * Obtiene todas las características de subclase para un nivel específico
 */
export function getAllSubclassFeaturesAt(classes, classId, subclassId, atLevel) {
  const features = getSubclassFeaturesAt(classes, classId, subclassId, atLevel);
  return indexFeaturesById(features);
}

/**
 * Obtiene las acciones disponibles de una subclase
 */
export function getSubclassActions(classes, classId, subclassId) {
  const subclass = classes[classId]?.subclasses?.[subclassId];
  return subclass?.actions || {};
}

/**
 * Obtiene todas las acciones de una subclase en formato plano
 */
export function getAllSubclassActions(classes, classId, subclassId) {
  const actions = getSubclassActions(classes, classId, subclassId);
  const allActions = [];
  
  Object.entries(actions).forEach(([actionKey, actionData]) => {
    if (actionData.options) {
      actionData.options.forEach((option, index) => {
        allActions.push({
          id: `${actionKey}_${index}`,
          category: actionData.name,
          categoryDescription: actionData.description,
          ...option
        });
      });
    }
  });
  
  return allActions;
}
