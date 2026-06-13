// region imports
import type {
  PayloadAction,
} from '@reduxjs/toolkit'
import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit'
import * as authAPI from '@/services/api/auth'
import type {
  User,
} from '@/types/auth'
// endregion

// region types
export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: Record<string, string> | null
}
// endregion

// region initial state
const initialState: AuthState = {
  user: null,

  token:
    localStorage.getItem('authToken') ||
    null,

  isLoading: false,

  isAuthenticated:
    !!localStorage.getItem('authToken'),

  error: null,
}
// endregion

// region login user
export const loginUser = createAsyncThunk(
  'auth/loginUser',

  async (
    credentials: {
      email: string
      password: string
    },

    { rejectWithValue },
  ) => {
    try {
      // authenticate user
      const response =
        await authAPI.login(
          credentials.email,
          credentials.password,
        )

      // handle API validation errors
      if (!response.success) {
        return rejectWithValue(
          response.errors || {
            general: response.message,
          },
        )
      }

      return response
    } catch (error: any) {
      return rejectWithValue({
        general:
          error.message || 'Login failed',
      })
    }
  },
)
// endregion

// region signup user
export const signupUser = createAsyncThunk(
  'auth/signupUser',

  async (
    data: {
      name: string
      email: string
      password: string
      confirmPassword: string
    },

    { rejectWithValue },
  ) => {
    try {
      // register new user
      const response =
        await authAPI.signup(
          data.email,
          data.password,
          data.confirmPassword,
          data.name,
        )

      // handle API validation errors
      if (!response.success) {
        return rejectWithValue(
          response.errors || {
            general: response.message,
          },
        )
      }

      return response
    } catch (error: any) {
      return rejectWithValue({
        general:
          error.message || 'Signup failed',
      })
    }
  },
)
// endregion

// region verify token
export const verifyToken = createAsyncThunk(
  'auth/verifyToken',

  async (_, { rejectWithValue }) => {
    try {
      // fetch stored auth token
      const token =
        localStorage.getItem('authToken')

      if (!token) {
        return rejectWithValue({
          general: 'No token found',
        })
      }

      // verify token with backend
      const response =
        await authAPI.verifyToken(token)

      // handle invalid token
      if (!response.success) {
        localStorage.removeItem(
          'authToken',
        )

        return rejectWithValue({
          general:
            'Token verification failed',
        })
      }

      return {
        token,
        user: response.user,
      }
    } catch (error: any) {
      // clear invalid token
      localStorage.removeItem(
        'authToken',
      )

      return rejectWithValue({
        general:
          error.message ||
          'Verification failed',
      })
    }
  },
)
// endregion

// region auth slice
const authSlice = createSlice({
  name: 'auth',

  initialState,

  reducers: {
    logout: (state) => {
      // clear auth state
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null

      // remove stored token
      localStorage.removeItem(
        'authToken',
      )
    },

    clearError: (state) => {
      // clear auth errors
      state.error = null
    },

    setUser: (
      state,
      action: PayloadAction<User>,
    ) => {
      // update authenticated user
      state.user = action.payload
      state.isAuthenticated = true
    },
  },

  extraReducers: (builder) => {
    // region login reducers

    builder
      .addCase(
        loginUser.pending,
        (state) => {
          state.isLoading = true
          state.error = null
        },
      )

      .addCase(
        loginUser.fulfilled,
        (state, action) => {
          state.isLoading = false
          state.isAuthenticated = true

          state.token =
            action.payload.token || null

          state.user =
            (action.payload.user as User) ||
            null

          // persist auth token
          if (action.payload.token) {
            localStorage.setItem(
              'authToken',
              action.payload.token,
            )
          }
        },
      )

      .addCase(
        loginUser.rejected,
        (state, action) => {
          state.isLoading = false

          state.error =
            action.payload as Record<
              string,
              string
            >

          state.isAuthenticated = false
        },
      )

    // endregion

    // region signup reducers

    builder
      .addCase(
        signupUser.pending,
        (state) => {
          state.isLoading = true
          state.error = null
        },
      )

      .addCase(
        signupUser.fulfilled,
        (state, action) => {
          state.isLoading = false
          state.isAuthenticated = true

          state.token =
            action.payload.token || null

          state.user =
            (action.payload.user as User) ||
            null

          // persist auth token
          if (action.payload.token) {
            localStorage.setItem(
              'authToken',
              action.payload.token,
            )
          }
        },
      )

      .addCase(
        signupUser.rejected,
        (state, action) => {
          state.isLoading = false

          state.error =
            action.payload as Record<
              string,
              string
            >

          state.isAuthenticated = false
        },
      )

    // endregion

    // region verify token reducers

    builder
      .addCase(
        verifyToken.pending,
        (state) => {
          state.isLoading = true
        },
      )

      .addCase(
        verifyToken.fulfilled,
        (state, action) => {
          state.isLoading = false

          state.token =
            action.payload.token

          state.user =
            (action.payload.user as User) ||
            null

          state.isAuthenticated = true
        },
      )

      .addCase(
        verifyToken.rejected,
        (state) => {
          state.isLoading = false

          state.user = null
          state.token = null
          state.isAuthenticated = false
        },
      )

    // endregion
  },
})
// endregion

// region exports
export const {
  logout,
  clearError,
  setUser,
} = authSlice.actions

export default authSlice.reducer
// endregion