import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Tool {
  icon: string;
  title: string;
  description: string;
  path: string;
}

interface FavoritesState {
  favorites: Tool[];
}

const initialState: FavoritesState = {
  favorites: []
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addToFavorites: (state, action: PayloadAction<Tool>) => {
      state.favorites.push(action.payload);
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(tool => tool.title !== action.payload);
    }
  }
});

export const { addToFavorites, removeFromFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;