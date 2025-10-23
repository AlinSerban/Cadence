export function xpForLevel(level: number): number {
  // New formula: Linear progression - 50 XP per level
  return (level - 1) * 50;
}

export function getXpProgress(currentXp: number): { level: number; progress: number; xpToNext: number; currentLevelXp: number; nextLevelXp: number } {
  const level = Math.max(1, Math.floor(currentXp / 50) + 1);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const progress = ((currentXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  const xpToNext = nextLevelXp - currentXp;

  return { level, progress: Math.max(0, Math.min(100, progress)), xpToNext, currentLevelXp, nextLevelXp };
}
