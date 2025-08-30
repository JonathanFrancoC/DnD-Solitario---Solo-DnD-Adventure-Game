// Funciones de cálculo para el sistema de point-buy (25 PB)

// Función para calcular el coste de point-buy desde valor base
export function pointBuyCostFromBase(score) {
  const s = Math.max(8, Math.min(score, 18));
  if (s <= 8) return 0;
  if (s <= 15) return s - 8;
  return 7 + (s - 15) * 2;
}

// Función para calcular estadísticas efectivas (base + racial)
export function calculateEffectiveStats(baseStats, raceMods) {
  const effective = {};
  Object.entries(baseStats).forEach(([stat, value]) => {
    const raceMod = raceMods[stat] || 0;
    effective[stat] = Math.min(20, value + raceMod);
  });
  return effective;
}

// Función para calcular el coste total de point-buy
export function calculateTotalCost(baseStats) {
  return Object.values(baseStats).reduce((total, value) => {
    return total + pointBuyCostFromBase(value);
  }, 0);
}

// Función para aplicar recomendaciones de una clase
export function applyClassRecommendations(className, classData, raceMods) {
  const baseStats = classData[className]?.recommendedStats;
  if (!baseStats) return null;
  
  const effective = calculateEffectiveStats(baseStats, raceMods);
  const totalCost = calculateTotalCost(baseStats);
  
  return {
    base: baseStats,
    effective,
    totalCost
  };
}
