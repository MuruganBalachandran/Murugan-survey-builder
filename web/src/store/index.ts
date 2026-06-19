// region imports
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import questionReducer from "./slices/questionSlice";
import responseReducer from "./slices/responseSlice";
import surveyReducer from "./slices/surveySlice";
// endregion

// region store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    survey: surveyReducer,
    question: questionReducer,
    response: responseReducer,
  },
});
// endregion

// region types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
// endregion
