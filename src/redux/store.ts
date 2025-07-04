import { configureStore } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import { combineReducers } from 'redux';
import themeReducer from './slices/themeSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['theme']
};

const rootReducer = combineReducers({
  theme: themeReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer
});

export const persistor = persistStore(store);