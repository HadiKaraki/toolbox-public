import { configureStore } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import { combineReducers } from 'redux';
import themeReducer from './slices/themeSlice';
import favoritesReducer from './slices/favoritesSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['theme', 'favorites']
};

const rootReducer = combineReducers({
  theme: themeReducer,
  favorites: favoritesReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);