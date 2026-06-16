// region imports
import { configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import authReducer from './slices/authSlice'
import questionReducer from './slices/questionSlice'
import responseReducer from './slices/responseSlice'
import surveyReducer from './slices/surveySlice'

// endregion

// region persist config
const persistConfig = {
  key: 'root',
  // custom localStorage wrapper for redux persist
  storage: {
    getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),

    setItem: (key: string, value: string) => Promise.resolve(localStorage.setItem(key, value)),

    removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key)),
  },
  // persist only auth state
  whitelist: ['auth'],
}
// endregion

// region persisted reducers
const persistedAuthReducer = persistReducer(persistConfig, authReducer)
// endregion

// region store
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    survey: surveyReducer,
    question: questionReducer,
    response: responseReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // ignore redux persist actions
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})
// endregion

// region persistor
export const persistor = persistStore(store)
// endregion

// region types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
// endregion
