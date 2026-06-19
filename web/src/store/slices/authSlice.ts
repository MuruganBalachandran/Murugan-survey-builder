// region imports
import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as authAPI from "@/services/api/auth";
import type { User } from "@/types/auth";
// endregion

// region types
export interface AuthState {
  user: User | null;
  // token is no longer stored in Redux — it lives in the httpOnly cookie
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Record<string, string> | null;
}
// endregion

// region initial state
// isLoading starts true — verifyToken() on mount rehydrates it, preventing
// a flash of the locked/redirect state before the cookie check completes
const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};
// endregion

// region login user
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await authAPI.login(
        credentials.email,
        credentials.password,
      );
      if (!response.success) {
        return rejectWithValue(
          response.errors || { general: response.message },
        );
      }
      return response;
    } catch (error: any) {
      return rejectWithValue({ general: error.message || "Login failed" });
    }
  },
);
// endregion

// region signup user
export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async (
    data: {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await authAPI.signup(
        data.email,
        data.password,
        data.confirmPassword,
        data.name,
      );
      if (!response.success) {
        return rejectWithValue(
          response.errors || { general: response.message },
        );
      }
      return response;
    } catch (error: any) {
      return rejectWithValue({ general: error.message || "Signup failed" });
    }
  },
);
// endregion

// region logout user
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.logout();
      if (!response.success) {
        return rejectWithValue({ general: response.message });
      }
      return response;
    } catch (error: any) {
      return rejectWithValue({ general: error.message || "Logout failed" });
    }
  },
);
// endregion

// region verify token
// Cookie is sent automatically by the browser — no token to pass.
// On success, rehydrates user identity and isAuthenticated in Redux.
export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyToken();
      if (!response.success) {
        return rejectWithValue({ general: "Token verification failed" });
      }
      return { user: response.user };
    } catch (error: any) {
      return rejectWithValue({
        general: error.message || "Verification failed",
      });
    }
  },
);
// endregion

// region auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      // Clear Redux state — the cookie is cleared by the API logout endpoint
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      // remove any stale redux-persist data from previous sessions
      localStorage.removeItem("persist:root");
    },

    clearError: (state) => {
      state.error = null;
    },

    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },

  extraReducers: (builder) => {
    // region login reducers
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = (action.payload.user as User) ?? null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as Record<string, string>;
        state.isAuthenticated = false;
      });
    // endregion

    // region signup reducers
    builder
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = (action.payload.user as User) ?? null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as Record<string, string>;
        state.isAuthenticated = false;
      });
    // endregion

    // region logout reducers
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        localStorage.removeItem("persist:root");
      })
      .addCase(logoutUser.rejected, (state) => {
        // clear local state even if the API call fails
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        localStorage.removeItem("persist:root");
      });
    // endregion

    // region verify token reducers
    builder
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = (action.payload.user as User) ?? null;
        state.isAuthenticated = true;
      })
      .addCase(verifyToken.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
    // endregion
  },
});
// endregion

// region exports
export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
// endregion
