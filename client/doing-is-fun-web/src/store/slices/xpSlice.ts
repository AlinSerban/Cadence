import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
interface XpState {
  current: number;
  level: number;
  justLeveled: boolean;
}

const initialState: XpState = { current: 0, level: 1, justLeveled: false };

export const xpSlice = createSlice({
  name: "xp",
  initialState,
  reducers: {
    setXp(state, action: PayloadAction<number>) {
      state.current = action.payload;
      // New formula: Linear progression with slight curve - much faster leveling
      state.level = Math.max(1, Math.floor(state.current / 50) + 1);
      state.justLeveled = false;
    },
    addXp(state, action: PayloadAction<number>) {
      state.current += action.payload;
      // New formula: Linear progression with slight curve - much faster leveling
      const newLevel = Math.max(1, Math.floor(state.current / 50) + 1);
      if (newLevel > state.level) {
        state.level = newLevel;
        state.justLeveled = true;
      }
    },
    levelUp(state) {
      state.justLeveled = true;
    },
    clearLevelUp(state) {
      state.justLeveled = false;
    },
  },
});

export const { setXp, addXp, levelUp, clearLevelUp } = xpSlice.actions;
export default xpSlice.reducer;
